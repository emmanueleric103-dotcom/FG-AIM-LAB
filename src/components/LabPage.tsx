
import { useState, useEffect, useRef } from 'react'
import { PAYMENT_CONFIG, parseSelarRedirect, consumeSelarRedirectParams, getPendingProfile, clearPendingProfile, makeRedirectAutoCode } from '../lib/paymentConfig'
import { calculateSensitivity } from '../lib/sensitivityEngine'
import { calculateCodSensitivity } from '../lib/codSensitivityEngine'
import { getFingerprint, getProfileLabel, unlockProfile } from '../lib/profileLock'

const brands = ['Infinix','Tecno','Samsung','Xiaomi','Redmi','Poco','Realme','Oppo','Vivo','OnePlus','iPhone']
const rams = ['4','6','8','12','16']
const refresh = ['60','90','120','144']

export default function LabPage(){
  const [paidEmail, setPaidEmail] = useState<string|null>(null)
  const [paidName, setPaidName] = useState('')
  const [active, setActive] = useState<'ff'|'cod'>('ff')
  const [ffInputs, setFfInputs] = useState<any>({ phoneBrand:'Infinix', phoneModel:'Note 40', ram:'8', refreshRate:'120', fps:'90 FPS', dpi:'420', fingerLayout:'4', playStyle:'Balanced', weapon:'AR', fireButtonSize:'52', problem:'Headshots', matchMode:'Custom Room / Lone Wolf', dragStyle:'Hard / Fast', failWhere:'Works in Training but fails in Room' })
  const [codInputs, setCodInputs] = useState<any>({ phoneBrand:'Infinix', phoneModel:'Note 40', ram:'8', refreshRate:'120', fps:'Ultra (90 FPS)', dpi:'420', fingerLayout:'4', playStyle:'Balanced', weapon:'AR', adsMode:'Tap', gyro:'Off', fireButtonSize:'52', problem:'Tracking' })
  const [ffResult, setFfResult] = useState<any|null>(null)
  const [codResult, setCodResult] = useState<any|null>(null)
  const [ffExp, setFfExp] = useState<string[]>([])
  const [codExp, setCodExp] = useState<string[]>([])
  const [secondsLeft, setSecondsLeft] = useState(60)
  const [lockedGame, setLockedGame] = useState<'ff'|'cod'|null>(null)
  const [generatedAt, setGeneratedAt] = useState<number|null>(null)
  const [locked, setLocked] = useState(false)
  const [lockReason, setLockReason] = useState('')
  const [downloaded, setDownloaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showRefBackup, setShowRefBackup] = useState(false)
  const [ref, setRef] = useState('')
  const [refErr, setRefErr] = useState('')
  const timerRef = useRef<any>(null)

  const currentInputs = active==='ff' ? ffInputs : codInputs
  // FIX: Timer is GLOBAL, not per-tab. Once you generate, you are locked to that game. Switching tabs cannot restart timer or generate 2nd profile free.
  const currentResult = lockedGame ? (lockedGame==='ff' ? ffResult : codResult) : (active==='ff' ? ffResult : codResult)
  const currentExp = lockedGame ? (lockedGame==='ff' ? ffExp : codExp) : (active==='ff' ? ffExp : codExp)
  const currentFp = getFingerprint(active, currentInputs)
  const currentLabel = getProfileLabel(active, currentInputs)
  const hasResult = !!(ffResult || codResult)

  // 1. Check payment on load: Selar redirect OR sessionStorage paid flag OR pending
  useEffect(()=>{
    // Selar redirect: ?selar=success&email=...&fullname=...
    const redirect = parseSelarRedirect()
    if (redirect) {
      setPaidEmail(redirect.email); setPaidName(redirect.fullname)
      try{ sessionStorage.setItem('fg_lab_paid_email', redirect.email); sessionStorage.setItem('fg_lab_paid_name', redirect.fullname); sessionStorage.setItem('fg_lab_paid_at', String(Date.now())); localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL, redirect.email) }catch{}
      consumeSelarRedirectParams()
      // Restore game from pending if exists
      const pending = getPendingProfile()
      if (pending && pending.game) setActive(pending.game)
      return
    }
    // Already paid in this tab (refresh / after redirect)
    try{
      const e = sessionStorage.getItem('fg_lab_paid_email')
      if (e) { setPaidEmail(e); setPaidName(sessionStorage.getItem('fg_lab_paid_name')||'Buyer'); return }
      const le = localStorage.getItem('fg_lab_paid_email')
      if (le) { setPaidEmail(le); return }
    }catch{}
    // No payment -> show locked screen, will redirect to homepage via button
  },[])

  // 2. FIXED 60s timer — GLOBAL, starts once on first generate, NEVER resets on tab switch
  // Old bug: timer was per-tab, so switching FF -> COD hid timer, switching back restarted it to 60s.
  // New: timer is based on generatedAt timestamp. It keeps counting even if you switch tabs.
  useEffect(()=>{
    if (!generatedAt || locked) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - generatedAt) / 1000)
      const left = 60 - elapsed
      if (left <= 0) {
        clearInterval(timerRef.current)
        setSecondsLeft(0)
        handleLock('Time up! 60 seconds finished. Your result is locked.')
      } else {
        setSecondsLeft(left)
      }
    }
    tick()
    timerRef.current = setInterval(tick, 500)
    return ()=> clearInterval(timerRef.current)
  },[generatedAt, locked])

  const handleLock = (reason: string) => {
    if (locked) return
    setLocked(true); setLockReason(reason)
    setFfResult(null); setCodResult(null)
    try{ sessionStorage.removeItem('fg_lab_paid_email'); sessionStorage.removeItem('fg_lab_paid_name'); localStorage.removeItem('fg_lab_paid_email'); clearPendingProfile() }catch{}
    // After 3s, back to homepage to start cycle again
    setTimeout(()=>{ window.location.href = '/' }, 3500)
  }

  const gen = () => {
    if (!paidEmail) return
    // FIX: 1 payment = 1 profile = 1 game. If you already generated FF, you cannot switch to COD and generate 2nd free profile.
    if (lockedGame && lockedGame !== active) return
    if (lockedGame && hasResult) return
    const now = Date.now()
    setLockedGame(active)
    setGeneratedAt(now)
    setSecondsLeft(60)
    if (active==='ff') {
      const { result, explanation } = calculateSensitivity(ffInputs, {})
      setFfResult(result); setFfExp(explanation)
    } else {
      const { result, explanation } = calculateCodSensitivity(codInputs, {})
      setCodResult(result); setCodExp(explanation)
    }
    // Lock this profile to this payment (1 payment = 1 profile)
    const autoCode = makeRedirectAutoCode(paidEmail, currentFp)
    unlockProfile({ fingerprint: currentFp, game: active, label: currentLabel, code: autoCode, ref: autoCode, date: new Date().toISOString(), inputs: currentInputs })
    setDownloaded(false); setCopied(false)
  }

  const formatTime = (s:number) => `0:${s < 10 ? '0'+s : s}`

  // ===== DOWNLOADABLE PNG — canvas, 1080x1350, screenshot-ready =====
  const downloadPNG = () => {
    if (!currentResult || !paidEmail) return
    const canvas = document.createElement('canvas')
    canvas.width = 1080; canvas.height = 1350
    const ctx = canvas.getContext('2d')!
    // Background
    ctx.fillStyle = '#050607'; ctx.fillRect(0,0,1080,1350)
    // Cyan top bar
    ctx.fillStyle = '#00FFD1'; ctx.fillRect(0,0,1080,8)
    ctx.fillStyle = '#00FFD1'; ctx.font = 'bold 28px Arial'; ctx.fillText('FG AIM LAB', 60, 70)
    ctx.fillStyle = '#E6E9ED'; ctx.font = '16px Arial'; ctx.fillText('ENGINEERED BEYOND LIMITS', 60, 100)
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 52px Arial'; ctx.fillText(active==='ff' ? 'FREE FIRE' : 'CALL OF DUTY MOBILE', 60, 180)
    ctx.fillStyle = '#00FFD1'; ctx.font = 'bold 26px Arial'; ctx.fillText(active==='ff' ? 'FG-FF-01  •  0-200' : 'FG-COD-01  •  0-300', 60, 220)
    // Profile box
    ctx.fillStyle = '#0A0D0F'; ctx.fillRect(60, 250, 960, 150)
    ctx.fillStyle = '#AAAAAA'; ctx.font = '20px Arial'; ctx.fillText('PROFILE', 90, 290)
    ctx.fillStyle = '#FFFFFF'; ctx.font = '22px Arial'
    const lines = [currentLabel.slice(0,58), currentLabel.slice(58,116)]
    ctx.fillText(lines[0], 90, 325)
    if (lines[1]) ctx.fillText(lines[1], 90, 355)
    ctx.fillStyle = '#00FFD1'; ctx.font = 'bold 20px Arial'; ctx.fillText(`PROFILE ID: ${currentFp}`, 90, 385)
    // Results
    let y = 470
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 28px Arial'; ctx.fillText('YOUR SENSITIVITY', 60, y); y += 30
    Object.entries(currentResult).forEach(([k,v])=>{
      y += 70
      ctx.fillStyle = '#111418'; ctx.fillRect(60, y-35, 960, 60)
      ctx.fillStyle = '#CCCCCC'; ctx.font = '24px Arial'; ctx.fillText(k, 90, y+5)
      ctx.fillStyle = '#00FFD1'; ctx.font = 'bold 36px Arial'; ctx.textAlign = 'right'; ctx.fillText(String(v), 990, y+8); ctx.textAlign = 'left'
    })
    y += 110
    ctx.fillStyle = '#888888'; ctx.font = '20px Arial'; ctx.fillText('Copy these numbers into your game settings exactly.', 60, y)
    y += 40
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 22px Arial'; ctx.fillText('HOW TO USE: Free Fire / CODM → Settings → Sensitivity →', 60, y)
    y += 35; ctx.fillText('Set each value above. Restart game if needed.', 60, y)
    // Footer watermark
    y = 1240
    ctx.fillStyle = '#00FFD1'; ctx.fillRect(60, y, 960, 2); y += 35
    ctx.fillStyle = '#AAAAAA'; ctx.font = '18px Arial'; ctx.fillText(`Buyer: ${paidEmail}`, 60, y)
    ctx.fillStyle = '#AAAAAA'; ctx.font = '18px Arial'; ctx.fillText(`Date: ${new Date().toLocaleString()}  •  1 Payment = 1 Profile`, 60, y+30)
    ctx.fillStyle = '#666666'; ctx.font = '16px Arial'; ctx.fillText('FG AIM LAB • Do not share — watermarked to buyer', 60, y+60)
    const a = document.createElement('a')
    a.download = `FG-AIM-LAB-${active.toUpperCase()}-${currentFp}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
    setDownloaded(true)
  }

  const downloadTXT = () => {
    if (!currentResult) return
    const txt = `FG AIM LAB — ${active==='ff'?'FREE FIRE':'CODM'}\nProfile: ${currentLabel}\nProfile ID: ${currentFp}\nBuyer: ${paidEmail}\nDate: ${new Date().toLocaleString()}\n\nSENSITIVITY:\n` + Object.entries(currentResult).map(([k,v])=>`${k}: ${v}`).join('\n') + `\n\nHow to use: Copy into game Settings → Sensitivity\n1 Payment = 1 Profile • Do not share`
    const blob = new Blob([txt], {type:'text/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`FG-AIM-LAB-${active.toUpperCase()}-${currentFp}.txt`; a.click(); URL.revokeObjectURL(url)
    setDownloaded(true)
  }

  const copyValues = async () => {
    if (!currentResult) return
    const s = Object.entries(currentResult).map(([k,v])=>`${k}: ${v}`).join(' | ')
    try{ await navigator.clipboard.writeText(s); setCopied(true); setTimeout(()=>setCopied(false),2000) }catch{}
  }

  const handleRefBackup = () => {
    if (!ref.trim() || ref.trim().length < 10) { setRefErr('Enter your Selar Reference, e.g. SS15YT2P60WUMW0AG'); return }
    // Backup: if buyer has a Reference, accept it as paid (they paid, Selar just did not redirect)
    // In this cycle, we trust Reference as backup because buyer is already in Lab and will be watermarked.
    const emailFromRef = localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL) || 'buyer@gmail.com'
    setPaidEmail(emailFromRef); setPaidName('Buyer')
    try{ sessionStorage.setItem('fg_lab_paid_email', emailFromRef) }catch{}
    setRefErr(''); setShowRefBackup(false)
  }

  // NOT PAID SCREEN
  if (!paidEmail && !locked) {
    return (
      <div className="min-h-screen bg-[#050607] text-[#E6E9ED] flex items-center justify-center px-5">
        <div className="w-full max-w-[520px] rounded-[28px] bg-[#0A0D0F] border border-white/10 p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[28px]">🔒</div>
          <div className="mt-4 font-black text-[22px]">Lab is Locked</div>
          <p className="mt-2 font-mono text-[12px] opacity-60 leading-relaxed">You need to pay ₦500 first on the Homepage. After payment, Selar will bring you here automatically.</p>
          <button onClick={()=>window.location.href='/'} className="mt-6 w-full py-4 rounded-full bg-[#FF6B00] text-white font-bold text-[13px] tracking-[0.12em]">GO TO HOMEPAGE → BUY ₦500</button>
          <button onClick={()=>setShowRefBackup(true)} className="mt-3 w-full py-3 rounded-full bg-white/5 border border-white/10 font-mono text-[11px]">I PAID BUT SELAR DID NOT BRING ME BACK — USE REFERENCE</button>
          {showRefBackup && (
            <div className="mt-4 text-left rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <div className="font-mono text-[11px] font-bold">Paste Selar Reference</div>
              <input value={ref} onChange={e=>setRef(e.target.value.toUpperCase())} placeholder="SS15YT2P60WUMW0AG" className="mt-2 w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-[13px]" />
              <button onClick={handleRefBackup} className="mt-3 w-full py-3 rounded-full bg-white text-black font-bold text-[12px]">UNLOCK LAB WITH REFERENCE</button>
              {refErr && <div className="mt-2 font-mono text-[11px] text-red-300">{refErr}</div>}
            </div>
          )}
          <div className="mt-4 font-mono text-[10px] opacity-40">If you just paid, wait 10 seconds and refresh. Selar redirect may be slow.</div>
        </div>
      </div>
    )
  }

  // LOCKED AFTER 60s SCREEN
  if (locked) {
    return (
      <div className="min-h-screen bg-[#050607] text-[#E6E9ED] flex items-center justify-center px-5">
        <div className="w-full max-w-[520px] rounded-[28px] bg-[#0A0D0F] border border-red-500/20 p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[28px]">⏰</div>
          <div className="mt-4 font-black text-[22px]">Session Ended — Locked</div>
          <p className="mt-2 font-mono text-[12px] opacity-70 leading-relaxed">{lockReason}<br/>Your result is cleared for security. You are going back to Homepage in 3 seconds...</p>
          <div className="mt-4 font-mono text-[11px] opacity-60">Want another profile? Buy again — ₦500.</div>
          <button onClick={()=>window.location.href='/'} className="mt-5 w-full py-4 rounded-full bg-[#FF6B00] text-white font-bold text-[13px]">BACK TO HOMEPAGE NOW →</button>
          {downloaded && <div className="mt-3 font-mono text-[11px] text-emerald-300">✓ You downloaded before lock — check your gallery.</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050607] text-[#E6E9ED]">
      {/* LAB HEADER */}
      <header className="sticky top-0 z-50 bg-[#050607]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-[1100px] mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-[#00FFD1] text-black font-black flex items-center justify-center">FG</div><div><div className="font-black text-[13px] leading-none">FG AIM LAB • LAB</div><div className="font-mono text-[9px] opacity-50">Paid: {paidEmail}</div></div></div>
          <button onClick={()=>window.location.href='/'} className="font-mono text-[11px] px-3 py-2 rounded-full bg-white/5 border border-white/10">← Homepage</button>
        </div>
        {/* 60s COUNTDOWN BAR — only after generate */}
        {hasResult && (
          <div className="bg-red-500/10 border-t border-red-500/20">
            <div className="max-w-[1100px] mx-auto px-5 py-2 flex items-center justify-between gap-3">
              <div className="font-mono text-[11px] font-bold text-red-300">⏰ DOWNLOAD NOW — LOCKS IN {formatTime(secondsLeft)}</div>
              <div className="font-mono text-[10px] opacity-60 hidden md:block">{downloaded ? '✓ Downloaded' : 'Not downloaded yet!'}</div>
            </div>
            <div className="h-1.5 bg-white/10"><div className="h-full bg-red-500 transition-all duration-1000" style={{width: `${(secondsLeft/60)*100}%`}} /></div>
          </div>
        )}
      </header>

      <main className="max-w-[1100px] mx-auto px-5 py-6">
        <div className="flex flex-wrap gap-2">
          <button disabled={!!lockedGame && lockedGame!=='ff'} onClick={()=>{if(!lockedGame) setActive('ff');}} className={`px-5 py-3 rounded-full font-bold text-[12px] disabled:opacity-30 disabled:cursor-not-allowed ${active==='ff' ? 'bg-[#00FFD1] text-black' : 'bg-white/5 border border-white/10'}`}>🔥 FREE FIRE {lockedGame==='ff' ? '• LOCKED' : ''}</button>
          <button disabled={!!lockedGame && lockedGame!=='cod'} onClick={()=>{if(!lockedGame) setActive('cod');}} className={`px-5 py-3 rounded-full font-bold text-[12px] disabled:opacity-30 disabled:cursor-not-allowed ${active==='cod' ? 'bg-orange-400 text-black' : 'bg-white/5 border border-white/10'}`}>🎯 CODM {lockedGame==='cod' ? '• LOCKED' : ''}</button>
          {lockedGame && <div className="ml-2 self-center font-mono text-[10px] text-amber-300">🔒 Locked to {lockedGame==='ff'?'FREE FIRE':'CODM'} — Buy again for other game. Timer keeps running, cannot restart.</div>}
          <div className="ml-auto font-mono text-[10px] opacity-60 self-center">Profile ID: {currentFp} • Buyer: {paidName}</div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* INPUTS */}
          <div className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6">
            <div className="font-mono text-[11px]">YOUR PHONE + SETTINGS — {active==='ff' ? 'FREE FIRE' : 'CODM'}</div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <label className="block"><span className="font-mono text-[10px] opacity-60">BRAND</span><select value={currentInputs.phoneBrand} disabled={hasResult} onChange={e=> active==='ff' ? setFfInputs({...ffInputs, phoneBrand:e.target.value}) : setCodInputs({...codInputs, phoneBrand:e.target.value})} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px] disabled:opacity-50">{brands.map(b=><option key={b}>{b}</option>)}</select></label>
              <label className="block"><span className="font-mono text-[10px] opacity-60">MODEL</span><input value={currentInputs.phoneModel} disabled={hasResult} onChange={e=> active==='ff' ? setFfInputs({...ffInputs, phoneModel:e.target.value}) : setCodInputs({...codInputs, phoneModel:e.target.value})} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px] disabled:opacity-50" /></label>
              <label className="block"><span className="font-mono text-[10px] opacity-60">RAM</span><select value={currentInputs.ram} disabled={hasResult} onChange={e=> active==='ff' ? setFfInputs({...ffInputs, ram:e.target.value}) : setCodInputs({...codInputs, ram:e.target.value})} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px] disabled:opacity-50">{rams.map(r=><option key={r} value={r}>{r} GB</option>)}</select></label>
              <label className="block"><span className="font-mono text-[10px] opacity-60">DPI</span><input type="number" value={currentInputs.dpi} disabled={hasResult} onChange={e=> active==='ff' ? setFfInputs({...ffInputs, dpi:e.target.value}) : setCodInputs({...codInputs, dpi:e.target.value})} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px] disabled:opacity-50" /></label>
              <label className="block"><span className="font-mono text-[10px] opacity-60">REFRESH</span><select value={currentInputs.refreshRate} disabled={hasResult} onChange={e=> active==='ff' ? setFfInputs({...ffInputs, refreshRate:e.target.value}) : setCodInputs({...codInputs, refreshRate:e.target.value})} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px] disabled:opacity-50">{refresh.map(r=><option key={r} value={r}>{r} Hz</option>)}</select></label>
              <label className="block"><span className="font-mono text-[10px] opacity-60">FINGERS</span><div className="mt-1 grid grid-cols-3 gap-2">{(['2','3','4'] as const).map(f=><button key={f} disabled={hasResult} onClick={()=> active==='ff' ? setFfInputs({...ffInputs, fingerLayout:f}) : setCodInputs({...codInputs, fingerLayout:f})} className={`rounded-xl border py-3 font-mono text-[12px] disabled:opacity-50 ${currentInputs.fingerLayout===f ? 'bg-white text-black' : 'bg-black/40 border-white/10'}`}>{f}</button>)}</div></label>
              <label className="block"><span className="font-mono text-[10px] opacity-60">PLAYSTYLE</span><select value={currentInputs.playStyle} disabled={hasResult} onChange={e=> active==='ff' ? setFfInputs({...ffInputs, playStyle:e.target.value}) : setCodInputs({...codInputs, playStyle:e.target.value})} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px] disabled:opacity-50"><option>Balanced</option><option>Aggressive</option>{active==='ff' ? <><option>Precision</option><option>Defensive</option></> : <><option>Stealth</option><option>Sniper</option></>}</select></label>
              <label className="block"><span className="font-mono text-[10px] opacity-60">WEAPON</span><select value={currentInputs.weapon} disabled={hasResult} onChange={e=> active==='ff' ? setFfInputs({...ffInputs, weapon:e.target.value}) : setCodInputs({...codInputs, weapon:e.target.value})} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px] disabled:opacity-50"><option>AR</option><option>SMG</option><option>Shotgun</option><option>Sniper</option>{active==='ff' ? <option>Balanced</option> : <option>LMG</option>}</select></label>
              <label className="block md:col-span-2"><span className="font-mono text-[10px] opacity-60">PROBLEM</span><div className="mt-1 grid grid-cols-2 md:grid-cols-5 gap-2">{(active==='ff' ? ['Overshooting','Undershooting','Dragging','Unstable','Headshots'] : ['Overshooting','Undershooting','Recoil','Tracking','Wobble']).map(p=><button key={p} disabled={hasResult} onClick={()=> active==='ff' ? setFfInputs({...ffInputs, problem:p}) : setCodInputs({...codInputs, problem:p})} className={`rounded-xl border px-3 py-3 font-mono text-[11px] disabled:opacity-50 ${currentInputs.problem===p ? 'bg-white text-black' : 'bg-black/40 border-white/10'}`}>{p}</button>)}</div></label>
              {active==='ff' && (
                <>
                  <label className="block md:col-span-2"><span className="font-mono text-[10px] opacity-60">🎮 MATCH MODE — ROOM OR RANK? (NEW — Room sens ≠ Rank sens)</span><div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-2">{(['Ranked BR','Clash Squad Ranked','Custom Room / Lone Wolf'] as const).map(m=><button key={m} disabled={hasResult} onClick={()=>setFfInputs({...ffInputs, matchMode:m})} className={`rounded-xl border px-3 py-3 font-mono text-[11px] text-left disabled:opacity-50 ${ffInputs.matchMode===m ? 'bg-[#00FFD1] text-black font-bold' : 'bg-black/40 border-white/10'}`}>{m}<div className="font-normal opacity-70 text-[10px] mt-1">{m==='Ranked BR' ? 'Stable, long range, tracking' : m==='Clash Squad Ranked' ? 'Faster close, +8 General' : 'Fastest flicks, +12 General'}</div></button>)}</div></label>
                  <label className="block"><span className="font-mono text-[10px] opacity-60">✋ YOUR DRAG IN ROOM</span><div className="mt-1 grid grid-cols-3 gap-2">{(['Hard / Fast','Normal','Soft / Slow'] as const).map(d=><button key={d} disabled={hasResult} onClick={()=>setFfInputs({...ffInputs, dragStyle:d})} className={`rounded-xl border px-3 py-3 font-mono text-[11px] disabled:opacity-50 ${ffInputs.dragStyle===d ? 'bg-white text-black font-bold' : 'bg-black/40 border-white/10'}`}>{d}</button>)}</div><div className="mt-1 font-mono text-[10px] opacity-50">Most people drag harder/faster in Room → we lower sens to stop overshoot.</div></label>
                  <label className="block"><span className="font-mono text-[10px] opacity-60">❓ WHERE DOES IT FAIL?</span><select value={ffInputs.failWhere} disabled={hasResult} onChange={e=>setFfInputs({...ffInputs, failWhere:e.target.value})} className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 font-mono text-[12px] disabled:opacity-50"><option>Works in Training but fails in Room</option><option>Works in Room but fails in Rank</option><option>Fails everywhere</option><option>Works everywhere / New</option></select><div className="mt-1 font-mono text-[10px] opacity-50">Training bot stands still. Room enemy moves + panic. Different fix.</div></label>
                  <div className="md:col-span-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 font-mono text-[11px] text-cyan-100 leading-relaxed"><b>Why Training works but Room fails?</b> In Training, bot does not move, you have time, no ping, no FPS drop, no pressure. In Room, enemy runs, you panic, you drag harder/faster → same sens overshoots. We fixed it: Room mode + Hard drag = lower General/Red Dot. Test new sens in <b>Custom Room</b>, not Training, for 3 games before judging.</div>
                </>
              )}
              {active==='cod' && <label className="block"><span className="font-mono text-[10px] opacity-60">GYRO</span><div className="mt-1 grid grid-cols-2 gap-2">{(['Off','On'] as const).map(g=><button key={g} disabled={hasResult} onClick={()=>setCodInputs({...codInputs, gyro:g})} className={`rounded-xl border py-3 font-mono text-[12px] disabled:opacity-50 ${codInputs.gyro===g ? 'bg-white text-black' : 'bg-black/40 border-white/10'}`}>{g}</button>)}</div></label>}
              {active==='cod' && <label className="block"><span className="font-mono text-[10px] opacity-60">ADS MODE</span><div className="mt-1 grid grid-cols-2 gap-2">{(['Tap','Hold'] as const).map(m=><button key={m} disabled={hasResult} onClick={()=>setCodInputs({...codInputs, adsMode:m})} className={`rounded-xl border py-3 font-mono text-[12px] disabled:opacity-50 ${codInputs.adsMode===m ? 'bg-white text-black' : 'bg-black/40 border-white/10'}`}>{m}</button>)}</div></label>}
            </div>
            {!hasResult ? <button onClick={gen} className="mt-6 w-full py-4 rounded-full bg-[#FF6B00] text-white font-bold text-[13px] tracking-[0.12em]">GENERATE MY SENSITIVITY → START 60s</button> : <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 font-mono text-[11px] text-amber-200">Inputs locked for this session. You already generated this profile. Download now — {formatTime(secondsLeft)} left.</div>}
            <div className="mt-3 font-mono text-[10px] opacity-50">{currentLabel}</div>
          </div>

          {/* RESULT CARD — DOWNLOADABLE / SCREENSHOT */}
          <div className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6 min-h-[420px]">
            <div className="flex justify-between items-center"><div className="font-mono text-[11px]">OUTPUT • {active==='ff' ? 'FREE FIRE' : 'CODM'} • {currentFp}</div><div className="font-mono text-[10px] opacity-50">{hasResult ? `⏰ ${formatTime(secondsLeft)}` : 'No result yet'}</div></div>
            {!hasResult ? (
              <div className="mt-16 text-center"><div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[28px]">🎯</div><div className="mt-4 font-bold text-[16px]">No sensitivity yet</div><div className="mt-2 font-mono text-[11px] opacity-60 max-w-[280px] mx-auto leading-relaxed">Set your phone + settings on the left, tap GENERATE. You will have 60 seconds to download or screenshot.</div></div>
            ) : (
              <div>
                <div className="mt-6 space-y-2">
                  {Object.entries(currentResult).map(([k,v])=>(
                    <div key={k} className="flex justify-between items-center rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-3.5"><span className="font-mono text-[12px] opacity-70">{k}</span><span className="font-black text-[20px] text-[#00FFD1]">{String(v)}</span></div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {currentExp.map((e,i)=><div key={i} className="font-mono text-[11px] opacity-60 border-l-2 border-[#00FFD1]/30 pl-3">• {e}</div>)}
                </div>
                {/* DOWNLOAD BUTTONS */}
                <div className="mt-6 space-y-2">
                  <button onClick={downloadPNG} className="w-full py-4 rounded-full bg-[#00FFD1] text-black font-bold text-[13px] tracking-[0.08em]">⬇ DOWNLOAD PNG CARD (Screenshot-Ready) {downloaded ? '✓' : ''}</button>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={downloadTXT} className="py-3 rounded-full bg-white text-black font-bold text-[11px]">⬇ DOWNLOAD TXT</button>
                    <button onClick={copyValues} className="py-3 rounded-full bg-white/10 border border-white/10 font-bold text-[11px]">{copied ? '✓ COPIED!' : '📋 COPY VALUES'}</button>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 font-mono text-[10px] opacity-70 leading-relaxed">📸 <b>Screenshot tip:</b> Hold Power + Volume Down to screenshot this card. Or tap DOWNLOAD PNG — it saves a clean 1080×1350 image to your gallery with your email watermark. Do it now — {formatTime(secondsLeft)} left before lock.</div>
                  <div className="font-mono text-[10px] opacity-50 text-center">Watermarked to: {paidEmail} • Profile: {currentFp} • 1 Payment = 1 Profile</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
