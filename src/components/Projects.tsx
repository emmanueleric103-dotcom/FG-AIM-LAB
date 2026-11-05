import { motion } from 'framer-motion'
const projects = [
  { id:'FF-01', title:'Free Fire Core', desc:'0-200 clamped, deterministic.', tags:['FF','Engine'] },
  { id:'COD-02', title:'CODM Core', desc:'0-300 ADS, Tactic, Sniper, Gyro.', tags:['CODM','Engine'] },
  { id:'HUD-03', title:'HUD System', desc:'2/3/4 finger presets, draggable.', tags:['HUD','UX'] },
]
export default function Projects(){
  return (
    <section id="projects" className="relative py-24 md:py-32 bg-[#050607] border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6"><div className="font-mono text-[11px] tracking-[0.22em] text-cyan">05 / PROJECTS</div><h2 className="mt-3 font-display text-[32px] md:text-[48px] font-semibold leading-[0.9]">One website, <br /><span className="text-white/40">two games.</span></h2><div className="mt-12 grid md:grid-cols-3 gap-4">{projects.map((p,i)=><motion.div key={p.id} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} className="rounded-[24px] glass p-6"><div className="flex justify-between"><div className="font-mono text-[10px] opacity-50">{p.id}</div><div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px]">↗</div></div><div className="mt-8 font-display text-[20px] font-medium">{p.title}</div><div className="mt-3 font-mono text-[12px] opacity-60">{p.desc}</div><div className="mt-6 flex gap-2 flex-wrap">{p.tags.map(t=><span key={t} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[9px]">{t}</span>)}</div></motion.div>)}</div></div>
    </section>
  )
}
