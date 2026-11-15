import { motion } from 'framer-motion'
import { FlaskConical, Target, Cpu, ShieldCheck } from 'lucide-react'
export default function About(){
  return (
    <section id="about" className="relative py-24 md:py-32 bg-[#050607] border-t border-white/5">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="max-w-[1400px] mx-auto px-6 relative">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-20 items-start">
          <div><motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-mono text-[11px] tracking-[0.22em] text-cyan">01 / ABOUT — ONE WEBSITE</motion.div>
            <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}} className="mt-4 font-display font-semibold text-[36px] md:text-[56px] leading-[0.95] tracking-[-0.02em]">Free Fire + CODM <br /><span className="text-white/40">in one website.</span></motion.h2>
            <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.2}} className="mt-8 font-mono text-[13px] leading-relaxed max-w-[560px] opacity-70">One domain, two labs. Tabs switch between Free Fire (0-200) and CODM (0-300). Each engine deterministic, honest, no AI chatbot.</motion.p>
            <div className="mt-12 grid grid-cols-2 gap-4 max-w-[520px]">{[{icon:FlaskConical,title:'Dual Engine',desc:'FF + CODM separate math'},{icon:Target,title:'One Website',desc:'Tabs, not two sites'},{icon:Cpu,title:'Device Aware',desc:'DPI, refresh, FPS weighted'},{icon:ShieldCheck,title:'No Fake',desc:'No random, no overclaim'}].map((f,i)=><motion.div key={f.title} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1*i}} className="rounded-2xl glass p-5"><f.icon className="w-5 h-5 text-cyan mb-3" /><div className="font-display font-medium text-[13px]">{f.title}</div><div className="mt-1 font-mono text-[11px] opacity-60">{f.desc}</div></motion.div>)}</div>
          </div>
          <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="relative"><div className="rounded-[28px] glass-strong p-3"><div className="rounded-[20px] bg-[#0A0D0F] border border-white/5 p-6 md:p-8"><div className="flex items-center justify-between"><div className="font-mono text-[10px] tracking-[0.2em] opacity-60">LAB SPECS — ONE WEB</div><div className="w-2 h-2 rounded-full bg-cyan animate-pulse" /></div><div className="mt-8 space-y-6">{[{l:'GAMES',v:'Free Fire + CODM'},{l:'WEBSITE',v:'One — hefgesensitivity.hefge.cloud'},{l:'ENGINES',v:'FG-FF-01 + FG-COD-01'},{l:'TABS',v:'FF tab • COD tab'},{l:'BUILD',v:'Termux + Netlify + One Domain'}].map(row=><div key={row.l} className="flex justify-between border-b border-white/5 pb-4 last:border-0"><div className="font-mono text-[10px] opacity-50">{row.l}</div><div className="font-mono text-[11px]">{row.v}</div></div>)}</div></div></div></motion.div>
        </div>
      </div>
    </section>
  )
}
