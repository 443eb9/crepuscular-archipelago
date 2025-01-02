use std::{
    collections::HashMap,
    io::{BufReader, Cursor, Write},
};

use chrono::{Datelike, Local};
use image::{
    codecs::png::{PngDecoder, PngEncoder},
    DynamicImage, ExtendedColorType, GenericImageView, ImageBuffer, ImageEncoder, Luma, RgbaImage,
};
use noise::{
    utils::{NoiseMapBuilder, PlaneMapBuilder},
    MultiFractal, Simplex,
};
use rand::{rngs::StdRng, Rng, SeedableRng};
use serde::Serialize;

use crate::sql::{self, IslandDB};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IslandMapQuery {
    id: u32,
    tex_val: f32,
}

#[derive(Clone)]
struct GeneratedMap {
    size: u32,
    /// Noise texture map for rendering. 1.0(255) indicates no island exists.
    texture: Vec<u8>,
    /// Island id on each pixel.
    island_ids: Vec<Option<u32>>,
    /// Noise value on each pixel.
    noise_values: Vec<f32>,
}

#[derive(Clone)]
pub struct IslandMap {
    islands: u32,
    cached: Option<GeneratedMap>,
}

impl IslandMap {
    pub fn new(db: &IslandDB) -> Self {
        let cnt = futures::executor::block_on(sql::query_island_count(db)).unwrap();

        Self {
            islands: cnt.count,
            cached: None,
        }
    }

    pub fn update(&mut self) {
        let size = 128u32;
        let now = Local::now();
        let seed = now.year() as u32 + now.month() + now.day();

        let map = PlaneMapBuilder::new(
            noise::Fbm::<Simplex>::new(seed).set_frequency(size as f64 / 10.0),
        )
        .set_x_bounds(0.0, 1.0)
        .set_y_bounds(0.0, 1.0)
        .set_size(size as usize, size as usize)
        .build();

        let mut binary_map = map
            .into_iter()
            .enumerate()
            .map(|(index, val)| {
                let index = index as i32;
                let size = size as i32;
                let half = size / 2;

                let x = index % size - half;
                let y = index / size - half;

                let dist = ((x * x + y * y) as f64).sqrt();
                let t = (dist - half as f64 * 0.8) / (half as f64 * 0.2);
                let falloff = (1.0 - t.clamp(0.0, 1.0)).powf(2.0);

                (val * 5.0 * falloff * u8::MAX as f64) as u8
            })
            .map(|x| x > u8::MAX / 2)
            .collect::<Vec<_>>();

        fn bfs_island(
            start_x: i32,
            start_y: i32,
            area_index: u32,
            island_size: &mut u32,
            size: u32,
            noise: &mut Vec<bool>,
            land_mapper: &mut Vec<Option<u32>>,
        ) {
            let index = (start_x + start_y * size as i32) as usize;
            if start_x < 0
                || start_x >= size as i32
                || start_y < 0
                || start_y >= size as i32
                || !noise[index]
            {
                return;
            }

            noise[index] = false;
            land_mapper[index] = Some(area_index);
            *island_size += 1;
            for dx in [0, 0, 1, -1] {
                for dy in [1, -1, 0, 0] {
                    bfs_island(
                        start_x + dx,
                        start_y + dy,
                        area_index,
                        island_size,
                        size,
                        noise,
                        land_mapper,
                    );
                }
            }
        }

        // Land id of each pixel.
        let mut lands_mapper = vec![None; binary_map.len()];
        let mut is_discarded = Vec::new();
        let mut cnt = 0;

        for x in 0..size as usize {
            for y in 0..size as usize {
                if binary_map[x + y * size as usize] {
                    let mut island_size = 0;
                    bfs_island(
                        x as i32,
                        y as i32,
                        cnt,
                        &mut island_size,
                        size,
                        &mut binary_map,
                        &mut lands_mapper,
                    );

                    is_discarded.push(island_size < 10);
                    cnt += 1;
                }
            }
        }

        let mut land_indices = is_discarded
            .into_iter()
            .enumerate()
            .filter_map(|(index, is_discarded)| (!is_discarded).then_some(index))
            .collect::<Vec<_>>();
        // Land id to island id mapper.
        let mut land_to_island = vec![None; cnt as usize + 1];
        let mut island_id_to_tex_val = vec![0.0; self.islands as usize];

        let mut rng = StdRng::seed_from_u64(seed as u64);
        for island_id in 0..self.islands {
            let land = rng.gen_range(0..land_indices.len());
            let real_land_index = land_indices[land];
            land_indices.swap_remove(land);

            land_to_island[real_land_index as usize] = Some(island_id);
            island_id_to_tex_val[island_id as usize] = real_land_index as f32 / cnt as f32;
        }

        // Convert land id to island id.
        for land_index in &mut lands_mapper {
            if let Some(land) = land_index.as_mut() {
                if let Some(island) = land_to_island[*land as usize] {
                    *land_index = Some(island);
                } else {
                    *land_index = None;
                }
            }
        }

        let island_map = lands_mapper
            .clone()
            .into_iter()
            .map(|x| x.unwrap_or(self.islands) as f32 / self.islands as f32)
            .collect::<Vec<_>>();
        let image = ImageBuffer::<Luma<u8>, _>::from_vec(
            size,
            size,
            island_map
                .clone()
                .into_iter()
                .map(|x| (x * u8::MAX as f32) as u8)
                .collect(),
        )
        .unwrap();

        let mut buffer = Vec::with_capacity((size * size) as usize);
        let _ = PngEncoder::new(&mut buffer).write_image(&image, size, size, ExtendedColorType::L8);

        let _ = std::fs::File::create("test.png")
            .unwrap()
            .write_all(&buffer);

        self.cached = Some(GeneratedMap {
            size,
            texture: buffer,
            island_ids: lands_mapper,
            noise_values: island_map,
        });
    }

    pub fn get_cache(&mut self) -> &[u8] {
        if self.cached.is_none() {
            self.update();
        }
        &self.cached.as_ref().unwrap().texture
    }

    pub fn get_island_at(&mut self, coord: (usize, usize)) -> Option<IslandMapQuery> {
        if self.cached.is_none() {
            self.update();
        }
        let cache = self.cached.as_ref().unwrap();
        let pixel = coord.0 + coord.1 * cache.size as usize;

        let id = cache.island_ids.get(pixel).cloned()??;
        let tex_val = cache.noise_values.get(pixel).cloned()?;

        Some(IslandMapQuery { id, tex_val })
    }
}
