// ==UserScript==
// @name         Ants Forage UI Elements
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Ants crawl over the page, pick up UI elements, and carry them to the ant hole!
// @author       PasteMeAnywhere
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
  // --- Overlay Canvas ---
  let antCanvas = document.createElement('canvas');
  antCanvas.style.position = 'fixed';
  antCanvas.style.left = '0';
  antCanvas.style.top = '0';
  antCanvas.style.width = '100vw';
  antCanvas.style.height = '100vh';
  antCanvas.style.pointerEvents = 'none';
  antCanvas.style.zIndex = 999999;
  antCanvas.width = window.innerWidth;
  antCanvas.height = window.innerHeight;
  document.body.appendChild(antCanvas);
  let ctx = antCanvas.getContext('2d');

  // --- Parameters ---
  const ANT_COUNT = 18;
  const ANT_SIZE = 16;
  const ANT_SPEED = 1.6;
  const ANT_RANDOMNESS = 0.19;
  const TARGET_MIN_SIZE = 16;
  const CARRY_SHRINK = 0.6;
  const ANTHOLE = { x: window.innerWidth/2, y: window.innerHeight-36 };

// --- Find Forageable Elements ---
function getForageElements() {
  // Select interviews-section by class
  let el = document.body.querySelector('.interviews-section');

  if (!el || !(el instanceof HTMLElement)) return [];

  // Apply same filtering rules as before
  let style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return [];
  if (['SCRIPT','STYLE','CANVAS','NOSCRIPT','META','HEAD','TITLE','LINK'].includes(el.tagName)) return [];
  let rect = el.getBoundingClientRect();
  if (rect.width < TARGET_MIN_SIZE || rect.height < TARGET_MIN_SIZE) return [];
  if (rect.bottom < 0 || rect.top > window.innerHeight) return [];
  if (rect.right < 0 || rect.left > window.innerWidth) return [];

  return [el]; // Always return in array
}

// Set targets **only once** on load
targets = getForageElements();

// --- Find Forageable Elements ---
function getForageElements() {
  // Select interviews-section by class
  let el = document.body.querySelector('.interviews-section');

  if (!el || !(el instanceof HTMLElement)) return [];

  // Apply same filtering rules as before
  let style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return [];
  if (['SCRIPT','STYLE','CANVAS','NOSCRIPT','META','HEAD','TITLE','LINK'].includes(el.tagName)) return [];
  let rect = el.getBoundingClientRect();
  if (rect.width < TARGET_MIN_SIZE || rect.height < TARGET_MIN_SIZE) return [];
  if (rect.bottom < 0 || rect.top > window.innerHeight) return [];
  if (rect.right < 0 || rect.left > window.innerWidth) return [];

  return [el]; // Always return in array
}

// Keep targets updated every 2 seconds
setInterval(() => {
  targets = getForageElements();
}, 2000);

// --- Pick Group Target ---
function pickGroupTarget() {
  const el = document.body.querySelector('.interviews-section');
  if (!el || !el.isConnected) return null;

  let s = targetStates.get(el) || { state: 'idle', scale: 1 };
  if (s.state !== 'done' && (s.scale === undefined || s.scale > MIN_SCALE)) {
    return el;
  }
  return null;
}

  

  // --- Ant State ---
  let ants = [];
  let targets = getForageElements();
