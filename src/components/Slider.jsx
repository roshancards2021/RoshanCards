import { useEffect, useMemo, useState } from 'react'
import {Link} from 'react-router-dom'
import apiBaseUrl from '../data/api'

const SLIDE_INTERVAL_MS = 5000

const imageModules = import.meta.glob('../assets/Slider Images/*.{jpg,jpeg,png,webp,avif,svg}', {
    eager: true,
    import: 'default',
})

const sliderImages = Object.entries(imageModules)
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath, undefined, { numeric: true, sensitivity: 'base' }))
    .map(([, imageUrl]) => imageUrl)

const defaultSlideContent = {
    title: 'Premium card designs',
    description: 'Modern, carefully finished card work crafted to leave a strong first impression.',
}

function Slider() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [sliderContent, setSliderContent] = useState([])

    useEffect(() => {
        const loadSliderContent = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/slider-content`)
                const payload = await response.json()

                if (response.ok) {
                    setSliderContent(Array.isArray(payload) ? payload : [])
                } else {
                    setSliderContent([])
                }
            } catch {
                setSliderContent([])
            }
        }

        loadSliderContent()
    }, [])

    const slides = useMemo(() => {
        if (sliderImages.length === 0) {
            return []
        }

        return sliderImages.map((imageUrl, index) => {
            const slideContent = sliderContent[index] || sliderContent[index % sliderContent.length] || defaultSlideContent

            return {
                imageUrl,
                title: slideContent?.title?.trim() || defaultSlideContent.title,
                description: slideContent?.description?.trim() || defaultSlideContent.description,
            }
        })
    }, [sliderContent])

    useEffect(() => {
        if (slides.length <= 1) {
            return undefined
        }

        const intervalId = window.setInterval(() => {
            setCurrentIndex((previousIndex) => (previousIndex + 1) % slides.length)
        }, SLIDE_INTERVAL_MS)

        return () => window.clearInterval(intervalId)
    }, [slides.length])

    const goToPrevious = () => {
        setCurrentIndex((previousIndex) => (previousIndex - 1 + slides.length) % slides.length)
    }

    const goToNext = () => {
        setCurrentIndex((previousIndex) => (previousIndex + 1) % slides.length)
    }

    if (sliderImages.length === 0) {
        return (
            <section id="home" className="slider slider--empty" aria-label="Image slider">
                <div className="slider__frame">
                    <p className="slider__empty">Add images to src/assets/Slider Images to display the landing page slider.</p>
                </div>
            </section>
        )
    }

    if (!slides.length) {
        return (
            <section id="home" className="slider slider--empty" aria-label="Image slider">
                <div className="slider__frame">
                    <p className="slider__empty">Loading slider content...</p>
                </div>
            </section>
        )
    }

    return (
        <section id="home" className="slider" aria-label="Image slider">
            <Link to="/catalogue" className="slider-explore">Explore</Link>
            <div className="slider__frame">
                <button
                    type="button"
                    className="slider__nav slider__nav--prev"
                    onClick={goToPrevious}
                    aria-label="Previous slide"
                >
                    <span aria-hidden="true">←</span>
                </button>

                <div className="slider__viewport">
                    <div
                        className="slider__track"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {slides.map((slide, index) => (
                            <figure className="slider__slide" key={slide.imageUrl}>
                                <img
                                    src={slide.imageUrl}
                                    alt={slide.title}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    />
                                <div className="sliderMask"></div>
                                <figcaption className="slider__caption">
                                    <h2 id='sliderTitle'>{slide.title}</h2>
                                    <p id='sliderSubTitle'>{slide.description}</p>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
                           
                <button
                    type="button"
                    className="slider__nav slider__nav--next"
                    onClick={goToNext}
                    aria-label="Next slide"
                >
                    <span aria-hidden="true">→</span>
                </button>

                <div className="slider__footer">
                    <div className="slider__dots" role="tablist" aria-label="Select slide">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.imageUrl}
                                type="button"
                                className={`slider__dot ${index === currentIndex ? 'is-active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={index === currentIndex ? 'true' : undefined}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Slider