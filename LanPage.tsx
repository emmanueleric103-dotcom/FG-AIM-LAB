import { useState, useEffect } from 'react'

type Game = 'ff' | 'cod'
type Mode = 'rank' | 'room'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function calcFF(dpi: number, fingers: number, playstyle: string, weapon: string, problem: string, mode: Mode) {
  let general = 95
  let red = 92
  let x2 = 88
  let x4 = 80
  let sniper = 68
  let freeLook = 85
  const notes: string[] = []
  // DPI - lower DPI needs higher in-game sensitivity
  const dpiAdj = clamp((500 - dpi) / 12, -10, 14)
  general += dpiAdj; red += dpiAdj; x2 += dpiAdj
  notes.push(`DPI ${dpi}: ${dpiAdj >= 0 ? '+' : ''}${dpiAdj} - low DPI needs higher sensitivity, high DPI needs lower.`)
  // Fingers - more fingers = better control = slightly lower
  const fingerAdj = fingers === 2 ? 6 : fingers === 3 ? 2 : fingers === 4 ? -4 : -7
  general += fingerAdj; red += fingerAdj
  notes.push(`${fingers} fingers: ${fingerAdj >= 0 ? '+' : ''}${fingerAdj} - more fingers = more control, less sensitivity needed.`)
  // Playstyle
  const playAdj = playstyle === 'Aggressive' ? 8 : playstyle === 'Rusher' ? 10 : playstyle === 'Sniper' ? -8 : playstyle === 'Defensive' ? -4 : 0
  general += playAdj; red += playAdj
  notes.push(`Playstyle ${playstyle}: ${playAdj >= 0 ? '+' : ''}${playAdj}`)
  // Weapon
  const wpAdj = weapon === 'SMG' ? 6 : weapon === 'Shotgun' ? 10 : weapon === 'Sniper' ? -10 : weapon === 'AR' ? 2 : 0
  general += wpAdj; red += wpAdj
  notes.push(`Weapon ${weapon}: ${wpAdj >= 0 ? '+' : ''}${wpAdj}`)
  // Problem
  let probAdj = 0
  if (problem === 'Recoil goes up') probAdj = -8
  if (problem === 'Drag is slow') probAdj = 10
  if (problem === 'Aim is shaky') probAdj = -10
  if (problem === 'Close range weak') probAdj = 8
  if (problem === 'Long range weak') probAdj = -8
  general += probAdj; red += probAdj; x2 += probAdj
  notes.push(`Problem ${problem}: ${probAdj >= 0 ? '+' : ''}${probAdj} - fixed by shifting base, not guessing.`)
  // Room vs Rank - room players drag harder / faster
  const roomAdj = mode === 'room' ? 8 : 0
  general += roomAdj; red += 6 * (mode === 'room' ? 1 : 0); x2 += 5 * (mode === 'room' ? 1 : 0)
  notes.push(mode === 'room' ? 'Mode Room: +8 General - room drag is faster than rank, so sensitivity is higher.' : 'Mode Rank: balanced - rank needs control, not speed.')
  return {
    General: clamp(general, 0, 200),
    'Red Dot': clamp(red, 0, 200),
    '2x Scope': clamp(x2, 0, 200),
    '4x Scope': clamp(x4, 0, 200),
    'Sniper Scope': clamp(sniper, 0, 200),
    'Free Look': clamp(freeLook, 0, 200),
    notes,
  }
}