setInterval(()=>{ targets = getForageElements(); }, 2000);
  let targetStates = new WeakMap(); // {carriedBy: ant or null, state: 'idle'|'carried'|'delivered'}

  function randomAntPos() {
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    return {x,y};
  }

  function spawnAnts() {
    ants = [];
    for (let i=0; i<ANT_COUNT; i++) {
      let pos = randomAntPos();
      ants.push({
        x: pos.x,
        y: pos.y,
        angle: Math.random()*Math.PI*2,
        legPhase: Math.random()*Math.PI*2,
        target: null,
        carrying: false,
        state: 'idle',
        carriedElem: null
      });
    }
  }

  // --- Group Target Logic ---
  let groupTarget = null;
  let groupTargetState = 'idle'; // 'idle', 'eating', 'done'
  let BITE_AMOUNT = 0.005; // shrink per bite (much slower)
  let MIN_SCALE = 0.18;

  function pickGroupTarget() {
    for (let el of targets) {
      if (!el.isConnected) continue;
      let s = targetStates.get(el) || {state:'idle', scale:1};
      if (s.state !== 'done' && (s.scale === undefined || s.scale > MIN_SCALE)) return el;
    }
    return null;
  }

  function pickTarget(ant) {
    // All ants target the same groupTarget
    return groupTarget;
  }

  function updateGroupTarget(dt) {
    // If no group target or it's delivered, pick a new one
    if (!groupTarget || groupTargetState === 'delivered' || !groupTarget.isConnected) {
      groupTarget = pickGroupTarget();
      groupTargetState = groupTarget ? 'idle' : 'idle';
      groupCarryProgress = 0;
    }
    if (!groupTarget) return;
    // If idle and all ants are close, start carrying
    let rect = groupTarget.getBoundingClientRect();
    let tx = rect.left + rect.width/2;
    let ty = rect.top + rect.height/2;
    let allClose = ants.every(ant => Math.hypot(ant.x-tx, ant.y-ty) < Math.max(rect.width,rect.height)*0.4);
    if (groupTargetState === 'idle' && allClose) {
      groupTargetState = 'carried';
      targetStates.set(groupTarget, {state:'carried'});
    }
    // If carried, increment progress
    if (groupTargetState === 'carried') {
      groupCarryProgress += dt / GROUP_CARRY_TIME;
      // Move element toward anthole
      let px = tx + (ANTHOLE.x-tx) * groupCarryProgress;
      let py = ty + (ANTHOLE.y-ty) * groupCarryProgress;
      groupTarget.style.position = 'absolute';
      groupTarget.style.pointerEvents = 'none';
      groupTarget.style.zIndex = 999998;
      groupTarget.style.left = (px-18) + 'px';
      groupTarget.style.top = (py-18) + 'px';
      groupTarget.style.width = (groupTarget._origWidth*CARRY_SHRINK) + 'px';
      groupTarget.style.height = (groupTarget._origHeight*CARRY_SHRINK) + 'px';
      groupTarget.style.transform = `scale(${CARRY_SHRINK})`;
      if (groupCarryProgress >= 1) {
        groupTarget.style.visibility = 'hidden';
        groupTargetState = 'delivered';
        targetStates.set(groupTarget, {state:'delivered'});
      }
    }
  }

  function updateAnt(ant) {
    // Per-ant bite state machine
    if (!ant.state || ant.state === 'idle') ant.state = 'toBite';
    ant.target = groupTarget;
    if (!groupTarget || groupTargetState === 'done') {
      // Idle random walk if nothing to eat
      ant.target = null;
      ant.state = 'idle';
      ant.angle += (Math.random()-0.5)*0.2;
      ant.x += Math.cos(ant.angle) * ANT_SPEED * 0.55;
      ant.y += Math.sin(ant.angle) * ANT_SPEED * 0.55;
      // Clamp
      ant.x = Math.max(0, Math.min(window.innerWidth, ant.x));
      ant.y = Math.max(0, Math.min(window.innerHeight, ant.y));
      return;
    }
    let rect = groupTarget.getBoundingClientRect();
    let tx, ty;
    if (ant.state === 'toBite') {
      tx = rect.left + rect.width/2;
      ty = rect.top + rect.height/2;
    } else if (ant.state === 'toAnthole') {
      tx = ANTHOLE.x;
      ty = ANTHOLE.y;
    } else if (ant.state === 'returning') {
      tx = rect.left + rect.width/2 + (Math.random()-0.5)*20;
      ty = rect.top + rect.height/2 + (Math.random()-0.5)*20;
    }
    let dx = tx - ant.x;
    let dy = ty - ant.y;
    let dist = Math.hypot(dx,dy);
    let desired = Math.atan2(dy, dx);
    let da = desired - ant.angle;
    da = Math.atan2(Math.sin(da), Math.cos(da));
    ant.angle += da * 0.17 + (Math.random()-0.5)*ANT_RANDOMNESS;
    let speed = ANT_SPEED;
    if (ant.state === 'toAnthole') speed *= 1.1;
    ant.x += Math.cos(ant.angle) * speed;
    ant.y += Math.sin(ant.angle) * speed;
    // Clamp
    ant.x = Math.max(0, Math.min(window.innerWidth, ant.x));
    ant.y = Math.max(0, Math.min(window.innerHeight, ant.y));
    // State transitions
    if (ant.state === 'toBite' && dist < Math.max(rect.width,rect.height)*0.35) {
      // Take a bite if allowed
      let s = targetStates.get(groupTarget) || {state:'eating', scale:1};
      if (!s.biteLock) {
        s.biteLock = true;
        setTimeout(()=>{ s.biteLock = false; }, 160); // prevent double bites
        s.scale = (s.scale === undefined ? 1 : s.scale) - BITE_AMOUNT;
        if (s.scale < MIN_SCALE) s.scale = MIN_SCALE;
        groupTarget.style.transformOrigin = 'center center';
        groupTarget.style.transition = 'transform 0.18s cubic-bezier(0.7,0,0.7,1)';
        groupTarget.style.transform = `scale(${s.scale})`;
        targetStates.set(groupTarget, s);
        ant.state = 'toAnthole';
        ant.biteSize = BITE_AMOUNT;
      }
    } else if (ant.state === 'toAnthole' && dist < 36) {
      // Drop off bite
      ant.state = 'returning';
      setTimeout(()=>{ ant.state = 'toBite'; }, 320+Math.random()*200);
    } else if (ant.state === 'returning' && dist < Math.max(rect.width,rect.height)*0.45) {
      ant.state = 'toBite';
    }
  }

  // Mark groupTarget done if fully eaten
  function updateGroupTarget(dt) {
    if (!groupTarget || !groupTarget.isConnected) {
      groupTarget = pickGroupTarget();
      groupTargetState = groupTarget ? 'eating' : 'idle';
      if (groupTarget) {
        let s = targetStates.get(groupTarget) || {state:'eating', scale:1};
        if (s.scale === undefined) s.scale = 1;
        targetStates.set(groupTarget, s);
      }
    }
    if (!groupTarget) return;
    let s = targetStates.get(groupTarget) || {state:'eating', scale:1};
    if (s.scale <= MIN_SCALE) {
      groupTarget.style.visibility = 'hidden';
      groupTargetState = 'done';
      targetStates.set(groupTarget, {state:'done', scale:MIN_SCALE});
    }
  }

  function drawAnt(ctx, ant) {
    ctx.save();
    ctx.translate(ant.x, ant.y);
    ctx.rotate(ant.angle);
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, 0, ANT_SIZE * 0.32, ANT_SIZE * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ANT_SIZE * 0.38, 0, ANT_SIZE * 0.18, ANT_SIZE * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-ANT_SIZE * 0.48, 0, ANT_SIZE * 0.22, ANT_SIZE * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 2.1;
    const legAttach = [
      {x: ANT_SIZE * 0.07, y: -ANT_SIZE * 0.09, angle: -Math.PI/3},
      {x: -ANT_SIZE * 0.01, y: -ANT_SIZE * 0.07, angle: -Math.PI/4},
      {x: -ANT_SIZE * 0.09, y: -ANT_SIZE * 0.03, angle: -Math.PI/6},
      {x: ANT_SIZE * 0.07, y: ANT_SIZE * 0.09, angle: Math.PI/3},
      {x: -ANT_SIZE * 0.01, y: ANT_SIZE * 0.07, angle: Math.PI/4},
      {x: -ANT_SIZE * 0.09, y: ANT_SIZE * 0.03, angle: Math.PI/6},
    ];
    for (let i = 0; i < 6; i++) {
      const attach = legAttach[i];
      const gaitPhase = ant.legPhase + (i % 2 === 0 ? 0 : Math.PI);
      const swingMag = (i % 3 === 1) ? 0.12 : 0.22;
      const swing = Math.sin(gaitPhase + i) * swingMag;
      const baseAngle = attach.angle + swing;
      const femurLen = ANT_SIZE * 0.36;
      const tibiaLen = ANT_SIZE * 0.26;
      const fx = attach.x + Math.cos(baseAngle) * femurLen;
      const fy = attach.y + Math.sin(baseAngle) * femurLen;
      const tx = fx + Math.cos(baseAngle + swing * 0.8) * tibiaLen;
      const ty = fy + Math.sin(baseAngle + swing * 0.8) * tibiaLen;
      ctx.beginPath();
      ctx.moveTo(attach.x, attach.y);
      ctx.lineTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1.1;
    for (let k = -1; k <= 1; k += 2) {
      ctx.beginPath();
      ctx.moveTo(ANT_SIZE * 0.38, 0);
      ctx.quadraticCurveTo(
        ANT_SIZE * 0.54, k * 7,
        ANT_SIZE * 0.72, k * 13 * Math.sin(ant.legPhase * 0.7 + k * 1.5)
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAnthole(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(ANTHOLE.x, ANTHOLE.y, 30, 0, Math.PI*2);
    ctx.fillStyle = '#2a1800';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(ANTHOLE.x, ANTHOLE.y, 14, 0, Math.PI*2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, antCanvas.width, antCanvas.height);
    drawAnthole(ctx);
    for (let i = 0; i < ants.length; i++) {
      drawAnt(ctx, ants[i]);
    }
  }

  let lastUpdateTime = performance.now();
  function update() {
    const now = performance.now();
    let dt = Math.min((now - lastUpdateTime) / 1000, 0.2); // seconds, cap at 0.2s
    lastUpdateTime = now;
    updateGroupTarget(dt);
    for (let i = 0; i < ants.length; i++) {
      updateAnt(ants[i]);
      ants[i].legPhase = (ants[i].legPhase + 0.22 + Math.random() * 0.04) % (Math.PI * 2);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // --- Resize Handling ---
  window.addEventListener('resize', () => {
    antCanvas.width = window.innerWidth;
    antCanvas.height = window.innerHeight;
  });

  // --- Start ---
  spawnAnts();
  setInterval(()=>{
    // Refresh targets every so often in case DOM changes
    targets = getForageElements();
  }, 2000);
  loop();
})();

// --- Ant Parameters ---
const ANT_COUNT = 18;
const ANT_SIZE = 14;
const ANT_LEG_LENGTH = 10;
const ANT_SPEED = 1.3;
const ANT_TURN_SPEED = 0.12;
const ANT_EAT_RATE = 0.008; // much slower eating
const ANT_SENSE_DIST = 120;
const ANT_SUGAR_ATTRACT = 0.25;
const ANT_RANDOMNESS = 0.18;

// --- Sugar Parameters ---
const SUGAR_SIZE = 38;
const SUGAR_MIN_SIZE = 18;
const SUGAR_EAT_SHRINK = 0.22;

// --- State ---
let ants = [];
let sugar = null; // {x, y, size, dragging, offsetX, offsetY}
let draggingSugar = false;
let mouse = {x: 0, y: 0, down: false};
const QUEEN = { x: W/2, y: H-40, size: 32 };

// --- Ant Class ---
class Ant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = Math.random() * Math.PI * 2;
    this.legPhase = Math.random() * Math.PI * 2;
    this.target = null;
    this.alerted = false;    // true if this ant knows about sugar
    this.carrying = false;   // true if carrying sugar
    this.carryTimer = 0;     // frames left carrying
    this.state = 'idle';     // 'idle', 'toSugar', 'toQueen'
  }
  update(ants, sugarAlertActive) {
    const updateStart = performance.now();
    
    // Validate ant state
    const bounds = safeBounds(this.x, this.y, this.angle);
    this.x = bounds.x;
    this.y = bounds.y;
    this.angle = bounds.angle;
    
    // Prevent invalid states
    if (!['idle', 'toSugar', 'toQueen'].includes(this.state)) {
      this.state = 'idle';
    }
    
    // Timeout protection - if update takes too long, abort
    const timeoutCheck = () => {
      if (performance.now() - updateStart > 10) { // 10ms max per ant update
        console.warn('Ant update timeout, resetting ant');
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.angle = Math.random() * Math.PI * 2;
        this.state = 'idle';
        this.alerted = false;
        this.carrying = false;
        return true;
      }
      return false;
    };
    // No more 'recruiting' or 'returning' states. Only 'idle', 'toSugar', 'toQueen'.
    // If alerted, always repeat foraging cycle until sugar is gone.
    // State transitions:
    //   idle -> toSugar (if alerted and sugar exists)
    //   toSugar -> toQueen (if close to sugar, pick up)
    //   toQueen -> toSugar (if close to queen, drop off)
    //   idle if sugar gone
    let knowsSugar = this.alerted;
    // If this ant is alerted, it will always repeat the cycle: go to sugar, pick up, deliver, repeat
    // Alert logic: any ant that walks near an alerted ant becomes alerted
    if (this.alerted && ants && ants.length > 0) {
      let alertCount = 0;
      for (const other of ants) {
        if (timeoutCheck()) return; // Prevent infinite loop
        if (alertCount++ > 50) break; // Prevent excessive processing
        
        if (!other.alerted && other !== this && other.x !== undefined && other.y !== undefined) {
          const odx = safeNumber(other.x - this.x);
          const ody = safeNumber(other.y - this.y);
          const odist = Math.hypot(odx, ody);
          if (odist > 0 && odist < ANT_SENSE_DIST * 0.9) {
            other.alerted = true;
            other.state = 'toSugar';
          }
        }
      }
    }
    // Initial alert: if not alerted and senses sugar, become alerted
    if (sugar && sugar.size > SUGAR_MIN_SIZE && !this.alerted && sugar.x !== undefined && sugar.y !== undefined) {
      if (timeoutCheck()) return;
      const dx = safeNumber(sugar.x - this.x);
      const dy = safeNumber(sugar.y - this.y);
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < ANT_SENSE_DIST) {
        this.alerted = true;
        this.state = 'toSugar';
      }
    }
    // --- State Machine ---
    if (this.alerted && sugar && sugar.size > SUGAR_MIN_SIZE && sugar.x !== undefined && sugar.y !== undefined) {
      if (timeoutCheck()) return;
      if (this.state === 'idle') {
        this.state = 'toSugar';
      }
      if (this.state === 'toSugar') {
        // Go to sugar
        const dx = sugar.x - this.x;
        const dy = sugar.y - this.y;
        const dist = Math.hypot(dx, dy);
        // Turn toward sugar
        const desired = Math.atan2(dy, dx);
        let da = desired - this.angle;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        this.angle += safeNumber(da * ANT_SUGAR_ATTRACT, 0);
        // Move forward
        const moveX = Math.cos(this.angle) * ANT_SPEED;
        const moveY = Math.sin(this.angle) * ANT_SPEED;
        this.x += safeNumber(moveX, 0);
        this.y += safeNumber(moveY, 0);
        // If close, pick up chunk
        if (!this.carrying && dist < sugar.size * 0.8) {
          sugar.size -= ANT_EAT_RATE * 22;
          if (sugar.size < SUGAR_MIN_SIZE) sugar.size = SUGAR_MIN_SIZE;
          this.carrying = true;
          this.carryTimer = 60 + Math.random()*20|0;
          this.state = 'toQueen';
        }
      } else if (this.state === 'toQueen') {
        // Carry to queen
        const dxq = QUEEN.x - this.x;
        const dyq = QUEEN.y - this.y;
        const distq = Math.hypot(dxq, dyq);
        // Turn toward queen
        const desired = Math.atan2(dyq, dxq);
        let da = desired - this.angle;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        this.angle += safeNumber(da * 0.23, 0);
        // Move forward
        const moveX = Math.cos(this.angle) * ANT_SPEED * 1.08;
        const moveY = Math.sin(this.angle) * ANT_SPEED * 1.08;
        this.x += safeNumber(moveX, 0);
        this.y += safeNumber(moveY, 0);
        // If close to queen, drop off and return to sugar
        if (distq < 8) {
          this.carrying = false;
          this.carryTimer = 0;
          this.state = 'toSugar';
        }
      }
    } else if (this.alerted && (!sugar || sugar.size <= SUGAR_MIN_SIZE)) {
      // Sugar gone, wait near queen or wander, but stay alerted for future sugar
      // Remain in 'idle' but keep alerted=true so they resume when new sugar appears
      this.state = 'idle';
      // Optionally: move to queen or random walk
      // (No de-alerting)
    }
    // If not alerted, random walk
    if (!this.alerted) {
      if (timeoutCheck()) return;
      this.angle += safeNumber((Math.random() - 0.5) * ANT_RANDOMNESS, 0);
      const moveX = Math.cos(this.angle) * ANT_SPEED;
      const moveY = Math.sin(this.angle) * ANT_SPEED;
      this.x += safeNumber(moveX, 0);
      this.y += safeNumber(moveY, 0);
    }
    // Stay on canvas and final validation
    const finalBounds = safeBounds(this.x, this.y, this.angle);
    this.x = finalBounds.x;
    this.y = finalBounds.y;
    this.angle = finalBounds.angle;
    
    // Animate legs
    this.legPhase += safeNumber(0.22 + Math.random() * 0.04, 0.22);
    
    // Final timeout check
    if (performance.now() - updateStart > 15) {
      console.warn('Ant update exceeded 15ms, force completing');
    }
  }

  draw(ctx) {
    ctx.save();
    // Draw carried sugar if any
    if (this.carrying && this.carryTimer > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = 0.93;
      ctx.fillStyle = '#fff1a8';
      ctx.strokeStyle = '#e6c25a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(ANT_SIZE*0.16, -ANT_SIZE*0.14, 7, 7);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      this.carryTimer--;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // --- Body proportions ---
    // Thorax (center)
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, 0, ANT_SIZE * 0.32, ANT_SIZE * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head (front)
    ctx.beginPath();
    ctx.ellipse(ANT_SIZE * 0.38, 0, ANT_SIZE * 0.18, ANT_SIZE * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    // Abdomen (back, larger)
    ctx.beginPath();
    ctx.ellipse(-ANT_SIZE * 0.48, 0, ANT_SIZE * 0.22, ANT_SIZE * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- Legs: 6 legs, correct attachment, alternating gait ---
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 2.1;
    // Leg attachment points (from front to back on thorax)
    const legAttach = [
      {x: ANT_SIZE * 0.07, y: -ANT_SIZE * 0.09, angle: -Math.PI/3},   // front left
      {x: -ANT_SIZE * 0.01, y: -ANT_SIZE * 0.07, angle: -Math.PI/4},  // mid left
      {x: -ANT_SIZE * 0.09, y: -ANT_SIZE * 0.03, angle: -Math.PI/6},  // rear left
      {x: ANT_SIZE * 0.07, y: ANT_SIZE * 0.09, angle: Math.PI/3},     // front right
      {x: -ANT_SIZE * 0.01, y: ANT_SIZE * 0.07, angle: Math.PI/4},    // mid right
      {x: -ANT_SIZE * 0.09, y: ANT_SIZE * 0.03, angle: Math.PI/6},    // rear right
    ];
    // Gait: tripod (legs 0,4,2 and 1,3,5 alternate)
    for (let i = 0; i < 6; i++) {
      const attach = legAttach[i];
      // Gait phase: alternate 3/3 (tripod)
      const gaitPhase = this.legPhase + (i % 2 === 0 ? 0 : Math.PI);
      // Swing: front/rear swing more, mid less
      const swingMag = (i % 3 === 1) ? 0.12 : 0.22;
      const swing = Math.sin(gaitPhase + i) * swingMag;
      const baseAngle = attach.angle + swing;
      // Leg segments: femur and tibia
      const femurLen = ANT_SIZE * 0.36;
      const tibiaLen = ANT_SIZE * 0.26;
      // Femur endpoint
      const fx = attach.x + Math.cos(baseAngle) * femurLen;
      const fy = attach.y + Math.sin(baseAngle) * femurLen;
      // Tibia endpoint
      const tx = fx + Math.cos(baseAngle + swing * 0.8) * tibiaLen;
      const ty = fy + Math.sin(baseAngle + swing * 0.8) * tibiaLen;
      ctx.beginPath();
      ctx.moveTo(attach.x, attach.y);
      ctx.lineTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }

    // --- Antennae ---
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1.1;
    for (let k = -1; k <= 1; k += 2) {
      ctx.beginPath();
      ctx.moveTo(ANT_SIZE * 0.38, 0);
      ctx.quadraticCurveTo(
        ANT_SIZE * 0.54, k * 7,
        ANT_SIZE * 0.72, k * 13 * Math.sin(this.legPhase * 0.7 + k * 1.5)
      );
      ctx.stroke();
    }
    ctx.restore();
  }
}

// --- Sugar Block ---
function drawSugar(ctx, sugar) {
  ctx.save();
  ctx.globalAlpha = 0.97;
  ctx.fillStyle = draggingSugar ? '#ffe066' : '#fff1a8';
  ctx.strokeStyle = '#e6c25a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.rect(sugar.x - sugar.size/2, sugar.y - sugar.size/2, sugar.size, sugar.size);
  ctx.fill();
  ctx.stroke();
  // Crystals
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(sugar.x + Math.cos(i) * sugar.size * 0.22, sugar.y + Math.sin(i) * sugar.size * 0.22);
    ctx.rotate(i);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#fffbe8';
    ctx.beginPath();
    ctx.arc(0, 0, sugar.size * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// --- Queen ---
function drawQueen(ctx, queen) {
  ctx.save();
  ctx.translate(queen.x, queen.y);
  ctx.scale(1.2,1.2);
  // Abdomen
  ctx.fillStyle = '#2a1a1a';
  ctx.beginPath();
  ctx.ellipse(-12, 0, 15, 10, 0, 0, Math.PI*2);
  ctx.fill();
  // Thorax
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI*2);
  ctx.fill();
  // Head
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(10, 0, 5, 4, 0, 0, Math.PI*2);
  ctx.fill();
  // Crown
  ctx.strokeStyle = '#ffe066';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(13,-2); ctx.lineTo(15,-8); ctx.lineTo(17,-2);
  ctx.stroke();
  ctx.restore();
}

// --- Ant Colony ---
function spawnAnts() {
  ants = [];
  for (let i = 0; i < ANT_COUNT; i++) {
    const x = Math.random() * W * 0.7 + W * 0.15;
    const y = Math.random() * H * 0.7 + H * 0.15;
    ants.push(new Ant(x, y));
  }
}

// --- Animation Loop ---
function draw() {
  ctx.clearRect(0, 0, W, H);
  // Draw sugar
  if (sugar) drawSugar(ctx, sugar);
  // Draw queen
  drawQueen(ctx, QUEEN);
  // Draw ants
  for (const ant of ants) {
    ant.draw(ctx);
  }
}
function update() {
  const updateStart = performance.now();
  
  // Safety checks
  if (!ants || ants.length === 0) {
    console.warn('No ants found, respawning');
    spawnAnts();
    return;
  }
  
  // Limit ant count to prevent memory issues
  if (ants.length > ANT_COUNT * 2) {
    ants = ants.slice(0, ANT_COUNT);
  }
  
  // Update ants with timeout protection
  let updateCount = 0;
  for (const ant of ants) {
    if (performance.now() - updateStart > MAX_FRAME_TIME) {
      console.warn('Update timeout, skipping remaining ants');
      break;
    }
    if (ant && typeof ant.update === 'function') {
      ant.update(ants, false);
    }
    updateCount++;
  }
  
  // Heartbeat logging
  if (frameCount - lastHeartbeat > HEARTBEAT_INTERVAL) {
    console.log(`Simulation heartbeat: frame ${frameCount}, ${updateCount} ants updated`);
    lastHeartbeat = frameCount;
  }
}
function loop() {
  const loopStart = performance.now();
  frameCount++;
  
  try {
    // Check for freeze conditions
    const timeSinceLastFrame = loopStart - lastFrameTime;
    if (timeSinceLastFrame > 1000) { // More than 1 second since last frame
      console.warn(`Long gap detected: ${timeSinceLastFrame}ms, resetting simulation state`);
      // Reset critical state
      for (const ant of ants) {
        if (ant) {
          const bounds = safeBounds(ant.x, ant.y, ant.angle);
          ant.x = bounds.x;
          ant.y = bounds.y;
          ant.angle = bounds.angle;
          ant.state = 'idle';
        }
      }
    }
    
    update();
    draw();
    
    // Performance monitoring
    const frameTime = performance.now() - loopStart;
    if (frameTime > MAX_FRAME_TIME) {
      console.warn(`Slow frame detected: ${frameTime}ms`);
    }
    
  } catch (e) {
    // Log error to console but keep simulation running
    console.error('Simulation error:', e, e.stack);
    
    // Emergency reset if errors persist
    if (frameCount % 100 === 0) {
      console.log('Performing periodic safety reset');
      spawnAnts();
    }
  }
  
  lastFrameTime = performance.now();
  requestAnimationFrame(loop);
}

// --- Mouse & Sugar Interaction ---
canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  mouse.x = mx;
  mouse.y = my;
  mouse.down = true;
  if (sugar && Math.abs(mx - sugar.x) < sugar.size/2 && Math.abs(my - sugar.y) < sugar.size/2) {
    draggingSugar = true;
    sugar.dragOffsetX = mx - sugar.x;
    sugar.dragOffsetY = my - sugar.y;
  } else {
    // Spawn sugar at mouse
    sugar = {x: mx, y: my, size: SUGAR_SIZE, dragging: true, dragOffsetX: 0, dragOffsetY: 0};
    draggingSugar = true;
  }
});
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  mouse.x = mx;
  mouse.y = my;
  if (draggingSugar && sugar) {
    sugar.x = mx - (sugar.dragOffsetX || 0);
    sugar.y = my - (sugar.dragOffsetY || 0);
    // Clamp sugar to canvas
    sugar.x = Math.max(sugar.size/2, Math.min(W - sugar.size/2, sugar.x));
    sugar.y = Math.max(sugar.size/2, Math.min(H - sugar.size/2, sugar.y));
  }
});
window.addEventListener('mouseup', e => {
  mouse.down = false;
  draggingSugar = false;
  if (sugar) sugar.dragging = false;
});

// --- Init ---
spawnAnts();
loop();

// --- UI Instructions ---
document.getElementById('ui').innerHTML =
  '<b>Click</b> to spawn or drag sugar. <b>Ants</b> will seek and eat it!';
