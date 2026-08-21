import useContactInfo from '../hooks/useContactInfo.js'

function Footer(){
    const { contactInfo, loading } = useContactInfo()

    const phone = contactInfo?.mobileNumber || ''
    const email = contactInfo?.email || ''
    const address = contactInfo?.address || ''

    return (
        <footer id="footer" className="site-footer" aria-labelledby="footer-heading">
            <div className="footer-inner">
                <div className="footer-top">
                    <div className="footer-brand">
                        <p className="footer-kicker">Get In Touch</p>
                        <h2 id="footer-heading">Roshan Cards</h2>
                        <p className="footer-description">
                            We create modern, premium card designs with a focus on quality printing, clean presentation, and friendly support.
                        </p>
                        <a className="footer-cta" href={phone ? `tel:${phone}` : '#'}>{phone ? 'Call us Now' : 'Contact us'}</a>
                    </div>

                    <div className="footer-details">
                        <div className="footer-card">
                            <h3>Head Office</h3>
                            <ul>
                                <li><span>Phone</span>{loading ? <span>Loading…</span> : phone ? <a href={`tel:${phone}`}>{phone}</a> : <span>—</span>}</li>
                                <li><span>Email</span>{loading ? <span>Loading…</span> : email ? <a href={`mailto:${email}`}>{email}</a> : <span>—</span>}</li>
                                <li><span>Address</span>{loading ? <span>Loading…</span> : address ? <span style={{whiteSpace:'pre-wrap'}}>{address}</span> : <span>—</span>}</li>
                            </ul>
                        </div>
                        <img src="/assets/Brand.png" alt="RoshanCards Brand Image" className="footer-details-banner" />
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="social">
                        <a href="#" aria-label="Instagram">Instagram</a>
                        <a href="#" aria-label="Facebook">Facebook</a>
                        <a href="#" aria-label="Twitter">Twitter</a>
                    </div>
                    <div className="copyright">© {new Date().getFullYear()} Roshan Cards. All rights reserved.</div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