function calcCODM(dpi: number, fingers: number, playstyle: string, weapon: string, problem: string) {
  let std = 120
  let ads = 110
  let gyro = 95
  const notes: string[] = []
  const dpiAdj = clamp((500 - dpi) / 10, -15, 18)
  std += dpiAdj; ads += dpiAdj
  notes.push(`DPI ${dpi}: ${dpiAdj >= 0 ? '+' : ''}${dpiAdj}`)
  const fingerAdj = fingers === 2 ? 8 : fingers === 3 ? 3 : fingers === 4 ? -5 : -9
  std += fingerAdj; ads += fingerAdj
  notes.push(`${fingers} fingers: ${fingerAdj >= 0 ? '+' : ''}${fingerAdj}`)
  const playAdj = playstyle === 'Aggressive' ? 10 : playstyle === 'Rusher' ? 12 : playstyle === 'Sniper' ? -10 : 0
  std += playAdj; ads += playAdj
  notes.push(`Playstyle ${playstyle}: ${playAdj >= 0 ? '+' : ''}${playAdj}`)
  const wpAdj = weapon === 'SMG' ? 8 : weapon === 'Shotgun' ? 12 : weapon === 'Sniper' ? -12 : 2
  std += wpAdj; ads += wpAdj
  notes.push(`Weapon ${weapon}: ${wpAdj >= 0 ? '+' : ''}${wpAdj}`)
  let probAdj = 0
  if (problem === 'Recoil goes up') probAdj = -10
  if (problem === 'Drag is slow') probAdj = 12
  if (problem === 'Aim is shaky') probAdj = -12
  if (problem === 'Close range weak') probAdj = 10
  if (problem === 'Long range weak') probAdj = -10
  std += probAdj; ads += probAdj
  notes.push(`Problem ${problem}: ${probAdj >= 0 ? '+' : ''}${probAdj}`)
  return {
    'Standard Sensitivity': clamp(std, 0, 300),
    'ADS Sensitivity': clamp(ads, 0, 300),
    'Gyro Sensitivity': clamp(gyro, 0, 300),
    notes,
  }
}

