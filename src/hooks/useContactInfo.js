import { useEffect, useState } from 'react'
import apiBaseUrl from '../data/api'

export default function useContactInfo() {
    const [contactInfo, setContactInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchContactInfo = async () => {
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${apiBaseUrl}/contact-info`)
            const payload = await res.json()

            if (!res.ok) {
                throw new Error(payload.error || 'Unable to load contact information')
            }

            setContactInfo(payload.contactInfo || null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void (async () => {
            setLoading(true)
            setError('')

            try {
                const res = await fetch(`${apiBaseUrl}/contact-info`)
                const payload = await res.json()

                if (!res.ok) {
                    throw new Error(payload.error || 'Unable to load contact information')
                }

                setContactInfo(payload.contactInfo || null)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    return { contactInfo, loading, error, refresh: fetchContactInfo }
}
