
use std::collections::HashSet;
use unicode_normalization::UnicodeNormalization;
use unicode_categories::UnicodeCategories;

/// Matches the TypeScript benchmark's NFC/lowercase and Unicode L/M/N/S policy.
pub fn comparison_key(input: &str) -> String {
    let normalized: String = input.nfc().collect();
    let mut output = String::with_capacity(normalized.len());
    let mut pending_space = false;
    for ch in normalized.chars().flat_map(char::to_lowercase) {
        if ch.is_letter() || ch.is_mark() || ch.is_number() || ch.is_symbol() {
            if pending_space && !output.is_empty() { output.push(' '); }
            pending_space = false;
            output.push(ch);
        } else {
            pending_space = true;
        }
    }
    output.trim().to_owned()
}

pub fn deduplicate<'a, I>(items: I) -> Vec<String>
where I: IntoIterator<Item = &'a str> {
    let mut seen = HashSet::new();
    let mut output = Vec::new();
    for item in items {
        let key = comparison_key(item);
        if !key.is_empty() && seen.insert(key) { output.push(item.to_owned()); }
    }
    output
}

pub fn levenshtein_distance(left: &str, right: &str) -> usize {
    let mut a: Vec<char> = comparison_key(left).chars().collect();
    let mut b: Vec<char> = comparison_key(right).chars().collect();
    if a.len() > b.len() { std::mem::swap(&mut a, &mut b); }
    if a.is_empty() { return b.len(); }
    let mut row: Vec<usize> = (0..=a.len()).collect();
    for (i, rc) in b.iter().enumerate() {
        let mut diagonal = row[0];
        row[0] = i + 1;
        for (j, lc) in a.iter().enumerate() {
            let above = row[j + 1];
            let cost = usize::from(lc != rc);
            row[j + 1] = (row[j + 1] + 1).min(row[j] + 1).min(diagonal + cost);
            diagonal = above;
        }
    }
    row[a.len()]
}

pub fn unique_ratio(items: &[String]) -> f64 {
    if items.is_empty() { return 1.0; }
    let unique = items.iter().map(|s| comparison_key(s)).collect::<HashSet<_>>().len();
    unique as f64 / items.len() as f64
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn unicode_nfc_equivalence() {
        assert_eq!(comparison_key("Élodie"), comparison_key("E\\u{301}lodie"));
    }
    #[test] fn keeps_scripts_and_symbols() {
        assert_eq!(comparison_key("مُحَمَّد"), "مُحَمَّد");
        assert_eq!(comparison_key("東京"), "東京");
        assert_eq!(comparison_key("A+B"), "a+b");
    }
    #[test] fn deduplicates_stably() {
        assert_eq!(deduplicate(["Élodie", "E\\u{301}lodie", "東京"]), vec!["Élodie", "東京"]);
    }
    #[test] fn levenshtein_uses_unicode_scalars() {
        assert_eq!(levenshtein_distance("東京", "京都"), 2);
    }
}
