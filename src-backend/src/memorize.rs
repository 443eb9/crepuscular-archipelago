use std::collections::HashMap;

use chrono::{DateTime, Utc};

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
