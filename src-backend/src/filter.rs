pub struct TagsFilter {
    pub filtered_ids: Vec<u32>,
    pub sql_restriction: String,
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

        let sql_restriction = {
            if filtered_ids.is_empty() {
                String::default()
            } else {
                format!(
                    "AND tag_id IN ({})",
                    filtered_ids
                        .iter()
                        .map(|_| "?")
                        .collect::<Vec<_>>()
                        .join(", ")
                )
            }
        };

        Self {
            filtered_ids,
            sql_restriction,
        }
    }
}

bitflags::bitflags! {
    #[derive(Debug)]
    pub struct ExcludedStates : u32 {
        const FINISHED = 1 << 0;
        const WORK_IN_PROGRESS = 1 << 1;
        const LONG_TERM_PROJECT = 1 << 2;
        const DEPRECATED = 1 << 3;
    }
}

#[derive(Debug)]
pub struct AdvancedFilter {
    pub is_exclude: bool,
    pub and_sql_restriction: String,
    pub excluded_states: ExcludedStates,
    pub excluded_state_sql_restriction: String,
}

impl AdvancedFilter {
    pub fn new(filter: i32, tags_filter: &TagsFilter) -> Self {
        let excluded_states = ExcludedStates::from_bits_truncate((filter >> 3) as u32);
        let excluded_state_sql_restriction = {
            if excluded_states.is_empty() {
                String::default()
            } else {
                format!(
                    "AND state NOT IN ({})",
                    excluded_states
                        .iter()
                        .map(|x| x.bits().trailing_zeros().to_string())
                        .collect::<Vec<_>>()
                        .join(",")
                )
            }
        };

        let and_sql_restriction = {
            if tags_filter.filtered_ids.is_empty() || (filter & (1 << 2)) != 0 {
                String::default()
            } else {
                format!("HAVING COUNT(tag_id) = {}", tags_filter.filtered_ids.len())
            }
        };

        Self {
            is_exclude: (filter & (1 << 1)) != 0 && !tags_filter.filtered_ids.is_empty(),
            and_sql_restriction,
            excluded_states,
            excluded_state_sql_restriction,
        }
    }
}
