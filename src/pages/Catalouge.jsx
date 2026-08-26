import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import apiBaseUrl from '../data/api'
import { Helmet } from 'react-helmet-async'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
})

const resolveProductImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return null
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('blob:')) {
        return imageUrl
    }

    return `${apiBaseUrl}${imageUrl}`
}

const tokenize = (value) => value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

function LazyCatalogueImage({ src, alt }) {
    const imageWrapRef = useRef(null)
    const [isInView, setIsInView] = useState(false)

    useEffect(() => {
        if (!src || isInView || !imageWrapRef.current) {
            return undefined
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '120px 0px' }
        )

        observer.observe(imageWrapRef.current)

        return () => observer.disconnect()
    }, [src, isInView])

    return (
        <div className="catalogue-card__image-wrap" ref={imageWrapRef}>
            {src ? (
                isInView ? (
                    <img className="catalogue-card__image" src={src} alt={alt} loading="lazy" />
                ) : (
                    <div className="catalogue-card__image" aria-hidden="true" />
                )
            ) : (
                <div className="catalogue-card__image catalogue-card__image--empty">No image</div>
            )}
        </div>
    )
}

function Catalouge() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
    const [categorySearchQuery, setCategorySearchQuery] = useState('')
    const [isMobileView, setIsMobileView] = useState(() => window.innerWidth <= 768)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsCategoryMenuOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 768)
        }

        handleResize()
        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (!isCategoryMenuOpen) {
            setCategorySearchQuery('')
        }
    }, [isCategoryMenuOpen])

    useEffect(() => {
        void (async () => {
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
        })()
    }, [])

    const categories = useMemo(() => {
        return [...new Set(products.map((product) => product.category).filter(Boolean))].sort((leftCategory, rightCategory) =>
            leftCategory.localeCompare(rightCategory)
        )
    }, [products])

    const filteredCategories = useMemo(() => {
        const normalizedCategoryQuery = categorySearchQuery.trim().toLowerCase()

        if (!normalizedCategoryQuery) {
            return categories
        }

        return categories.filter((category) => category.toLowerCase().includes(normalizedCategoryQuery))
    }, [categories, categorySearchQuery])

    const filteredProducts = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()
        const queryTokens = tokenize(normalizedQuery)

        return [...products]
            .filter((product) => selectedCategory === 'all' || product.category === selectedCategory)
            .map((product) => {
                const productName = String(product.name || '').toLowerCase()
                const productIdText = String(product.productId ?? '')
                const productTokens = tokenize(productName)

                if (!normalizedQuery) {
                    return { product, score: 0 }
                }

                let score = 0

                if (productIdText === normalizedQuery) {
                    score += 140
                } else if (productIdText.includes(normalizedQuery)) {
                    score += 110
                }

                if (productName === normalizedQuery) {
                    score += 130
                } else if (productName.includes(normalizedQuery)) {
                    score += 90
                }

                if (productName.startsWith(normalizedQuery)) {
                    score += 25
                }

                queryTokens.forEach((queryToken) => {
                    productTokens.forEach((productToken) => {
                        if (productToken === queryToken) {
                            score += 24
                        } else if (productToken.startsWith(queryToken) || queryToken.startsWith(productToken)) {
                            score += 16
                        } else if (productToken.includes(queryToken) || queryToken.includes(productToken)) {
                            score += 8
                        }
                    })
                })

                return { product, score }
            })
            .filter(({ product, score }) => {
                if (!normalizedQuery) {
                    return true
                }

                const productName = String(product.name || '').toLowerCase()
                const productIdText = String(product.productId ?? '')

                return score > 0 || productName.includes(normalizedQuery) || productIdText.includes(normalizedQuery)
            })
            .sort((leftEntry, rightEntry) => {
                if (searchQuery.trim()) {
                    if (rightEntry.score !== leftEntry.score) {
                        return rightEntry.score - leftEntry.score
                    }
                }

                return Number(leftEntry.product.productId) - Number(rightEntry.product.productId)
            })
            .map(({ product }) => product)
    }, [products, searchQuery, selectedCategory])

    const activeCategoryLabel = selectedCategory === 'all' ? 'All Categories' : selectedCategory

    return (
        <>
            <Navbar />

            <main className="catalogue-page">
                <section id="home" className="catalogue-hero">
                    <div className="catalogue-toolbar__category">
                        <button
                            className="catalogue-category-button"
                            type="button"
                            aria-expanded={isCategoryMenuOpen}
                            aria-haspopup="menu"
                            onClick={() => setIsCategoryMenuOpen((current) => !current)}
                        >
                            {activeCategoryLabel}
                        </button>

                        {isCategoryMenuOpen ? (
                            <div className="catalogue-category-menu" role="menu" aria-label="Categories">
                                {isMobileView ? (
                                    <label className="catalogue-category-menu__search" htmlFor="catalogue-category-search-input">
                                        <span className="catalogue-category-menu__search-label">Search categories</span>
                                        <input
                                            id="catalogue-category-search-input"
                                            type="search"
                                            value={categorySearchQuery}
                                            onChange={(event) => setCategorySearchQuery(event.target.value)}
                                            placeholder="Type to filter categories"
                                        />
                                    </label>
                                ) : null}

                                <button type="button" className="catalogue-category-menu__item" onClick={() => { setSelectedCategory('all'); setIsCategoryMenuOpen(false) }}>
                                    All Categories
                                </button>

                                {filteredCategories.map((category) => (
                                    <button
                                        key={category}
                                        type="button"
                                        className={`catalogue-category-menu__item${selectedCategory === category ? ' is-active' : ''}`}
                                        onClick={() => { setSelectedCategory(category); setIsCategoryMenuOpen(false) }}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                </section>

                <section className="catalogue-toolbar" aria-label="Catalogue filters">
                    <div className="catalogue-search">
                        <label className="catalogue-search__label" htmlFor="catalogue-search-input">
                            Search products
                        </label>
                        <div className="catalogue-search__field">
                            <input
                                id="catalogue-search-input"
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search Products"
                            />
                            {/* <span className="search-prefix-icon" style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">🔍</span> */}
                        </div>
                    </div>
                </section>

                {isLoading ? (
                    <p className="catalogue-state">Loading products...</p>
                ) : errorMessage ? (
                    <p className="catalogue-state catalogue-state--error">{errorMessage}</p>
                ) : filteredProducts.length > 0 ? (
                    <section className="catalogue-grid" aria-label="Product catalogue grid">
                        {filteredProducts.map((product) => {
                            const firstImage = resolveProductImageUrl(product.imageUrls?.[0])

                            return (
                                <Link
                                    key={product._id}
                                    to={`/product/${product.productId}`}
                                    state={{ product }}
                                    className="catalogue-card-link"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <article className="catalogue-card">
                                        <div className="catalogue-image-wrap">
                                            <LazyCatalogueImage src={firstImage} alt={product.name} />
                                        </div>

                                        <div className="catalogue-card__body">
                                            <div className="catalogue-card__info">
                                                    <h4 className="catalogue-card__id">Id: {product.productId}</h4>
                                                    <h4 className="catalogue-card__id">Cat: {product.category || 'Uncategorized'}</h4>
                                                

                                                <h2 className="catalogue-card__name">{product.name}</h2>
                                            </div>

                                            <div className="catalogue-card__meta">
                                                <strong className={`catalogue-status catalogue-status--${product.status === 'in-stock' ? 'in' : product.status === 'coming-soon' ? 'coming' : 'out'}`}>
                                                    {product.status === 'in-stock' ? 'In Stock' : product.status === 'coming-soon' ? 'Processing' : 'Out of Stock'}
                                                </strong>
                                            </div>
                                                <h4 className="catalogue-card__id">{currencyFormatter.format(product.price)}</h4>
                                                
                                                <h4 className="catalogue-card__id">{(() => {
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
                                                })()}</h4>
                                        </div>
                                    </article>
                                </Link>
                            )
                        })}
                    </section>
                ) : (
                    <p className="catalogue-state">No matching products found.</p>
                )}
            </main>
            <Helmet>
                <title>RoshanCards | Catalogue Page readymade & customized Invitations, Calendars, Diaries.</title>
                <meta name="description" content="Explore our catalogue of wedding invitations, birthday cards, calendars and diaries."  />
            </Helmet>
        </>
    )
}

export default Catalouge
