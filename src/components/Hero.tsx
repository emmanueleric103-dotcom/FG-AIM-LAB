import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
export default function Hero(){
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#050607]">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0"><div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan/20 blur-[120px]" /><div className="absolute bottom-[-20%] right-[10%] w-[700px] h-[700px] rounded-full bg-violet/20 blur-[140px]" /><div className="absolute top-[30%] right-[30%] w-[400px] h-[400px] rounded-full bg-orange-400/10 blur-[100px]" /></div>
      <div className="relative z-10 max-w-[1400px] w-full px-6 pt-28 pb-20">
        <div className="flex flex-col items-center text-center">
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[10px] font-mono tracking-[0.2em] mb-8"><span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />TWO GAMES • ONE WEBSITE • EST 2026</motion.div>
          <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:1,delay:0.3}} className="font-display font-bold leading-[0.85] tracking-[-0.04em] text-[13vw] md:text-[10vw] lg:text-[108px]"><span className="block">ENGINEERED</span><span className="block bg-gradient-to-r from-cyan via-white to-orange-400 bg-clip-text text-transparent">BEYOND</span><span className="block">LIMITS.</span></motion.h1>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}} className="mt-8 max-w-[560px] font-mono text-[13px] leading-relaxed opacity-70">Free Fire + Call of Duty Mobile in one premium lab. Two deterministic engines. No AI fluff.</motion.p>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.9}} className="mt-10 flex flex-wrap gap-3 justify-center"><button onClick={()=>document.getElementById('labs')?.scrollIntoView({behavior:'smooth'})} className="group relative px-8 py-4 rounded-full bg-white text-black font-display font-semibold text-[12px] tracking-[0.16em] overflow-hidden"><span className="relative z-10">OPEN GAMING LABS →</span><span className="absolute inset-0 bg-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" /></button><button onClick={()=>document.getElementById('hud')?.scrollIntoView({behavior:'smooth'})} className="px-8 py-4 rounded-full glass font-mono text-[11px] tracking-[0.18em]">HUD LAB</button></motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.4}} onClick={()=>document.getElementById('about')?.scrollIntoView({behavior:'smooth'})} className="mt-16 w-10 h-10 rounded-full glass flex items-center justify-center mx-auto animate-bounce"><ArrowDown className="w-4 h-4 opacity-70" /></motion.div>
        </div>
      </div>
    </section>
  )
}
