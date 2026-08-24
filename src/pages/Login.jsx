import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiBaseUrl from '../data/api'

const authStorageKey = 'roshanCards.authUser'

function Login() {
	const navigate = useNavigate()
	const [errorMessage, setErrorMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (event) => {
		event.preventDefault()
		setErrorMessage('')
		setIsSubmitting(true)

		const formData = new FormData(event.currentTarget)
		const username = formData.get('username')?.toString().trim()
		const password = formData.get('password')?.toString()

		try {
			const response = await fetch(`${apiBaseUrl}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			})

			const payload = await response.json()

			if (!response.ok) {
				throw new Error(payload.error || 'Unable to sign in.')
			}

			localStorage.setItem(authStorageKey, JSON.stringify(payload.user))
			navigate('/home')
		} catch (loginError) {
			setErrorMessage(loginError.message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="login-page">
			<section className="login-card" aria-labelledby="login-title">
				<div className="login-card__intro">
					<p className="login-card__eyebrow">Roshan Cards</p>
					<h1 id="login-title">Sign in to your account</h1>
					<p style={{ maxWidth: '100%' }} className="login-card__copy">
						If you want to see the catalogue, please{' '}
						<span className="login-form__note">
							<Link to="/catalogue" className="login-form__link">
							Click here.
							</Link>
						</span>
					</p>
				</div>

				<form className="login-form" onSubmit={handleSubmit}>
					<label className="login-field">
						<span>Username</span>
						<input type="text" name="username" placeholder="Enter your username" autoComplete="username" required />
					</label>

					<label className="login-field">
						<span>Password</span>
						<input type="password" name="password" placeholder="Enter your password" autoComplete="current-password" required />
					</label>

					{errorMessage ? <p className="login-form__error">{errorMessage}</p> : null}

					<button className="login-button" type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Signing in...' : 'Login to Home'}
					</button>

					<p className="login-form__note">
						Can't Login?{' '}
						<Link to="/home" className="login-form__link">
							Go to Home
						</Link>
					</p>
				</form>
			</section>
		</main>
	)
}

export default Login
