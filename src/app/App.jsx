import Navbar from '../components/Navbar'
import Slider from '../components/Slider'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import AboutUs from '../components/AboutUs'
import WhyUs from '../components/WhyUs'
import Services from '../components/Services'
import { Helmet } from 'react-helmet-async'

function App() {

  return (
    <>
      <Helmet>
        <title>  RoshanCards - Premium Invitation Cards, Calendars & Diaries </title>
        <meta  name="description" content="Browse premium invitation cards, wedding cards, calendars and diaries from RoshanCards."/>
      </Helmet>

      <Navbar />
      <Slider />
      <AboutUs />
      <WhyUs />
      <Services />
      <Contact />
      <Footer />
    </>
  )
}

export default App
