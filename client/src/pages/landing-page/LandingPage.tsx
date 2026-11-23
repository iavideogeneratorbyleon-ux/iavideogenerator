
import Hero from './sections/Hero/Hero'
import Products from './sections/Products/Products'
import Tools from './sections/Tools/Tools'
import Showcase from './sections/Showcase/Showcase'
import HowItWorks from './sections/HowItWorks/Howitworks'
import Features from './sections/Features/Features'
import Testimonials from './sections/Testimonials/Testimonials'
import Pricing from './sections/Pricing/Pricing'
import FAQ from './sections/FAQ/FAQ'

function LandingPage() {
  return (
    <main>
      <Hero />
      <Products />
      <Tools />
      <Showcase />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
    </main>
  )
}

export default LandingPage
