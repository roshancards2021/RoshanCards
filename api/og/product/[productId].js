export default async function handler(req, res) {
  const { productId } = req.query;

  try {
    const apiUrl = process.env.VITE_API_URL;

    const response = await fetch(
      `${apiUrl}/products`
    );

    const products = await response.json();

    const product = products.find(
      (p) => String(p.productId) === productId
    );

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const image =
      product.imageUrls?.[0] || "";

    const pageUrl =
      `https://roshancards.com/product/${productId}`;

    const html = `
<!DOCTYPE html>
<html>
<head>

<title>${product.name}</title>

<meta property="og:type" content="website" />
<meta property="og:title" content="${product.name}" />
<meta property="og:description" content="${product.description || product.name}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${pageUrl}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${product.name}" />
<meta name="twitter:description" content="${product.description || product.name}" />
<meta name="twitter:image" content="${image}" />

<meta http-equiv="refresh"
      content="0;url=${pageUrl}" />

</head>
<body>

Redirecting...

</body>
</html>
`;

    res.setHeader(
      "Content-Type",
      "text/html"
    );

    res.status(200).send(html);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}