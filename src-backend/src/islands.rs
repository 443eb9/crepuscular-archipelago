use std::ops::Deref;

use chrono::{Datelike, Local};
use image::{codecs::png::PngEncoder, ExtendedColorType, ImageEncoder};
use noise::{
    utils::{NoiseMapBuilder, PlaneMapBuilder},
    MultiFractal, Simplex,
};
use rand::{rngs::StdRng, seq::SliceRandom, SeedableRng};
use serde::Serialize;

use crate::{
    models::IslandMapMeta,
    sql::{self, IslandDB},
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IslandMapQuery {
    region_id: u32,
    noise_value: f32,
}

pub struct Generic2dMap<T> {
    width: usize,
    height: usize,
    data: Vec<T>,
}

impl<T> Deref for Generic2dMap<T> {
    type Target = <Vec<T> as Deref>::Target;

    fn deref(&self) -> &Self::Target {
        &self.data
    }
}

impl<T> Generic2dMap<T> {
    pub fn new(width: usize, height: usize, data: Vec<T>) -> Self {
        assert_eq!(data.len(), width * height);
        Self {
            width,
            height,
            data,
        }
    }

    pub fn get_2d(&self, x: usize, y: usize) -> Option<&T> {
        self.data.get(x + y * self.height)
    }

    pub fn get_mut_2d(&mut self, x: usize, y: usize) -> Option<&mut T> {
        self.data.get_mut(x + y * self.height)
    }

    pub fn set_2d(&mut self, x: usize, y: usize, data: T) {
        if let Some(x) = self.get_mut_2d(x, y) {
            *x = data;
        }
    }
}

impl<T: Clone> Clone for Generic2dMap<T> {
    fn clone(&self) -> Self {
        Self {
            width: self.width.clone(),
            height: self.height.clone(),
            data: self.data.clone(),
        }
    }
}

impl<T: Default + Clone> Generic2dMap<T> {
    pub fn empty(width: usize, height: usize) -> Self {
        Self {
            width,
            height,
            data: vec![T::default(); width * height],
        }
    }
}

#[derive(Clone)]
pub struct FbmSettings {
    pub frequency: f32,
    pub lacunarity: f32,
    pub persistence: f32,
}

#[derive(Clone)]
pub struct GeneratedMap {
    pub size: u32,
    /// Noise texture map for rendering. 1.0 indicates no island exists.
    pub texture: Vec<u8>,
    /// Id on each pixel.
    pub region_ids: Generic2dMap<Option<u32>>,
    // TODO optimize this out.
    pub region_noise_values: Generic2dMap<f32>,
    pub region_centers: Vec<[f32; 2]>,
}

impl GeneratedMap {
    pub fn new(
        size: u32,
        min_region_size: u32,
        max_region_size: u32,
        seed: u32,
        land_threshold: f32,
        expected_region_cnt: u32,
        fbm: FbmSettings,
    ) -> Option<Self> {
        let map = PlaneMapBuilder::new(
            noise::Fbm::<Simplex>::new(seed)
                .set_frequency(fbm.frequency as f64)
                .set_lacunarity(fbm.lacunarity as f64)
                .set_persistence(fbm.persistence as f64),
        )
        .set_x_bounds(0.0, 1.0)
        .set_y_bounds(0.0, 1.0)
        .set_size(size as usize, size as usize)
        .build();

        let binary_map = map
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

                val * falloff
            })
            .map(|x| x > land_threshold as f64)
            .collect::<Vec<_>>();
        let mut binary_map = Generic2dMap::new(size as usize, size as usize, binary_map);

        fn bfs_region(
            x: i32,
            y: i32,
            area_index: u32,
            region_size: &mut u32,
            size: u32,
            binary_noise: &mut Generic2dMap<bool>,
            region_map: &mut Generic2dMap<Option<u32>>,
            position_sum: &mut [u32; 2],
        ) {
            if x < 0 || y < 0 || !*binary_noise.get_2d(x as usize, y as usize).unwrap() {
                return;
            }

            let ux = x as usize;
            let uy = y as usize;
            binary_noise.set_2d(ux, uy, false);
            region_map.set_2d(ux, uy, Some(area_index));
            *region_size += 1;
            position_sum[0] += x as u32;
            position_sum[1] += y as u32;

            for dx in [0, 0, 1, -1] {
                for dy in [1, -1, 0, 0] {
                    bfs_region(
                        x + dx,
                        y + dy,
                        area_index,
                        region_size,
                        size,
                        binary_noise,
                        region_map,
                        position_sum,
                    );
                }
            }
        }

        let mut region_map = Generic2dMap::empty(size as usize, size as usize);
        let mut region_centers = Vec::new();
        let mut is_discarded = Vec::new();
        let mut region_cnt = 0;
        let mut valid_region_cnt = 0;

        for x in 0..size as usize {
            for y in 0..size as usize {
                if *binary_map.get_2d(x, y).unwrap() {
                    let mut region_size = 0;
                    let mut position_sum = [0; 2];

                    bfs_region(
                        x as i32,
                        y as i32,
                        region_cnt,
                        &mut region_size,
                        size,
                        &mut binary_map,
                        &mut region_map,
                        &mut position_sum,
                    );

                    let valid = region_size >= min_region_size && region_size <= max_region_size;
                    is_discarded.push(!valid);
                    if valid {
                        valid_region_cnt += 1;
                    }
                    region_centers.push([
                        position_sum[0] as f32 / region_size as f32,
                        position_sum[1] as f32 / region_size as f32,
                    ]);
                    region_cnt += 1;
                }
            }
        }

        if valid_region_cnt < expected_region_cnt {
            return None;
        }

        // Discard regions
        // region_id (0..region_cnt) ->
        // None if it's discarded
        // Some if it's not (0..valid_region_cnt)
        let mut sanitized_region_id_mapper = vec![None; region_cnt as usize];
        let mut discarded_cnt = 0;
        for region_id in 0..region_cnt as usize {
            if is_discarded[region_id] {
                discarded_cnt += 1;
            } else {
                sanitized_region_id_mapper[region_id] = Some(region_id - discarded_cnt);
            }
        }

        let mut rng = StdRng::seed_from_u64(seed as u64);
        // sanitized_region_id -> random_id
        let mut region_id_shuffle = sanitized_region_id_mapper
            .clone()
            .into_iter()
            .filter_map(|x| x)
            .collect::<Vec<_>>();
        region_id_shuffle.shuffle(&mut rng);

        let raw_region_id_to_final_region_id = (0..region_cnt)
            .map(|region_id| {
                sanitized_region_id_mapper[region_id as usize].map(|id| region_id_shuffle[id])
            })
            // Truncate redundant regions
            .map(|region_id| {
                region_id
                    .is_some_and(|id| id < expected_region_cnt as usize)
                    .then(|| region_id)
            })
            .map(|x| x.flatten())
            .collect::<Vec<_>>();

        let sanitized_region_id_map = region_map
            .into_iter()
            .map(|region_id| region_id.and_then(|id| raw_region_id_to_final_region_id[id as usize]))
            .map(|id| id.map(|region_id| region_id as u32))
            .collect::<Vec<_>>();
        let sanitized_region_id_map =
            Generic2dMap::new(size as usize, size as usize, sanitized_region_id_map);

        let mut final_region_centers = vec![[0.0; 2]; expected_region_cnt as usize];
        for raw_region_id in 0..region_cnt as usize {
            if let Some(region_id) = raw_region_id_to_final_region_id[raw_region_id] {
                final_region_centers[region_id] = region_centers[raw_region_id];
            }
        }

        let texture_buffer = sanitized_region_id_map
            .clone()
            .into_iter()
            .map(|id| {
                (id.unwrap_or(valid_region_cnt) as f32 / valid_region_cnt as f32 * u8::MAX as f32)
                    as u8
            })
            .collect::<Vec<_>>();
        let mut texture = Vec::new();
        let _ = PngEncoder::new(&mut texture).write_image(
            &texture_buffer,
            size,
            size,
            ExtendedColorType::L8,
        );

        Some(Self {
            size,
            texture,
            region_ids: sanitized_region_id_map,
            // TODO optimize this out.
            region_noise_values: Generic2dMap::new(
                size as usize,
                size as usize,
                texture_buffer
                    .into_iter()
                    .map(|x| x as f32 / u8::MAX as f32)
                    .collect(),
            ),
            region_centers: final_region_centers,
        })
    }

    pub fn region_cnt(&self) -> u32 {
        self.region_centers.len() as u32
    }

    pub fn get_noise_value_at(&self, x: usize, y: usize) -> f32 {
        // self.get_region_at(x, y)
        //     .map(|id| id as f32 / self.region_cnt() as f32)
        //     .unwrap_or(1.0)
        self.region_noise_values
            .get_2d(x, y)
            .cloned()
            .unwrap_or(1.0)
    }

    pub fn get_region_at(&self, x: usize, y: usize) -> Option<u32> {
        self.region_ids.get_2d(x, y).cloned().flatten()
    }
}

