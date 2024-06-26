use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::Deserialize;

use crate::model::{MemorizeForm, MemorizeFormMeta};

#[derive(Default)]
pub struct MemorizeCoolDown {
    value: HashMap<String, DateTime<Utc>>,
}

impl MemorizeCoolDown {
    pub fn add(&mut self, ip: String) {
        self.value.insert(ip, Utc::now());
    }

    pub fn get(&self, ip: &String) -> i64 {
        self.value
            .get(ip)
            .map(|t| (Utc::now() - *t).num_seconds())
            .unwrap_or(601)
    }
}

#[derive(Clone, Deserialize)]
pub struct MemorizeValidator {
    data: Vec<String>,
}

impl MemorizeValidator {
    pub fn validate(&self, form: &MemorizeForm) -> Result<(), String> {
        let Ok(stu_id) = form.stu_id.parse::<u32>() else {
            return Err("无效学号".to_string());
        };

        let id = stu_id % 100;
        if stu_id - id != 20240400 {
            return Err("无效学号".to_string());
        }

        match self.data.get(id as usize - 1) {
            Some(data) => {
                if data != &form.name {
                    return Err(format!("无效的学号或姓名"));
                }
            }
            None => {
                return Err(format!("无效学号 {}", form.stu_id));
            }
        }

        if form.wechat.is_empty()
            && form.qq.is_empty()
            && form.phone.is_empty()
            && form.email.is_empty()
        {
            return Err("请至少填写一种联系方式".to_string());
        }

        Ok(())
    }
}

pub fn generate_csv(data: Vec<(MemorizeForm, MemorizeFormMeta)>) -> String {
    data.into_iter().fold("八位学号,姓名,微信,QQ,电话,邮箱,一个词描述,爱好,职位,未来专业(or计划),留言,提交时间,提交ip\n".to_string(), |mut acc, (form,meta)| {
        acc.push_str(&format!(
            "{},{},{},{},{},{},{},{},{},{},{},{},{}\n",
            form.stu_id, form.name, form.wechat, form.qq, form.phone,
            form.email, form.desc, form.hobby, form.position, form.ftr_major,
            form.message, meta.time, meta.ip,
        ));
        acc
    })
}
