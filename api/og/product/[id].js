export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const apiUrl = process.env.VITE_API_URL;

    const response = await fetch(
      `${apiUrl}/products`
    );
    if (!response.ok) {throw new Error(`API returned ${response.status}`);}

    const products = await response.json();

    const product = products.find(
      (p) => String(p.productId) === id || p._id === id
    );

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const firstImage = product.imageUrls?.[0] || "";

    const image =
      firstImage.startsWith("http")
        ? firstImage
        : `${apiUrl}${firstImage}`;

    const pageUrl =
      `https://roshancards.com/product/${id}`;

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