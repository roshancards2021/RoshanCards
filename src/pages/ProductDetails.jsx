import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import apiBaseUrl from '../data/api'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
})

const formatDate = (dateValue) => {
    if (!dateValue) {
        return '—'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
        return '—'
    }

    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const formatProductStatus = (status) => {
    if (status === 'in-stock') {
        return 'In Stock'
    }

    if (status === 'coming-soon') {
        return 'Coming Soon'
    }

    return 'Out of Stock'
}

const resolveProductImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return null
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('blob:')) {
        return imageUrl
    }

    return `${apiBaseUrl}${imageUrl}`
}

function ProductDetails() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const sortedProducts = useMemo(() => {
        return [...products].sort((leftProduct, rightProduct) => leftProduct.productId - rightProduct.productId)
    }, [products])

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const response = await fetch(`${apiBaseUrl}/products`)
                const payload = await response.json()

                if (!response.ok) {
                    throw new Error(payload.error || 'Unable to load products.')
                }

                setProducts(payload)
            } catch (loadError) {
                setErrorMessage(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [])

    return (
        <main className="product-details-page">
            <Navbar />
            <section className="product-details-hero">
                <div>
                    <p className="product-details-hero__eyebrow">Product archive</p>
                    <h1>Stored Product Details</h1>
                </div>

                <div className="product-details-actions">
                    <Link className="product-details-manage-link" to="/manage-products">
                        Back
                    </Link>
                </div>
            </section>

            <section className="product-details-panel">
                <div className="product-details-panel__heading">
                    <p className="product-details-panel__eyebrow">Catalog table</p>
                    <h2>Complete product inventory</h2>
                </div>

                {isLoading ? (
                    <p className="product-details-empty">Loading products...</p>
                ) : errorMessage ? (
                    <p className="product-details-feedback product-details-feedback--error">{errorMessage}</p>
                ) : sortedProducts.length > 0 ? (
                    <div className="product-details-table" role="table" aria-label="Products list">
                        <div className="product-details-table__row product-details-table__row--head" role="row">
                            <span role="columnheader">Product</span>
                            <span role="columnheader">Category</span>
                            <span role="columnheader">Description</span>
                            <span role="columnheader">Price</span>
                            <span role="columnheader">Size</span>
                            <span role="columnheader">Unit</span>
                            <span role="columnheader">Status</span>
                            <span role="columnheader">Images</span>
                            <span role="columnheader">Created</span>
                            <span role="columnheader">Updated</span>
                        </div>

                        {sortedProducts.map((product) => {
                            const firstImage = resolveProductImageUrl(product.imageUrls?.[0])
                            const secondImage = resolveProductImageUrl(product.imageUrls?.[1])
                            const thirdImage = resolveProductImageUrl(product.imageUrls?.[2])

                            return (
                                <div key={product._id} className="product-details-table__row" role="row">
                                    <span role="cell" data-label="Product">
                                        <strong>{product.name}</strong>
                                        <small>ID #{product.productId}</small>
                                    </span>
                                    <span role="cell" data-label="Category">{product.category}</span>
                                    <span role="cell" data-label="Description">{product.description}</span>
                                    <span role="cell" data-label="Price">{currencyFormatter.format(product.price)}</span>
                                    <span role="cell" data-label="Size">
                                        {product.height} x {product.width}
                                    </span>
                                    <span role="cell" data-label="Unit">{product.unit}</span>
                                    <span role="cell" data-label="Status">{formatProductStatus(product.status)}</span>
                                    <span role="cell" data-label="Images" className="product-details-images">
                                        {firstImage ? <img src={firstImage} alt={`${product.name} image 1`} loading="lazy" /> : null}
                                        {secondImage ? <img src={secondImage} alt={`${product.name} image 2`} loading="lazy" /> : null}
                                        {thirdImage ? <img src={thirdImage} alt={`${product.name} image 3`} loading="lazy" /> : null}
                                    </span>
                                    <span role="cell" data-label="Created">{formatDate(product.createdAt)}</span>
                                    <span role="cell" data-label="Updated">{formatDate(product.updatedAt)}</span>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="product-details-empty">No products found.</p>
                )}
            </section>
        </main>
    )
}

export default ProductDetails
