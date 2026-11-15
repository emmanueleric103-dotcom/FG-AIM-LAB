import Homepage from './components/Homepage'
import LabPage from './components/LabPage'
import SellerPage from './components/SellerPage'
import ClaimCodePage from './components/ClaimCodePage'

// FG AIM LAB — hefgesensitivity.hefge.cloud
// FIX: Old App.tsx never used Homepage or LabPage. It always showed Hero + GamingLab (old site).
// That is why Netlify said 5578c91 Published but site still looked old — it WAS building new commit, but App.tsx still rendered old homepage.
// New routing:
// / -> Homepage (Sell -> Selar)
// /lab -> LabPage (Generate, 60s timer, Room vs Rank)
// /claim -> ClaimCodePage (Selar ref backup)
// /seller -> SellerPage
export default function App(){
  const path = window.location.pathname
  if (path === '/lab' || path === '/lab/') return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><LabPage /></div>)
  if (path === '/seller' || path === '/seller/') return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><SellerPage /></div>)
  if (path === '/claim' || path === '/claim/') return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><ClaimCodePage /></div>)
  return (<div className="min-h-screen bg-[#050607] text-[#E6E9ED]"><Homepage /></div>)
}
