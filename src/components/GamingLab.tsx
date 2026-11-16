
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Flame, Gamepad2, Target, Lock, Unlock, ShieldCheck, Smartphone, RefreshCw, FolderOpen } from 'lucide-react'
import { calculateSensitivity, Inputs as FFInputs, Sens as FFSens } from '../lib/sensitivityEngine'
import { calculateCodSensitivity, CodInputs, CodSens } from '../lib/codSensitivityEngine'
import PaymentModal from './PaymentModal'
import { PAYMENT_CONFIG, unlockFromSelarRedirect, getPaymentInfo } from '../lib/paymentConfig'
import { getFingerprint, getProfileLabel, getShortLabel, getVault, isProfileUnlocked, getProfileEntry, unlockProfile, diffInputs, isPhoneChanged, ProfileEntry } from '../lib/profileLock'

const brands = ['Infinix','Tecno','Samsung','Xiaomi','Redmi','Poco','Realme','Oppo','Vivo','OnePlus','iPhone']
const rams = ['4','6','8','12','16']
const refresh = ['60','90','120','144']

export default function GamingLab(){
  const [active, setActive] = useState<'ff'|'cod'>('ff')
  const [ffMode, setFfMode] = useState<'room'|'rank'>('room');
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerLocked, setTimerLocked] = useState(false);
  useEffect(()=>{ if(!timerActive) return; if(timeLeft<=0){ setTimerLocked(true); setTimerActive(false); setTimeout(()=>{ window.location.href='/'; },2000); return; } const tm=setTimeout(()=> setTimeLeft(v=>v-1),1000); return ()=> clearTimeout(tm); },[timerActive, timeLeft]);
  const [showPayment, setShowPayment] = useState(false)
  const [paymentGame, setPaymentGame] = useState<'ff'|'cod'>('ff')
  const [paymentInfo, setPaymentInfo] = useState(getPaymentInfo())
  const [vault, setVault] = useState<ProfileEntry[]>([])
  const [showVault, setShowVault] = useState(false)

  const [ffInputs, setFfInputs] = useState<FFInputs>({ phoneBrand:'Infinix', phoneModel:'Note 40', ram:'8', refreshRate:'120', fps:'90 FPS', dpi:'420', fingerLayout:'4', playStyle:'Balanced', weapon:'AR', fireButtonSize:'52', problem:'Headshots' as any })
  const [ffResult, setFfResult] = useState<FFSens|null>(null)
  const [ffExp, setFfExp] = useState<string[]>([])
  const [ffCopied, setFfCopied] = useState(false)
  const [codInputs, setCodInputs] = useState<CodInputs>({ phoneBrand:'Infinix', phoneModel:'Note 40', ram:'8', refreshRate:'120', fps:'Ultra (90 FPS)', dpi:'420', fingerLayout:'4', playStyle:'Balanced', weapon:'AR', adsMode:'Tap', gyro:'Off', fireButtonSize:'52', problem:'Tracking' })
  const [codResult, setCodResult] = useState<CodSens|null>(null)
  const [codExp, setCodExp] = useState<string[]>([])
  const [codCopied, setCodCopied] = useState(false)

  // Fingerprints for current settings
  const ffFp = useMemo(()=> getFingerprint('ff', ffInputs), [ffInputs])
  const codFp = useMemo(()=> getFingerprint('cod', codInputs), [codInputs])
  const ffLabel = useMemo(()=> getProfileLabel('ff', ffInputs), [ffInputs])
  const codLabel = useMemo(()=> getProfileLabel('cod', codInputs), [codInputs])
  const currentFp = active === 'ff' ? ffFp : codFp
  const currentLabel = active === 'ff' ? ffLabel : codLabel
  const currentInputs = active === 'ff' ? ffInputs : codInputs
  const isCurrentUnlocked = isProfileUnlocked(currentFp)
  const currentEntry = getProfileEntry(currentFp)

  useEffect(()=>{
    unlockFromSelarRedirect()
    setVault(getVault())
    setPaymentInfo(getPaymentInfo())
    const last = localStorage.getItem('fg_last_tab'); if(last==='cod'||last==='ff') setActive(last as any)
    const s1 = localStorage.getItem('fg_lab_inputs'); if(s1){ try{ setFfInputs(JSON.parse(s1)) }catch{} }
    const r1 = localStorage.getItem('fg_lab_result'); if(r1){ try{ const {result, explanation}=JSON.parse(r1); setFfResult(result); setFfExp(explanation) }catch{} }
    const s2 = localStorage.getItem('fg_cod_inputs'); if(s2){ try{ setCodInputs(JSON.parse(s2)) }catch{} }
    const r2 = localStorage.getItem('fg_cod_result'); if(r2){ try{ const {result, explanation}=JSON.parse(r2); setCodResult(result); setCodExp(explanation) }catch{} }
  },[])

  // Refresh vault when inputs change (to show lock status)
  useEffect(()=>{ setVault(getVault()) }, [ffFp, codFp])

  const handleUnlocked = () => {
    setVault(getVault())
    setPaymentInfo(getPaymentInfo())
    setShowPayment(false)
    setTimeout(()=>{ if(paymentGame==='ff') genFF(true); else genCOD(true) }, 300)
  }

  const genFF = (bypass=false)=>{
    if(!bypass && !isProfileUnlocked(ffFp)){ setPaymentGame('ff'); setShowPayment(true); return }
    const { result, explanation } = calculateSensitivity({ ...ffInputs, mode: ffMode }, {})
    setFfResult(result); setFfExp(explanation)
    localStorage.setItem('fg_lab_inputs', JSON.stringify(ffInputs))
    localStorage.setItem('fg_lab_result', JSON.stringify({ result, explanation }))
    localStorage.setItem('fg_last_tab','ff')
  }
  const genCOD = (bypass=false)=>{
    if(!bypass && !isProfileUnlocked(codFp)){ setPaymentGame('cod'); setShowPayment(true); return }
    const { result, explanation } = calculateCodSensitivity(codInputs, {})
    setCodResult(result); setCodExp(explanation)
    localStorage.setItem('fg_cod_inputs', JSON.stringify(codInputs))
    localStorage.setItem('fg_cod_result', JSON.stringify({ result, explanation }))
    localStorage.setItem('fg_last_tab','cod')
  }

  const loadProfile = (entry: ProfileEntry)=>{
    if(entry.game==='ff'){ setFfInputs(entry.inputs); setActive('ff'); localStorage.setItem('fg_last_tab','ff') }
    else { setCodInputs(entry.inputs); setActive('cod'); localStorage.setItem('fg_last_tab','cod') }
    setShowVault(false)
    // Auto-generate for that paid profile (already unlocked, free)
    setTimeout(()=>{
      if(entry.game==='ff'){
        const { result, explanation } = calculateSensitivity(entry.inputs, {})
        setFfResult(result); setFfExp(explanation)
      } else {
        const { result, explanation } = calculateCodSensitivity(entry.inputs, {})
        setCodResult(result); setCodExp(explanation)
      }
    }, 100)
  }

  // Diff vs last paid profile (to explain why new payment needed)
  const lastPaidForThisGame = vault.filter(v=>v.game===active).slice(-1)[0]
  const diffs = lastPaidForThisGame ? diffInputs(lastPaidForThisGame.inputs, currentInputs) : []

  return (
    <section id="labs" className="relative py-24 md:py-32 bg-[#050607] border-t border-white/5">
  <div className="max-w-[600px] mx-auto mb-4 px-4"><div className="rounded-full bg-white/10 border border-white/20 p-2 flex items-center justify-between"><span className="font-mono text-[12px]">{timerLocked ? 'LOCKED - Returning...' : timerActive ? timeLeft + 's LEFT - Download now!' : '60s TIMER - Starts on Generate'}</span><div className="h-2 flex-1 mx-3 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-[#00FFD1]" style={{width: (timeLeft/60*100)+'%'}} /></div><span className="font-mono text-[12px] font-bold">{timeLeft}s</span></div></div>
  {active==='ff' && (<div className="max-w-[600px] mx-auto mb-6 px-4"><div className="font-mono text-[11px] tracking-[0.2em] opacity-60 mb-2 text-center">ROOM vs RANK - FREE FIRE</div><div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-black/40 border border-white/20"><button onClick={()=>setFfMode('room')} className={ffMode==='room' ? 'px-4 py-3 rounded-full bg-[#00FFD1] text-black font-bold' : 'px-4 py-3 rounded-full text-white/70'}>ROOM - Custom Room<br/><span className="text-[10px] font-normal">Faster +8 General</span></button><button onClick={()=>setFfMode('rank')} className={ffMode==='rank' ? 'px-4 py-3 rounded-full bg-white text-black font-bold' : 'px-4 py-3 rounded-full text-white/70'}>RANK - Ranked<br/><span className="text-[10px] font-normal">Balanced Control</span></button></div><p className="font-mono text-[10px] opacity-60 text-center mt-2">{ffMode==='room' ? 'Room = close-range flicks, higher sensitivity for Custom Room' : 'Rank = stable control for Ranked matches'}</p></div>)}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="max-w-[1400px] mx-auto px-6 relative">
        <div className="flex flex-wrap justify-between gap-6">
          <div className="max-w-[700px]">
            <div className="font-mono text-[11px] tracking-[0.22em] text-cyan">03 / GAMING LABORATORIES — ADVANCED • PAY PER PROFILE</div>
            <h2 className="mt-3 font-display font-semibold text-[32px] md:text-[52px] leading-[0.9]">Free Fire +<br/>Call of Duty.<br/><span className="text-white/40">Pay per phone.</span></h2>
            <p className="mt-4 max-w-[600px] font-mono text-[12px] opacity-60">New model: <b className="text-white">₦500 = 1 Profile</b> = 1 Phone + 1 Settings set. Change phone OR any setting = New profile = New ₦500. Go back to a paid profile = FREE.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isCurrentUnlocked ? (<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-[11px] text-emerald-300"><Unlock className="w-3.5 h-3.5" /> THIS PROFILE UNLOCKED • {currentFp} • Free re-generate</div>) : (<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 font-mono text-[11px] text-amber-300"><Lock className="w-3.5 h-3.5" /> NEW PROFILE • Pay {PAYMENT_CONFIG.PRICE_DISPLAY} to Generate<button onClick={()=>{ setPaymentGame(active); setShowPayment(true)}} className="ml-2 px-3 py-1 rounded-full bg-amber-400 text-black font-bold text-[10px]">UNLOCK THIS PROFILE</button></div>)}
              <button onClick={()=>setShowVault(!showVault)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass font-mono text-[11px]"><FolderOpen className="w-3.5 h-3.5" /> MY PROFILES ({vault.length}) {vault.length>0 ? "• Switch back FREE" : ""}</button>
            </div>
            {showVault && (
              <div className="mt-4 rounded-[20px] glass-strong p-4">
                <div className="font-mono text-[11px] mb-3">MY PAID PROFILES — Click to load FREE (no new payment)</div>
                {vault.length===0 ? <div className="font-mono text-[11px] opacity-60">No paid profiles yet. Pay for your first profile above.</div> : vault.map(v=>(
                  <button key={v.fingerprint} onClick={()=>loadProfile(v)} className={`w-full text-left rounded-xl border p-3 mb-2 flex justify-between items-center ${v.fingerprint===currentFp ? 'bg-cyan/10 border-cyan/30' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'}`}>
                    <div><div className="font-mono text-[11px]">{v.label}</div><div className="font-mono text-[10px] opacity-50 mt-0.5">{v.fingerprint} • {new Date(v.date).toLocaleDateString()} • Code: {v.code.slice(0,8)}... • {v.fingerprint===currentFp ? '← CURRENT' : 'Click to load FREE'}</div></div>
                    <div className="font-mono text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">PAID ✓</div>
                  </button>
                ))}
              </div>
            )}
            {!isCurrentUnlocked && lastPaidForThisGame && diffs.length>0 && (
              <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 font-mono text-[11px] text-amber-200">
                <div className="font-bold mb-1">Why new payment? You changed:</div>
                {diffs.slice(0,4).map((d,i)=><div key={i}>• {d}</div>)}
                {isPhoneChanged(lastPaidForThisGame.inputs, currentInputs) && <div className="mt-1 font-bold">→ New phone detected. Your old profile is still saved in Vault — switch back free.</div>}
              </div>
            )}
          </div>
          <div className="rounded-full glass px-4 py-2 font-mono text-[10px] tracking-[0.18em] h-fit"><span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse inline-block mr-2" /> ADVANCED: PAY PER PROFILE • 1 CODE = 1 PROFILE</div>
        </div>

        <div className="mt-6 rounded-[20px] glass p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3"><Smartphone className="w-5 h-5 text-cyan" /><div><div className="font-mono text-[10px] opacity-50">CURRENT PROFILE (what you will pay for)</div><div className="font-mono text-[11px] mt-0.5">{currentLabel}</div><div className="font-mono text-[10px] opacity-50">ID: {currentFp} • {isCurrentUnlocked ? 'UNLOCKED ✓' : 'NOT PAID YET — Pay ₦500'}</div></div></div>
          <div className="text-right font-mono text-[10px] opacity-60">Vault: {vault.length} paid profile(s)<br/>Each new phone/settings = New ₦500</div>
        </div>

        <div className="mt-6 flex gap-2 p-1 rounded-full glass-strong w-fit"><button onClick={()=>{setActive('ff'); localStorage.setItem('fg_last_tab','ff')}} className={`px-6 py-3 rounded-full font-bold text-[11px] tracking-[0.16em] flex items-center gap-2 ${active==='ff' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}><Flame className="w-4 h-4" /> FREE FIRE</button><button onClick={()=>{setActive('cod'); localStorage.setItem('fg_last_tab','cod')}} className={`px-6 py-3 rounded-full font-bold text-[11px] tracking-[0.16em] flex items-center gap-2 ${active==='cod' ? 'bg-orange-400 text-black' : 'text-white/60 hover:text-white'}`}><Gamepad2 className="w-4 h-4" /> CALL OF DUTY</button></div>

        {active==='ff' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="rounded-[28px] glass-strong p-6 md:p-8"><div className="font-mono text-[11px] mb-6 flex items-center gap-2"><Flame className="w-4 h-4 text-cyan" /> FREE FIRE MATRIX • 0-200 {!isProfileUnlocked(ffFp) && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-bold">LOCKED • NEW PROFILE</span>}{isProfileUnlocked(ffFp) && <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-bold">UNLOCKED</span>}</div><div className="grid md:grid-cols-2 gap-4"><Field label="Brand"><select value={ffInputs.phoneBrand} onChange={e=>setFfInputs({...ffInputs, phoneBrand:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]">{brands.map(b=><option key={b} value={b}>{b}</option>)}</select></Field><Field label="Model"><input value={ffInputs.phoneModel} onChange={e=>setFfInputs({...ffInputs, phoneModel:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]" /></Field><Field label="RAM"><select value={ffInputs.ram} onChange={e=>setFfInputs({...ffInputs, ram:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]">{rams.map(r=><option key={r} value={r}>{r} GB</option>)}</select></Field><Field label="Refresh"><select value={ffInputs.refreshRate} onChange={e=>setFfInputs({...ffInputs, refreshRate:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]">{refresh.map(r=><option key={r} value={r}>{r}Hz</option>)}</select></Field><Field label="DPI"><input type="number" value={ffInputs.dpi} onChange={e=>setFfInputs({...ffInputs, dpi:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]" /></Field><Field label="Fingers"><div className="grid grid-cols-3 gap-2">{(['2','3','4'] as const).map(f=><button key={f} onClick={()=>setFfInputs({...ffInputs, fingerLayout:f})} className={`rounded-xl border py-3 font-mono text-[12px] ${ffInputs.fingerLayout===f ? 'bg-cyan text-black' : 'bg-black/40 border-white/10'}`}>{f}</button>)}</div></Field><Field label="PlayStyle"><select value={ffInputs.playStyle} onChange={e=>setFfInputs({...ffInputs, playStyle:e.target.value as any})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]"><option>Balanced</option><option>Aggressive</option><option>Precision</option><option>Defensive</option></select></Field><Field label="Weapon"><select value={ffInputs.weapon} onChange={e=>setFfInputs({...ffInputs, weapon:e.target.value as any})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]"><option>AR</option><option>SMG</option><option>Shotgun</option><option>Sniper</option><option>Balanced</option></select></Field><Field label="Problem" full><div className="grid grid-cols-2 gap-2">{['Overshooting','Undershooting','Dragging','Unstable','Headshots'].map(p=><button key={p} onClick={()=>setFfInputs({...ffInputs, problem:p as any})} className={`rounded-xl border px-3 py-3 font-mono text-[11px] ${ffInputs.problem===p ? 'bg-white text-black' : 'bg-black/40 border-white/10'}`}>{p}</button>)}</div></Field></div><button onClick={() => { setTimerActive(true); setTimeLeft(60); setTimerLocked(false); genFF(); }} className={`mt-8 w-full md:w-auto px-7 py-4 rounded-full font-bold text-[11px] tracking-[0.16em] flex items-center justify-center gap-2 ${isProfileUnlocked(ffFp) ? 'bg-white text-black' : 'bg-[#FF6B00] text-white hover:bg-[#FF8A2A]'}`}>{isProfileUnlocked(ffFp) ? <><Flame className="w-4 h-4" /> GENERATE THIS PROFILE (PAID ✓)</> : <><Lock className="w-4 h-4" /> PAY {PAYMENT_CONFIG.PRICE_DISPLAY} FOR THIS PROFILE • SELAR</>}</button>{!isProfileUnlocked(ffFp) && <div className="mt-3 font-mono text-[10px] opacity-60 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-cyan" /> Changing phone or any setting creates a new profile that needs a new payment.</div>}</div>
            <div className="rounded-[28px] glass-strong p-6 md:p-8 min-h-[420px]"><div className="flex justify-between"><div className="font-mono text-[11px]">OUTPUT • FREE FIRE • {ffFp}</div><button onClick={()=>{ if(!ffResult) return; navigator.clipboard.writeText(`FF General ${ffResult.General} Red ${ffResult.RedDot}`); setFfCopied(true); setTimeout(()=>setFfCopied(false),2000)}} className="w-9 h-9 rounded-full glass flex items-center justify-center">{ffCopied ? <Check className="w-4 h-4 text-cyan" /> : <Copy className="w-4 h-4" />}</button></div>{!isProfileUnlocked(ffFp) ? (<div className="mt-10 text-center"><div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Lock className="w-7 h-7 text-amber-400" /></div><div className="mt-5 font-display font-bold text-[18px]">This Profile Locked</div><div className="mt-2 font-mono text-[12px] opacity-60 max-w-[300px] mx-auto">{ffLabel}</div><div className="mt-2 font-mono text-[11px] opacity-50">Pay {PAYMENT_CONFIG.PRICE_DISPLAY} to unlock THIS profile. New phone/settings = New profile.</div><button onClick={() => { setPaymentGame('ff'); setShowPayment(true) }} className="mt-6 px-6 py-3.5 rounded-full bg-[#FF6B00] text-white font-bold text-[11px] tracking-[0.14em]">UNLOCK THIS PROFILE — {PAYMENT_CONFIG.PRICE_DISPLAY}</button></div>) : !ffResult ? <div className="mt-20 text-center opacity-60 font-mono text-[12px]">Unlocked ✓ — Press Generate for this profile</div> : <div className="mt-8 space-y-3">{Object.entries(ffResult).map(([k,v])=><div key={k} className="flex justify-between rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-4"><div className="font-mono text-[11px] opacity-70">{k}</div><div className="font-bold text-[18px]">{v as any}</div></div>)}</div>}{isProfileUnlocked(ffFp) && ffExp.length>0 && <div className="mt-6 space-y-2">{ffExp.map((e,i)=><div key={i} className="font-mono text-[11px] opacity-60 border-l border-cyan/30 pl-3">• {e}</div>)}</div>}</div>
          </motion.div>
        )}
        {active==='cod' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="rounded-[28px] glass-strong p-6 md:p-8 border border-orange-400/10"><div className="font-mono text-[11px] mb-6 flex items-center gap-2"><Target className="w-4 h-4 text-orange-400" /> CODM MATRIX • 0-300 {!isProfileUnlocked(codFp) && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-bold">LOCKED • NEW PROFILE</span>}{isProfileUnlocked(codFp) && <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-bold">UNLOCKED</span>}</div><div className="grid md:grid-cols-2 gap-4"><Field label="Brand"><select value={codInputs.phoneBrand} onChange={e=>setCodInputs({...codInputs, phoneBrand:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]">{brands.map(b=><option key={b} value={b}>{b}</option>)}</select></Field><Field label="Model"><input value={codInputs.phoneModel} onChange={e=>setCodInputs({...codInputs, phoneModel:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]" /></Field><Field label="RAM"><select value={codInputs.ram} onChange={e=>setCodInputs({...codInputs, ram:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]">{rams.map(r=><option key={r} value={r}>{r} GB</option>)}</select></Field><Field label="DPI"><input type="number" value={codInputs.dpi} onChange={e=>setCodInputs({...codInputs, dpi:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]" /></Field><Field label="Fingers"><div className="grid grid-cols-3 gap-2">{(['2','3','4'] as const).map(f=><button key={f} onClick={()=>setCodInputs({...codInputs, fingerLayout:f})} className={`rounded-xl border py-3 font-mono text-[12px] ${codInputs.fingerLayout===f ? 'bg-orange-400 text-black' : 'bg-black/40 border-white/10'}`}>{f}</button>)}</div></Field><Field label="Gyro"><div className="grid grid-cols-2 gap-2">{(['Off','On'] as const).map(g=><button key={g} onClick={()=>setCodInputs({...codInputs, gyro:g})} className={`rounded-xl border py-3 font-mono text-[12px] ${codInputs.gyro===g ? 'bg-white text-black' : 'bg-black/40 border-white/10'}`}>{g}</button>)}</div></Field><Field label="PlayStyle"><select value={codInputs.playStyle} onChange={e=>setCodInputs({...codInputs, playStyle:e.target.value as any})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]"><option>Balanced</option><option>Aggressive</option><option>Stealth</option><option>Sniper</option></select></Field><Field label="Weapon"><select value={codInputs.weapon} onChange={e=>setCodInputs({...codInputs, weapon:e.target.value as any})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px]"><option>AR</option><option>SMG</option><option>Shotgun</option><option>Sniper</option><option>LMG</option></select></Field><Field label="Problem" full><div className="grid grid-cols-2 gap-2">{['Overshooting','Undershooting','Recoil','Tracking','Wobble'].map(p=><button key={p} onClick={()=>setCodInputs({...codInputs, problem:p as any})} className={`rounded-xl border px-3 py-3 font-mono text-[11px] ${codInputs.problem===p ? 'bg-white text-black' : 'bg-black/40 border-white/10'}`}>{p}</button>)}</div></Field></div><button onClick={() => genCOD()} className={`mt-8 w-full md:w-auto px-7 py-4 rounded-full font-bold text-[11px] tracking-[0.16em] flex items-center justify-center gap-2 ${isProfileUnlocked(codFp) ? 'bg-orange-400 text-black' : 'bg-[#FF6B00] text-white hover:bg-[#FF8A2A]'}`}>{isProfileUnlocked(codFp) ? <><Target className="w-4 h-4" /> GENERATE THIS PROFILE (PAID ✓)</> : <><Lock className="w-4 h-4" /> PAY {PAYMENT_CONFIG.PRICE_DISPLAY} FOR THIS PROFILE • SELAR</>}</button>{!isProfileUnlocked(codFp) && <div className="mt-3 font-mono text-[10px] opacity-60 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-orange-400" /> Same rule: New phone or setting = New profile = New payment.</div>}</div>
            <div className="rounded-[28px] glass-strong p-6 md:p-8 min-h-[420px]"><div className="flex justify-between"><div className="font-mono text-[11px]">OUTPUT • CODM • {codFp}</div><button onClick={()=>{ if(!codResult) return; navigator.clipboard.writeText(`CODM Std ${codResult.Standard} ADS ${codResult.ADS}`); setCodCopied(true); setTimeout(()=>setCodCopied(false),2000)}} className="w-9 h-9 rounded-full glass flex items-center justify-center">{codCopied ? <Check className="w-4 h-4 text-orange-400" /> : <Copy className="w-4 h-4" />}</button></div>{!isProfileUnlocked(codFp) ? (<div className="mt-10 text-center"><div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Lock className="w-7 h-7 text-amber-400" /></div><div className="mt-5 font-display font-bold text-[18px]">This Profile Locked</div><div className="mt-2 font-mono text-[12px] opacity-60 max-w-[300px] mx-auto">{codLabel}</div><button onClick={() => { setPaymentGame('cod'); setShowPayment(true) }} className="mt-6 px-6 py-3.5 rounded-full bg-[#FF6B00] text-white font-bold text-[11px] tracking-[0.14em]">UNLOCK THIS PROFILE — {PAYMENT_CONFIG.PRICE_DISPLAY}</button></div>) : !codResult ? <div className="mt-20 text-center opacity-60 font-mono text-[12px]">Unlocked ✓ — Press Generate</div> : <div className="mt-8 space-y-3">{Object.entries(codResult).map(([k,v])=><div key={k} className="flex justify-between rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-4"><div className="font-mono text-[11px] opacity-70">{k}</div><div className="font-bold text-[18px]">{v as any}</div></div>)}</div>}{isProfileUnlocked(codFp) && codExp.length>0 && <div className="mt-6 space-y-2">{codExp.map((e,i)=><div key={i} className="font-mono text-[11px] opacity-60 border-l border-orange-400/30 pl-3">• {e}</div>)}</div>}</div>
          </motion.div>
        )}
      </div>
      <PaymentModal open={showPayment} onClose={()=>setShowPayment(false)} onUnlocked={handleUnlocked} game={paymentGame} currentInputs={paymentGame==='ff' ? ffInputs : codInputs} fingerprint={paymentGame==='ff' ? ffFp : codFp} label={paymentGame==='ff' ? ffLabel : codLabel} />
    </section>
  )
}
function Field({ label, children, full }: { label:string, children:React.ReactNode, full?:boolean }){ return <div className={full ? 'md:col-span-2' : ''}><div className="font-mono text-[10px] tracking-[0.18em] opacity-60 mb-2">{label}</div>{children}</div> }
