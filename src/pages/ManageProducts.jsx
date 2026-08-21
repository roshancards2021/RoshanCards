import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import apiBaseUrl from '../data/api'
import { optimizeImage } from "../utils/imageOptimizer";

const initialFormData = {
    productId: '',
    name: '',
    category: '',
    description: '',
    price: '',
    height: '',
    width: '',
    unit: 'inch',
    status: 'in-stock',
}

const createEmptyImageState = () => ({
    first: null,
    second: null,
    third: null,
})

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

function ManageProducts() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedProductId, setSelectedProductId] = useState('')
    const [formData, setFormData] = useState(initialFormData)
    const [imageFiles, setImageFiles] = useState(createEmptyImageState)
    const [previewUrls, setPreviewUrls] = useState(createEmptyImageState)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingProductId, setDeletingProductId] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const selectedProduct = useMemo(() => {
        return products.find((product) => product._id === selectedProductId) || null
    }, [products, selectedProductId])

    const productStats = useMemo(() => {
        return {
            total: products.length,
            inStock: products.filter((product) => product.status === 'in-stock').length,
            comingSoon: products.filter((product) => product.status === 'coming-soon').length,
            outOfStock: products.filter((product) => product.status === 'out-of-stock').length,
        }
    }, [products])

    const productCategories = useMemo(() => {
        return new Set(products.map((product) => product.category).filter(Boolean)).size
    }, [products])

    const sortedProducts = useMemo(() => {
        return [...products].sort((leftProduct, rightProduct) => leftProduct.productId - rightProduct.productId)
    }, [products])

    const revokePreviewUrl = (previewUrl) => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }
    }

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

    useEffect(() => {
        loadProducts()
    }, [])

    useEffect(() => {
        return () => {
            Object.values(previewUrls).forEach(revokePreviewUrl)
        }
    }, [previewUrls])

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const handleImageChange = async (slot, event) => {
        const originalFile = event.target.files?.[0] || null
        const file = originalFile  ? await optimizeImage(originalFile)  : null

        setImageFiles((current) => ({
            ...current,
            [slot]: file,
        }))

        setPreviewUrls((current) => {
            revokePreviewUrl(current[slot])

            return {
                ...current,
                [slot]: file ? URL.createObjectURL(file) : current[slot]?.startsWith('blob:') ? null : current[slot],
            }
        })
    }

    const syncFormToProduct = (product) => {
        setSelectedProductId(product._id)
        setFormData({
            productId: product.productId.toString(),
            name: product.name || '',
            category: product.category || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            height: product.height?.toString() || '',
            width: product.width?.toString() || '',
            unit: product.unit || 'inch',
            status: product.status || 'in-stock',
        })
        setImageFiles(createEmptyImageState())
        setPreviewUrls({
            first: resolveProductImageUrl(product.imageUrls?.[0]),
            second: resolveProductImageUrl(product.imageUrls?.[1]),
            third: resolveProductImageUrl(product.imageUrls?.[2]),
        })
        setStatusMessage(`Editing ${product.name}.`)
        setErrorMessage('')
    }

    const resetEditor = () => {
        setSelectedProductId('')
        setFormData(initialFormData)
        setImageFiles(createEmptyImageState())
        setPreviewUrls(createEmptyImageState())
        setStatusMessage('')
        setErrorMessage('')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!selectedProductId) {
            setErrorMessage('Select a product from the list to edit.')
            return
        }

        if ((imageFiles.first && !imageFiles.second) || (!imageFiles.first && imageFiles.second) || (imageFiles.first && !imageFiles.third) || (!imageFiles.first && imageFiles.third) || (imageFiles.second && !imageFiles.third) || (!imageFiles.second && imageFiles.third)) {
            setErrorMessage('Upload all replacement images or keep the existing ones.')
            return
        }

        setIsSaving(true)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const payload = new FormData()

            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value)
            })

            if (imageFiles.first && imageFiles.second && imageFiles.third) {
                payload.append('image1', imageFiles.first)
                payload.append('image2', imageFiles.second)
                payload.append('image3', imageFiles.third)
            }

            const response = await fetch(`${apiBaseUrl}/products/${selectedProductId}`, {
                method: 'PUT',
                body: payload,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Unable to update product.')
            }

            setProducts((current) => current.map((product) => (product._id === result.product._id ? result.product : product)))
            syncFormToProduct(result.product)
            setStatusMessage(`Updated ${result.product.name}.`)
            setImageFiles(createEmptyImageState())
        } catch (submitError) {
            setErrorMessage(submitError.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (productId, productName) => {
        const shouldDelete = window.confirm(`Delete ${productName} permanently? This cannot be undone.`)

        if (!shouldDelete) {
            return
        }

        setDeletingProductId(productId)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const response = await fetch(`${apiBaseUrl}/products/${productId}`, {
                method: 'DELETE',
            })

            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to delete product.')
            }

            setProducts((current) => current.filter((product) => product._id !== productId))

            if (selectedProductId === productId) {
                resetEditor()
            }

            setStatusMessage(`Deleted ${productName}.`)
        } catch (deleteError) {
            setErrorMessage(deleteError.message)
        } finally {
            setDeletingProductId('')
        }
    }

    return (
        <main className="manage-products-page">
            <Navbar />
            <section className="manage-products-hero">
                <div>
                    <p className="manage-products-hero__eyebrow">Administration</p>
                    <h1>Manage Products</h1>
                    
                </div>

                <div className="manage-products-hero__stats">
                    <div className="manage-products-stat">
                        <span>{productStats.total}</span>
                        <p>Total products</p>
                    </div>
                    <div className="manage-products-stat">
                        <span>{productStats.inStock}</span>
                        <p>In stock</p>
                    </div>
                    <div className="manage-products-stat">
                        <span>{productStats.comingSoon}</span>
                        <p>Coming soon</p>
                    </div>
                    <div className="manage-products-stat">
                        <span>{productStats.outOfStock}</span>
                        <p>Out of stock</p>
                    </div>
                    <div className="manage-products-stat">
                        <span>{productCategories}</span>
                        <p>Categories</p>
                    </div>
                </div>
            </section>

            <section className="manage-products-grid">
                <form className="manage-products-panel manage-products-panel--form" onSubmit={handleSubmit}>
                    <div className="manage-products-panel__heading">
                        <p className="manage-products-panel__eyebrow">Edit product</p>
                        <h2>{selectedProduct ? `Editing ${selectedProduct.name}` : 'Select a product to edit'}</h2>
                    </div>

                    <div className="manage-products-form__notice">
                        Update any field below. If you want to replace the product images, upload both new files together.
                    </div>

                    <div className="manage-products-fields">
                        <label className="manage-products-field">
                            <span>Product ID</span>
                            <input name="productId" value={formData.productId} onChange={handleChange} placeholder="1001" required />
                        </label>

                        <label className="manage-products-field manage-products-field--wide">
                            <span>Product name</span>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Premium Display Card" required />
                        </label>

                        <label className="manage-products-field manage-products-field--wide">
                            <span>Category</span>
                            <input name="category" value={formData.category} onChange={handleChange} placeholder="Wedding Cards" required />
                        </label>

                        <label className="manage-products-field manage-products-field--wide">
                            <span>Description</span>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the finish, material, target use, and standout details."
                                rows="5"
                                required
                            />
                        </label>

                        <label className="manage-products-field">
                            <span>Price</span>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="249.00" min="0" step="0.01" required />
                        </label>

                        <label className="manage-products-field">
                            <span>Height</span>
                            <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="12" min="0" step="0.01" required />
                        </label>

                        <label className="manage-products-field">
                            <span>Width</span>
                            <input type="number" name="width" value={formData.width} onChange={handleChange} placeholder="8" min="0" step="0.01" required />
                        </label>

                        <label className="manage-products-field">
                            <span>Unit</span>
                            <select name="unit" value={formData.unit} onChange={handleChange} required>
                                <option value="inch">Inch</option>
                                <option value="cm">Cm</option>
                            </select>
                        </label>

                        <label className="manage-products-field">
                            <span>Status</span>
                            <select name="status" value={formData.status} onChange={handleChange} required>
                                <option value="in-stock">In Stock</option>
                                <option value="coming-soon">Coming Soon</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </select>
                        </label>

                        <label className="manage-products-field manage-products-field--wide">
                            <span>Replace image 1</span>
                            <input type="file" accept="image/*" onChange={(event) => handleImageChange('first', event)} />
                        </label>

                        <label className="manage-products-field manage-products-field--wide">
                            <span>Replace image 2</span>
                            <input type="file" accept="image/*" onChange={(event) => handleImageChange('second', event)} />
                        </label>
                        <label className="manage-products-field manage-products-field--wide">
                            <span>Replace image 3</span>
                            <input type="file" accept="image/*" onChange={(event) => handleImageChange('third', event)} />
                        </label>
                    </div>

                    <div className="manage-products-previews">
                        <article className="manage-products-preview">
                            {previewUrls.first ? <img src={previewUrls.first} alt="First product preview" loading="lazy" /> : <span>First image preview</span>}
                        </article>
                        <article className="manage-products-preview">
                            {previewUrls.second ? <img src={previewUrls.second} alt="Second product preview" loading="lazy" /> : <span>Second image preview</span>}
                        </article>
                        <article className="manage-products-preview">
                            {previewUrls.third ? <img src={previewUrls.third} alt="Third product preview" loading="lazy" /> : <span>Third image preview</span>}
                        </article>
                    </div>

                    {errorMessage ? <p className="manage-products-feedback manage-products-feedback--error">{errorMessage}</p> : null}
                    {statusMessage ? <p className="manage-products-feedback manage-products-feedback--success">{statusMessage}</p> : null}

                    <div className="manage-products-actions">
                        <button className="manage-products-secondary" type="button" onClick={resetEditor}>
                            Clear
                        </button>
                        <button className="manage-products-button" type="submit" disabled={isSaving || !selectedProductId}>
                            {isSaving ? 'Saving changes...' : 'Update Product'}
                        </button>
                    </div>
                </form>

                <div className="manage-products-panel manage-products-panel--table">
                    <div className="manage-products-panel__heading manage-products-panel__heading--split">
                        <div>
                            <p className="manage-products-panel__eyebrow">Catalog</p>
                            <h2>Stored products</h2>
                        </div>

                        <Link className="manage-products-panel__link" to="/product-details">
                            ProductDetails
                        </Link>
                    </div>

                    {isLoading ? (
                        <p className="manage-products-empty">Loading products...</p>
                    ) : sortedProducts.length > 0 ? (
                        <div className="manage-products-table" role="table" aria-label="Products list">
                            <div className="manage-products-table__row manage-products-table__row--head" role="row">
                                <span role="columnheader">Product</span>
                                <span role="columnheader">Price</span>
                                <span role="columnheader">Status</span>
                                <span role="columnheader">Action</span>
                            </div>

                            {sortedProducts.map((product) => (
                                <div key={product._id} className={`manage-products-table__row${selectedProductId === product._id ? ' manage-products-table__row--active' : ''}`} role="row">
                                    <span role="cell" data-label="Product">
                                        <strong>{product.name}</strong>
                                        <small>{product.category}</small>
                                    </span>
                                    <span role="cell" data-label="Price">{currencyFormatter.format(product.price)}</span>
                                    <span role="cell" data-label="Status">{product.status === 'in-stock' ? 'In Stock' : product.status === 'coming-soon' ? 'Coming Soon' : 'Out of Stock'}</span>
                                    <span role="cell" data-label="Action" className="manage-products-table__actions">
                                        <button className="manage-products-select" type="button" onClick={() => syncFormToProduct(product)}>
                                            Edit
                                        </button>
                                        <button
                                            className="manage-products-remove"
                                            type="button"
                                            disabled={deletingProductId === product._id}
                                            onClick={() => handleDelete(product._id, product.name)}
                                        >
                                            {deletingProductId === product._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="manage-products-empty">No products found.</p>
                    )}
                </div>
            </section>
        </main>
    )
}

export default ManageProducts
