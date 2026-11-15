
// FG-FF-02 — Free Fire 0-200 scale, Room vs Rank fixed
// Research: OB44 (April 2024) raised cap to 0-200. Old 0-100 guides are outdated.
// OB55 starting point: General 180-195, Red Dot 175-190, 2x 165-175, 4x 150-165, Sniper 85-100, Free Look 120-145
// Room vs Rank: Clash Squad fights are faster close-range, so +5-10 General/Red Dot only. BR keeps 4x/Sniper higher.
// Training vs Room: Training bot stands still, you have time, no panic, no moving enemy, no ping/FPS drop. Room enemy moves + panic drag harder = overshoot. So Training-works-but-Room-fails needs LOWER sens, not higher.

export type Inputs = {
  phoneBrand: string; phoneModel: string; ram: string; refreshRate: string; fps: string; dpi: string;
  fingerLayout: '2'|'3'|'4'; playStyle: 'Balanced'|'Aggressive'|'Precision'|'Defensive';
  weapon: 'AR'|'SMG'|'Shotgun'|'Sniper'|'Balanced'; fireButtonSize: string;
  problem: 'Overshooting'|'Undershooting'|'Dragging'|'Unstable'|'Headshots';
  matchMode?: 'Ranked BR'|'Clash Squad Ranked'|'Custom Room / Lone Wolf';
  dragStyle?: 'Hard / Fast'|'Normal'|'Soft / Slow';
  failWhere?: 'Works in Training but fails in Room'|'Works in Room but fails in Rank'|'Fails everywhere'|'Works everywhere / New';
};
export type Sens = { General: number; RedDot: number; '2x': number; '4x': number; Sniper: number; FreeLook: number };
export type Explain = string[];

const BASE: Sens = { General: 185, RedDot: 180, '2x': 160, '4x': 145, Sniper: 90, FreeLook: 130 };

function clamp(v: number){ return Math.max(0, Math.min(200, Math.round(v))) }

