
use nameforge_engine::{comparison_key, deduplicate, levenshtein_distance};
use serde_json::Value;
use std::{env, fs, process};

fn hash_strings<'a>(items: impl IntoIterator<Item = &'a str>) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for item in items {
        for byte in item.as_bytes().iter().copied().chain(std::iter::once(0xff)) {
            hash ^= byte as u64;
            hash = hash.wrapping_mul(0x100000001b3);
        }
    }
    format!("{:016x}", hash)
}

fn main() {
    let path = env::args().nth(1).unwrap_or_else(|| {
        eprintln!("usage: nameforge-bench <input.json>"); process::exit(2)
    });
    let raw = fs::read_to_string(path).expect("read benchmark input");
    let values: Vec<String> = serde_json::from_str::<Value>(&raw).expect("valid JSON array")
        .as_array().expect("JSON array")
        .iter().map(|v| v.as_str().expect("string entries").to_owned()).collect();
    let normalized: Vec<String> = values.iter().map(|s| comparison_key(s)).collect();
    let unique = deduplicate(values.iter().map(String::as_str));
    let mut distance_checksum: u64 = 0;
    for pair in values.chunks(2) {
        if pair.len() == 2 {
            distance_checksum = distance_checksum.wrapping_add(
                levenshtein_distance(&pair[0], &pair[1]) as u64
            );
        }
    }
    let result = serde_json::json!({
        "input_count": values.len(),
        "normalized_count": normalized.len(),
        "unique_count": unique.len(),
        "normalized_hash": hash_strings(normalized.iter().map(String::as_str)),
        "deduplicated_hash": hash_strings(unique.iter().map(String::as_str)),
        "distance_checksum": distance_checksum
    });
    println!("{}", result);
}