#[derive(Clone)]
pub struct IslandMaps {
    islands: u32,
    page_size: u32,
    pages: u32,
    per_page_regions: u32,
    cached: Vec<GeneratedMap>,
}

impl IslandMaps {
    pub const PAGE_CNT: u32 = 5;
    pub const PAGE_SIZE: u32 = 128;
    pub const PER_PAGE_REGIONS: u32 = 10;

    pub fn new(db: &IslandDB) -> Self {
        let cnt = futures::executor::block_on(sql::query_island_count(db)).unwrap();

        let mut map = Self {
            islands: cnt.count,
            page_size: Self::PAGE_SIZE,
            pages: Self::PAGE_CNT,
            per_page_regions: Self::PER_PAGE_REGIONS,
            cached: Vec::new(),
        };
        map.update();
        map
    }

    pub fn update(&mut self) {
        let now = Local::now();
        let temporal_seed = now.year() as u32 + now.month() + now.day();
        let mut seed_offset = 0;

        self.cached = (0..self.pages)
            .map(|page| {
                let mut attempt = 0;

                loop {
                    log::info!(
                        "Generating island map: {}/{} attempt: {}",
                        page,
                        self.pages,
                        attempt
                    );
                    if let Some(map) = GeneratedMap::new(
                        self.page_size,
                        20,
                        40,
                        temporal_seed + page as u32 + seed_offset,
                        0.04,
                        self.per_page_regions,
                        FbmSettings {
                            frequency: self.page_size as f32 / 10.0,
                            lacunarity: 1.5,
                            persistence: 0.5,
                        },
                    ) {
                        break map;
                    }
                    attempt += 1;
                    seed_offset += 1;
                }
            })
            .collect();
    }

    pub fn get_cache(&self, page: u32) -> &GeneratedMap {
        &self.cached[page as usize]
    }

    pub fn get_region_at(&mut self, page: u32, coord: (usize, usize)) -> Option<IslandMapQuery> {
        let map = self.get_cache(page);
        let region_id = map.get_region_at(coord.0, coord.1)?;
        let noise_value = map.get_noise_value_at(coord.0, coord.1);
        Some(IslandMapQuery {
            region_id,
            noise_value,
        })
    }

    pub fn get_map_meta(&self) -> IslandMapMeta {
        IslandMapMeta {
            size: self.page_size,
            per_page_regions: self.per_page_regions,
            page_cnt: self.pages,
        }
    }
}
