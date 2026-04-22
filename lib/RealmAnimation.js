"use client";
import { useRef, useEffect } from "react";

function rgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}

function setStroke(ctx, color, w = 2, glow = 8) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function setFill(ctx, color, glow = 8) {
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
}

function drawLabel(ctx, text, x, y, color, opts = {}) {
  const { size = 9, weight = 300, align = "left", alpha = 0.75, font = "DM Sans" } = opts;
  ctx.font = `${weight} ${size}px '${font}', sans-serif`;
  ctx.fillStyle = rgba(color, alpha);
  ctx.shadowColor = color;
  ctx.shadowBlur = 3;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

// ═══════════════════════════════════════════════════════════════════════════
// RESERVOIR — The Body Under Siege
// state 0-3: number of inflow valves open (quests completed)
// ═══════════════════════════════════════════════════════════════════════════

function drawReservoir(ctx, w, h, t, color, state = 0) {
  // Tank dimensions
  const tankX = w * 0.25;
  const tankY = h * 0.25;
  const tankW = w * 0.5;
  const tankH = h * 0.5;

  // Water level — based on state
  // state 0: low & dropping, state 1: stabilized, state 2: rising, state 3: past midpoint
  const baseLevels = [0.2, 0.3, 0.5, 0.7];
  const targetLevel = baseLevels[Math.min(3, state)];
  const wobble = Math.sin(t * 0.8) * 0.02;
  const waterLevel = targetLevel + wobble;
  const waterY = tankY + tankH * (1 - waterLevel);

  // Tank outline
  setStroke(ctx, color, 2, 10);
  ctx.beginPath();
  ctx.moveTo(tankX, tankY);
  ctx.lineTo(tankX, tankY + tankH);
  ctx.lineTo(tankX + tankW, tankY + tankH);
  ctx.lineTo(tankX + tankW, tankY);
  ctx.stroke();

  // Water fill
  ctx.globalAlpha = 0.35;
  setFill(ctx, color, 15);
  ctx.fillRect(tankX + 2, waterY, tankW - 4, tankY + tankH - waterY);
  ctx.globalAlpha = 1;

  // Water surface — wavy
  setStroke(ctx, color, 1.5, 8);
  ctx.beginPath();
  for (let x = tankX; x <= tankX + tankW; x += 4) {
    const wave = Math.sin((x - tankX) * 0.2 + t * 2) * 1.5;
    if (x === tankX) ctx.moveTo(x, waterY + wave);
    else ctx.lineTo(x, waterY + wave);
  }
  ctx.stroke();

  // Outflow pipe (right side, wide)
  const outflowY = tankY + tankH * 0.75;
  setStroke(ctx, color, 2, 10);
  ctx.beginPath();
  ctx.moveTo(tankX + tankW, outflowY - 5);
  ctx.lineTo(w - 10, outflowY - 5);
  ctx.moveTo(tankX + tankW, outflowY + 5);
  ctx.lineTo(w - 10, outflowY + 5);
  ctx.stroke();

  // Flowing water in outflow (always active — they're still working)
  for (let i = 0; i < 5; i++) {
    const phase = (t * 1.2 + i * 0.2) % 1;
    const dx = tankX + tankW + phase * (w - tankX - tankW - 20);
    setFill(ctx, color, 6);
    ctx.globalAlpha = (1 - phase) * 0.7;
    ctx.beginPath();
    ctx.arc(dx, outflowY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawLabel(ctx, "OUT — work, stress, output", tankX + tankW + 6, outflowY + 20, color, { size: 8, alpha: 0.6, font: "Space Mono" });

  // Inflow pipes (left side, 3 valves)
  const valveLabels = ["Rest", "Move", "Reset"];
  const valveYs = [tankY + tankH * 0.25, tankY + tankH * 0.45, tankY + tankH * 0.65];

  valveYs.forEach((vy, i) => {
    const isOpen = i < state;
    // Pipe stub
    setStroke(ctx, color, 1.5, 6);
    ctx.globalAlpha = isOpen ? 1 : 0.4;
    ctx.beginPath();
    ctx.moveTo(6, vy);
    ctx.lineTo(tankX, vy);
    ctx.stroke();

    // Valve handle
    setStroke(ctx, color, 1.8, 8);
    ctx.globalAlpha = isOpen ? 1 : 0.5;
    ctx.beginPath();
    ctx.arc(tankX - 12, vy, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Valve handle lines (rotation indicates open/closed)
    ctx.beginPath();
    if (isOpen) {
      ctx.moveTo(tankX - 16, vy);
      ctx.lineTo(tankX - 8, vy);
    } else {
      ctx.moveTo(tankX - 14, vy - 3);
      ctx.lineTo(tankX - 10, vy + 3);
    }
    ctx.stroke();

    // Flowing drops into tank if open
    if (isOpen) {
      for (let d = 0; d < 3; d++) {
        const phase = (t * 0.8 + d * 0.33 + i * 0.15) % 1;
        const dx = 8 + phase * (tankX - 10);
        setFill(ctx, color, 6);
        ctx.globalAlpha = (1 - phase) * 0.8;
        ctx.beginPath();
        ctx.arc(dx, vy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Label
    ctx.globalAlpha = isOpen ? 0.85 : 0.35;
    drawLabel(ctx, valveLabels[i], 10, vy - 6, color, { size: 7, alpha: isOpen ? 0.85 : 0.35, font: "Space Mono" });
  });
  ctx.globalAlpha = 1;

  // Top label
  drawLabel(ctx, "IN", tankX - 22, tankY - 6, color, { size: 8, alpha: 0.7, font: "Space Mono" });
  drawLabel(ctx, "OUT", tankX + tankW + 6, tankY - 6, color, { size: 8, alpha: 0.7, font: "Space Mono" });

  // State label (bottom center)
  const stateLabels = [
    "Being drawn from, not replenished",
    "One valve open — inflow begins",
    "Two valves — level steadying",
    "All three — the tank is being restored",
  ];
  drawLabel(ctx, stateLabels[Math.min(3, state)], w / 2, h - 10, color, {
    size: 10, alpha: 0.9, align: "center", font: "Cormorant Garamond", weight: 400
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// FIRE — The Withdrawn Self
// state 0-3: kindling pieces added (quests completed)
// ═══════════════════════════════════════════════════════════════════════════

function drawFire(ctx, w, h, t, color, state = 0) {
  const cx = w / 2;
  const baseY = h * 0.78;

  // Stones surrounding fire pit
  setStroke(ctx, color, 1.5, 6);
  ctx.globalAlpha = 0.6;
  for (let i = -3; i <= 3; i++) {
    const x = cx + i * 14;
    ctx.beginPath();
    ctx.arc(x, baseY, 5, Math.PI, 0);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Logs / base
  setStroke(ctx, color, 2, 6);
  ctx.beginPath();
  ctx.moveTo(cx - 25, baseY - 4);
  ctx.lineTo(cx + 25, baseY - 4);
  ctx.moveTo(cx - 22, baseY - 8);
  ctx.lineTo(cx + 22, baseY - 8);
  ctx.stroke();

  // Embers glow (always present, brightness scales with state)
  const emberIntensity = 0.5 + state * 0.12;
  for (let i = 0; i < 6; i++) {
    const ex = cx - 20 + i * 8;
    const ey = baseY - 6;
    const pulse = Math.sin(t * 2 + i) * 0.5 + 0.5;
    setFill(ctx, color, 8 + emberIntensity * 4);
    ctx.globalAlpha = 0.3 + pulse * 0.4 * emberIntensity;
    ctx.beginPath();
    ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Flame — height based on state
  // state 0: just ember glow, no flame
  // state 1: small flame
  // state 2: medium flame
  // state 3: steady full flame
  const flameHeights = [0, 18, 32, 48];
  const flameH = flameHeights[Math.min(3, state)];

  if (flameH > 0) {
    // Flame shape — wavy
    const flicker = Math.sin(t * 6) * 2;
    setFill(ctx, color, 20);
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(cx - 12, baseY - 4);
    for (let i = 0; i <= 20; i++) {
      const progress = i / 20;
      const currentH = flameH * progress;
      const waveX = Math.sin(t * 4 + progress * 6) * 4 * (1 - progress * 0.5);
      const width = (1 - progress) * 12;
      ctx.lineTo(cx - width + waveX, baseY - 4 - currentH);
    }
    for (let i = 20; i >= 0; i--) {
      const progress = i / 20;
      const currentH = flameH * progress;
      const waveX = Math.sin(t * 4 + progress * 6 + 1) * 4 * (1 - progress * 0.5);
      const width = (1 - progress) * 12;
      ctx.lineTo(cx + width + waveX, baseY - 4 - currentH);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Inner bright flame
    setFill(ctx, color, 15);
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    const innerH = flameH * 0.7;
    ctx.moveTo(cx - 6, baseY - 4);
    ctx.lineTo(cx - 3 + Math.sin(t * 5) * 2, baseY - 4 - innerH * 0.5);
    ctx.lineTo(cx + Math.sin(t * 6) * 2, baseY - 4 - innerH);
    ctx.lineTo(cx + 3 + Math.sin(t * 5 + 1) * 2, baseY - 4 - innerH * 0.5);
    ctx.lineTo(cx + 6, baseY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Sparks rising
    for (let i = 0; i < 4; i++) {
      const phase = ((t * 0.6 + i * 0.25) % 1);
      const sx = cx + Math.sin(t * 2 + i) * 10;
      const sy = baseY - 4 - flameH - phase * 30;
      setFill(ctx, color, 6);
      ctx.globalAlpha = (1 - phase) * 0.7;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Kindling pieces (shown as placed sticks leading toward fire)
  const kindlingLabels = ["presence", "attention", "purpose"];
  for (let i = 0; i < 3; i++) {
    const kx = w * 0.12 + i * 18;
    const ky = h * 0.5 + i * 4;
    const placed = i < state;
    setStroke(ctx, color, 1.5, placed ? 6 : 3);
    ctx.globalAlpha = placed ? 0.7 : 0.3;
    ctx.beginPath();
    ctx.moveTo(kx, ky);
    ctx.lineTo(kx + 20, ky - 3);
    ctx.stroke();
    if (placed) {
      drawLabel(ctx, kindlingLabels[i], kx, ky + 10, color, { size: 7, alpha: 0.6, font: "Space Mono" });
    }
  }
  ctx.globalAlpha = 1;

  // State label
  const stateLabels = [
    "Embers — heat without flame",
    "First kindling — small warmth returning",
    "Second piece — flame holding",
    "Tended fire — steady, useful, warm",
  ];
  drawLabel(ctx, stateLabels[Math.min(3, state)], w / 2, h - 10, color, {
    size: 10, alpha: 0.9, align: "center", font: "Cormorant Garamond", weight: 400
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RADIO DIAL — The Unnamed Heart
// state 0-3: signal clarity
// ═══════════════════════════════════════════════════════════════════════════

function drawRadio(ctx, w, h, t, color, state = 0) {
  const cx = w / 2;
  const radioY = h * 0.5;

  // Radio face (rectangle)
  setStroke(ctx, color, 2, 8);
  ctx.beginPath();
  ctx.rect(cx - 80, radioY - 40, 160, 80);
  ctx.stroke();

  // Dial circle
  const dialX = cx - 40;
  const dialY = radioY;
  const dialR = 22;
  setStroke(ctx, color, 1.5, 6);
  ctx.beginPath();
  ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
  ctx.stroke();

  // Dial tick marks
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r1 = dialR + 2;
    const r2 = dialR + 5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(dialX + Math.cos(a) * r1, dialY + Math.sin(a) * r1);
    ctx.lineTo(dialX + Math.cos(a) * r2, dialY + Math.sin(a) * r2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Dial pointer — rotates based on state (tuning in)
  // State 0: random wobble. State 1: moving toward sweet spot. State 2-3: locked on sweet spot
  const sweetSpotAngle = Math.PI * 0.25;
  let pointerAngle;
  if (state === 0) {
    pointerAngle = Math.sin(t * 3) * Math.PI + Math.PI * 0.7;
  } else if (state === 1) {
    pointerAngle = sweetSpotAngle + Math.PI * 0.3 + Math.sin(t * 2) * 0.2;
  } else if (state === 2) {
    pointerAngle = sweetSpotAngle + Math.PI * 0.1 + Math.sin(t * 1.5) * 0.1;
  } else {
    pointerAngle = sweetSpotAngle + Math.sin(t) * 0.03;
  }

  setStroke(ctx, color, 2, 10);
  ctx.beginPath();
  ctx.moveTo(dialX, dialY);
  ctx.lineTo(dialX + Math.cos(pointerAngle) * dialR * 0.85, dialY + Math.sin(pointerAngle) * dialR * 0.85);
  ctx.stroke();

  // Center dot
  setFill(ctx, color, 8);
  ctx.beginPath();
  ctx.arc(dialX, dialY, 2, 0, Math.PI * 2);
  ctx.fill();

  // Signal meter (right side of radio)
  const meterX = cx + 15;
  const meterW = 55;
  const meterY = radioY - 20;
  const meterH = 40;

  setStroke(ctx, color, 1.5, 6);
  ctx.beginPath();
  ctx.rect(meterX, meterY, meterW, meterH);
  ctx.stroke();

  // Signal visualization — from static to waveform
  setStroke(ctx, color, 1.3, 6);
  ctx.beginPath();
  for (let i = 0; i <= meterW; i += 2) {
    let y;
    if (state === 0) {
      // Pure static
      y = meterY + meterH / 2 + (Math.random() - 0.5) * meterH * 0.8;
    } else if (state === 1) {
      // Faint signal + static
      const signal = Math.sin((i + t * 30) * 0.15) * 5;
      y = meterY + meterH / 2 + signal + (Math.random() - 0.5) * meterH * 0.4;
    } else if (state === 2) {
      // Cleaner signal
      const signal = Math.sin((i + t * 30) * 0.15) * 10;
      y = meterY + meterH / 2 + signal + (Math.random() - 0.5) * meterH * 0.15;
    } else {
      // Clean waveform
      const signal = Math.sin((i + t * 30) * 0.15) * 14;
      y = meterY + meterH / 2 + signal;
    }
    if (i === 0) ctx.moveTo(meterX + i, y);
    else ctx.lineTo(meterX + i, y);
  }
  ctx.stroke();

  // Emerging word above the radio — the "named" feeling
  const wordStages = ["?", "tight", "tight — afraid", "tight — afraid, and tired"];
  const word = wordStages[Math.min(3, state)];
  ctx.font = `${state >= 2 ? "italic 14px" : "bold 16px"} 'Cormorant Garamond', serif`;
  ctx.fillStyle = rgba(color, 0.7 + state * 0.07);
  ctx.shadowBlur = 6 + state * 2;
  ctx.textAlign = "center";
  ctx.fillText(word, cx, radioY - 56);

  // Dial label
  drawLabel(ctx, "TUNING", dialX, dialY + dialR + 16, color, { size: 7, alpha: 0.6, align: "center", font: "Space Mono" });

  // State label
  const stateLabels = [
    "Static — the body speaking, unheard",
    "Tuning begins — faint signal",
    "Signal clearer — you recognize the feeling",
    "Clear tone — you can name what has been there",
  ];
  drawLabel(ctx, stateLabels[Math.min(3, state)], w / 2, h - 10, color, {
    size: 10, alpha: 0.9, align: "center", font: "Cormorant Garamond", weight: 400
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// GLASSES + TAP — The Scattered Mind
// state 0-3: glasses filled
// ═══════════════════════════════════════════════════════════════════════════

function drawGlasses(ctx, w, h, t, color, state = 0) {
  const baseY = h * 0.75;
  const glassCount = 3;
  const glassW = 32;
  const glassH = 48;
  const gap = 12;
  const totalW = glassCount * glassW + (glassCount - 1) * gap;
  const startX = (w - totalW) / 2;

  // Tap — horizontal pipe at top
  const tapY = h * 0.2;
  setStroke(ctx, color, 2, 8);
  ctx.beginPath();
  ctx.moveTo(startX, tapY);
  ctx.lineTo(startX + totalW, tapY);
  ctx.stroke();

  // Tap nozzle position — stable over filling glass, or moving chaotically
  let nozzleX;
  if (state === 0) {
    // Chaotic motion
    nozzleX = startX + totalW / 2 + Math.sin(t * 4) * totalW * 0.4;
  } else {
    // Stable over the glass being filled (state 1 = glass 0, state 2 = glass 1, state 3 = glass 2)
    // For visible ongoing filling, put nozzle over the NEXT glass to fill (or last one if done)
    const filling = Math.min(state - 1, glassCount - 1);
    const targetX = startX + filling * (glassW + gap) + glassW / 2;
    // Smooth lerp
    nozzleX = targetX + Math.sin(t * 1) * 2;
  }

  // Nozzle
  setStroke(ctx, color, 1.8, 8);
  ctx.beginPath();
  ctx.moveTo(nozzleX, tapY);
  ctx.lineTo(nozzleX, tapY + 8);
  ctx.stroke();

  // Draw glasses
  for (let i = 0; i < glassCount; i++) {
    const gx = startX + i * (glassW + gap);
    // Glass outline
    setStroke(ctx, color, 1.8, 6);
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(gx, baseY - glassH);
    ctx.lineTo(gx, baseY);
    ctx.lineTo(gx + glassW, baseY);
    ctx.lineTo(gx + glassW, baseY - glassH);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Fill level
    const filled = i < state;
    if (filled) {
      setFill(ctx, color, 12);
      ctx.globalAlpha = 0.4;
      ctx.fillRect(gx + 2, baseY - glassH + 4, glassW - 4, glassH - 6);
      ctx.globalAlpha = 1;
      // Water surface wave
      setStroke(ctx, color, 1.2, 6);
      ctx.beginPath();
      for (let x = gx + 2; x <= gx + glassW - 2; x += 2) {
        const wave = Math.sin(x * 0.5 + t * 3 + i) * 0.8;
        if (x === gx + 2) ctx.moveTo(x, baseY - glassH + 4 + wave);
        else ctx.lineTo(x, baseY - glassH + 4 + wave);
      }
      ctx.stroke();
    }
  }

  // Water drops from nozzle
  if (state === 0) {
    // Chaotic — drops miss glasses, splash on ground
    for (let i = 0; i < 8; i++) {
      const phase = (t * 2 + i * 0.12) % 1;
      const dropStartX = nozzleX + (Math.random() - 0.5) * 20;
      const dy = tapY + 8 + phase * (baseY - tapY - 8);
      setFill(ctx, color, 5);
      ctx.globalAlpha = (1 - phase) * 0.5;
      ctx.beginPath();
      ctx.arc(dropStartX, dy, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Splash marks on ground outside glasses
    setStroke(ctx, color, 1, 4);
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 5; i++) {
      const sx = startX - 15 + Math.random() * (totalW + 30);
      if (sx >= startX && sx < startX + totalW && (sx - startX) % (glassW + gap) < glassW) continue;
      ctx.beginPath();
      ctx.moveTo(sx, baseY + 1);
      ctx.lineTo(sx + 2, baseY + 3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (state < glassCount) {
    // Flow from nozzle into current target glass
    for (let i = 0; i < 5; i++) {
      const phase = (t * 1.5 + i * 0.2) % 1;
      const dy = tapY + 8 + phase * (baseY - glassH - (tapY + 8));
      setFill(ctx, color, 6);
      ctx.globalAlpha = (1 - phase) * 0.8;
      ctx.beginPath();
      ctx.arc(nozzleX, dy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // State label
  const stateLabels = [
    "Attention scattered — nothing fills",
    "First focus — one container filling",
    "Second complete — the next begins",
    "All three — nothing wasted, all full",
  ];
  drawLabel(ctx, stateLabels[Math.min(3, state)], w / 2, h - 10, color, {
    size: 10, alpha: 0.9, align: "center", font: "Cormorant Garamond", weight: 400
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// LIGHTHOUSE — Lost Purpose
// state 0-3: lamp brightness and ships visible
// ═══════════════════════════════════════════════════════════════════════════

function drawLighthouse(ctx, w, h, t, color, state = 0) {
  const cx = w * 0.3;
  const groundY = h * 0.85;

  // Sea horizon (wavy line)
  setStroke(ctx, color, 1, 4);
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 4) {
    const wave = Math.sin(x * 0.1 + t) * 1.2;
    if (x === 0) ctx.moveTo(x, groundY + wave);
    else ctx.lineTo(x, groundY + wave);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Fog — density decreases with state
  const fogDensity = Math.max(0, 1 - state * 0.3);
  for (let i = 0; i < 15; i++) {
    const fx = (i * 47 + t * 5) % (w + 40) - 20;
    const fy = h * 0.3 + (i * 13) % 30;
    const fsize = 25 + (i * 7) % 20;
    setFill(ctx, color, 15);
    ctx.globalAlpha = 0.08 * fogDensity;
    ctx.beginPath();
    ctx.arc(fx, fy, fsize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Lighthouse base (rocky outcrop)
  setStroke(ctx, color, 1.5, 5);
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 18, groundY);
  ctx.lineTo(cx - 22, groundY - 12);
  ctx.lineTo(cx - 15, groundY - 14);
  ctx.lineTo(cx - 10, groundY - 10);
  ctx.lineTo(cx + 10, groundY - 12);
  ctx.lineTo(cx + 22, groundY - 10);
  ctx.lineTo(cx + 18, groundY);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Lighthouse tower
  const towerTop = groundY - 70;
  setStroke(ctx, color, 2, 6);
  ctx.beginPath();
  ctx.moveTo(cx - 10, groundY - 12);
  ctx.lineTo(cx - 7, towerTop);
  ctx.lineTo(cx + 7, towerTop);
  ctx.lineTo(cx + 10, groundY - 12);
  ctx.stroke();

  // Stripes on tower
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 3; i++) {
    const sy = groundY - 18 - i * 18;
    ctx.beginPath();
    ctx.moveTo(cx - 9 + i * 0.5, sy);
    ctx.lineTo(cx + 9 - i * 0.5, sy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Lamp house
  setStroke(ctx, color, 2, 8);
  ctx.beginPath();
  ctx.rect(cx - 10, towerTop - 12, 20, 12);
  ctx.stroke();

  // Roof
  ctx.beginPath();
  ctx.moveTo(cx - 10, towerTop - 12);
  ctx.lineTo(cx, towerTop - 20);
  ctx.lineTo(cx + 10, towerTop - 12);
  ctx.stroke();

  // Lamp brightness
  const lampIntensity = 0.3 + state * 0.23;
  const lampPulse = Math.sin(t * 2) * 0.1 + 0.9;
  setFill(ctx, color, 20 + state * 8);
  ctx.globalAlpha = lampIntensity * lampPulse;
  ctx.beginPath();
  ctx.arc(cx, towerTop - 6, 4 + state * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Light beam — only when state >= 1
  if (state >= 1) {
    // Beam sweeps slowly
    const beamAngle = Math.PI * 0.15 + Math.sin(t * 0.3) * Math.PI * 0.2;
    const beamLen = 100 + state * 20;
    setFill(ctx, color, 25);
    ctx.globalAlpha = 0.15 + state * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx, towerTop - 6);
    ctx.lineTo(cx + Math.cos(beamAngle - 0.15) * beamLen, towerTop - 6 + Math.sin(beamAngle - 0.15) * beamLen);
    ctx.lineTo(cx + Math.cos(beamAngle + 0.15) * beamLen, towerTop - 6 + Math.sin(beamAngle + 0.15) * beamLen);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Ships — visibility scales with state
  if (state >= 2) {
    const shipPositions = [
      { x: w * 0.7, y: groundY - 6, size: 1 },
      { x: w * 0.85, y: groundY - 5, size: 0.85 },
    ];
    shipPositions.forEach((s, i) => {
      if (state < 2 + i) return;
      ctx.globalAlpha = Math.min(1, (state - 1 - i) * 0.6);
      setStroke(ctx, color, 1.5, 6);
      // Hull
      ctx.beginPath();
      ctx.moveTo(s.x - 8 * s.size, s.y);
      ctx.lineTo(s.x + 8 * s.size, s.y);
      ctx.lineTo(s.x + 6 * s.size, s.y + 4 * s.size);
      ctx.lineTo(s.x - 6 * s.size, s.y + 4 * s.size);
      ctx.closePath();
      ctx.stroke();
      // Mast
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y - 14 * s.size);
      ctx.stroke();
      // Sail
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - 14 * s.size);
      ctx.lineTo(s.x + 6 * s.size, s.y - 10 * s.size);
      ctx.lineTo(s.x, s.y - 2 * s.size);
      ctx.closePath();
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  // State label
  const stateLabels = [
    "Lamp dim — fog thick, nothing visible",
    "Lamp tended — beam finds form",
    "Fog thinning — the first ship appears",
    "Others navigate by your light",
  ];
  drawLabel(ctx, stateLabels[Math.min(3, state)], w / 2, h - 10, color, {
    size: 10, alpha: 0.9, align: "center", font: "Cormorant Garamond", weight: 400
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ICEBERG — Shadow reveal on Profile screen
// Shows the hidden depth of the pattern
// ═══════════════════════════════════════════════════════════════════════════

function drawIceberg(ctx, w, h, t, color, state = 0, shadowLabels = []) {
  const waterY = h * 0.32;

  // Water surface
  setStroke(ctx, color, 1.5, 6);
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 4) {
    const wave = Math.sin(x * 0.1 + t * 1.2) * 1.5;
    if (x === 0) ctx.moveTo(x, waterY + wave);
    else ctx.lineTo(x, waterY + wave);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Water tint below surface
  setFill(ctx, color, 15);
  ctx.globalAlpha = 0.08;
  ctx.fillRect(0, waterY, w, h - waterY);
  ctx.globalAlpha = 1;

  const cx = w / 2;

  // Above-water tip (small)
  const tipTop = waterY - 25;
  setStroke(ctx, color, 2, 10);
  ctx.beginPath();
  ctx.moveTo(cx - 18, waterY + 1);
  ctx.lineTo(cx - 8, tipTop + 3);
  ctx.lineTo(cx, tipTop - 2);
  ctx.lineTo(cx + 10, tipTop + 5);
  ctx.lineTo(cx + 20, waterY + 1);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.15;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Tip label
  drawLabel(ctx, "what you see", cx, tipTop - 10, color, { size: 8, alpha: 0.8, align: "center", font: "Space Mono" });

  // Below-water body (much larger)
  const bergBottom = h - 50;
  const bergW = w * 0.7;
  setStroke(ctx, color, 2, 10);
  ctx.beginPath();
  ctx.moveTo(cx - 20, waterY + 2);
  ctx.lineTo(cx - bergW / 2, waterY + 40);
  ctx.lineTo(cx - bergW / 2.2, waterY + 90);
  ctx.lineTo(cx - bergW / 2.5, bergBottom);
  ctx.lineTo(cx + bergW / 3, bergBottom);
  ctx.lineTo(cx + bergW / 2.2, waterY + 90);
  ctx.lineTo(cx + bergW / 2, waterY + 40);
  ctx.lineTo(cx + 22, waterY + 2);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Labels on the underwater portion
  shadowLabels.forEach((label, i) => {
    const ly = waterY + 28 + i * 22;
    const alpha = Math.max(0, Math.min(1, (t * 0.8 - 0.5 - i * 0.4)));
    ctx.globalAlpha = alpha;
    drawLabel(ctx, label.name, cx, ly, color, { size: 9, alpha: 0.85, align: "center", font: "Space Mono" });
    drawLabel(ctx, label.value, cx + 40, ly, color, { size: 9, alpha: 0.7, align: "left", font: "Space Mono" });
  });
  ctx.globalAlpha = 1;

  // Bottom label
  drawLabel(ctx, "what has been happening", cx, h - 10, color, {
    size: 10, alpha: 0.9, align: "center", font: "Cormorant Garamond", weight: 400
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SHADOW INTEGRATION — figure and its shadow rejoining
// Cycles through: separated → turning → rejoining → whole
// ═══════════════════════════════════════════════════════════════════════════

function drawFigure(ctx, x, groundY, color, opts = {}) {
  const { pose = "standing", size = 1, lean = 0, alpha = 1 } = opts;
  const s = size;
  ctx.globalAlpha = alpha;
  setStroke(ctx, color, 2, 8);
  const headR = 5 * s;
  const bodyLen = 18 * s;
  const legLen = 15 * s;
  const armLen = 12 * s;
  const headY = groundY - legLen - bodyLen - headR;
  ctx.beginPath();
  ctx.arc(x + lean * 2, headY, headR, 0, Math.PI * 2);
  ctx.stroke();
  const shoulderY = headY + headR;
  const hipY = shoulderY + bodyLen;
  ctx.beginPath();
  ctx.moveTo(x + lean * 2, shoulderY);
  ctx.lineTo(x + lean, hipY);
  ctx.stroke();
  ctx.beginPath();
  if (pose === "walking") {
    ctx.moveTo(x + lean, hipY);
    ctx.lineTo(x - 4 * s, groundY);
    ctx.moveTo(x + lean, hipY);
    ctx.lineTo(x + 4 * s, groundY);
  } else {
    ctx.moveTo(x + lean, hipY);
    ctx.lineTo(x - 3 * s, groundY);
    ctx.moveTo(x + lean, hipY);
    ctx.lineTo(x + 3 * s, groundY);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + lean, shoulderY + 2);
  ctx.lineTo(x - armLen * 0.5, shoulderY + armLen * 0.6);
  ctx.moveTo(x + lean, shoulderY + 2);
  ctx.lineTo(x + armLen * 0.5, shoulderY + armLen * 0.6);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawIntegration(ctx, w, h, t, color, state = 0) {
  const groundY = h * 0.72;

  // Ground line
  setStroke(ctx, rgba(color, 0.5), 1.5, 6);
  ctx.beginPath();
  for (let x = 10; x <= w - 10; x += 4) {
    const wobble = Math.sin(x * 0.12) * 1.5;
    if (x === 10) ctx.moveTo(x, groundY + wobble);
    else ctx.lineTo(x, groundY + wobble);
  }
  ctx.stroke();

  // Light source (top) — establishes physics of shadow geometry
  const lightX = w * 0.15;
  const lightY = h * 0.15;
  setFill(ctx, color, 20);
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(lightX, lightY, 4, 0, Math.PI * 2);
  ctx.fill();
  setStroke(ctx, rgba(color, 0.6), 1, 6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + t * 0.3;
    ctx.beginPath();
    ctx.moveTo(lightX + Math.cos(a) * 6, lightY + Math.sin(a) * 6);
    ctx.lineTo(lightX + Math.cos(a) * 9, lightY + Math.sin(a) * 9);
    ctx.stroke();
  }
  drawLabel(ctx, "awareness", lightX, lightY + 18, color, { size: 7, alpha: 0.7, align: "center", font: "Space Mono" });
  ctx.globalAlpha = 1;

  // Cycle — 4 phases
  const cycle = (t % 12) / 12;
  let phase, progress;
  if (cycle < 0.25) { phase = 0; progress = cycle / 0.25; }
  else if (cycle < 0.5) { phase = 1; progress = (cycle - 0.25) / 0.25; }
  else if (cycle < 0.75) { phase = 2; progress = (cycle - 0.5) / 0.25; }
  else { phase = 3; progress = (cycle - 0.75) / 0.25; }

  const cx = w / 2;
  const shadowColor = "#8b3a3a";

  if (phase === 0) {
    // PHYSICS WRONG: Shadow detached, standing upright next to figure.
    // Shadow should be flat on ground. This is physically impossible — the subconscious notices.
    drawFigure(ctx, cx - 16, groundY, color, { pose: "standing", size: 1 });
    // Upright "shadow" — visually wrong
    drawFigure(ctx, cx + 22, groundY, shadowColor, { pose: "standing", size: 1.1, alpha: 0.8 });
    // No shadow on ground beneath figure — highlighting the absence
    drawLabel(ctx, "you", cx - 16, groundY + 14, color, { size: 7, alpha: 0.7, align: "center", font: "Space Mono" });
    drawLabel(ctx, "Shadow (severed)", cx + 22, groundY + 14, shadowColor, { size: 7, alpha: 0.8, align: "center", font: "Space Mono" });
    // Light from source — shows where the REAL shadow should fall (empty gap on ground under figure)
    setStroke(ctx, rgba(color, 0.2), 1, 3);
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(lightX, lightY);
    ctx.lineTo(cx - 16, groundY - 18);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (phase === 1) {
    // Figure notices the upright shadow — turns toward it
    drawFigure(ctx, cx - 16, groundY, color, { pose: "standing", size: 1, lean: 3 });
    drawFigure(ctx, cx + 22, groundY, shadowColor, { pose: "standing", size: 1.1, alpha: 0.8 });
    // Acknowledgment line (eye contact)
    setStroke(ctx, rgba(color, 0.7), 1, 6);
    ctx.beginPath();
    ctx.moveTo(cx - 10, groundY - 36);
    ctx.lineTo(cx + 16, groundY - 36);
    ctx.stroke();
  } else if (phase === 2) {
    // Shadow collapses/melts back to its correct physical position — flat on ground beneath figure
    drawFigure(ctx, cx, groundY, color, { pose: "standing", size: 1 });
    // Upright shadow compresses down — height shrinks, spreads along ground
    const shadowUprightness = 1 - progress; // 1 = upright, 0 = flat
    const shadowY = groundY - shadowUprightness * 48; // midpoint shifts down
    const shadowScale = shadowUprightness;
    // As shadow collapses, draw it transitioning from figure to flat ellipse
    if (shadowScale > 0.2) {
      drawFigure(ctx, cx + 4 + (1 - progress) * 18, groundY, shadowColor, {
        pose: "standing", size: 1.1 * shadowScale, alpha: 0.7 * shadowScale + 0.1,
      });
    }
    // Flat ground-shadow ellipse appearing below figure
    setFill(ctx, shadowColor, 12);
    ctx.globalAlpha = 0.5 + progress * 0.3;
    const ellW = 8 + progress * 12;
    ctx.beginPath();
    ctx.ellipse(cx + 6, groundY + 1, ellW, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else {
    // PHYSICS RESTORED: Figure walks with attached ground-shadow, as physics requires
    const walkCycle = (t * 0.5) % 1;
    const baseX = w * 0.25 + walkCycle * (w * 0.5);
    // Proper ground shadow — elongated, following feet
    setFill(ctx, shadowColor, 10);
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(baseX + 6, groundY + 1, 20, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Figure
    drawFigure(ctx, baseX, groundY, color, { pose: "walking", size: 1 });
    // Combined glow — unified, whole
    setFill(ctx, color, 18);
    ctx.globalAlpha = 0.25 * (Math.sin(t * 2) * 0.2 + 0.8);
    ctx.beginPath();
    ctx.arc(baseX, groundY - 22, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Phase dots indicator
  for (let i = 0; i < 4; i++) {
    setFill(ctx, i === phase ? color : rgba(color, 0.3), i === phase ? 8 : 2);
    ctx.globalAlpha = i === phase ? 1 : 0.3;
    ctx.beginPath();
    ctx.arc(cx - 18 + i * 12, h - 24, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // State label — physics-framed
  const labels = [
    "Shadow severed — standing apart, not where physics requires",
    "You turn — acknowledging what has been severed",
    "The Shadow returns to its place — beneath, attached",
    "Physics restored — you move forward, whole",
  ];
  drawLabel(ctx, labels[phase], w / 2, h - 10, color, {
    size: 10, alpha: 0.9, align: "center", font: "Cormorant Garamond", weight: 400
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const REALM_METAPHORS = {
  body: { name: "reservoir", draw: drawReservoir },
  withdrawn: { name: "fire", draw: drawFire },
  unnamed: { name: "radio", draw: drawRadio },
  scattered: { name: "glasses", draw: drawGlasses },
  purpose: { name: "lighthouse", draw: drawLighthouse },
};

export default function RealmAnimation({ scene, color, state = 0, size = { w: 400, h: 320 }, extra = {} }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const draw = () => {
      const t = (Date.now() - startTime.current) / 1000;
      ctx.fillStyle = "#06060a";
      ctx.fillRect(0, 0, size.w, size.h);

      if (scene === "iceberg") {
        drawIceberg(ctx, size.w, size.h, t, color, state, extra.shadowLabels || []);
      } else if (scene === "integration") {
        drawIntegration(ctx, size.w, size.h, t, color, state);
      } else {
        // Realm-level animations
        const realm = REALM_METAPHORS[scene];
        if (realm) realm.draw(ctx, size.w, size.h, t, color, state);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [scene, color, state, size.w, size.h, extra]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size.w, height: size.h, display: "block", background: "#06060a" }}
    />
  );
}
