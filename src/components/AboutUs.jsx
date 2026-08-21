function AboutUs(){

    return (
        <>
            <span style={{position:"relative",top:"-6rem"}} id="about-us"></span>
            <main className="about-us-container">
                <div className="about-us-hero">
                    <h1 className="about-us-hero__title">About <span id="about-us-brand">Roshan Cards</span></h1>
                    <p className="about-us-hero__subtitle">We are lead manufacturers of wedding cards, Greetings, calendar, multicolor etc. With the trade mark of Roshan Cards. Traces of past history of Roshan Cards shows development through quality printing process.</p>
                </div>
                <img className="about-us-banner" src="/assets/Banner - 1.png" alt="Img Not Available" />
                <div className="about-us-content">
                    <div className="about-us-content__item">
                        <span className="about-us-content__icon">
                            <img className="about-us-content__image" src="/assets/Icon-Compass.png" alt="Professional Designs" />
                        </span><br/>
                        <h5 className="about-us-content__subtitle">Professional Designs</h5>
                    </div>
                    <div className="about-us-content__item">
                        <span className="about-us-content__icon">
                            <img className="about-us-content__image" src="/assets/Icon-WeddingCard.png" alt="High Quality Cards" />
                        </span><br/>
                        <h5 className="about-us-content__subtitle">High Quality Cards</h5>
                    </div>
                    <div className="about-us-content__item">
                        <span className="about-us-content__icon" id="multicolor-icon">
                            <img className="about-us-content__image" src="/assets/Icon-Gallery.png" alt="Multicolor Printing" />
                        </span><br/>
                        <h5 className="about-us-content__subtitle">Multicolor Printing</h5>
                    </div>
                </div>
            </main> 
        </>
    );
}

export default AboutUs;