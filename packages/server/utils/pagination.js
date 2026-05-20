function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const perPage = Math.min(100, Math.max(1, parseInt(query.perPage, 10) || 20))
  const offset = (page - 1) * perPage
  return { page, perPage, offset }
}

module.exports = { parsePagination }
