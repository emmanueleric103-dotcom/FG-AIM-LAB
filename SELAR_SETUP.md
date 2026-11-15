# FG AIM LAB — NEW CYCLE: HOMEPAGE → SELAR → LAB → DOWNLOAD → LOCK → HOMEPAGE

## THE NEW FLOW (what you asked for)
1. HOMEPAGE ( / ) — Buyer sees sales page, enters email + name, taps BUY
2. SELAR — Buyer pays ₦500 on Selar (checkout prefilled with email/name)
3. LAB ( /lab ) — Selar redirects buyer to Lab automatically: /lab?selar=success&email=...&fullname=...
4. GENERATE — Buyer sets phone + DPI + fingers + weapon + problem, taps GENERATE
5. DOWNLOAD / SCREENSHOT — Buyer has 60 SECONDS to download PNG card or screenshot. Countdown bar at top.
6. LOCK → HOMEPAGE — After 60s, Lab locks, clears result, sends buyer back to Homepage in 3s. Cycle starts again. Buy again for new profile.

## MY IMPROVEMENTS I ADDED (you asked for ideas)
- Watermark: Downloaded PNG has buyer's email + profile ID + date — stops sharing. If someone shares it, you know who.
- Inputs LOCK after generate: Buyer cannot change settings to generate unlimited profiles on 1 payment. 1 payment = 1 profile.
- Download PNG is 1080x1350 — phone wallpaper size, screenshot-ready, clean, no website chrome.
- Copy Values button: One tap copies "General: 120 | Red Dot: 115 ..." to paste in WhatsApp / notes.
- Download TXT backup: If PNG fails, TXT still works.
- Countdown bar + big timer: Buyer never misses download.
- Backup Reference: If Selar does NOT redirect, buyer can paste Reference on Lab locked screen to unlock Lab.
- Session is in sessionStorage, not localStorage — refresh without payment = locked. No cheating by refreshing.
- Homepage is separate from Lab — cleaner, faster, feels like real product (Jumia / betting style). Lab is private, Homepage is public.

## WHAT TO CHANGE IN SELAR (IMPORTANT — DO THIS)
Selar → Products → FG AIM LAB Pro → Edit
- Tick: Automatically redirect the buyer to an external URL after a purchase
- Redirect URL → Paste EXACTLY:
  https://hefgesensitivity.hefge.cloud/lab?selar=success
- Save

Old redirect was https://hefgesensitivity.hefge.cloud/?selar=success — CHANGE IT TO /lab version, or buyer will land on Homepage, not Lab.

## WHAT TO CHANGE IN CODE
src/lib/paymentConfig.ts:
- SELAR_CHECKOUT_URL = your REAL Selar link (NOT https://selar.com/fgaimlab-pro)
- SELLER_WHATSAPP = your real number, e.g. 2348100000000
- SELAR_REDIRECT_URL is already https://hefgesensitivity.hefge.cloud/lab?selar=success

## DEPLOY (Termux)
cd /sdcard/Download
unzip -o FG-HOMEPAGE-SELAR-LAB-CYCLE.zip
rm -rf ~/fg-aim-lab
mv fg-homepage-cycle ~/fg-aim-lab
cd ~/fg-aim-lab
nano src/lib/paymentConfig.ts  # set real Selar link + WhatsApp
npm install
npm run build
git add .
git commit -m "feat: homepage selar lab 60s lock cycle"
git push -f -u origin main
Netlify will auto-deploy. Wait for Deploy success.

## TEST THE FULL CYCLE
1. Open https://hefgesensitivity.hefge.cloud/ → You see Homepage (sell page)
2. Enter email + name → BUY → Pay ₦500 on Selar with SAME email
3. Selar shows "You're about to be redirected..." → You land on /lab?selar=success&email=...
4. Lab shows "Paid: your@email" → Set phone/DPI/fingers → GENERATE
5. You see result + countdown 0:59 → Tap DOWNLOAD PNG CARD → Check gallery, PNG saved
6. Also try screenshot: Power + Volume Down
7. Wait 60s → Lab locks → "Session Ended" → Auto back to Homepage in 3s
8. Buy again → New profile

## IF YOU WANT TO CHANGE 60s
LabPage.tsx → search for 60 → change setSecondsLeft(60) and formatTime. Recommended: Keep 60s. Longer = more sharing. Shorter = buyers panic. 60s is sweet spot.

## OTHER IDEAS YOU CAN ADD LATER (not in this zip)
- WhatsApp Share button: Share PNG directly to WhatsApp Status
- "Buy 3 Profiles, Get 1 Free" bundle on Homepage
- Before/After video: Show someone using sensitivity, headshots
- Countdown on Homepage: "Price goes to ₦1000 soon" — urgency
- Testimonials: Screenshots of buyers' headshots / wins
