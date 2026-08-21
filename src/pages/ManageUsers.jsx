import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import apiBaseUrl from '../data/api'

function ManageUsers() {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [removingUserId, setRemovingUserId] = useState('')
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user',
        for: '',
    })

    const sortedUsers = useMemo(() => {
        return [...users].sort((leftUser, rightUser) => leftUser.username.localeCompare(rightUser.username))
    }, [users])

    const loadUsers = async () => {
        setIsLoading(true)
        setErrorMessage('')

        try {
            const response = await fetch(`${apiBaseUrl}/users`)
            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to load users.')
            }

            setUsers(payload)
        } catch (loadError) {
            setErrorMessage(loadError.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
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
            const response = await fetch(`${apiBaseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to add user.')
            }

            setUsers((current) => [...current, payload.user])
            setFormData({
                username: '',
                password: '',
                role: 'user',
                for: '',
            })
            setStatusMessage(`Added ${payload.user.username}.`)
        } catch (submitError) {
            setErrorMessage(submitError.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemove = async (userId, username) => {
        setRemovingUserId(userId)
        setErrorMessage('')
        setStatusMessage('')

        try {
            const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
                method: 'DELETE',
            })

            const payload = await response.json()

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to remove user.')
            }

            setUsers((current) => current.filter((user) => user._id !== userId))
            setStatusMessage(`Removed ${username}.`)
        } catch (removeError) {
            setErrorMessage(removeError.message)
        } finally {
            setRemovingUserId('')
        }
    }

    return (
        <main className="manage-users-page">
            <Navbar />
            <section className="manage-users-hero">
                <div>
                    <p className="manage-users-hero__eyebrow">Administration</p>
                    <h1>Manage Users</h1>
                </div>
                <div className="manage-users-hero__stats">
                    <div className="manage-users-stat">
                        <span>{sortedUsers.length}</span>
                        <p>Total users</p>
                    </div>
                    <div className="manage-users-stat">
                        <span>{sortedUsers.filter((user) => user.role === 'admin').length}</span>
                        <p>Admins</p>
                    </div>
                </div>
            </section>

            <section className="manage-users-grid">
                <form className="manage-users-panel manage-users-panel--form" onSubmit={handleSubmit}>
                    <div className="manage-users-panel__heading">
                        <p className="manage-users-panel__eyebrow">Add user</p>
                        <h2>Create a new credential</h2>
                    </div>

                    <div className="manage-users-fields">
                        <label className="manage-users-field">
                            <span>Username</span>
                            <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
                        </label>

                        <label className="manage-users-field">
                            <span>Password</span>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                        </label>

                        <label className="manage-users-field">
                            <span>Role</span>
                            <select name="role" value={formData.role} onChange={handleChange} required>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>

                        <label className="manage-users-field manage-users-field--wide">
                            <span>For</span>
                            <input name="for" value={formData.for} onChange={handleChange} placeholder="Person name" required />
                        </label>
                    </div>

                    {errorMessage ? <p className="manage-users-feedback manage-users-feedback--error">{errorMessage}</p> : null}
                    {statusMessage ? <p className="manage-users-feedback manage-users-feedback--success">{statusMessage}</p> : null}

                    <button className="manage-users-button" type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving user...' : 'Add User'}
                    </button>
                </form>

                <div className="manage-users-panel manage-users-panel--table">
                    <div className="manage-users-panel__heading">
                        <p className="manage-users-panel__eyebrow">Current users</p>
                        <h2>Stored credentials</h2>
                    </div>

                    {isLoading ? (
                        <p className="manage-users-empty">Loading users...</p>
                    ) : sortedUsers.length > 0 ? (
                        <div className="manage-users-table" role="table" aria-label="Users list">
                            <div className="manage-users-table__row manage-users-table__row--head" role="row">
                                <span role="columnheader">Username</span>
                                <span role="columnheader">Role</span>
                                <span role="columnheader">For</span>
                                <span role="columnheader">Action</span>
                            </div>

                            {sortedUsers.map((user) => (
                                <div key={user._id} className="manage-users-table__row" role="row">
                                    <span role="cell" data-label="Username">{user.username}</span>
                                    <span role="cell" data-label="Role">{user.role}</span>
                                    <span role="cell" data-label="For">{user.for}</span>
                                    <span role="cell" data-label="Action">
                                        <button
                                            className="manage-users-remove"
                                            type="button"
                                            disabled={removingUserId === user._id}
                                            onClick={() => handleRemove(user._id, user.username)}
                                        >
                                            {removingUserId === user._id ? 'Removing...' : 'Remove'}
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="manage-users-empty">No users found.</p>
                    )}
                </div>
            </section>
        </main>
    )
}

export default ManageUsers