import { useState } from 'react'
import useContactInfo from '../hooks/useContactInfo.js'
import apiBaseUrl from '../data/api'

function Contact(){
    const { contactInfo, loading } = useContactInfo()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedbackMessage, setFeedbackMessage] = useState('')
    const [feedbackError, setFeedbackError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const payload = {
            name: form.name.value.trim(),
            phone: form.mobile.value.trim(),
            message: form.message.value.trim(),
        };

        if (!payload.name || !payload.phone || !payload.message) {
            setFeedbackError('Please complete all required fields before sending your message.');
            setFeedbackMessage('');
            return;
        }

        setIsSubmitting(true);
        setFeedbackMessage('');
        setFeedbackError('');

        try {
            const response = await fetch(`${apiBaseUrl}/contact-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to submit your message right now.');
            }

            form.reset();
            setFeedbackMessage('Message sent successfully — thank you!');
            const whatsappNumber = contactInfo?.mobileNumber?.replace(/\D/g, '');

            const whatsappMessage = `Can you Call me Back? I have a query regarding your products. Here are my details:

Name: ${payload.name}
Phone: ${payload.phone}

Message:
${payload.message}`;

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            window.open(whatsappUrl, '_blank');
        } catch (submitError) {
            setFeedbackError(submitError.message || 'Unable to submit your message right now.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="contact" aria-labelledby="contact-heading">
            <span style={{position:"relative",top:"-8rem"}} id="contact"></span>
            <div className="contact-container">
                <div className="contact-info">
                    <h1 id="contact-heading">Contact us</h1>
                    <ul className="contact-list">Have a question or want to work together? Reach out using the form or the contact details.</ul>
                    <ul className="contact-list">
                        {loading ? (
                            <li>Loading contact details…</li>
                        ) : contactInfo ? (
                            <>
                                <li>Call☎️: <a href={`tel:${contactInfo.mobileNumber}`}>{contactInfo.mobileNumber}</a></li>
                                <li>Mail✉️: <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></li>
                                <li>Visit📍: <div style={{display: 'inline', whiteSpace: 'pre-wrap'}}>{contactInfo.address}</div></li>
                            </>
                        ) : (
                            <li>No contact details available.</li>
                        )}
                    </ul>
                    <ul className="contact-list">
                        After Your Request is Submitted or your order has been processed and shipped, We Will Contact You shortly for the Smooth workflow.
                    </ul>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <label>
                        <span className="label">Name</span>
                        <input name="name" type="text" placeholder="Your Name" required />
                    </label>

                    <label>
                        <span className="label">Mobile No.</span>
                        <input name="mobile" type="tel" placeholder="Your Mobile Number" required />
                    </label>

                    <label>
                        <span className="label">Message</span>
                        <textarea name="message" rows="8" placeholder="Write a short message" required></textarea>
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>

                    {feedbackMessage ? <p className="contact-feedback contact-feedback--success">{feedbackMessage}</p> : null}
                    {feedbackError ? <p className="contact-feedback contact-feedback--error">{feedbackError}</p> : null}
                </form>
            </div>
        </section>
    );    
}

export default Contact;