export default function LabPage() {
  const [active, setActive] = useState<Game>('ff')
  const [dpi, setDpi] = useState(420)
  const [fingers, setFingers] = useState(3)
  const [playstyle, setPlaystyle] = useState('Balanced')
  const [weapon, setWeapon] = useState('AR')
  const [problem, setProblem] = useState('Recoil goes up')
  const [mode, setMode] = useState<Mode>('rank')
  const [ffResult, setFfResult] = useState<any>(null)
  const [codResult, setCodResult] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [savedMsg, setSavedMsg] = useState('')

  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const unlocked = params.get('selar') === 'success'
  const lockedGame: Game | null = ffResult ? 'ff' : codResult ? 'cod' : null
  const currentResult = active === 'ff' ? ffResult : codResult

  useEffect(() => {
    if (timeLeft <= 0) return
    const t = setTimeout(() => {
      if (timeLeft === 1) {
        window.location.href = '/'
      } else {
        setTimeLeft(timeLeft - 1)
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  function handleGenerate() {
    if (!unlocked) return
    if (lockedGame && lockedGame !== active) {
      alert(lockedGame === 'ff' ? 'CODM Locked: This payment was used for Free Fire. Buy a new profile for CODM.' : 'Free Fire Locked: This payment was used for CODM. Buy a new profile for Free Fire.')
      return
    }
    if (active === 'ff') {
      const r = calcFF(dpi, fingers, playstyle, weapon, problem, mode)
      setFfResult(r)
    } else {
      const r = calcCODM(dpi, fingers, playstyle, weapon, problem)
      setCodResult(r)
    }
    setTimeLeft(60)
    setSavedMsg('')
  }

  function handleDownloadTxt() {
    if (!currentResult) return
    const lines = [
      'FG AIM LAB - ENGINEERED BEYOND LIMITS',
      `Game: ${active === 'ff' ? 'Free Fire' : 'Call of Duty Mobile'}`,
      `DPI: ${dpi} | Fingers: ${fingers} | Playstyle: ${playstyle} | Weapon: ${weapon} | Problem: ${problem} | Mode: ${active === 'ff' ? mode : 'N/A'}`,
      '',
      '--- SENSITIVITY ---',
      ...Object.keys(currentResult).filter(k => k !== 'notes').map(k => `${k}: ${currentResult[k]}`),
      '',
      '--- WHY THIS SENSITIVITY (VERIFIED ENGINE) ---',
      ...(currentResult.notes || []),
      '',
      '--- HOW TO MASTER THIS SENSITIVITY - READ THIS ---',
      '1. Apply EXACTLY as shown. Do not change one value alone.',
      '2. Training Ground 10 mins: 100 kills, practice drag + flick, no rank yet.',
      '3. Room test: Play 3 rooms. If drag feels slow, add +5 to General only. If shaky, minus -5 only.',
      '4. Rank test: Play 3 rank matches. Do NOT change sensitivity mid-match.',
      '5. If still off after 3 rooms + 3 ranks, generate again with correct DPI / Problem. Do not guess.',
      'Changing phone or any setting = new profile = new payment. Saved profiles in MY PROFILES can be reloaded free.',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `FG-AIM-LAB-${active === 'ff' ? 'FF' : 'CODM'}.txt`
    a.click()
  }

  function handleDownloadPng() {
    if (!currentResult) return
    const canvas = document.createElement('canvas')
    canvas.width = 720; canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#050607'; ctx.fillRect(0, 0, 720, 1080)
    ctx.fillStyle = '#00FFD1'; ctx.font = 'bold 32px Arial'; ctx.fillText('FG AIM LAB', 40, 70)
    ctx.fillStyle = '#E6E9ED'; ctx.font = '16px Arial'; ctx.fillText('ENGINEERED BEYOND LIMITS', 40, 100)
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 28px Arial'; ctx.fillText(active === 'ff' ? 'FREE FIRE' : 'CALL OF DUTY MOBILE', 40, 150)
    ctx.fillStyle = '#00FFD1'; ctx.font = '18px Arial'; ctx.fillText(`DPI ${dpi} | ${fingers} Fingers | ${playstyle} | ${weapon} | ${mode}`, 40, 185)
    let y = 230
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 22px Arial'; ctx.fillText('SENSITIVITY', 40, y); y += 35
    Object.keys(currentResult).filter(k => k !== 'notes').forEach(k => {
      ctx.font = '20px Arial'; ctx.fillStyle = '#E6E9ED'; ctx.fillText(`${k}:`, 40, y)
      ctx.fillStyle = '#00FFD1'; ctx.fillText(`${currentResult[k]}`, 320, y)
      y += 38
    })
    y += 20
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 20px Arial'; ctx.fillText('HOW TO MASTER:', 40, y); y += 30
    ctx.fillStyle = '#E6E9ED'; ctx.font = '16px Arial'
    const guide = ['1. Apply exactly. Do not change one value.', '2. Training 10 mins - 100 kills.', '3. Room x3 - adjust +-5 only if needed.', '4. Rank x3 - do not change mid-match.', '5. Still off? Re-generate with correct DPI.']
    guide.forEach(g => { ctx.fillText(g, 40, y); y += 28 })
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `FG-AIM-LAB-${active === 'ff' ? 'FF' : 'CODM'}.png`
    a.click()
  }

  function handleCopy() {
    if (!currentResult) return
    const txt = Object.keys(currentResult).filter(k => k !== 'notes').map(k => `${k}: ${currentResult[k]}`).join('\n')
    navigator.clipboard.writeText(`FG AIM LAB - ${active === 'ff' ? 'Free Fire' : 'CODM'}\n${txt}`)
    setSavedMsg('Copied!')
  }

  function handleSave() {
    if (!currentResult) return
    const vault = JSON.parse(localStorage.getItem('fg_vault') || '[]')
    vault.push({ game: active, dpi, fingers, playstyle, weapon, problem, mode, result: currentResult, at: new Date().toISOString() })
    localStorage.setItem('fg_vault', JSON.stringify(vault))
    setSavedMsg('Saved to MY PROFILES Vault - reload free!')
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#050607] text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="text-[11px] font-mono text-cyan-300">BUILD REDESIGN-1</div>
        <h1 className="text-3xl font-bold mt-2">FG AIM LAB</h1>
        <p className="text-gray-400 mt-2">This lab is locked. Pay ₦500 for 1 profile, 1 game.</p>
        <p className="text-sm text-gray-500 mt-1">One payment = one profile. Changing phone or any setting = new profile.</p>
        <a href="https://selar.com/46o4125613" className="mt-6 bg-[#00FFD1] text-black font-bold px-6 py-3 rounded-xl">Pay ₦500 on Selar</a>
        <a href="/" className="mt-3 text-cyan-300 underline">Back to Homepage</a>
      </div>
    )
  }

  const isLockedForActive = lockedGame !== null && lockedGame !== active

  return (
    <div className="min-h-screen bg-[#050607] text-white p-4 pb-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center">
          <div className="text-[11px] font-mono text-cyan-300">BUILD REDESIGN-1 • VERIFIED ENGINE</div>
          <h1 className="text-3xl font-bold mt-1">FG AIM LAB</h1>
          <p className="text-gray-400 text-sm">ENGINEERED BEYOND LIMITS</p>
        </div>

        {lockedGame && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500 text-center font-mono text-[12px]">
            {lockedGame === 'ff' ? 'CODM Locked: This payment was used for Free Fire. Buy a new profile for CODM.' : 'Free Fire Locked: This payment was used for CODM. Buy a new profile for Free Fire.'}
          </div>
        )}

        {timeLeft > 0 && (
          <div className="mt-3 p-2 rounded-xl bg-yellow-500/20 border border-yellow-500 text-center text-sm">Lab locks in {timeLeft}s - Download now, then you return to homepage.</div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={() => { if (lockedGame === 'cod') { alert('Free Fire Locked: This payment was used for CODM.'); return } setActive('ff') }} className={`flex-1 py-3 rounded-xl font-bold ${active === 'ff' ? 'bg-[#00FFD1] text-black' : 'bg-white/10'}`}>FREE FIRE {lockedGame === 'cod' ? '🔒' : ''}</button>
          <button onClick={() => { if (lockedGame === 'ff') { alert('CODM Locked: This payment was used for Free Fire.'); return } setActive('cod') }} className={`flex-1 py-3 rounded-xl font-bold ${active === 'cod' ? 'bg-[#00FFD1] text-black' : 'bg-white/10'}`}>CODM {lockedGame === 'ff' ? '🔒' : ''}</button>
        </div>

        <div className="mt-4 space-y-4 bg-white/5 p-4 rounded-2xl">
          <label className="block"><span className="text-sm text-gray-300">DPI: {dpi}</span><input type="range" min={300} max={800} value={dpi} onChange={e => setDpi(Number(e.target.value))} className="w-full" /></label>
          <label className="block"><span className="text-sm text-gray-300">Fingers: {fingers}</span><div className="flex gap-2 mt-1">{[2, 3, 4, 5].map(f => (<button key={f} onClick={() => setFingers(f)} className={`px-4 py-2 rounded-lg ${fingers === f ? 'bg-[#00FFD1] text-black font-bold' : 'bg-white/10'}`}>{f}</button>))}</div></label>
          <label className="block"><span className="text-sm text-gray-300">Playstyle</span><select value={playstyle} onChange={e => setPlaystyle(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-black/50 border border-white/20"><option>Aggressive</option><option>Balanced</option><option>Rusher</option><option>Sniper</option><option>Defensive</option></select></label>
          <label className="block"><span className="text-sm text-gray-300">Weapon</span><select value={weapon} onChange={e => setWeapon(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-black/50 border border-white/20"><option>AR</option><option>SMG</option><option>Shotgun</option><option>Sniper</option><option>All</option></select></label>
          <label className="block"><span className="text-sm text-gray-300">Problem</span><select value={problem} onChange={e => setProblem(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-black/50 border border-white/20"><option>Recoil goes up</option><option>Drag is slow</option><option>Aim is shaky</option><option>Close range weak</option><option>Long range weak</option></select></label>
          {active === 'ff' && (
            <div><span className="text-sm text-gray-300">ROOM vs RANK - FREE FIRE</span><div className="flex gap-2 mt-1"><button onClick={() => setMode('rank')} className={`flex-1 py-3 rounded-xl font-bold ${mode === 'rank' ? 'bg-[#00FFD1] text-black' : 'bg-white/10'}`}>RANK - Balanced</button><button onClick={() => setMode('room')} className={`flex-1 py-3 rounded-xl font-bold ${mode === 'room' ? 'bg-[#00FFD1] text-black' : 'bg-white/10'}`}>ROOM - +8 Faster</button></div><p className="text-xs text-gray-400 mt-1">Room players drag harder / faster than rank. Room = +8 General.</p></div>
          )}
        </div>

        <button onClick={handleGenerate} disabled={isLockedForActive} className={`w-full mt-4 py-4 rounded-xl font-bold text-lg ${isLockedForActive ? 'bg-gray-600 text-gray-300' : 'bg-[#00FFD1] text-black'}`}>{isLockedForActive ? 'LOCKED - Buy New Profile' : 'GENERATE SENSITIVITY - ₦500 Paid'}</button>

        {currentResult && (
          <div className="mt-4 bg-white/5 p-4 rounded-2xl">
            <h2 className="text-xl font-bold">{active === 'ff' ? 'FREE FIRE - Your Sensitivity' : 'CODM - Your Sensitivity'}</h2>
            <div className="mt-3 space-y-2">{Object.keys(currentResult).filter(k => k !== 'notes').map(k => (<div key={k} className="flex justify-between bg-black/40 p-3 rounded-xl"><span>{k}</span><span className="text-[#00FFD1] font-bold">{currentResult[k]}</span></div>))}</div>
            <div className="mt-4 bg-black/40 p-3 rounded-xl">
              <h3 className="font-bold text-cyan-300">WHY THIS SENSITIVITY - VERIFIED ENGINE</h3>
              <ul className="text-sm text-gray-300 mt-2 space-y-1">{(currentResult.notes || []).map((n: string, i: number) => (<li key={i}>• {n}</li>))}</ul>
            </div>
            <div className="mt-3 bg-[#00FFD1]/10 border border-[#00FFD1]/40 p-3 rounded-xl">
              <h3 className="font-bold">HOW TO MASTER THIS SENSITIVITY - READ THIS</h3>
              <p className="text-sm text-gray-200 mt-2">1. Apply EXACTLY as shown. Do not change one value alone.</p>
              <p className="text-sm text-gray-200">2. Training Ground 10 mins: 100 kills, drag + flick practice.</p>
              <p className="text-sm text-gray-200">3. Room test x3: If slow, +5 General only. If shaky, -5 only.</p>
              <p className="text-sm text-gray-200">4. Rank test x3: Do NOT change mid-match.</p>
              <p className="text-sm text-gray-200">5. Still off? Generate again with correct DPI / Problem. Do not guess.</p>
            </div>
            <div className="flex gap-2 mt-4"><button onClick={handleDownloadPng} className="flex-1 bg-[#00FFD1] text-black font-bold py-3 rounded-xl">DOWNLOAD PNG</button><button onClick={handleDownloadTxt} className="flex-1 bg-white/10 font-bold py-3 rounded-xl">DOWNLOAD TXT</button></div>
            <div className="flex gap-2 mt-2"><button onClick={handleCopy} className="flex-1 bg-white/10 py-3 rounded-xl">COPY</button><button onClick={handleSave} className="flex-1 bg-white/10 py-3 rounded-xl">SAVE TO VAULT</button></div>
            {savedMsg && <p className="text-center text-cyan-300 text-sm mt-2">{savedMsg}</p>}
            <p className="text-center text-xs text-gray-400 mt-3">One payment = one profile. This profile is saved in Vault - reload free. New phone / new setting = new payment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
export { LabPage }

