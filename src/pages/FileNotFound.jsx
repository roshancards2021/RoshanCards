import { Link, useNavigate } from 'react-router-dom';

/**
 * FileNotFound.jsx
 * Standalone 404 page for RoshanCards, styled to match the site's
 * existing look and feel (warm cream/teal gradient background, dotted
 * grid overlay, glassmorphic panel, gradient CTA buttons). Everything
 * needed to render this page — markup and styles — lives in this file.
 *
 * Usage (react-router-dom):
 *   { path: "*", element: <FileNotFound /> }
 */
function FileNotFound() {
    const navigate = useNavigate();
    const handleNavClick = (sectionId) => {
        const scrollToTarget = () => {
            if (sectionId === 'home') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            const element = document.getElementById(sectionId);

            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        };

        if (window.location.pathname !== '/') {
            navigate('/');

            setTimeout(() => {
                scrollToTarget();
            }, 300);

            return;
        }

        scrollToTarget();
    };
    return (
        <div className="nf-page">
            <div style={{paddingTop:'1rem'}} className="nf-panel">
                <button
                    className="nf-logo-link"
                    type="button"
                    onClick={() => navigate('/')}
                    aria-label="Roshan Cards home"
                >
                    <img
                        className="nf-logo"
                        src="/assets/Logo-bgRemoved.png"
                        alt="Roshan Cards"
                    />
                </button>

                <h1 className="nf-code">404</h1>
                <h2 className="nf-title">This page couldn&rsquo;t be found</h2>
                <p className="nf-desc">
                    The page you&rsquo;re looking for may have been moved, renamed,
                    or doesn&rsquo;t exist.
                </p>

                <div className="nf-actions">
                    <button className="nf-btn nf-btn--primary" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                    <button className="nf-btn nf-btn--soft" onClick={() => navigate('/catalogue')}>
                        Browse Catalogue
                    </button>
                    <button
                        className="nf-btn nf-btn--soft"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </button>
                </div>

                <div className="nf-links">
                    <span style={{fontSize:'1rem',color:'#000000'}}>Need help?</span>
                    <button
                        type="button"
                        className="nf-link-btn"
                        onClick={() => handleNavClick('contact')}
                    >
                        Contact Us
                    </button>
                        
                    <span aria-hidden="true">&bull;</span>
                        
                    <button
                        type="button"
                        className="nf-link-btn"
                        onClick={() => handleNavClick('about-us')}
                    >
                        About Us
                    </button>
                        
                    <span aria-hidden="true">&bull;</span>
                        
                    <button
                        type="button"
                        className="nf-link-btn"
                        onClick={() => handleNavClick('services')}
                    >
                        Services
                    </button>
                </div>
            </div>

            <style>{`
                .nf-page {
                    --nf-bg-0: #fdf6ef;
                    --nf-bg-1: #f0f0ea;
                    --nf-bg-2: #fef7e9;
                    --nf-bg-3: #e8f4f0;
                    --nf-panel: rgba(255, 251, 245, 0.92);
                    --nf-panel-border: rgba(120, 90, 60, 0.15);
                    --nf-text-primary: #1a1a2e;
                    --nf-text-secondary: rgba(90, 80, 75, 0.78);
                    --nf-accent: #a8641e;
                    --nf-accent-strong: #0f9f8f;
                    --nf-button-gradient: linear-gradient(135deg, #ff7a59 0%, #ff3d8d 34%, #7c3aed 68%, #06b6d4 100%);
                    --nf-button-gradient-hover: linear-gradient(135deg, #ff8b66 0%, #ff4fa0 32%, #8b5cf6 66%, #22d3ee 100%);
                    --nf-button-soft: linear-gradient(135deg, rgba(255, 122, 89, 0.16), rgba(255, 61, 141, 0.13), rgba(124, 58, 237, 0.13), rgba(6, 182, 212, 0.16));
                    --nf-button-soft-hover: linear-gradient(135deg, rgba(255, 122, 89, 0.24), rgba(255, 61, 141, 0.2), rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.24));
                    --nf-button-border: rgba(124, 58, 237, 0.24);
                    --nf-button-shadow: 0 18px 35px rgba(124, 58, 237, 0.22);
                    --nf-button-shadow-hover: 0 22px 42px rgba(124, 58, 237, 0.28);
                    --nf-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);

                    position: relative;
                    box-sizing: border-box;
                    width: 100%;
                    height: 100vh;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1.25rem;
                    overflow: hidden;
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    color: var(--nf-text-primary);
                    background:
                        radial-gradient(circle at 20% 10%, rgba(103, 211, 194, 0.32), transparent 40%),
                        radial-gradient(circle at 85% 20%, rgba(212, 147, 79, 0.28), transparent 35%),
                        radial-gradient(circle at 50% 80%, rgba(212, 147, 79, 0.18), transparent 32%),
                        linear-gradient(135deg, var(--nf-bg-0), var(--nf-bg-1) 45%, var(--nf-bg-2) 80%, var(--nf-bg-3));
                }

                .nf-page * {
                    box-sizing: border-box;
                }

                .nf-page::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image: linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
                    background-size: 32px 32px;
                    -webkit-mask-image: radial-gradient(circle at center, black, transparent 84%);
                    mask-image: radial-gradient(circle at center, black, transparent 84%);
                    opacity: 0.28;
                }

                .nf-panel {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 640px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 0.6rem;
                    padding: clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 6vw, 3.5rem);
                    border: 1px solid var(--nf-panel-border);
                    border-radius: 24px;
                    background: var(--nf-panel);
                    backdrop-filter: blur(18px) saturate(160%);
                    -webkit-backdrop-filter: blur(18px) saturate(160%);
                    box-shadow: var(--nf-shadow);
                }

                .nf-logo-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    padding: 0;
                    margin-bottom: 0.25rem;
                }

                .nf-logo {
                    display: block;
                    height: clamp(4.5rem, 10vw, 6.5rem);
                    width: auto;
                    max-width: 9rem;
                    object-fit: contain;
                    border-radius: 16px;
                    filter: drop-shadow(0 2px 4px rgba(15, 23, 42, 0.10));
                }

                .nf-eyebrow {
                    margin: 0;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    color: var(--nf-accent-strong);
                }

                .nf-code {
                    margin: 0;
                    font-size: clamp(3.5rem, 12vw, 6rem);
                    line-height: 1;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    background: var(--nf-button-gradient);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .nf-title {
                    margin: 0.25rem 0 0;
                    font-size: clamp(1.15rem, 3vw, 1.6rem);
                    font-weight: 700;
                    color: var(--nf-text-primary);
                }

                .nf-desc {
                    margin: 0.35rem 0 0.75rem;
                    max-width: 46ch;
                    font-size: clamp(0.9rem, 2vw, 1rem);
                    line-height: 1.6;
                    font-weight: 600;
                }

                .nf-actions {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-top: 0.25rem;
                    width: 100%;
                }

                .nf-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 2.75rem;
                    padding: 0 1.5rem;
                    border-radius: 999px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                    white-space: nowrap;
                }

                .nf-btn:active {
                    transform: translateY(1px);
                }

                .nf-btn--primary {
                    color: #fff;
                    background: var(--nf-button-gradient);
                    box-shadow: var(--nf-button-shadow);
                }

                .nf-btn--primary:hover {
                    background: var(--nf-button-gradient-hover);
                    box-shadow: var(--nf-button-shadow-hover);
                    transform: translateY(-2px);
                }

                .nf-btn--soft {
                    color: var(--nf-text-primary);
                    background: var(--nf-button-soft);
                    border-color: var(--nf-button-border);
                }

                .nf-btn--soft:hover {
                    background: var(--nf-button-soft-hover);
                    transform: translateY(-2px);
                }

                .nf-links {
                    margin-top: 1.5rem;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--nf-text-secondary);
                }

                .nf-links button {
                    color: var(--nf-accent);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 1rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .nf-links button:hover {
                    text-decoration: underline;
                }

                /* ---------- Responsive breakpoints ---------- */
                @media (max-width: 640px) {
                    .nf-page {
                        padding: 1.5rem 1rem;
                    }

                    .nf-panel {
                        border-radius: 20px;
                        gap: 0.5rem;
                    }

                    .nf-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .nf-btn {
                        width: 100%;
                    }

                    .nf-links {
                        font-size: 0.8rem;
                        gap: 0.4rem;
                    }
                }

                @media (max-width: 380px) {
                    .nf-code {
                        font-size: 3rem;
                    }

                    .nf-logo {
                        height: 4rem;
                    }
                }

                @media (min-width: 1024px) {
                    .nf-panel {
                        max-width: 680px;
                    }
                }
            `}</style>
        </div>
    );
}

export default FileNotFound;
