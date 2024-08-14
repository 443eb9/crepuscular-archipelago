pub struct TagsFilter {
    pub filtered_ids: Vec<u32>,
    pub sql_conditions: String,
}

impl TagsFilter {
    pub fn new(filter: i32) -> Self {
        let tags_filter = unsafe { std::mem::transmute::<_, u32>(filter) };
        let filtered_ids = (0..31)
            .into_iter()
            .filter_map(|bit| {
                if (tags_filter & (1 << bit)) != 0 {
                    Some(bit)
                } else {
                    None
                }
            })
            .collect::<Vec<_>>();

        let sql_conditions = filtered_ids
            .iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(", ");

        Self {
            filtered_ids,
            sql_conditions,
        }
    }
}

#[derive(Debug)]
pub struct AdvancedFilter {
    pub is_exclude: bool,
    pub is_or_not_and: bool,
}

impl AdvancedFilter {
    pub fn new(filter: i32) -> Self {
        Self {
            is_exclude: (filter & (1 << 1)) != 0,
            is_or_not_and: (filter & (1 << 2)) != 0,
        }
    }
}
