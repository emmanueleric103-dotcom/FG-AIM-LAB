
import { useState } from 'react'
import { PAYMENT_CONFIG, isPlaceholderLink, buildSelarCheckoutUrl, savePendingProfile } from '../lib/paymentConfig'

export default function Homepage(){
  const [email, setEmail] = useState(()=>{ try{ return localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL) || '' }catch{ return '' } })
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [buying, setBuying] = useState(false)
  const [game, setGame] = useState<'ff'|'cod'>('ff')

  const handleBuy = () => {
    if (isPlaceholderLink()) { setErr('Seller has not set real Selar link yet.'); return }
    if (!email.trim() || !email.includes('@')) { setErr('Enter your email first — Selar will use it to bring you back to the Lab after payment.'); return }
    if (!name.trim()) { setErr('Enter your full name — Selar will prefill checkout for you.'); return }
    setErr(''); setBuying(true)
    try{ localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL, email.trim()) }catch{}
    // Save that buyer is going to pay — Lab will use this to know they came from Homepage
    savePendingProfile({ game, inputs: {}, fingerprint: 'PENDING', label: 'Pending — choose in Lab', email: email.trim(), fullname: name.trim(), startedAt: Date.now() })
    const url = buildSelarCheckoutUrl(email.trim(), name.trim())
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-[#050607] text-[#E6E9ED]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 bg-[#050607]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-[1100px] mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#00FFD1] text-black font-black flex items-center justify-center text-[16px]">FG</div>
            <div><div className="font-black tracking-widest text-[14px] leading-none">FG AIM LAB</div><div className="font-mono text-[9px] tracking-[0.25em] opacity-50 mt-0.5">ENGINEERED BEYOND LIMITS</div></div>
          </div>
          <div className="font-mono text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10">₦620 • 1 Profile</div>
        </div>
      </header>

      {/* VERSION STAMP — proves new file is live. If you don't see this, you are on cached old file. */}
      <div className="max-w-[1100px] mx-auto px-5 pt-3"><div className="rounded-xl bg-[#00FFD1] text-black font-mono text-[11px] font-bold px-4 py-2 text-center">✅ NEW UPDATE LIVE • FG-FF-02 • ROOM vs RANK • GLOBAL 60s TIMER FIXED • v2.2</div></div>
      {/* HERO — THIS IS PAGE 1: SELL */}
      <section className="max-w-[1100px] mx-auto px-5 pt-10 pb-8">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/20 font-mono text-[10px] tracking-[0.18em] text-[#00FFD1]">● FREE FIRE + CALL OF DUTY MOBILE • SAME SITE</div>
            <h1 className="mt-5 font-black text-[42px] md:text-[64px] leading-[0.9] tracking-tight">Your Aim.<br/>Engineered.<br/><span className="text-[#00FFD1]">Not Guessed.</span></h1>
            <p className="mt-4 font-mono text-[13px] leading-relaxed opacity-70 max-w-[520px]">Stop copying YouTuber sensitivity. FG AIM LAB calculates YOUR sensitivity from YOUR phone, YOUR DPI, YOUR fingers, YOUR playstyle, YOUR weapon and YOUR problem. Deterministic engine FG-FF-02 (0-200) + FG-COD-01 (0-300). NEW: Room vs Rank + Global 60s Timer. No random. No AI fake.</p>

            <div className="mt-6 grid grid-cols-3 gap-3 max-w-[520px]">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-center"><div className="font-black text-[18px]">0-200</div><div className="font-mono text-[9px] opacity-60 mt-1">FREE FIRE<br/>ENGINE</div></div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-center"><div className="font-black text-[18px]">0-300</div><div className="font-mono text-[9px] opacity-60 mt-1">CODM<br/>ENGINE</div></div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-center"><div className="font-black text-[18px]">60s</div><div className="font-mono text-[9px] opacity-60 mt-1">TO DOWNLOAD<br/>THEN LOCK</div></div>
            </div>

            <div className="mt-6 space-y-2 font-mono text-[12px] opacity-80">
              <div>✓ Built for Infinix, Tecno, Samsung, Xiaomi, Redmi, Poco, Realme, iPhone</div>
              <div>✓ Downloadable PNG card — screenshot-ready, watermarked with your email</div>
              <div>✓ 1 Payment = 1 Phone + 1 Settings combo. Change phone/settings = New profile</div>
            </div>
          </div>

          {/* BUY CARD — THIS DIRECTS TO SELAR */}
          <div className="rounded-[28px] bg-[#0A0D0F] border border-white/10 p-6 sticky top-[80px]">
            <div className="font-mono text-[10px] tracking-[0.2em] opacity-50">STEP 1 — BUY YOUR PROFILE</div>
            <div className="mt-3 flex items-baseline gap-2"><span className="font-black text-[44px]">₦620</span><span className="font-mono text-[11px] opacity-60">NGN • 1 Profile • Not unlimited</span></div>
            <div className="mt-1 font-mono text-[11px] opacity-60">You pay on Selar. Selar brings you back to the Lab automatically.</div>

            <div className="mt-4 flex gap-2">
              <button onClick={()=>setGame('ff')} className={`flex-1 py-3 rounded-xl font-mono text-[12px] font-bold border ${game==='ff' ? 'bg-[#00FFD1] text-black border-[#00FFD1]' : 'bg-black/40 border-white/10'}`}>🔥 FREE FIRE</button>
              <button onClick={()=>setGame('cod')} className={`flex-1 py-3 rounded-xl font-mono text-[12px] font-bold border ${game==='cod' ? 'bg-orange-400 text-black border-orange-400' : 'bg-black/40 border-white/10'}`}>🎯 CODM</button>
            </div>

            <div className="mt-4 space-y-3">
              <div><div className="font-mono text-[10px] tracking-[0.18em] opacity-60 mb-1.5">YOUR EMAIL (Selar uses this to bring you back)</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@gmail.com" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 font-mono text-[13px]" /></div>
              <div><div className="font-mono text-[10px] tracking-[0.18em] opacity-60 mb-1.5">YOUR FULL NAME</div><input value={name} onChange={e=>setName(e.target.value)} placeholder="John Doe" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 font-mono text-[13px]" /></div>
            </div>

            <button onClick={handleBuy} disabled={buying} className="mt-4 w-full py-4 rounded-full bg-[#FF6B00] hover:bg-[#FF8A2A] disabled:opacity-50 text-white font-bold text-[13px] tracking-[0.12em]">{buying ? 'OPENING SELAR...' : 'BUY ON SELAR — ₦620 → GO TO LAB'}</button>
            <div className="mt-2 text-center font-mono text-[10px] opacity-50 leading-relaxed">You leave this page to pay. After payment, Selar brings you back to the Lab automatically. Use SAME email on Selar.</div>
            {err && <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3 font-mono text-[11px] text-red-300">{err}</div>}

            <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 font-mono text-[11px] text-emerald-200 leading-relaxed"><b>How the cycle works:</b><br/>1. Buy here → Selar<br/>2. Pay → Selar → Lab<br/>3. Generate → Download PNG in 60s<br/>4. Lab locks → Back here → Buy again for new profile</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1100px] mx-auto px-5 py-10 border-t border-white/5">
        <div className="font-mono text-[11px] tracking-[0.22em] text-[#00FFD1]">THE CYCLE — 60 SECONDS TO DOWNLOAD, THEN LOCK</div>
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          {[
            {n:'01', t:'BUY HERE', d:'Enter email + name, tap BUY. Go to Selar, pay ₦620.'},
            {n:'02', t:'SELAR → LAB', d:'Selar redirects you to /lab with your email. No manual approve.'},
            {n:'03', t:'GENERATE + DOWNLOAD', d:'Enter phone + DPI + fingers + weapon. Generate. Download PNG or Screenshot. 60s countdown.'},
            {n:'04', t:'AUTO-LOCK → HOME', d:'After 60s, Lab locks, clears your result, sends you back here. Want another profile? Buy again.'},
          ].map(s=>(
            <div key={s.n} className="rounded-[22px] bg-white/[0.03] border border-white/10 p-5"><div className="font-black text-[28px] text-[#00FFD1]">{s.n}</div><div className="mt-2 font-bold text-[14px]">{s.t}</div><div className="mt-1 font-mono text-[11px] opacity-60 leading-relaxed">{s.d}</div></div>
          ))}
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="max-w-[1100px] mx-auto px-5 py-10 border-t border-white/5">
        <h2 className="font-black text-[28px]">What your ₦620 gives you</h2>
        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div className="rounded-[22px] bg-white/[0.03] border border-white/10 p-5"><div className="font-bold">🔥 Free Fire — FG-FF-02</div><div className="mt-2 font-mono text-[11px] opacity-60 leading-relaxed">General, Red Dot, 2x, 4x, Sniper, Free Look. 0-200. NEW: Choose Ranked BR or Custom Room / Lone Wolf + Your Drag (Hard/Fast) + Where it fails (Training vs Room). Room sens ≠ Rank sens.</div></div>
          <div className="rounded-[22px] bg-white/[0.03] border border-white/10 p-5"><div className="font-bold">🎯 CODM — FG-COD-01</div><div className="mt-2 font-mono text-[11px] opacity-60 leading-relaxed">Standard, ADS, Tactic, Sniper, Gyro Std, Gyro ADS. 0-300. Plus Gyro On/Off, ADS Tap/Hold.</div></div>
          <div className="rounded-[22px] bg-white/[0.03] border border-white/10 p-5"><div className="font-bold">🖼️ Downloadable PNG Card</div><div className="mt-2 font-mono text-[11px] opacity-60 leading-relaxed">1080×1350 screenshot-ready card. Your values big, your email watermark, profile ID, date. Save to gallery, share to WhatsApp, or screenshot.</div></div>
          <div className="rounded-[22px] bg-white/[0.03] border border-white/10 p-5"><div className="font-bold">🔒 60-Second Anti-Share Lock</div><div className="mt-2 font-mono text-[11px] opacity-60 leading-relaxed">After you generate, you have 60s to download. Then Lab locks and sends you home. Nobody can sit on your paid session and generate unlimited profiles.</div></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1100px] mx-auto px-5 py-10 border-t border-white/5">
        <h2 className="font-black text-[28px]">Questions</h2>
        <div className="mt-5 space-y-3 font-mono text-[12px] leading-relaxed">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4"><b>What is 1 Profile?</b><div className="opacity-60 mt-1">1 Game + 1 Phone (Brand/Model/RAM) + DPI + Refresh + Fingers + Playstyle + Weapon + Problem. Change any of those = New profile = New ₦620.</div></div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4"><b>What if I don't download in 60s?</b><div className="opacity-60 mt-1">Lab locks and you go back home. You must buy again. That's why we show a big countdown + Download button at the top. Download first, then screenshot.</div></div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4"><b>Can I screenshot instead of Download?</b><div className="opacity-60 mt-1">Yes. The result card is designed for screenshot. But Download PNG is sharper and has your watermark. Do both in 60s.</div></div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4"><b>Selar did not bring me back to Lab?</b><div className="opacity-60 mt-1">Go to Selar receipt, copy Reference, then go to /lab and paste it in the backup box. Or contact seller on WhatsApp.</div></div>
        </div>
        <div className="mt-8 text-center font-mono text-[10px] opacity-40">FG AIM LAB • ENGINEERED BEYOND LIMITS • ₦620 per profile • 1 Payment = 1 Profile • v2.2 FG-FF-02 ROOM/RANK</div>
      </section>
    </div>
  )
}
