import Navigation from './components/Navigation'
import Hero from './components/Hero'
import About from './components/About'
import TechShowcase from './components/TechShowcase'
import GamingLab from './components/GamingLab'
import HudLab from './components/HudLab'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import SellerPage from './components/SellerPage'
export default function App(){
  const path = window.location.pathname
  if (path === '/seller' || path === '/seller/') return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><SellerPage /></div>)
  return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><Navigation /><Hero /><About /><TechShowcase /><GamingLab /><HudLab /><Projects /><Contact /><Footer /></div>)
}
