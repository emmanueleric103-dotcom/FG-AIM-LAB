import { motion } from 'framer-motion'
import { Gauge, Smartphone, Sliders, Box, Layers, Sparkles } from 'lucide-react'
const items = [
  { icon: Gauge, title:'Two Engines, One Site', desc:'FF and CODM share website, separate math cores.' },
  { icon: Smartphone, title:'Tab System', desc:'Free Fire / CODM tabs, localStorage remembers last.' },
  { icon: Sliders, title:'Controlled Calibration', desc:'Small ± adjustments, safety caps.' },
  { icon: Box, title:'HUD Ergonomics', desc:'2/3/4 finger presets, draggable.' },
  { icon: Layers, title:'Premium Visual', desc:'Grid, glass, glows, optimized for Android.' },
  { icon: Sparkles, title:'No Fake AI', desc:'Frontend-only, works offline.' },
]
export default function TechShowcase(){
  return (
    <section id="tech" className="relative py-24 md:py-32 bg-[#080A0B] border-y border-white/5">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="max-w-[1400px] mx-auto px-6 relative">
        <div className="flex flex-wrap items-end justify-between gap-6"><div><div className="font-mono text-[11px] tracking-[0.22em] text-violet">02 / TECHNOLOGY</div><h2 className="mt-3 font-display text-[32px] md:text-[48px] leading-[0.9] font-semibold">One website. <br /><span className="text-white/40">Two games.</span></h2></div><p className="max-w-[420px] font-mono text-[12px] opacity-60">Every tool documented, testable, browser-only.</p></div>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-4">{items.map((it,i)=><motion.div key={it.title} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.06}} className="rounded-[22px] glass p-6"><div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center"><it.icon className="w-5 h-5" /></div><div className="mt-5 font-display font-medium text-[16px]">{it.title}</div><div className="mt-2 font-mono text-[12px] opacity-60">{it.desc}</div></motion.div>)}</div>
      </div>
    </section>
  )
}
