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

function NewProduct() {
    const [formData, setFormData] = useState(initialFormData)
    const [imageFiles, setImageFiles] = useState(createEmptyImageState)
    const [previewUrls, setPreviewUrls] = useState(createEmptyImageState)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        return () => {
            Object.values(previewUrls).forEach((previewUrl) => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                }
            })
        }
    }, [previewUrls])

    const dimensionSummary = useMemo(() => {
        if (!formData.height && !formData.width) {
            return '---'
        }

        return `${formData.height || '—'} x ${formData.width || '—'} ${formData.unit}`
    }, [formData.height, formData.unit, formData.width])

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
            const previousUrl = current[slot]

            if (previousUrl) {
                URL.revokeObjectURL(previousUrl)
            }

            return {
                ...current,
                [slot]: file ? URL.createObjectURL(file) : null,
            }
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setIsSubmitting(true)
        setErrorMessage('')
        setStatusMessage('')

        if (!imageFiles.first || !imageFiles.second || !imageFiles.third) {
            setErrorMessage('Please upload all three product images before saving.')
            setIsSubmitting(false)
            return
        }

        try {
            const payload = new FormData()

            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value)
            })

            payload.append('image1', imageFiles.first)
            payload.append('image2', imageFiles.second)
            payload.append('image3', imageFiles.third)

            const response = await fetch(`${apiBaseUrl}/products`, {
                method: 'POST',
                body: payload,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Unable to save product.')
            }

            setStatusMessage(`Saved product ${result.product.productId} to the database.`)
            setFormData(initialFormData)
            setImageFiles(createEmptyImageState())
            setPreviewUrls((current) => {
                Object.values(current).forEach((previewUrl) => {
                    if (previewUrl) {
                        URL.revokeObjectURL(previewUrl)
                    }
                })

                return createEmptyImageState()
            })
        } catch (submitError) {
            setErrorMessage(submitError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="new-product-page">
            <Navbar />
            <section className="new-product-hero">
                <div>
                    <p className="new-product-hero__eyebrow">Catalog studio</p>
                    <h1>Create a New Product Record</h1>
                </div>
            </section>

            <section className="new-product-layout">

                <form className="new-product-panel new-product-panel--form" onSubmit={handleSubmit}>
                    <div className="new-product-panel__heading">
                        <p className="new-product-panel__eyebrow">Product entry</p>
                        <h2>Enter complete product details</h2>
                    </div>

                    <div className="new-product-fields">
                        <label className="new-product-field">
                            <span>Product ID</span>
                            <input
                                type="number"
                                name="productId"
                                value={formData.productId}
                                onChange={handleChange}
                                placeholder="1001"
                                min="0"
                                step="1"
                                required
                            />
                        </label>

                        <label className="new-product-field new-product-field--wide">
                            <span>Product name</span>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Premium Display Card"
                                required
                            />
                        </label>

                        <label className="new-product-field new-product-field--wide">
                            <span>Category</span>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Wedding Cards"
                                required
                            />
                        </label>

                        <label className="new-product-field new-product-field--wide">
                            <span>Description</span>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the finish, material, target use, and any standout details."
                                rows="5"
                                required
                            />
                        </label>

                        <label className="new-product-field">
                            <span>Price</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="249.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </label>

                        <label className="new-product-field">
                            <span>Height</span>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                placeholder="12"
                                min="0"
                                step="0.01"
                                required
                            />
                        </label>

                        <label className="new-product-field">
                            <span>Width</span>
                            <input
                                type="number"
                                name="width"
                                value={formData.width}
                                onChange={handleChange}
                                placeholder="8"
                                min="0"
                                step="0.01"
                                required
                            />
                        </label>

                        <label className="new-product-field">
                            <span>Unit</span>
                            <select name="unit" value={formData.unit} onChange={handleChange} required>
                                <option value="inch">Inch</option>
                                <option value="cm">Cm</option>
                            </select>
                        </label>

                        <label className="new-product-field">
                            <span>Status</span>
                            <select name="status" value={formData.status} onChange={handleChange} required>
                                <option value="in-stock">In Stock</option>
                                <option value="coming-soon">Coming Soon</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </select>
                        </label>

                        <label className="new-product-field new-product-field--wide">
                            <span>Product image 1</span>
                            <input type="file" accept="image/*" onChange={(event) => handleImageChange('first', event)} required />
                        </label>

                        <label className="new-product-field new-product-field--wide">
                            <span>Product image 2</span>
                            <input type="file" accept="image/*" onChange={(event) => handleImageChange('second', event)} required />
                        </label>
                        <label className="new-product-field new-product-field--wide">
                            <span>Product image 3</span>
                            <input type="file" accept="image/*" onChange={(event) => handleImageChange('third', event)} required />
                        </label>
                    </div>

                    <div className="new-product-previews">
                        <article className="new-product-preview">
                            {previewUrls.first ? <img src={previewUrls.first} alt="Preview of the first product upload" loading="lazy" /> : <span>First image preview</span>}
                        </article>
                        <article className="new-product-preview">
                            {previewUrls.second ? <img src={previewUrls.second} alt="Preview of the second product upload" loading="lazy" /> : <span>Second image preview</span>}
                        </article>
                        <article className="new-product-preview">
                            {previewUrls.third ? <img src={previewUrls.third} alt="Preview of the third product upload" loading="lazy" /> : <span>Third image preview</span>}
                        </article>
                    </div>

                    {errorMessage ? <p className="new-product-feedback new-product-feedback--error">{errorMessage}</p> : null}
                    {statusMessage ? <p className="new-product-feedback">{statusMessage}</p> : null}

                    <div className="new-product-actions">
                        <Link className="new-product-secondary-action" to="/home">
                            Back to Home
                        </Link>
                        <button className="new-product-primary-action" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving Product...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    )
}

export default NewProduct