# FG AIM LAB — FIX: Timer + Room vs Rank + Training vs Room

## WHAT WAS WRONG (you reported)
1. Timer only for Free Fire. Switch to COD → timer disappears. Switch back to FF → timer restarts to 60s.
   FIX: Timer is now GLOBAL, based on generatedAt timestamp. It never resets on tab switch. After you generate FF, COD tab is LOCKED (disabled). You cannot generate 2nd profile free. 1 payment = 1 game + 1 profile.

2. Free Fire: Room sens ≠ Rank sens. People drag harder/faster in Room than Rank.
   FIX: New selector MATCH MODE:
   - Ranked BR: stable, +5 4x, +5 Sniper, for long range tracking
   - Clash Squad Ranked: +8 General, +7 Red Dot, faster close fights
   - Custom Room / Lone Wolf: +12 General, +10 Red Dot, +6 Free Look, -8 4x, -10 Sniper — close, fast flicks, no long range

3. Training works (standing bot) but Room fails.
   FIX: New selectors:
   - YOUR DRAG IN ROOM: Hard/Fast (-12 General, -10 Red Dot to stop overshoot) / Normal / Soft/Slow (+10 General)
   - WHERE DOES IT FAIL?: Works in Training but fails in Room (-8 General, -6 Red Dot) / Works in Room but fails in Rank / Fails everywhere / New
   WHY: Training bot stands still, you have time, no ping, no FPS drop, no pressure. Room enemy moves, you panic, you drag harder → same sens overshoots. So Room fix is LOWER sens, not higher.

4. Old engine used 0-100 scale. Free Fire OB44 raised cap to 0-200. Old engine gave General 95, Red Dot 92 — too low for new scale.
   FIX: New engine FG-FF-02, BASE General 185, Red Dot 180, 2x 160, 4x 145, Sniper 90, Free Look 130. This matches OB55 guides: General 180-195, Red Dot 175-190.

## HOW TO TEST NEW FIX
1. Homepage → Buy → Selar → Lab
2. FF → MATCH MODE: Custom Room / Lone Wolf, DRAG: Hard/Fast, FAIL: Works in Training but fails in Room → GENERATE
3. Check timer: 0:59 → Switch to COD tab → Should be DISABLED, timer still at top, does NOT restart
4. Switch back — timer did NOT restart, it kept counting down
5. Download PNG — PNG shows Mode in profile label
6. Wait 60s → Lock → Homepage

## HOW TO TEST IN GAME (IMPORTANT)
- Do NOT judge new sens in Training only. Training is for warm-up.
- Test in Custom Room, 3 games, same phone, same DPI.
- If you still overshoot in Room → Go to Lab, choose FAIL: Works in Training but fails in Room, DRAG: Hard/Fast, PROBLEM: Overshooting → Generate again (new payment) — it will be even lower.
- If you undershoot → PROBLEM: Undershooting.

## DEPLOY
Same as before:
cd ~/fg-aim-lab
# IMPORTANT: Do NOT rm -rf whole folder (you lose .git). Do:
# cp -r new files over old, or if you already deleted .git, re-init + force push
git add .
git commit -m "fix: global timer, room vs rank, 0-200 engine"
git push -f -u origin main
