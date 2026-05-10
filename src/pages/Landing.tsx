import ScrollProgress from '../components/ScrollProgress';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Flavors from '../components/Flavors';
import Story from '../components/Story';
import HowItWorks from '../components/HowItWorks';
import Vibe from '../components/Vibe';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      
      <main>
        <Hero />
        <Marquee />
        <Flavors />
        <Story />
        <HowItWorks />
        <Vibe />
        <Testimonials />
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
