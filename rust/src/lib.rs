//! NameForge's specialized high-throughput engine.
//!
//! This crate deliberately contains deterministic primitives only. It does not
//! invent linguistic rules or claim that a generated name is culturally valid.
//! The TypeScript application remains the product interface and source of truth
//! until parity tests justify routing a workload through this engine.

use std::collections::HashSet;
use unicode_normalization::UnicodeNormalization;

/// Canonical comparison key: NFC, lowercase, punctuation/whitespace collapsed.
pub fn comparison_key(input: &str) -> String {
    let normalized: String = input.nfc().collect();
    let mut output = String::with_capacity(normalized.len());
    let mut pending_space = false;

    for ch in normalized.chars().flat_map(char::to_lowercase) {
        if ch.is_alphanumeric() || is_combining_mark(ch) || is_symbol(ch) {
            if pending_space && !output.is_empty() {
                output.push(' ');
            }
            pending_space = false;
            output.push(ch);
        } else {
            pending_space = true;
        }
    }
    output.trim().to_owned()
}

fn is_combining_mark(ch: char) -> bool {
    matches!(ch as u32,
        0x0300..=0x036F | 0x1AB0..=0x1AFF | 0x1DC0..=0x1DFF |
        0x20D0..=0x20FF | 0xFE20..=0xFE2F)
}

fn is_symbol(ch: char) -> bool {
    matches!(ch as u32, 0x200C..=0x200D | 0xFE00..=0xFE0F)
}

/// Levenshtein distance over Unicode scalar values, using O(min(n,m)) memory.
pub fn levenshtein_distance(left: &str, right: &str) -> usize {
    let mut a: Vec<char> = comparison_key(left).chars().collect();
    let mut b: Vec<char> = comparison_key(right).chars().collect();
    if a.len() > b.len() {
        std::mem::swap(&mut a, &mut b);
    }
    if a.is_empty() { return b.len(); }

    let mut row: Vec<usize> = (0..=a.len()).collect();
    for (i, right_char) in b.iter().enumerate() {
        let mut diagonal = row[0];
        row[0] = i + 1;
        for (j, left_char) in a.iter().enumerate() {
            let above = row[j + 1];
            let cost = usize::from(left_char != right_char);
            row[j + 1] = (row[j + 1] + 1).min(row[j] + 1).min(diagonal + cost);
            diagonal = above;
        }
    }
    row[a.len()]
}

/// Deduplicate a batch while preserving the first occurrence and original spelling.
pub fn deduplicate<'a, I>(items: I) -> Vec<String>
where
    I: IntoIterator<Item = &'a str>,
{
    let mut seen = HashSet::new();
    let mut output = Vec::new();
    for item in items {
        let key = comparison_key(item);
        if !key.is_empty() && seen.insert(key) {
            output.push(item.to_owned());
        }
    }
    output
}

/// Calculate unique ratio (0.0..=1.0) after Unicode-aware normalization.
pub fn unique_ratio(items: &[String]) -> f64 {
    if items.is_empty() { return 1.0; }
    let unique = items.iter().map(|s| comparison_key(s)).collect::<HashSet<_>>().len();
    unique as f64 / items.len() as f64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_canonical_unicode_equivalents() {
        assert_eq!(comparison_key("Élodie"), comparison_key("E\u{301}lodie"));
    }

    #[test]
    fn preserves_non_latin_scripts() {
        assert_eq!(comparison_key("مُحَمَّد"), "مُحَمَّد");
        assert_eq!(comparison_key("東京"), "東京");
        assert_eq!(comparison_key("김민준"), "김민준");
    }

    #[test]
    fn computes_unicode_levenshtein_distance() {
        assert_eq!(levenshtein_distance("café", "cafe"), 1);
        assert_eq!(levenshtein_distance("東京", "京都"), 2);
    }

    #[test]
    fn deduplicates_without_reordering() {
        let input = ["Élodie", "E\u{301}lodie", "محمد", "محمد", "東京"];
        assert_eq!(deduplicate(input), vec!["Élodie", "محمد", "東京"]);
    }

    #[test]
    fn unique_ratio_handles_empty_and_repeated_batches() {
        assert_eq!(unique_ratio(&[]), 1.0);
        assert_eq!(unique_ratio(&["A".into(), "a".into(), "B".into()]), 2.0 / 3.0);
    }
}
