mkdir output
deno i
# deno task build
cargo build --release
mv .next output
mv target/release/backend output
7z a -tzip output.zip output
