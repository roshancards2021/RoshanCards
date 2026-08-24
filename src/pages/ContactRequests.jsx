import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import apiBaseUrl from '../data/api'

function ContactRequests() {
    const [requests, setRequests] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [isDeletingId, setIsDeletingId] = useState('')

    const loadRequests = async () => {
        setIsLoading(true)
        setErrorMessage('')

        try {
            const response = await fetch(`${apiBaseUrl}/contact-requests`)
            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to load contact requests.')
            }

            setRequests(payload || [])
        } catch (loadError) {
            setErrorMessage(loadError.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadRequests()
    }, [])

    const handleDelete = async (requestId) => {
        setIsDeletingId(requestId)

        try {
            const response = await fetch(`${apiBaseUrl}/contact-requests/${requestId}`, {
                method: 'DELETE',
            })
            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to delete this request.')
            }

            setRequests((current) => current.filter((request) => request._id !== requestId))
        } catch (deleteError) {
            setErrorMessage(deleteError.message)
        } finally {
            setIsDeletingId('')
        }
    }

    return (
        <main className="manage-contact-page">
            <Navbar />
            <section className="manage-contact-hero">
                <div>
                    <p className="manage-contact-hero__eyebrow">Administration</p>
                    <h1>Contact Requests</h1>
                </div>
            </section>

            <section id="messageBox" className="manage-contact-grid">
                <div id="requestBox" className="manage-contact-panel manage-contact-panel--table">
                    <div className="manage-contact-panel__heading">
                        <p className="manage-contact-panel__eyebrow">Incoming enquiries</p>
                        <h2>Review and manage request submissions</h2>
                    </div>

                    {errorMessage ? <p className="manage-contact-feedback manage-contact-feedback--error">{errorMessage}</p> : null}

                    {isLoading ? (
                        <p className="manage-users-empty">Loading requests...</p>
                    ) : requests.length === 0 ? (
                        <p className="manage-users-empty">No contact requests found yet.</p>
                    ) : (
                        <div className="manage-users-table" role="table" aria-label="Contact requests list">
                            <div className="manage-users-table__row manage-users-table__row--head" role="row">
                                <span data-label="Name">Name</span>
                                <span data-label="Phone">Phone</span>
                                <span data-label="Message">Message</span>
                                <span data-label="Requested Date">Requested Date</span>
                                <span data-label="Actions">Actions</span>
                            </div>
                            {requests.map((request) => (
                                <div className="manage-users-table__row" role="row" key={request._id}>
                                    <span data-label="Name">{request.name}</span>
                                    <span data-label="Phone">{request.phone}</span>
                                    <span title={request.message} data-label="Message">
                                        {/* {request.message.length > 50 ? `${request.message.substring(0, 50)}...` : request.message} */}
                                        {request.message}
                                    </span>
                                    <span data-label="Requested Date">{request.createdAt ? new Date(request.createdAt).toLocaleString() : '—'}</span>
                                    <span className="manage-users-table__actions" data-label="Actions">
                                        <button
                                            className="manage-users-remove"
                                            type="button"
                                            onClick={() => handleDelete(request._id)}
                                            disabled={isDeletingId === request._id}
                                        >
                                            {isDeletingId === request._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}

export default ContactRequests