export function calculateSensitivity(inp: Inputs, offset?: Partial<Sens>){
  let s: any = { ...BASE };
  const ex: Explain = [];
  const dpi = parseInt(inp.dpi || '400');

  // --- MATCH MODE: ROOM vs RANK — the main fix ---
  const mode = inp.matchMode || 'Ranked BR';
  if (mode === 'Custom Room / Lone Wolf'){
    s.General += 12; s.RedDot += 10; s.FreeLook += 6; s['4x'] -= 8; s.Sniper -= 10;
    ex.push('Custom Room / Lone Wolf: +12 General, +10 Red Dot, +6 Free Look, -8 4x, -10 Sniper — close fights, fast flicks, no long range');
  } else if (mode === 'Clash Squad Ranked'){
    s.General += 8; s.RedDot += 7; s['4x'] -= 3; s.Sniper -= 2; s.FreeLook += 4;
    ex.push('Clash Squad Ranked: +8 General, +7 Red Dot — faster close fights than BR');
  } else {
    s['4x'] += 5; s.Sniper += 5;
    ex.push('Ranked BR: +5 4x, +5 Sniper — stable for long range, tracking moving enemies');
  }

  // --- DRAG STYLE: you drag harder/faster in Room ---
  const drag = inp.dragStyle || 'Normal';
  if (drag === 'Hard / Fast'){
    s.General -= 12; s.RedDot -= 10; s['2x'] -= 6;
    ex.push('You drag Hard/Fast in Room → -12 General, -10 Red Dot to stop overshoot (hard drag + high sens = past head)');
  } else if (drag === 'Soft / Slow'){
    s.General += 10; s.RedDot += 8;
    ex.push('You drag Soft/Slow → +10 General, +8 Red Dot to reach head in time');
  }

  // --- WHERE DOES IT FAIL? Training vs Room ---
  const fail = inp.failWhere || 'Works everywhere / New';
  if (fail === 'Works in Training but fails in Room'){
    s.General -= 8; s.RedDot -= 6; s.FreeLook += 5;
    ex.push('Training works but Room fails: -8 General, -6 Red Dot — Training bot stands still, Room enemy moves + panic drag = overshoot. Lowered to fix Room.');
  } else if (fail === 'Works in Room but fails in Rank'){
    s.General -= 6; s.RedDot -= 4; s['4x'] += 6; s.Sniper += 6;
    ex.push('Room works but Rank fails: -6 General, +6 4x/Sniper — Rank needs stability + long range, not Room speed');
  } else if (fail === 'Fails everywhere'){
    s.General -= 5; s.RedDot -= 5;
    ex.push('Fails everywhere: -5 General/Red Dot for more control, then test in Room, not Training');
  }

  // --- DPI (0-200 scale, bigger steps than old 0-100 engine) ---
  if (dpi < 360){ s.General += 12; s.RedDot += 8; ex.push(`Low DPI (${dpi}) → +12 General`) }
  else if (dpi <= 420){ s.General += 6; ex.push(`Medium DPI → +6`) }
  else if (dpi >= 501 && dpi <= 600){ s.General -= 8; ex.push(`High DPI → -8`) }
  else if (dpi > 600){ s.General -= 15; s.RedDot -= 8; ex.push(`Very high DPI → -15`) }

  // --- Refresh ---
  const rr = parseInt(inp.refreshRate);
  if (rr === 60){ s.General += 5; ex.push('60Hz → +5') }
  else if (rr >= 120){ s.General -= 3; ex.push(`${rr}Hz → -3`) }

  // --- Fingers ---
  if (inp.fingerLayout === '2'){ s.General += 8; s.Sniper -= 5; ex.push('2-finger → +8') }
  else if (inp.fingerLayout === '3'){ s.General += 3; ex.push('3-finger → +3') }
  else { s.General -= 3; s.Sniper += 6; ex.push('4-finger → -3, +6 Sniper') }

  // --- Playstyle ---
  if (inp.playStyle === 'Aggressive'){ s.General += 10; s.RedDot += 6; ex.push('Aggressive → +10') }
  else if (inp.playStyle === 'Precision'){ s.General -= 10; s.RedDot -= 6; s.Sniper += 5; ex.push('Precision → -10') }
  else if (inp.playStyle === 'Defensive'){ s.General -= 6; ex.push('Defensive → -6') }

  // --- Weapon ---
  if (inp.weapon === 'Shotgun'){ s.General += 10; s.RedDot += 8; ex.push('Shotgun → +10') }
  else if (inp.weapon === 'SMG'){ s.General += 8; ex.push('SMG → +8') }
  else if (inp.weapon === 'Sniper'){ s.General -= 12; s.Sniper += 15; ex.push('Sniper → -12, +15 Sniper') }

  // --- Fire button ---
  const fire = parseInt(inp.fireButtonSize);
  if (fire <= 45){ s.General += 6; ex.push(`Small fire ${fire}% → +6`) }
  else if (fire >= 60){ s.General -= 5; ex.push(`Large fire → -5`) }

  // --- Problem (stronger for 0-200) ---
  if (inp.problem === 'Overshooting'){ s.General -= 15; s.RedDot -= 12; ex.push('Overshooting → -15 General, -12 Red Dot') }
  else if (inp.problem === 'Undershooting'){ s.General += 15; s.RedDot += 12; ex.push('Undershooting → +15') }
  else if (inp.problem === 'Dragging'){ s.General += 12; ex.push('Dragging → +12') }
  else if (inp.problem === 'Unstable'){ s.General -= 12; ex.push('Unstable → -12') }
  else { s.RedDot += 8; ex.push('Headshots → +8 Red Dot') }

  if (offset){ Object.keys(offset).forEach(k=>{ s[k] += (offset as any)[k] }) }

  const result: Sens = { General: clamp(s.General), RedDot: clamp(s.RedDot), '2x': clamp(s['2x']), '4x': clamp(s['4x']), Sniper: clamp(s.Sniper), FreeLook: clamp(s.FreeLook) };
  return { result, explanation: ex };
}
