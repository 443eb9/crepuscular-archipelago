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
    #[derive(Debug, Clone, Copy)]
    pub struct AdvancedFilterFlags : u32 {
        const TAG_INVERT                = 1 << 1;
        const TAG_OR_LOGIC              = 1 << 2;
        const EXCLUDE_FINISHED          = 1 << 3;
        const EXCLUDE_WORK_IN_PROGRESS  = 1 << 4;
        const EXCLUDE_LONG_TERM_PROJECT = 1 << 5;
        const EXCLUDE_DEPRECATED        = 1 << 6;
        const EXCLUDE_DELETED           = 1 << 7;
    }
}

#[derive(Debug)]
pub struct AdvancedFilter {
    pub is_exclude: bool,
    pub and_sql_restriction: String,
    pub excluded_state_sql_restriction: String,
}

impl AdvancedFilter {
    pub fn new(filter: i32, tags_filter: &TagsFilter) -> Self {
        let flags = AdvancedFilterFlags::from_bits_truncate(unsafe { std::mem::transmute(filter) });

        let excluded_state_sql_restriction = {
            if flags.is_empty() {
                String::default()
            } else {
                let exclusion_bits_start = AdvancedFilterFlags::EXCLUDE_FINISHED
                    .bits()
                    .trailing_zeros();
                format!(
                    "AND state NOT IN ({})",
                    flags
                        .intersection(
                            AdvancedFilterFlags::EXCLUDE_FINISHED
                                | AdvancedFilterFlags::EXCLUDE_WORK_IN_PROGRESS
                                | AdvancedFilterFlags::EXCLUDE_LONG_TERM_PROJECT
                                | AdvancedFilterFlags::EXCLUDE_DEPRECATED
                                | AdvancedFilterFlags::EXCLUDE_DELETED
                        )
                        .iter()
                        .map(|x| (x.bits().trailing_zeros() - exclusion_bits_start).to_string())
                        .collect::<Vec<_>>()
                        .join(",")
                )
            }
        };

        dbg!(&excluded_state_sql_restriction);

        let and_sql_restriction = {
            if tags_filter.filtered_ids.is_empty() || (filter & (1 << 2)) != 0 {
                String::default()
            } else {
                format!("HAVING COUNT(tag_id) = {}", tags_filter.filtered_ids.len())
            }
        };

        Self {
            is_exclude: flags.contains(AdvancedFilterFlags::TAG_INVERT)
                && !tags_filter.filtered_ids.is_empty(),
            and_sql_restriction,
            excluded_state_sql_restriction,
        }
    }
}
