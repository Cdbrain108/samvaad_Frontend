/**
 * queryIntent.js
 * ==============
 * Deterministic query-intent layer for the browser pipeline. Direct mirror of
 * rag_engine/query_intent.py, reading the SAME rules file
 * (rag_scriptures/query_intent_rules.json) via the '@shared-rules' alias, so
 * the frontend and backend cannot answer the same question differently.
 *
 * Two jobs:
 *
 * 1. HOW MANY verses did the seeker ask for?
 *    Multi-verse is STRICTLY OPT-IN. verseCount stays 1 unless the query names
 *    a number next to a countable noun ("5 questions from Garuda Purana") or
 *    uses an unambiguous plural phrase ("kuch shlok bataiye"). An ordinary
 *    emotional query is never read as a multi-verse request.
 *
 * 2. WHICH scripture, at full precision?
 *    "Garuda Purana" resolves to the exact `garuda_purana` collection filter
 *    instead of the generic `purana` bucket, which is what made a Garuda
 *    Purana question retrieve from all eighteen Puranas.
 */

import rules from '@shared-rules/query_intent_rules.json';

// How many verses a bare plural ask ("kuch shlok") yields. Weaker signal than
// a stated number, so stay modest. Matches UNNUMBERED_MULTI_COUNT in Python.
const UNNUMBERED_MULTI_COUNT = 3;

// Filler words tolerated between the number and the noun ("5 short verses").
const MAX_FILLER_WORDS = 4;

const DEVANAGARI_RE = /[ऀ-ॿ]/;

const POLICY = rules.policy || {};
const DEFAULT_VERSE_COUNT = Number(POLICY.default_verse_count) || 1;
const MAX_VERSE_COUNT = Number(POLICY.max_verse_count) || 8;

const NUMBER_WORDS = Object.fromEntries(
  Object.entries(rules.number_words || {}).map(([k, v]) => [k.toLowerCase(), Number(v)])
);

const COUNTABLE_NOUNS = (rules.countable_nouns || [])
  .map((n) => String(n).toLowerCase())
  .filter(Boolean);

const MULTI_PHRASES = (rules.explicit_multi_phrases || [])
  .map((p) => String(p).toLowerCase())
  .filter(Boolean);

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasDevanagari(s) {
  return DEVANAGARI_RE.test(s);
}

function byLengthDesc(a, b) {
  return b.length - a.length;
}

/**
 * Number immediately followed (within MAX_FILLER_WORDS) by a countable noun.
 * Requiring that adjacency is what keeps "I have 2 children and I am
 * struggling" from being read as a request for two verses.
 */
function buildCountPattern() {
  if (!COUNTABLE_NOUNS.length) return null;

  const wordNums = Object.keys(NUMBER_WORDS).sort(byLengthDesc).map(escapeRe);
  const numberAlt = wordNums.length ? `(?:\\d{1,2}|${wordNums.join('|')})` : '\\d{1,2}';

  const latin = [];
  const dev = [];
  for (const noun of COUNTABLE_NOUNS) {
    (hasDevanagari(noun) ? dev : latin).push(escapeRe(noun));
  }

  const nounParts = [];
  // \b after Latin nouns stops "verse" matching inside "versed". Devanagari
  // skips it: vowel signs and conjuncts make \b unreliable there.
  if (latin.length) nounParts.push(`(?:${latin.sort(byLengthDesc).join('|')})\\b`);
  if (dev.length) nounParts.push(`(?:${dev.sort(byLengthDesc).join('|')})`);
  const nounAlt = `(?:${nounParts.join('|')})`;

  const filler = `(?:\\S+[\\s\\-]+){0,${MAX_FILLER_WORDS}}`;

  return new RegExp(
    `(?:^|[^\\w])(${numberAlt})[\\s\\-]+${filler}(${nounAlt})`,
    'giu'
  );
}

function buildMultiPattern() {
  if (!MULTI_PHRASES.length) return null;
  const alts = [...MULTI_PHRASES].sort(byLengthDesc).map(escapeRe);
  return new RegExp(`(?:${alts.join('|')})`, 'iu');
}

const COUNT_RE = buildCountPattern();
const MULTI_RE = buildMultiPattern();

