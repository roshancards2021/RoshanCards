import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import apiBaseUrl from '../data/api'

const initialFormData = {
    title: '',
    description: '',
}

function ManageSliderContent() {
    const [sliderContent, setSliderContent] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedSliderContentId, setSelectedSliderContentId] = useState('')
    const [formData, setFormData] = useState(initialFormData)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingSliderContentId, setDeletingSliderContentId] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const selectedSliderContent = useMemo(() => {
        return sliderContent.find((entry) => entry._id === selectedSliderContentId) || null
    }, [sliderContent, selectedSliderContentId])

    const sliderStats = useMemo(() => {
        return {
            total: sliderContent.length,
            withDescriptions: sliderContent.filter((entry) => Boolean(entry.description?.trim())).length,
        }
    }, [sliderContent])

    const sortedSliderContent = useMemo(() => {
        return [...sliderContent].sort((leftEntry, rightEntry) => {
            return String(leftEntry.title || '').localeCompare(String(rightEntry.title || ''))
        })
    }, [sliderContent])

    const loadSliderContent = async () => {
        setIsLoading(true)
        setErrorMessage('')

        try {
            const response = await fetch(`${apiBaseUrl}/slider-content`)
            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to load slider content.')
            }

            setSliderContent(payload)
        } catch (loadError) {
            setErrorMessage(loadError.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadSliderContent()
    }, [])

    const resetEditor = () => {
        setSelectedSliderContentId('')
        setFormData(initialFormData)
        setStatusMessage('')
        setErrorMessage('')
    }

    const syncFormToEntry = (entry) => {
        setSelectedSliderContentId(entry._id)
        setFormData({
            title: entry.title || '',
            description: entry.description || '',
        })
        setStatusMessage(`Editing ${entry.title}.`)
        setErrorMessage('')
    }

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setIsSaving(true)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
            }

            const response = await fetch(
                selectedSliderContentId ? `${apiBaseUrl}/slider-content/${selectedSliderContentId}` : `${apiBaseUrl}/slider-content`,
                {
                    method: selectedSliderContentId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Unable to save slider content.')
            }

            const savedEntry = result.sliderContent

            setSliderContent((current) => {
                if (selectedSliderContentId) {
                    return current.map((entry) => (entry._id === savedEntry._id ? savedEntry : entry))
                }

                return [savedEntry, ...current]
            })

            setFormData(initialFormData)
            setSelectedSliderContentId('')
            setStatusMessage(selectedSliderContentId ? `Updated ${savedEntry.title}.` : `Added ${savedEntry.title}.`)
        } catch (submitError) {
            setErrorMessage(submitError.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (entryId, entryTitle) => {
        const shouldDelete = window.confirm(`Delete "${entryTitle}" permanently? This cannot be undone.`)

        if (!shouldDelete) {
            return
        }

        setDeletingSliderContentId(entryId)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const response = await fetch(`${apiBaseUrl}/slider-content/${entryId}`, {
                method: 'DELETE',
            })

            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to delete slider content.')
            }

            setSliderContent((current) => current.filter((entry) => entry._id !== entryId))

            if (selectedSliderContentId === entryId) {
                resetEditor()
            }

            setStatusMessage(`Deleted ${entryTitle}.`)
        } catch (deleteError) {
            setErrorMessage(deleteError.message)
        } finally {
            setDeletingSliderContentId('')
        }
    }

    const isEditMode = Boolean(selectedSliderContentId)

    return (
        <main className="manage-slider-page">
            <Navbar />
            <section className="manage-slider-hero">
                <div>
                    <p className="manage-slider-hero__eyebrow">Administration</p>
                    <h1>Manage slider</h1>
                </div>

                <div className="manage-slider-hero__stats">
                    <div className="manage-slider-stat">
                        <span>{sliderStats.total}</span>
                        <p>Total slides</p>
                    </div>
                    <div className="manage-slider-stat">
                        <span>{sliderStats.withDescriptions}</span>
                        <p>With descriptions</p>
                    </div>
                </div>
            </section>

            <section className="manage-slider-grid">
                <form className="manage-slider-panel manage-slider-panel--form" onSubmit={handleSubmit}>
                    <div className="manage-slider-panel__heading">
                        <p className="manage-slider-panel__eyebrow">{isEditMode ? 'Edit slide' : 'Add slide'}</p>
                        <h2>{isEditMode ? 'Update the selected content' : 'Create a new slide entry'}</h2>
                    </div>

                    <div className="manage-slider-fields">
                        <label className="manage-slider-field manage-slider-field--wide">
                            <span>Title</span>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Premium card designs"
                                required
                            />
                        </label>

                        <label className="manage-slider-field manage-slider-field--wide">
                            <span>Description</span>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Short promotional copy for the slide"
                                rows="7"
                                required
                            />
                        </label>
                    </div>

                    {errorMessage ? <p className="manage-slider-feedback manage-slider-feedback--error">{errorMessage}</p> : null}
                    {statusMessage ? <p className="manage-slider-feedback manage-slider-feedback--success">{statusMessage}</p> : null}

                    <div className="manage-slider-actions">
                        <button className="manage-slider-button" type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : isEditMode ? 'Update Slide' : 'Add Slide'}
                        </button>
                        {isEditMode ? (
                            <button className="manage-slider-button manage-slider-button--secondary" type="button" onClick={resetEditor}>
                                Cancel edit
                            </button>
                        ) : null}
                    </div>
                </form>

                <div className="manage-slider-panel manage-slider-panel--table">
                    <div className="manage-slider-panel__heading">
                        <p className="manage-slider-panel__eyebrow">Current slides</p>
                        <h2>Stored slider content</h2>
                    </div>

                    {isLoading ? (
                        <p className="manage-slider-empty">Loading slider content...</p>
                    ) : sortedSliderContent.length > 0 ? (
                        <div className="manage-slider-list" role="list" aria-label="Slider content list">
                            {sortedSliderContent.map((entry) => (
                                <article key={entry._id} className="manage-slider-card" role="listitem">
                                    <div className="manage-slider-card__content">
                                        <p className="manage-slider-card__label">Slide title</p>
                                        <h3>{entry.title}</h3>
                                        <p>{entry.description}</p>
                                    </div>

                                    <div className="manage-slider-card__actions">
                                        <button
                                            className="manage-slider-card__button"
                                            type="button"
                                            onClick={() => syncFormToEntry(entry)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="manage-slider-card__button manage-slider-card__button--danger"
                                            type="button"
                                            disabled={deletingSliderContentId === entry._id}
                                            onClick={() => handleDelete(entry._id, entry.title)}
                                        >
                                            {deletingSliderContentId === entry._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="manage-slider-empty">No slider content found. Add the first slide above.</p>
                    )}
                </div>
            </section>
        </main>
    )
}

export default ManageSliderContent
