import type { Article, Group, Product } from './types';

const categoryAliases: Record<string, string[]> = {
  'baby and kids': ['baby kids', 'baby', 'kids', 'family'],
  beauty: ['beauty', 'fashion beauty'],
  'community news': ['community', 'community news', 'editorial', 'events', 'local', 'news'],
  culture: ['culture', 'rituals', 'local'],
  fashion: ['fashion', 'fashion beauty'],
  food: ['food'],
  home: ['home', 'objects', 'essentials', 'apothecary'],
  jewelry: ['jewelry', 'jewellery', 'accessories'],
  sale: ['sale'],
  travel: ['travel'],
  wedding: ['wedding', 'weddings', 'love', 'relationships'],
  wellness: ['wellness', 'wellbeing', 'health', 'sex health'],
  women: ['women', 'fashion beauty', 'lifestyle'],
};

export function normalizeProfileCategory(value?: string | null) {
  return (value ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function termsForPreference(preference: string) {
  const normalized = normalizeProfileCategory(preference);
  const compact = normalized.replace(/\s+and\s+/g, ' ');
  return Array.from(new Set([normalized, compact, ...(categoryAliases[normalized] ?? [])]))
    .map(normalizeProfileCategory)
    .filter(Boolean);
}

function textMatchesPreference(text: string, preference: string) {
  const normalizedText = normalizeProfileCategory(text);
  const compactText = normalizedText.replace(/\s+/g, '');

  return termsForPreference(preference).some((term) => {
    const compactTerm = term.replace(/\s+/g, '');
    return (
      normalizedText.includes(term) ||
      term.includes(normalizedText) ||
      compactText.includes(compactTerm) ||
      compactTerm.includes(compactText)
    );
  });
}

function hasSelections(values?: string[] | null) {
  return Boolean(values?.some((value) => value.trim()));
}

export function filterProductsByProfileCategories(
  products: Product[],
  categories?: string[] | null,
  fallbackToOriginal = true,
) {
  if (!hasSelections(categories)) return products;

  const filtered = products.filter((product) => {
    const text = [
      product.category,
      product.categorySlug,
      ...(product.tags ?? []),
      ...(product.brands ?? []),
    ]
      .filter(Boolean)
      .join(' ');

    return categories!.some((category) => textMatchesPreference(text, category));
  });

  return filtered.length || !fallbackToOriginal ? filtered : products;
}

export function filterArticlesByProfileCategories(
  articles: Article[],
  categories?: string[] | null,
  fallbackToOriginal = true,
) {
  if (!hasSelections(categories)) return articles;

  const filtered = articles.filter((article) => {
    const text = [article.category, ...(article.tags ?? [])].filter(Boolean).join(' ');
    return categories!.some((category) => textMatchesPreference(text, category));
  });

  return filtered.length || !fallbackToOriginal ? filtered : articles;
}

export function filterGroupsByProfileSlugs(
  groups: Group[],
  slugs?: string[] | null,
  fallbackToOriginal = true,
) {
  if (!hasSelections(slugs)) return groups;

  const selected = new Set(slugs!.map((slug) => slug.trim().toLowerCase()).filter(Boolean));
  const filtered = groups.filter((group) => selected.has(group.slug.toLowerCase()));
  return filtered.length || !fallbackToOriginal ? filtered : groups;
}
