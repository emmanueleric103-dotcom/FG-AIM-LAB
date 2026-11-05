import { useState } from 'react'
export default function Contact(){
  const [done, setDone] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const body = new URLSearchParams(formData as any).toString()
    try { await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }); setDone(true); form.reset(); setTimeout(()=>setDone(false),5000) } catch { alert("Failed") }
  }
  return (
    <section id="contact" className="relative py-24 md:py-32 bg-[#080A0B] border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-[1fr_0.9fr] gap-12">
        <div><div className="font-mono text-[11px] tracking-[0.22em] text-violet">06 / CONTACT</div><h2 className="mt-4 font-display text-[36px] md:text-[56px] font-semibold leading-[0.9]">Let's build <br />precision.</h2><p className="mt-6 font-mono text-[12px] opacity-60 max-w-[460px]">FG AIM LAB — Free Fire + CODM in one website. Messages go to Netlify Forms.</p></div>
        <div className="rounded-[28px] glass-strong p-6 md:p-8"><div className="font-mono text-[11px] mb-6">SEND TRANSMISSION</div>
          <form name="fg-contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="form-name" value="fg-contact" /><p hidden><label>Don't fill: <input name="bot-field" /></label></p>
            <input required name="name" placeholder="Your name" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 font-mono text-[12px]" />
            <input required type="email" name="email" placeholder="Email address" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 font-mono text-[12px]" />
            <textarea required name="message" placeholder="Message..." rows={5} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 font-mono text-[12px] resize-none" />
            <button type="submit" className="w-full py-4 rounded-full bg-white text-black font-bold text-[11px] tracking-[0.16em]">{done ? "SENT ✓" : "SEND MESSAGE"}</button>
            {done && <div className="font-mono text-[11px] text-cyan text-center">Sent! Check Netlify Forms.</div>}
          </form>
        </div>
      </div>
    </section>
  )
}
