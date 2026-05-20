/** Category-specific fallback images */
const CATEGORY_IMAGES = {
  whiskey: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=400&q=80',
  beer: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=80',
  vodka: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=400&q=80',
  gin: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80',
  rum: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80',
  default: 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39?auto=format&fit=crop&w=400&q=80',
}

/**
 * Returns a category-appropriate fallback image for a product.
 * Uses the product's category name, brand, name, or description to detect the type.
 */
export function getProductFallbackImage(product) {
  if (product.image_url) return product.image_url
  const haystack = [
    product.categories?.name,
    product.name,
    product.brand,
    product.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/whisky|whiskey|bourbon|scotch|malt/.test(haystack)) return CATEGORY_IMAGES.whiskey
  if (/beer|ipa|ale|lager|stout|pilsner/.test(haystack)) return CATEGORY_IMAGES.beer
  if (/wine|chardonnay|cabernet|merlot|pinot/.test(haystack)) return CATEGORY_IMAGES.wine
  if (/vodka/.test(haystack)) return CATEGORY_IMAGES.vodka
  if (/gin/.test(haystack)) return CATEGORY_IMAGES.gin
  if (/rum/.test(haystack)) return CATEGORY_IMAGES.rum
  return CATEGORY_IMAGES.default
}

/** Match products to a category label (Whiskey, Beer, etc.) */
const CATEGORY_KEYWORDS = {
  Whiskey: ['whisky', 'whiskey', 'malt', 'bourbon', 'scotch'],
  Beer: ['beer', 'ipa', 'ale', 'lager', 'stout', 'pilsner'],
  Wine: ['wine', 'chardonnay', 'cabernet', 'merlot', 'pinot'],
  Vodka: ['vodka'],
  Gin: ['gin'],
  Rum: ['rum'],
}

export function normalizeCategoryName(name) {
  return (name || '').trim().toLowerCase()
}

export function productMatchesCategory(product, categoryName, categoriesById = {}) {
  if (!categoryName) return true

  const target = normalizeCategoryName(categoryName)
  const linked = product.categories?.name || categoriesById[product.category_id]?.name

  if (linked && normalizeCategoryName(linked) === target) return true
  if (linked && normalizeCategoryName(linked).includes(target)) return true

  const keywords = CATEGORY_KEYWORDS[categoryName] || [target]
  const haystack = [product.name, product.brand, product.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return keywords.some((kw) => haystack.includes(kw))
}

export function buildCategoryList(apiCategories) {
  const names = (apiCategories || []).map((c) => c.name).filter(Boolean)
  const defaults = ['Whiskey', 'Beer', 'Wine', 'Vodka', 'Gin', 'Rum']
  return [...new Set([...names, ...defaults])].sort((a, b) => a.localeCompare(b))
}
