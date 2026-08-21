import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import apiBaseUrl from '../data/api'

const initialFormData = {
    mobileNumber: '',
    email: '',
    address: '',
}

function ManageContactInfo() {
    const [formData, setFormData] = useState(initialFormData)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [contactInfoId, setContactInfoId] = useState('')

    const livePreview = useMemo(() => ({
        mobileNumber: formData.mobileNumber || 'Mobile number preview',
        email: formData.email || 'Email preview',
        address: formData.address || 'Address preview appears here exactly as entered.',
    }), [formData.address, formData.email, formData.mobileNumber])

    useEffect(() => {
        const loadContactInfo = async () => {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const response = await fetch(`${apiBaseUrl}/contact-info`)
                const payload = await response.json()

                if (!response.ok) {
                    throw new Error(payload.error || 'Unable to load contact details.')
                }

                if (payload.contactInfo) {
                    setFormData({
                        mobileNumber: payload.contactInfo.mobileNumber || '',
                        email: payload.contactInfo.email || '',
                        address: payload.contactInfo.address || '',
                    })
                    setContactInfoId(payload.contactInfo._id || '')
                }
            } catch (loadError) {
                setErrorMessage(loadError.message)
            } finally {
                setIsLoading(false)
            }
        }

        loadContactInfo()
    }, [])

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
            const response = await fetch(`${apiBaseUrl}/contact-info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to save contact details.')
            }

            setContactInfoId(payload.contactInfo?._id || contactInfoId)
            setStatusMessage('Contact information saved successfully.')
        } catch (submitError) {
            setErrorMessage(submitError.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <main className="manage-contact-page">
            <Navbar />
            <section className="manage-contact-hero">
                <div>
                    <p className="manage-contact-hero__eyebrow">Business settings</p>
                    <h1>Manage contact information</h1>
                </div>
            </section>

            <section className="manage-contact-grid">
                
                <form className="manage-contact-panel manage-contact-panel--form" onSubmit={handleSubmit}>
                    <div className="manage-contact-panel__heading">
                        <p className="manage-contact-panel__eyebrow">Contact entry</p>
                    </div>

                    <div className="manage-contact-fields">
                        <label className="manage-contact-field">
                            <span>Mobile number</span>
                            <input
                                name="mobileNumber"
                                type="tel"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                required
                            />
                        </label>
                        <br />
                        <label className="manage-contact-field">
                            <span>Email</span>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="hello@roshancards.com"
                                required
                            />
                        </label>

                        <label style={{position:"relative",left:"18rem",top:"-11.6rem"}} className="manage-contact-field manage-contact-field--wide">
                            <span>Address</span>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Shop no. 12\nMain Road\nCity, State, PIN"
                                rows="7"
                                required
                            />
                        </label>
                    </div>

                    {errorMessage ? <p className="manage-contact-feedback manage-contact-feedback--error">{errorMessage}</p> : null}
                    {statusMessage ? <p className="manage-contact-feedback manage-contact-feedback--success">{statusMessage}</p> : null}

                    <button className="manage-contact-button" type="submit" disabled={isSaving || isLoading}>
                        {isSaving ? 'Saving details...' : 'Save Contact Info'}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default ManageContactInfo