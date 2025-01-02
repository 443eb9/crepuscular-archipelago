use chrono::{Datelike, Local};
use image::{codecs::png::PngEncoder, ExtendedColorType, ImageBuffer, ImageEncoder, Luma};
use noise::{
    utils::{NoiseMapBuilder, PlaneMapBuilder},
    MultiFractal, Simplex,
};

use crate::sql::{self, IslandDB};

#[derive(Clone)]
pub struct IslandMap {
    islands: u32,
    cached: Option<Vec<u8>>,
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
        let size = 512;

        let now = Local::now();
        let map = PlaneMapBuilder::new(
            noise::Fbm::<Simplex>::new(now.year() as u32 + now.month() + now.day())
                .set_frequency(10.0)
                .set_persistence(0.8)
                .set_lacunarity(1.5),
        )
        .set_x_bounds(0.0, 1.0)
        .set_y_bounds(0.0, 1.0)
        .set_size(size as usize, size as usize)
        .build();
        let pixels = map.into_iter().map(|x| (x * 255.0) as u8).collect();
        let image = ImageBuffer::<Luma<u8>, _>::from_vec(size, size, pixels).unwrap();

        let mut buffer = Vec::with_capacity((size * size) as usize);
        let _ = PngEncoder::new(&mut buffer).write_image(&image, size, size, ExtendedColorType::L8);
        self.cached = Some(buffer)
    }

    pub fn get_cache(&mut self) -> &[u8] {
        if self.cached.is_none() {
            self.update();
        }
        self.cached.as_ref().unwrap()
    }
}