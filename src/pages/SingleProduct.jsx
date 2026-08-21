import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import apiBaseUrl from '../data/api'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
})

const resolveProductImageUrl = (imageUrl) => {
    if (!imageUrl) return null
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('blob:')) return imageUrl
    return `${apiBaseUrl}${imageUrl}`
}

const formatProductStatus = (status) => {
    if (status === 'in-stock') return 'In Stock'
    if (status === 'coming-soon') return 'Processing'
    return 'Out of Stock'
}

function SingleProduct() {
    const { productId } = useParams()
    const location = useLocation()
    const productFromState = location.state?.product

    const [product, setProduct] = useState(productFromState || null)
    const [isLoading, setIsLoading] = useState(!productFromState)
    const [errorMessage, setErrorMessage] = useState('')
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [zoomStyle, setZoomStyle] = useState({ display: 'none' })

    const imageWrapRef = useRef(null)
    const zoomRef = useRef(null)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    useEffect(() => {
        if (productFromState) return

        if (!productId) {
            setErrorMessage('No product specified.')
            setIsLoading(false)
            return
        }

        const loadProduct = async () => {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const response = await fetch(`${apiBaseUrl}/products`)

                if (!response.ok) {
                    throw new Error('Unable to load product.')
                }

                const products = await response.json()
                const found = products.find((p) => String(p.productId) === productId || p._id === productId)

                if (!found) {
                    throw new Error('Product not found.')
                }

                setProduct(found)
            } catch (loadError) {
                setErrorMessage(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadProduct()
    }, [productId, productFromState])

    const imageUrls = product?.imageUrls || []
    const currentImageUrl = imageUrls[activeImageIndex] ? resolveProductImageUrl(imageUrls[activeImageIndex]) : null

    const goToPrevImage = useCallback(() => {
        setActiveImageIndex((current) => (current === 0 ? imageUrls.length - 1 : current - 1))
    }, [imageUrls.length])

    const goToNextImage = useCallback(() => {
        setActiveImageIndex((current) => (current === imageUrls.length - 1 ? 0 : current + 1))
    }, [imageUrls.length])

    const handleMouseMove = useCallback((e) => {
        const wrap = imageWrapRef.current
        const zoomEl = zoomRef.current
        if (!wrap || !zoomEl) return

        const rect = wrap.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setZoomStyle({
            display: 'block',
            backgroundImage: currentImageUrl ? `url(${currentImageUrl})` : 'none',
            backgroundSize: '250%',
            backgroundPosition: `${x}% ${y}%`,
        })
    }, [currentImageUrl])

    const handleMouseLeave = useCallback(() => {
        setZoomStyle({ display: 'none' })
    }, [])

    const toggleFullscreen = () => {
        setIsFullscreen((current) => !current)
    }

    if (isLoading) {
        return (
            <main className="single-product-page">
                <div className="single-product-state">Loading product...</div>
            </main>
        )
    }

    if (errorMessage) {
        return (
            <main className="single-product-page">
                <div className="single-product-state single-product-state--error">{errorMessage}</div>
                <Link to="/" className="single-product-back-link">Back to Home</Link>
            </main>
        )
    }

    if (!product) {
        return (
            <main className="single-product-page">
                <div className="single-product-state">Product not found.</div>
                <Link to="/" className="single-product-back-link">Back to Home</Link>
            </main>
        )
    }

    return (
        <>
        <title>Card, Calendar, Bag Design | RoshanCards</title>
            <main className="single-product-page">
                <div className="single-product-topbar">
                    <Link to="/catalogue" className="single-product-back-button" aria-label="Back to catalogue">
                        ← Back
                    </Link>

                    <nav className="single-product-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/catalogue" className="single-product-breadcrumb__link">Catalogue</Link>
                        <span className="single-product-breadcrumb__sep">/</span>
                        <span className="single-product-breadcrumb__current">{product.name}</span>
                    </nav>
                </div>

                <div className="single-product-shell">
                    <section className="single-product-image-section" aria-label="Product images">
                        <div
                            className="single-product-image-wrap"
                            ref={imageWrapRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onClick={toggleFullscreen}
                        >
                            {currentImageUrl ? (
                                <img
                                    className="single-product-image"
                                    src={currentImageUrl}
                                    alt={`${product.name} — image ${activeImageIndex + 1}`}
                                    draggable={false}
                                />
                            ) : (
                                <div className="single-product-image single-product-image--empty">No image</div>
                            )}

                            {/* Zoom preview */}
                            <div
                                className="single-product-zoom"
                                ref={zoomRef}
                                style={zoomStyle}
                                aria-hidden="true"
                            />
                        </div>

                        {/* Image arrows */}
                        {imageUrls.length > 1 && (
                            <div className="single-product-arrows">
                                <button
                                    type="button"
                                    className="single-product-arrow single-product-arrow--prev"
                                    onClick={goToPrevImage}
                                    aria-label="Previous image"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    className="single-product-arrow single-product-arrow--next"
                                    onClick={goToNextImage}
                                    aria-label="Next image"
                                >
                                    ›
                                </button>
                            </div>
                        )}

                        {/* Thumbnails */}
                        {imageUrls.length > 1 && (
                            <div className="single-product-thumbnails">
                                {imageUrls.map((url, index) => {
                                    const resolved = resolveProductImageUrl(url)
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`single-product-thumb${index === activeImageIndex ? ' is-active' : ''}`}
                                            onClick={() => setActiveImageIndex(index)}
                                            aria-label={`View image ${index + 1}`}
                                        >
                                            {resolved ? (
                                                <img src={resolved} alt={`${product.name} thumbnail ${index + 1}`} loading="lazy" />
                                            ) : (
                                                <span>?</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    <section className="single-product-details" aria-label="Product details">
                        <div className="single-product-details__header">
                            <div className="single-product-details__title-group">
                                <p className="single-product-details__eyebrow">Product overview</p>
                                <h1 className="single-product-details__name">{product.name}</h1>
                                <p className="single-product-details__id">Product ID: #{product.productId}</p>
                            </div>

                            <div className="single-product-details__price-block">
                                <span className="single-product-details__label">Price</span>
                                <span className="single-product-details__price">{currencyFormatter.format(product.price)}</span>
                            </div>
                        </div>

                        <div className="single-product-details__grid">
                            <div className="single-product-details__field">
                                <span className="single-product-details__label">Category</span>
                                <span className="single-product-details__value">{product.category || 'Uncategorized'}</span>
                            </div>

                            <div className="single-product-details__field">
                                <span className="single-product-details__label">Size</span>
                                <span className="single-product-details__value">
                                    {(() => {
                                        const h = product.height
                                        const w = product.width
                                        const u = product.unit
                                        const hasH = h !== undefined && h !== null && h !== ''
                                        const hasW = w !== undefined && w !== null && w !== ''
                                        const hasU = u !== undefined && u !== null && u !== ''
                                        if (hasH && hasW && hasU) return `${h} x ${w} ${u}`
                                        if (hasH && hasW) return `${h}x${w}`
                                        if (hasH) return hasU ? `${h} ${u}` : `${h}`
                                        if (hasW) return hasU ? `${w} ${u}` : `${w}`
                                        return '—'
                                    })()}
                                </span>
                            </div>

                            <div className="single-product-details__field">
                                <span className="single-product-details__label">Status</span>
                                <span className={`single-product-status single-product-status--${product.status === 'in-stock' ? 'in' : product.status === 'coming-soon' ? 'coming' : 'out'}`}>
                                    {formatProductStatus(product.status)}
                                </span>
                            </div>
                        </div>

                        <div className="single-product-details__description">
                            <span className="single-product-details__label">Description</span>
                            <p className="single-product-details__value">{product.description}</p>
                        </div>
                    </section>
                </div>
            </main>

            {/* Fullscreen overlay */}
            {isFullscreen && currentImageUrl && (
                <div className="single-product-fullscreen" onClick={toggleFullscreen} role="dialog" aria-modal="true" aria-label="Fullscreen image">
                    <button
                        type="button"
                        className="single-product-fullscreen__close"
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleFullscreen()
                        }}
                        aria-label="Close fullscreen"
                    >
                        ×
                    </button>
                    <img
                        className="single-product-fullscreen__image"
                        src={currentImageUrl}
                        alt={`${product.name} — image ${activeImageIndex + 1}`}
                        loading="lazy"
                        onClick={(e) => e.stopPropagation()}
                        draggable={false}
                    />
                </div>
            )}
        </>
    )
}

export default SingleProduct
