use serde::Deserialize;

use crate::model::MemorizeFormWithMeta;

#[derive(Clone, Deserialize)]
pub struct MemorizeValidator {
    data: Vec<String>,
}

impl MemorizeValidator {
    pub fn validate(&self, form: &MemorizeFormWithMeta) -> Result<(), String> {
        let id = form.stu_id % 100;
        match self.data.get(id as usize - 1) {
            Some(data) => {
                if data != &form.name {
                    return Err(format!("Incorrect sutdent number or name."));
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
