export type UsernameStyle = 'gaming' | 'fantasy' | 'minimal' | 'elegant';

export interface UsernameOptions {
  baseName?: string;
  style: UsernameStyle;
  prefix?: string;
  suffix?: string;
  minLength: number;
  maxLength: number;
  quantity?: number;
}

export interface UsernameValidation {
  valid: boolean;
  normalized: string;
  length: number;
  errors: string[];
}

const STYLE_WORDS: Record<UsernameStyle, { prefixes: string[]; suffixes: string[]; roots: string[] }> = {
  gaming: {
    prefixes: ['x', 'neo', 'dark', 'pro', 'its', 'the'],
    suffixes: ['gg', 'plays', 'fps', 'x', 'exe', 'tv'],
    roots: ['viper', 'shadow', 'nova', 'glitch', 'phantom', 'frost', 'pixel', 'venom', 'rogue', 'turbo', 'raven', 'blaze'],
  },
  fantasy: {
    prefixes: ['aether', 'rune', 'eld', 'moon', 'wyrm', 'syl'],
    suffixes: ['born', 'blade', 'weaver', 'thorn', 'keeper', 'song'],
    roots: ['aether', 'rune', 'ember', 'sylvan', 'drake', 'astral', 'wyvern', 'thorn', 'lumen', 'fae', 'myth', 'dusk'],
  },
  minimal: {
    prefixes: ['n', 'mono', 'zen', 'neo', 'low', 'one'],
    suffixes: ['io', 'co', 'lab', '01', 'x', 'hq'],
    roots: ['axis', 'echo', 'nox', 'nexa', 'mono', 'luma', 'form', 'line', 'nova', 'zero', 'kin', 'sol'],
  },
  elegant: {
    prefixes: ['de', 'la', 'sir', 'maison', 'the', 'atelier'],
    suffixes: ['studio', 'official', 'noir', 'elle', 'luxe', 'verse'],
    roots: ['velvet', 'aurelia', 'sterling', 'ivory', 'opal', 'celeste', 'solenne', 'noble', 'sable', 'lumiere', 'monarch', 'eden'],
  },
};

const ALLOWED_PATTERN = /^[\p{L}\p{N}_-]+$/u;

export function countUsernameCharacters(value: string): number {
  return Array.from(value.normalize('NFC')).length;
}

export function normalizeUsernamePart(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/gu, '');
}

export function validateUsername(value: string, minLength = 3, maxLength = 16): UsernameValidation {
  const normalized = value.normalize('NFC');
  const length = countUsernameCharacters(normalized);
  const errors: string[] = [];

  if (!normalized) errors.push('empty');
  if (normalized !== normalized.trim() || /\s/u.test(normalized)) errors.push('whitespace');
  if (normalized && !ALLOWED_PATTERN.test(normalized)) errors.push('invalid-characters');
  if (!Number.isInteger(minLength) || !Number.isInteger(maxLength) || minLength < 1 || maxLength < minLength) {
    errors.push('invalid-limits');
  } else {
    if (length < minLength) errors.push('too-short');
    if (length > maxLength) errors.push('too-long');
  }

  return { valid: errors.length === 0, normalized, length, errors };
}

function cleanPart(value: string): string {
  return normalizeUsernamePart(value).replace(/[^\p{L}\p{N}_-]/gu, '');
}

function titleCase(value: string): string {
  return value ? value.charAt(0).toLocaleUpperCase() + value.slice(1) : value;
}

function buildCandidate(core: string, prefix: string, suffix: string, style: UsernameStyle, index: number): string {
  const styledCore = style === 'elegant' || style === 'fantasy' ? titleCase(core) : core;
  const prefixPart = prefix || (index % 3 === 1 ? STYLE_WORDS[style].prefixes[index % STYLE_WORDS[style].prefixes.length] : '');
  const suffixPart = suffix || (index % 3 === 2 ? STYLE_WORDS[style].suffixes[index % STYLE_WORDS[style].suffixes.length] : '');
  const separator = style === 'minimal' ? '' : (index % 2 === 0 ? '_' : '');
  const leftSeparator = prefixPart && separator ? separator : '';
  const rightSeparator = suffixPart && separator ? separator : '';
  return cleanPart(prefixPart) + leftSeparator + cleanPart(styledCore) + rightSeparator + cleanPart(suffixPart);
}

export function generateUsernameSuggestions(options: UsernameOptions): string[] {
  const { style, minLength, maxLength } = options;
  if (!Number.isInteger(minLength) || !Number.isInteger(maxLength) || minLength < 1 || maxLength < minLength) return [];

  const words = STYLE_WORDS[style];
  const base = cleanPart(options.baseName || '');
  const prefix = cleanPart(options.prefix || '');
  const suffix = cleanPart(options.suffix || '');
  const quantity = Math.min(Math.max(options.quantity ?? 12, 1), 40);
  const cores = base
    ? [base, ...words.roots.map((root) => (style === 'elegant' || style === 'fantasy' ? titleCase(base) : base) + root)]
    : words.roots;
  const candidates: string[] = [];
  const seen = new Set<string>();

  for (let index = 0; candidates.length < quantity && index < 400; index += 1) {
    const core = cores[index % cores.length];
    const candidate = buildCandidate(core, prefix, suffix, style, index);
    const validation = validateUsername(candidate, minLength, maxLength);
    const key = validation.normalized.toLocaleLowerCase();

    if (validation.valid && !seen.has(key)) {
      seen.add(key);
      candidates.push(validation.normalized);
    }
  }

  return candidates;
}
