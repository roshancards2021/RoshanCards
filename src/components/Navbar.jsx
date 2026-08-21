import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import brandLogo from '../assets/Logo-bgRemoved.png';

const authStorageKey = 'roshanCards.authUser';

function readStoredUser() {
    try {
        const storedUser = localStorage.getItem(authStorageKey);
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
}


function Navbar(){
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(readStoredUser);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(() => window.innerWidth <= 768);

    useEffect(() => {
        const handleStorageChange = () => {
            setUser(readStoredUser());
        };

        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (!user) {
            setIsMenuOpen(false);
        }
    }, [user]);

    useEffect(() => {
        const handleResize = () => {
            const nextIsMobileView = window.innerWidth <= 768;
            setIsMobileView(nextIsMobileView);

            if (!nextIsMobileView) {
                setIsMobileMenuOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            return;
        }

        const handleScroll = () => {
            setIsMobileMenuOpen(false);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobileMenuOpen]);

    useEffect(() => {
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem(authStorageKey);
        setUser(null);
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const handleCatalogueClick = () => {
        setIsMobileMenuOpen(false);

        if (window.location.pathname !== '/catalogue') {
            navigate('/catalogue');
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNavClick = (sectionId) => {
        const scrollToTarget = () => {
            if (sectionId === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        };

        setIsMobileMenuOpen(false);

        if (window.location.pathname !== '/') {
            navigate('/');
            setTimeout(scrollToTarget, 100);
            return;
        }

        scrollToTarget();
    };

    const navItems = [
        { label: 'Home', sectionId: 'home' },
        { label: 'About Us', sectionId: 'about-us' },
        { label: 'Catalogue', action: handleCatalogueClick },
        { label: 'Services', sectionId: 'services' },
        { label: 'Contact', sectionId: 'contact' },
    ];

    const renderNavLinks = (className, onClickHandler = handleNavClick) => navItems.map((item) => (
        <button
            key={item.label}
            className={className}
            type="button"
            onClick={() => {
                if (item.action) {
                    item.action();
                    return;
                }

                onClickHandler(item.sectionId);
            }}
        >
            {item.label}
        </button>
    ));

    const renderAdminLinks = () => (
        <>
            <Link className="site-nav__menu-link" to="/new-product">
                Add Card
            </Link>
            <Link className="site-nav__menu-link" to="/manage-slider-content">
                Manage Slider
            </Link>
            <Link className="site-nav__menu-link" to="/manage-products">
                Manage Cards
            </Link>
            <Link className="site-nav__menu-link" to="/manage-contact-info">
                Contact Info
            </Link>
            <Link className="site-nav__menu-link" to="/contact-requests">
                Messages
            </Link>
            <Link className="site-nav__menu-link" to="/manage-users">
                Manage Users
            </Link>
        </>
    );

    return (
        <header className="site-nav" aria-label="Primary navigation">
            <div className="site-nav__shell">
                <button
                    className="site-nav__logo-link"
                    type="button"
                    onClick={() => handleNavClick('home')}
                    aria-label="Roshan Cards home"
                > 
                <img className="site-nav__logo" src={brandLogo} alt="Roshan Cards" />
                </button>

                <div className="site-nav__inner">
                    {!isMobileView ? (
                        <nav className="site-nav__links" aria-label="Section links">
                            {renderNavLinks('nav-link-button site-nav__nav-link')}
                        </nav>
                    ) : (<>
                        <Link className="site-nav__mobile-link" to="/catalogue">
                            Catalogue
                        </Link>
                        <button
                            className="site-nav__mobile-toggle"
                            type="button" 
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle navigation menu"
                            onClick={() => setIsMobileMenuOpen((current) => !current)}
                        >
                           <h3>☰</h3>
                        </button></>
                    )}

                    {!isMobileView ? (
                        user ? (
                            <div className="site-nav__auth">
                                <button
                                    className="site-nav__cta site-nav__cta--user"
                                    type="button"
                                    aria-expanded={isMenuOpen}
                                    aria-haspopup="menu"
                                    onClick={() => setIsMenuOpen((current) => !current)}
                                >
                                    {user.username}
                                </button>

                                {isMenuOpen ? (
                                    <div className="site-nav__menu" role="menu" aria-label="Account actions">
                                        {user.role === 'admin' ? renderAdminLinks() : null}
                                        <button className="site-nav__logout" type="button" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <Link className="site-nav__cta" to="/login">
                                Log In
                            </Link>
                        )
                    ) : null}

                    {isMobileView ? (
                        <div className={`site-nav__mobile-panel${isMobileMenuOpen ? ' is-open' : ''}`}>
                            <div className="site-nav__mobile-links">
                                {renderNavLinks('site-nav__mobile-link')}
                            </div>

                            <div className="site-nav__mobile-actions">
                                {user ? (
                                    <>
                                        <span className="site-nav__mobile-label">{user.username}</span>
                                        {user.role === 'admin' ? renderAdminLinks() : null}
                                        <button className="site-nav__mobile-link site-nav__mobile-link--logout" type="button" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link className="site-nav__mobile-link site-nav__mobile-link--login" to="/login">
                                        Log In
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}

export default Navbar;