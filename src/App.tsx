
import Homepage from './components/Homepage'
import LabPage from './components/LabPage'
import SellerPage from './components/SellerPage'
export default function App(){
  const path = window.location.pathname
  if (path === '/seller' || path === '/seller/') return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><SellerPage /></div>)
  if (path === '/lab' || path === '/lab/' || path === '/sensitivity' || path === '/sensitivity/' || path === '/generate' || path === '/generate/') return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><LabPage /></div>)
  return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><Homepage /></div>)
}
