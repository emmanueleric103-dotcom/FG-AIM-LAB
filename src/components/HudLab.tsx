import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { presets, ButtonKey, HudPreset } from '../lib/hudPresets'
export default function HudLab(){
  const [layout, setLayout] = useState<'2'|'3'|'4'>('3')
  const [hud, setHud] = useState<HudPreset>(presets['3'])
  const [sizes, setSizes] = useState<Record<ButtonKey, number>>({ fire:84, joystick:72, gloo:60, jump:54, crouch:54, scope:50, reload:44, medkit:44 })
  useEffect(()=>{ setHud(presets[layout]) },[layout])
  useEffect(()=>{ const s=localStorage.getItem('fg_hud'); if(s){ try{ const p=JSON.parse(s); if(p.layout) setLayout(p.layout); if(p.sizes) setSizes(p.sizes); if(p.hud) setHud(p.hud) }catch{} } },[])
  useEffect(()=>{ localStorage.setItem('fg_hud', JSON.stringify({ layout, sizes, hud })) },[layout, sizes, hud])
  return (
    <section id="hud" className="relative py-24 md:py-32 bg-[#080A0B] border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-wrap justify-between gap-6 items-end"><div><div className="font-mono text-[11px] tracking-[0.22em] text-violet">04 / HUD LABORATORY</div><h2 className="mt-3 font-display font-semibold text-[32px] md:text-[48px] leading-[0.9]">Interactive HUD <br />optimizer.</h2></div><div className="flex gap-2 p-1 rounded-full glass">{(['2','3','4'] as const).map(l=><button key={l} onClick={()=>setLayout(l)} className={`px-5 py-2 rounded-full font-mono text-[11px] ${layout===l ? 'bg-white text-black' : 'opacity-60'}`}>{l}-FINGER</button>)}</div></div>
        <div className="mt-12 grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="rounded-[28px] glass-strong p-6 md:p-8 space-y-6"><div className="font-mono text-[11px] tracking-[0.18em]">BUTTON SIZES</div>{(Object.keys(sizes) as ButtonKey[]).map(k=><div key={k} className="flex items-center justify-between gap-4"><div className="font-mono text-[11px] uppercase w-[80px]">{k}</div><input type="range" min={36} max={96} value={sizes[k]} onChange={e=>setSizes(prev=>({...prev,[k]:parseInt(e.target.value)}))} className="flex-1 accent-cyan" /><div className="font-mono text-[11px] w-[36px] text-right">{sizes[k]}</div></div>)}</div>
          <div className="rounded-[28px] glass-strong p-3"><div className="rounded-[20px] bg-[#0A0D0F] border border-white/5 p-3"><div className="font-mono text-[10px] opacity-60 mb-3">LIVE PREVIEW • {layout}-FINGER HUD</div><div className="relative w-full aspect-[9/16] max-h-[680px] mx-auto rounded-[20px] overflow-hidden bg-gradient-to-b from-[#12161A] to-[#07090A] border border-white/5"><div className="absolute inset-0 grid-bg opacity-20" />{(Object.keys(hud) as ButtonKey[]).map(k=>{ const b=hud[k]; const size=sizes[k]??b.size; return <motion.div key={k} drag dragMomentum={false} style={{left:`${b.x}%`,top:`${b.y}%`,width:size,height:size}} className="absolute -translate-x-1/2 -translate-y-1/2"><div className={`w-full h-full rounded-full flex items-center justify-center font-mono text-[8px] border backdrop-blur-md ${k==='fire'?'bg-cyan/20 border-cyan/40 text-cyan':'bg-white/[0.06] border-white/15'}`}>{b.label}</div></motion.div>})}</div></div></div>
        </div>
      </div>
    </section>
  )
}