function parseNumber(token) {
  const t = String(token || '').trim().toLowerCase();
  if (!t) return null;
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  if (Object.prototype.hasOwnProperty.call(NUMBER_WORDS, t)) return NUMBER_WORDS[t];
  // Devanagari digits (१२३) arrive as individually mapped characters.
  if ([...t].every((ch) => Object.prototype.hasOwnProperty.call(NUMBER_WORDS, ch))) {
    const digits = [...t].map((ch) => String(NUMBER_WORDS[ch])).join('');
    const n = parseInt(digits, 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

/**
 * Flat [alias, route] list sorted longest-alias-first, so "garuda purana" is
 * tested before the generic "purana" and "srimad bhagavatam" before
 * "bhagavatam".
 */
function buildAliasIndex() {
  const index = [];

  for (const [sid, meta] of Object.entries(rules.scriptures || {})) {
    const route = {
      scriptureFilter: meta.filter || sid,
      scriptureIds: [sid],
      label: meta.label || sid,
      isExact: true,
    };
    for (const alias of meta.aliases || []) {
      const a = String(alias).toLowerCase().trim();
      if (a) index.push([a, route]);
    }
  }

  for (const [bucket, meta] of Object.entries(rules.generic_buckets || {})) {
    const route = {
      scriptureFilter: bucket,
      scriptureIds: [],
      label: meta.label || bucket,
      isExact: false,
    };
    for (const alias of meta.aliases || []) {
      const a = String(alias).toLowerCase().trim();
      if (a) index.push([a, route]);
    }
  }

  index.sort((x, y) => y[0].length - x[0].length);
  return index;
}

const ALIAS_INDEX = buildAliasIndex();

/**
 * Substring test with a word-ish boundary for Latin aliases, so short ones
 * behave: "garud" must not fire inside "garudasana". Devanagari aliases use a
 * plain substring test because \b is unreliable across vowel signs.
 */
function aliasPresent(text, alias) {
  if (hasDevanagari(alias)) return text.includes(alias);
  const re = new RegExp(`(?:^|[^a-z0-9])${escapeRe(alias)}(?:[^a-z0-9]|$)`, 'i');
  return re.test(text);
}

const DEFAULT_VERSE_INTENT = Object.freeze({
  verseCount: DEFAULT_VERSE_COUNT,
  wantsMultiple: false,
  trigger: 'default_single',
  matchedText: '',
});

const DEFAULT_ROUTE = Object.freeze({
  scriptureFilter: 'all',
  scriptureIds: [],
  label: '',
  isExact: false,
  matchedAlias: '',
});

/**
 * How many verses the seeker asked for. Returns 1 for anything that is not an
 * explicit request, so the single-primary-verse satsang default is untouched.
 */
export function detectVerseIntent(query) {
  if (!query || !String(query).trim()) return { ...DEFAULT_VERSE_INTENT };

  const text = String(query).trim().split(/\s+/).join(' ');

  // 1. Strongest signal: a stated number sitting next to a countable noun.
  if (COUNT_RE) {
    COUNT_RE.lastIndex = 0;
    let m;
    while ((m = COUNT_RE.exec(text)) !== null) {
      const count = parseNumber(m[1]);
      if (count === null || count <= 1) continue;
      return {
        verseCount: Math.min(count, MAX_VERSE_COUNT),
        wantsMultiple: true,
        trigger: 'explicit_count',
        matchedText: m[0].trim(),
      };
    }
  }

  // 2. Weaker but still explicit: an unambiguous plural ask with no number.
  if (MULTI_RE) {
    const m = MULTI_RE.exec(text);
    if (m) {
      return {
        verseCount: Math.min(UNNUMBERED_MULTI_COUNT, MAX_VERSE_COUNT),
        wantsMultiple: true,
        trigger: 'explicit_plural_phrase',
        matchedText: m[0].trim(),
      };
    }
  }

  return { ...DEFAULT_VERSE_INTENT };
}

/**
 * Resolve a named scripture to its exact collection filter. Prefers the most
 * specific alias, and falls back to 'all' when no scripture is named.
 */
export function resolveScripture(query) {
  if (!query || !String(query).trim()) return { ...DEFAULT_ROUTE };

  const text = String(query).trim().toLowerCase().split(/\s+/).join(' ');

  for (const [alias, route] of ALIAS_INDEX) {
    if (aliasPresent(text, alias)) {
      return {
        scriptureFilter: route.scriptureFilter,
        scriptureIds: [...route.scriptureIds],
        label: route.label,
        isExact: route.isExact,
        matchedAlias: alias,
      };
    }
  }

  return { ...DEFAULT_ROUTE };
}

/** Full deterministic intent pass: verse count + scripture routing. */
export function analyzeQuery(query) {
  const verse = detectVerseIntent(query);
  const scripture = resolveScripture(query);
  return {
    originalQuery: query || '',
    ...verse,
    ...scripture,
    verse,
    scripture,
  };
}

export { MAX_VERSE_COUNT, DEFAULT_VERSE_COUNT };
