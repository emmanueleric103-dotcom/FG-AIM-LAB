import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'
const links = [
  { id: 'about', label: 'LAB' },
  { id: 'tech', label: 'TECH' },
  { id: 'labs', label: 'GAMING LABS' },
  { id: 'hud', label: 'HUD LAB' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'contact', label: 'CONTACT' },
]
export default function Navigation(){
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(()=>{ const onScroll=()=> setScrolled(window.scrollY>20); window.addEventListener('scroll',onScroll); return ()=>window.removeEventListener('scroll',onScroll)},[])
  const scrollTo=(id:string)=>{ document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setOpen(false) }
  return (<>
    <motion.nav initial={{y:-100}} animate={{y:0}} transition={{duration:0.8}} className={`fixed top-0 w-full z-50 ${scrolled?'py-3':'py-5'}`}>
      <div className={`mx-auto max-w-[1400px] px-6 flex items-center justify-between ${scrolled?'glass-strong rounded-full px-6 py-3':''}`}>
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan to-violet flex items-center justify-center"><Zap className="w-5 h-5 text-black" /></div><div><div className="font-display font-bold tracking-[0.14em] text-[13px] leading-none">FG AIM LAB</div><div className="font-mono text-[9px] tracking-[0.2em] opacity-60">FREE FIRE + CODM • ONE WEB</div></div></div>
        <div className="hidden md:flex items-center gap-8">{links.map(l=><button key={l.id} onClick={()=>scrollTo(l.id)} className="font-mono text-[11px] tracking-[0.18em] opacity-70 hover:opacity-100 hover:text-cyan">{l.label}</button>)}<button onClick={()=>scrollTo('labs')} className="ml-2 px-5 py-2.5 rounded-full bg-white text-black font-display font-semibold text-[11px] tracking-[0.12em] hover:bg-cyan">ENTER LAB</button></div>
        <button className="md:hidden w-10 h-10 rounded-full glass flex items-center justify-center" onClick={()=>setOpen(!open)}>{open?<X className="w-4 h-4"/>:<Menu className="w-4 h-4"/>}</button>
      </div>
    </motion.nav>
    <AnimatePresence>{open && <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="fixed inset-0 z-40 md:hidden pt-20 px-6"><div className="glass-strong rounded-[28px] p-8 flex flex-col gap-6">{links.map(l=><button key={l.id} onClick={()=>scrollTo(l.id)} className="text-left font-display text-[22px] font-medium hover:text-cyan">{l.label}</button>)}<button onClick={()=>scrollTo('labs')} className="mt-4 w-full py-4 rounded-full bg-cyan text-black font-bold text-[12px]">ENTER LABORATORY</button></div></motion.div>}</AnimatePresence>
  </>)
}
