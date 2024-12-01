use sqlx::{query, query_as, SqlitePool};
use tantivy::{
    aggregation::metric::TopHitsAggregation,
    collector::TopDocs,
    doc,
    query::{FuzzyTermQuery, QueryParser},
    schema::{
        Field, IndexRecordOption, NumericOptions, Schema, TextFieldIndexing, TextOptions, Value,
    },
    tokenizer::{LowerCaser, RemoveLongFilter, Stemmer, TextAnalyzer},
    DocSet, Document, HasLen, Index, IndexReader, Searcher, TantivyDocument, Term,
};
use tantivy_jieba::JiebaTokenizer;

use crate::model::{Island, IslandSearchQuery, IslandSearchResult, IslandSearchResults};

#[derive(Clone)]
pub struct FullTextSearchEngine {
    reader: IndexReader,
    query_parser: QueryParser,

    id_field: Field,
    content_field: Field,
}

impl FullTextSearchEngine {
    pub async fn new(db: &SqlitePool) -> Self {
        let mut schema_builder = Schema::builder();
        let content = schema_builder.add_text_field(
            "content",
            TextOptions::default()
                .set_indexing_options(
                    TextFieldIndexing::default()
                        .set_tokenizer("jieba")
                        .set_index_option(IndexRecordOption::WithFreqsAndPositions),
                )
                .set_stored(),
        );

        let id = schema_builder.add_u64_field("id", NumericOptions::default().set_stored());
        let schema = schema_builder.build();

        let tokenizer = JiebaTokenizer;
        let index = Index::create_in_ram(schema);
        let analyzer = TextAnalyzer::builder(tokenizer)
            .filter(RemoveLongFilter::limit(40))
            .filter(LowerCaser)
            .filter(Stemmer::default())
            .build();
        index.tokenizers().register("jieba", analyzer);

        let articles: Vec<Island> =
            query_as("SELECT id, content FROM islands WHERE is_deleted = false")
                .fetch_all(db)
                .await
                .unwrap();

        let mut index_writer = index.writer(50_000_000).unwrap();
        for article in articles {
            let mut document = TantivyDocument::default();
            document.add_field_value(id, article.id as u64);
            document.add_field_value(content, article.content);
            index_writer.add_document(document).unwrap();
        }
        index_writer.commit().unwrap();

        let reader = index.reader().unwrap();
        let query_parser = QueryParser::for_index(&index, vec![content]);

        Self {
            reader,
            query_parser,

            id_field: id,
            content_field: content,
        }
    }

    pub fn search(&self, search_query: &IslandSearchQuery) -> IslandSearchResults {
        let searcher = self.reader.searcher();
        let term = Term::from_field_text(self.content_field, &search_query.keywords);
        let query = FuzzyTermQuery::new(term, 2, true);
        // let query = self
        //     .query_parser
        //     .parse_query(&search_query.keywords)
        //     .unwrap();
        let top_docs = searcher.search(&query, &TopDocs::with_limit(10)).unwrap();

        let results = top_docs
            .into_iter()
            .map(|(score, doc_address)| {
                let retrieved_doc: TantivyDocument = searcher.doc(doc_address).unwrap();
                let id = retrieved_doc
                    .get_first(self.id_field)
                    .unwrap()
                    .as_u64()
                    .unwrap() as u32;

                IslandSearchResult {
                    score,
                    id,
                    preview: Default::default(),
                }
            })
            .collect();

        IslandSearchResults { results }
    }
}
