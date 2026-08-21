function WhyUs(){

    return (
        <>
            <main id="why-us" className="why-us-container">
                <div className="why-us-hero">
                    <h1 className="why-us-hero__title">Why <span id="why-us-brand">Roshan Cards</span> ?</h1>
                    <p className="why-us-hero__subtitle">Discover the reasons why Roshan Cards is your best choice for all your greeting card needs. Our Key Features that brings us back the customers across Tamil Nadu.</p>
                </div>
                <img className="why-us-banner" src="/assets/Wedding Card.png" alt="Img Not Available" />
                <div className="why-us-content">
                    <div className="why-us-content__item">
                        <span className="why-us-content__icon">
                            <img className="why-us-content__image" src="/assets/Icon-Delivery.png" alt="Professional Designs" />
                        </span><br/>
                        <h5 className="why-us-content__subtitle">On-Time Delivery</h5>
                    </div>
                    <div className="why-us-content__item">
                        <span className="why-us-content__icon">
                            <img className="why-us-content__image" src="/assets/Icon-Support.png" alt="Professional Designs" />
                        </span><br/>
                        <h5 className="why-us-content__subtitle">Friendly Support</h5>
                    </div>
                    <div className="why-us-content__item">
                        <span className="why-us-content__icon">
                            <img className="why-us-content__image" src="/assets/Icon-Monitor.png" alt="Professional Designs" />
                        </span><br/>
                        <h5 className="why-us-content__subtitle">Perfect Designs</h5>
                    </div>
                </div>
            </main>
        </>
    );
}

export default WhyUs;