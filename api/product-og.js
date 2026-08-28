export default async function handler(req, res) {
  const { id } = req.query

  const escapeHtml = (str = '') =>
    String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]))

  let product = null
  try {
    const response = await fetch(`${process.env.VITE_API_URL}/products`)
    const products = await response.json()
    product = products.find((p) => String(p.productId) === String(id) || p._id === id)
  } catch (err) {
    console.error('OG fetch failed:', err)
  }

  const pageUrl = `https://www.roshancards.com/product/${id}`
  const title = product ? `${product.name} | RoshanCards` : 'RoshanCards'
  const description = product?.description
    ? product.description.slice(0, 200)
    : 'Premium Readymade & Customized invitation cards, calendars and diaries.'
  const image = product?.imageUrls?.[0] || 'https://www.roshancards.com/logo.png'

  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="product" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <meta http-equiv="refresh" content="0; url=${pageUrl}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${pageUrl}">View product</a>
</body>
</html>`)
}