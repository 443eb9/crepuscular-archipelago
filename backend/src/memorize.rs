use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::Deserialize;

use crate::model::MemorizeForm;

#[derive(Default)]
pub struct MemorizeCoolDown {
    value: HashMap<String, DateTime<Utc>>,
}

impl MemorizeCoolDown {
    pub fn add(&mut self, ip: String) {
        self.value.insert(ip, Utc::now());
    }

    pub fn is_cooling_down(&self, ip: &String) -> bool {
        self.value
            .get(ip)
            .is_some_and(|t| (Utc::now() - *t).num_seconds() < 3600)
    }
}

#[derive(Clone, Deserialize)]
pub struct MemorizeValidator {
    data: Vec<String>,
}

impl MemorizeValidator {
    pub fn validate(&self, form: &MemorizeForm) -> Result<(), String> {
        let Ok(id) = form.stu_id.parse::<u32>() else {
            return Err("Invalid student number.".to_string());
        };

        let id = id % 100;
        match self.data.get(id as usize - 1) {
            Some(data) => {
                if data != &form.name {
                    return Err(format!("Invalid sutdent number or name."));
                }
            }
            None => {
                return Err(format!("Invalid student number {}.", form.stu_id));
            }
        }

        if form.wechat.is_empty()
            && form.qq.is_empty()
            && form.phone.is_empty()
            && form.email.is_empty()
        {
            return Err("No contact info provided.".to_string());
        }

        Ok(())
    }
}
