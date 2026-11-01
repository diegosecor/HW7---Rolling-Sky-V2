'use strict';
const E = SkyEngine, $ = id => document.getElementById(id), canvas = $('game'), ctx = canvas.getContext('2d');
let selected = 0, state = E.create(), mode = 'ready', last = 0, accumulator = 0, muted = true, audio, best = 0;
const keys = new Set();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let deathElapsed = 0, particles = [], trail = [], trailClock = 0, collectPulse = 0;
function resetEffects() { deathElapsed=0; particles=[]; trail=[]; trailClock=0; collectPulse=0; document.querySelector('.game-section').style.transform=''; }
function burst(x,y,count,color) {
  for(let i=0;i<count;i++){const angle=Math.PI*2*i/count; const speed=80+Math.random()*230; particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-80,life:0.7+Math.random()*0.35,max:1.05,color});}
}
function collected() { beep(1000,0.1); collectPulse=0.3; burst(state.x,550,12,'#8ef0f4'); }
function beginDeath() {
  mode='dying'; keys.clear(); deathElapsed=0; trail=[];
  if(state.deathType==='crash'){burst(state.x,558-E.height(state),36,'#d8ff91');burst(state.x,558-E.height(state),15,'#ffad73');beep(75,0.4,'sawtooth');}
  else beep(190,0.55,'triangle');
}
function updateEffects(dt) {
  if(mode==='paused')return;
  collectPulse=Math.max(0,collectPulse-dt);
  for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=280*dt;} particles=particles.filter(p=>p.life>0);
  for(const p of trail)p.life-=dt;trail=trail.filter(p=>p.life>0);
  if(mode==='playing'){trailClock+=dt;if(trailClock>0.025){trailClock=0;trail.push({x:state.x,y:558-E.height(state),life:0.24});}for(const p of trail)p.y+=180*dt;}
  if(mode==='dying'){deathElapsed+=dt;if(deathElapsed>=(state.deathType==='fall'?1.15:0.85))finish();}
  const shake=mode==='dying'&&state.deathType==='crash'&&!reducedMotion?12*Math.pow(Math.max(0,1-deathElapsed/0.55),2):0;
  document.querySelector('.game-section').style.transform=shake?`translate(${Math.sin(deathElapsed*95)*shake}px,${Math.cos(deathElapsed*117)*shake*0.65}px)`:'';
}
function drawEffects() {
  ctx.save();
  for(const p of trail){ctx.globalAlpha=p.life/0.24*0.18;ctx.fillStyle='#c0ff78';ctx.beginPath();ctx.arc(p.x,p.y,14*p.life/0.24,0,Math.PI*2);ctx.fill();}
  for(const p of particles){ctx.globalAlpha=Math.min(1,p.life/p.max);pixel(p.x,p.y,5,5,p.color);}
  ctx.globalAlpha=1;
  if(mode==='dying'&&state.deathType==='crash'){
    const t=deathElapsed;ctx.strokeStyle=`rgba(255,180,120,${Math.max(0,1-t*2)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(state.x,558,20+t*180,0,Math.PI*2);ctx.stroke();
    if(!reducedMotion){ctx.fillStyle=`rgba(255,137,93,${Math.max(0,0.2-t)})`;ctx.fillRect(0,0,600,720);}
  }
  if(mode==='dying'&&state.deathType==='fall'){
    const t=Math.min(1,deathElapsed/1.1),scale=Math.pow(1-t,2);ctx.translate(state.x + Math.sign(state.vx || 0) * Math.min(45, Math.abs(state.vx || 0)*0.12) * t,558+85*t*t);ctx.scale(scale,scale);ctx.globalAlpha=1-t*0.75;drawBall(deathElapsed*14);
  }
  if(collectPulse>0){ctx.globalAlpha=collectPulse/0.3;ctx.fillStyle='#a9f6ef';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText('+100',state.x,500-(0.3-collectPulse)*80);}
  ctx.restore();
}
function drawBall(rotation) {
  ctx.save();ctx.rotate(rotation);const g=ctx.createRadialGradient(-7,-8,2,0,0,20);g.addColorStop(0,'#ffffdc');g.addColorStop(0.3,'#ceff48');g.addColorStop(1,'#6bc522');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#528527aa';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,8,17,0,0,Math.PI*2);ctx.stroke();pixel(-5,-13,5,5,'#f8ffe0');ctx.restore();
}
try { best = Number(localStorage.getItem('skyline-best')) || 0; } catch (_) { /* Private browsing can disable storage. */ }
$('best').textContent = String(best).padStart(5, '0');
function beep(freq, duration, type = 'sine') {
  if (muted) return;
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); const osc = audio.createOscillator(), gain = audio.createGain(); osc.type = type; osc.frequency.value = freq; gain.gain.setValueAtTime(0.045, audio.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration); osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration); } catch (_) {}
}
function overlay(label, title, copy, button, hint) {
  $('overlay').classList.remove('hidden'); $('screen-label').textContent = label; $('screen-title').textContent = title; $('screen-copy').textContent = copy; $('start').textContent = button; $('screen-hint').textContent = hint;
}
function start() { resetEffects(); state = E.create(selected); mode = 'playing'; keys.clear(); accumulator = 0; $('overlay').classList.add('hidden'); $('pause').textContent = 'Ⅱ'; beep(440, 0.15); updateHUD(); }
function pause() {
  if (mode === 'playing') { mode = 'paused'; keys.clear(); overlay('TAKE A BREATHER', 'Sky on standby.', 'Your run is right where you left it.', 'Continue ↗', 'P TO RESUME'); $('pause').textContent = '▶'; }
  else if (mode === 'paused') { mode = 'playing'; $('overlay').classList.add('hidden'); $('pause').textContent = 'Ⅱ'; }
  $('pause').setAttribute('aria-label', mode === 'paused' ? 'Resume game' : 'Pause game');
}
function finish() {
  mode = state.status; keys.clear(); const score = E.score(state);
  if (score > best) { best = score; try { localStorage.setItem('skyline-best', String(best)); } catch (_) {} }
  $('best').textContent = String(best).padStart(5, '0');
  overlay(mode === 'won' ? 'ROUTE COMPLETE' : 'EVERY RUN IS A NEW START', mode === 'won' ? 'Above and beyond.' : 'One more roll?', `${mode === 'won' ? 'Finish line reached!' : state.reason} Score: ${score} · Diamonds: ${state.diamonds}`, 'Roll again ↗', 'SPACE TO RESTART · OR CHOOSE ANOTHER ROUTE');
  if(mode==='won'){beep(880,0.35);burst(300,350,50,'#d8ff91');}
}
function updateHUD() { const fraction=state.distance/E.LEVELS[selected].length; $('challenge').textContent = fraction>=0.25&&fraction<0.50 ? '☾ NIGHTFALL · FOLLOW YOUR LIGHT' : fraction>=0.55&&fraction<0.65 ? '↔ CROSSWIND · FOLLOW THE ROAD' : '● LIVE FROM THE SKY'; const p = Math.floor(state.distance / E.LEVELS[selected].length * 100); $('score').textContent = String(E.score(state)).padStart(5, '0'); $('percent').textContent = p + '%'; $('progress').style.width = p + '%'; document.querySelector('.progress').setAttribute('aria-valuenow', p); $('speed').textContent = (1 + E.LEVELS[selected].acceleration / E.LEVELS[selected].speed * p / 100).toFixed(1) + '×'; }
$('start').onclick = () => mode === 'paused' ? pause() : start(); $('pause').onclick = pause;
$('sound').onclick = () => { muted = !muted; $('sound').textContent = muted ? 'Sound off' : 'Sound on'; $('sound').setAttribute('aria-pressed', !muted); beep(650, 0.1); };
document.querySelectorAll('[data-level]').forEach(button => button.onclick = () => { resetEffects(); selected = Number(button.dataset.level); state = E.create(selected); mode = 'ready'; keys.clear(); document.querySelectorAll('[data-level]').forEach(b => b.classList.toggle('active', b === button)); $('route-name').textContent = E.LEVELS[selected].name.toUpperCase(); overlay('READY WHEN YOU ARE', 'The sky is yours.', 'Dodge trees, rocks, peaks and ducks. Jump the gaps. Follow the diamonds to the finish.', 'Let’s roll ↗', '← → TO STEER · ↑ TO JUMP'); updateHUD(); });
function press(key, repeat = false) { if (key === 'ArrowUp' && !repeat && mode === 'playing') { E.jump(state); beep(330, 0.1); } if (key.toLowerCase() === 'p' && !repeat) pause(); if (key === ' ' && !repeat && ['lost', 'won'].includes(mode)) start(); keys.add(key); }
window.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) e.preventDefault(); press(e.key, e.repeat); });
window.addEventListener('keyup', e => keys.delete(e.key));
window.addEventListener('blur', () => { keys.clear(); if (mode === 'playing') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') pause(); });
document.querySelectorAll('[data-key]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); b.setPointerCapture(e.pointerId); press(b.dataset.key); }; b.onpointerup = b.onpointercancel = () => keys.delete(b.dataset.key); });
function rounded(x, y, w, h, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
// A single continuous projection keeps tiles, gaps, scenery and collisions aligned.
// World coordinates stay unchanged; only their presentation gains depth.
function project(x, d, onRoad = true) {
  const ahead = d - state.distance;
  const scale = 1 / (1 + ahead / 1800);
  // Higher camera: less foreshortening, wider distant road, more top-down surface.
  return { x: 300 + (x + (onRoad ? E.roadOffset(state) : 0) - 300) * scale, y: 575 - ahead * 0.85 * scale, scale };
}
function poly(points, color) {
  ctx.fillStyle = color; ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fill();
}
function ground(x1, x2, d1, d2, color) {
  poly([project(x1,d1),project(x2,d1),project(x2,d2),project(x1,d2)],color);
}
function pixel(x,y,w,h,color) { ctx.fillStyle=color; ctx.fillRect(x,y,w,h); }
function cloud(x,y,s) {
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
  pixel(-50,0,112,19,'#d9effa'); pixel(-62,-12,124,22,'#f5fcff'); pixel(-36,-28,48,23,'#ffffff'); pixel(4,-40,36,35,'#ffffff'); pixel(35,-20,45,24,'#ffffff'); ctx.restore();
}
function voxel(x,y,w,h,top,front,side) {
  pixel(x,y,w,h,front); poly([{x,y},{x:x+9,y:y-9},{x:x+w+9,y:y-9},{x:x+w,y}],top);
  poly([{x:x+w,y},{x:x+w+9,y:y-9},{x:x+w+9,y:y+h-9},{x:x+w,y:y+h}],side);
}
function scenery(o) {
  const p=project(E.objectX(o,state.time),o.d); if(p.y>850 || p.y< -120)return;
  ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.scale,p.scale);
  ctx.fillStyle='#334d4b35';ctx.beginPath();ctx.ellipse(3,7,30,13,0,0,Math.PI*2);ctx.fill();
  const kind=o.type==='moving'?'duck':o.skin;
  // Orange ground markers show the hazard footprint, including under tall canopies.
  ctx.strokeStyle='#ff9b45';ctx.lineWidth=2;ctx.strokeRect(-28,-14,56,28);
  if(kind==='tree') {
    voxel(-7,-43,14,47,'#f8ad56','#b56a30','#774128');
    voxel(-26,-74,46,32,'#a3e641','#42b445','#197a4d');
    voxel(-19,-96,33,26,'#c2f45c','#6cd338','#268c49');
    pixel(-18,-69,10,8,'#81e33e');pixel(3,-91,8,7,'#d8ff83');
  } else if(kind==='mountain') {
    voxel(-27,-22,49,27,'#bea1ef','#8d69ce','#6143a2');
    voxel(-19,-45,33,25,'#dac5ff','#ab87e7','#7855b9');
    voxel(-10,-66,17,24,'#ffffff','#e8f2f5','#c1d4df');
    pixel(-18,-43,10,8,'#f2f9fb');
  } else if(kind==='duck') {
    const direction=Math.cos(state.time*1.6+o.phase)>=0?1:-1;
    ctx.scale(direction,1); const walk=Math.sin(state.time*14)*4;
    pixel(-16,1+walk,10,7,'#ff8b21');pixel(6,1-walk,10,7,'#ff8b21');
    voxel(-23,-26,39,27,'#ffffff','#f7f5de','#d4dfcf');
    pixel(-15,-18,20,14,'#e3e9d8');voxel(7,-46,20,25,'#fffde7','#fff9d8','#e2dfb5');
    pixel(26,-29,13,8,'#ffb51b');pixel(19,-40,4,5,'#273d4b');pixel(-29,-30,10,14,'#ffffff');
  } else {
    voxel(-25,-21,44,25,'#f4b68c','#d78161','#a34f56');
    voxel(-15,-36,27,18,'#ffdab0','#ed9e71','#ba6557');pixel(-17,-18,8,6,'#ffd1a0');
  }
  ctx.restore();
}
function draw() {
  const distance=state.distance, violet=selected===1;
  const sky=ctx.createLinearGradient(0,0,0,720);
  sky.addColorStop(0,violet?'#29105d':'#101c56');sky.addColorStop(0.6,'#163c87');sky.addColorStop(1,'#091735');
  ctx.fillStyle=sky;ctx.fillRect(0,0,600,720);
  // A small moon and sparse stars keep the sky quiet.
  pixel(486,58,24,24,'#a8c6ce');pixel(495,55,18,20,violet?'#29105d':'#101c56');
  for(let i=0;i<24;i++){ctx.globalAlpha=0.25+(i%3)*0.12;pixel((i*173+25)%600,24+(i*47)%340,2,2,'#c3dae1');}ctx.globalAlpha=1;
  ctx.globalAlpha=0.1;for(let i=0;i<3;i++)cloud((i*271+distance*0.02)%820-100,150+(i*149)%500,0.5+(i%2)*0.25);ctx.globalAlpha=1;
  if(mode==='playing'&&!reducedMotion){ctx.strokeStyle='#9bdae22a';ctx.lineWidth=2;for(let i=0;i<12;i++){const x=i%2?565+(i%3)*9:18+(i%3)*9;const y=190+(i*73+distance*1.1)%520;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+18+state.distance/600);ctx.stroke();}}
  // Distant floating islands, cut from stepped stone and grass.
  for(const [x,y,s] of [[64,295,0.45],[551,445,0.5]]) {
    ctx.save();ctx.globalAlpha=0.35;ctx.translate(x,y);ctx.scale(s,s);pixel(-35,0,70,14,'#92c660');pixel(-27,14,54,18,'#a78d6a');pixel(-18,32,36,18,'#90a0aa');pixel(-7,50,14,13,'#aebec7');voxel(-6,-25,9,25,'#bca06e','#8f704e','#71583c');voxel(-21,-48,33,24,'#b9dc81','#8dbf61','#6b9d59');ctx.restore();
  }
  // World-indexed tiles never reset or flip color when a row scrolls past.
  const first=Math.floor((distance-300)/84), last= Math.ceil((distance+6000)/84);
  for(let row=last;row>=first;row--) {
    const near=row*84,far=near+84;
    const a=project(90,near),b=project(90,far),c=project(510,near),d=project(510,far);
    poly([a,b,{x:b.x,y:b.y+18*b.scale},{x:a.x,y:a.y+18*a.scale}],'#264d91');
    poly([c,d,{x:d.x,y:d.y+18*d.scale},{x:c.x,y:c.y+18*c.scale}],'#203675');
    for(let lane=0;lane<5;lane++) {
      const x=90+lane*84;
      const path=lane>0&&lane<4;
      const colors=path?(violet?['#7044c9','#8355df']:['#286aca','#3179df']):['#13866e','#18a17d'];
      ground(x,x+84,near-0.5,far+0.5,colors[((row+lane)%2+2)%2]);
      // Sparse pixel grain travels with each tile, rather than flickering per frame.
      const seed=((row*13+lane*7)%17+17)%17;
      ground(x+12+seed,x+21+seed,near+22,near+28,path?(violet?'#a575ef':'#428aed'):'#29b78a');
      if(!path)ground(x+53,x+59,near+55,near+62,'#62d998');
    }
  }
  // Gaps reveal sky, not a dark painted tile; the soil lip makes edges legible.
  for(const o of state.objects.filter(o=>o.type==='gap')) {
    if(o.d-distance < -300 || o.d-distance>6000)continue;
    ground(o.x-o.w/2,o.x+o.w/2,o.d-o.h/2,o.d+o.h/2,sky);
    ground(o.x-o.w/2,o.x+o.w/2,o.d+o.h/2,o.d+o.h/2+9,'#64c7ee');
  }
  const finish=E.LEVELS[selected].length;
  if(finish-distance<6000)for(let r=0;r<2;r++)for(let c=0;c<14;c++)ground(90+c*30,120+c*30,finish+r*24,finish+(r+1)*24,(r+c)%2?'#55788c':'#fff9dd');
  const sprites=state.objects.filter(o=>o.type!=='gap'&&!o.collected&&o.d>distance-300&&o.d<distance+6000).map(o=>({d:o.d,o}));
  if(state.status!=='lost')sprites.push({d:distance,ball:true});sprites.sort((a,b)=>b.d-a.d);
  for(const sprite of sprites) {
    if(sprite.ball) {
      const p=project(state.x,distance,false),h=E.height(state);
      ctx.fillStyle='#34586b45';ctx.beginPath();ctx.ellipse(p.x,p.y+6,19-h/12,7,0,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.translate(p.x,p.y-17-h);drawBall(distance/19);ctx.restore();
    } else if(sprite.o.type==='diamond') {
      const p=project(sprite.o.x,sprite.d);ctx.save();ctx.translate(p.x,p.y-15*p.scale);ctx.scale(p.scale,p.scale);poly([{x:0,y:-15},{x:11,y:0},{x:0,y:15},{x:-11,y:0}],'#00e1ee');poly([{x:0,y:-15},{x:0,y:15},{x:-11,y:0}],'#a6ffff');ctx.strokeStyle='#008fbf';ctx.lineWidth=2;ctx.stroke();ctx.restore();
    } else scenery(sprite.o);
  }

}
// An elliptical pool of light follows the player, revealing only the next
// short section of road. The transparent center preserves actual scene detail.
function drawFlashlight(dim) {
  ctx.save();
  ctx.translate(state.x,470);ctx.scale(1,1.15);
  const shade=ctx.createRadialGradient(0,0,12,0,0,145);
  shade.addColorStop(0,`rgba(1,4,12,${dim*0.025})`);
  shade.addColorStop(0.40,`rgba(1,4,12,${dim*0.07})`);
  shade.addColorStop(0.68,`rgba(1,4,12,${dim*0.35})`);
  shade.addColorStop(0.88,`rgba(1,4,12,${dim*0.8})`);
  shade.addColorStop(1,`rgba(1,4,12,${dim})`);
  ctx.fillStyle=shade;ctx.fillRect(-state.x,-470/1.15,600,720/1.15);
  ctx.restore();
}
function frame(now) {
  const dt=Math.min((now-(last||now))/1000,0.05);last=now;
  if(mode==='playing'){
    accumulator+=dt;
    while(accumulator>=1/120&&mode==='playing'){
      E.step(state,1/120,Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft')),collected);
      accumulator-=1/120;
      if(state.status==='lost')beginDeath();else if(state.status==='won')finish();
    }
    updateHUD();
  } else accumulator=0;
  updateEffects(dt);draw();drawEffects();
  // Canvas only: score, progress, controls and result text remain fully readable.
  const dim=E.darkness(state);
  if(dim>0)drawFlashlight(dim);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
