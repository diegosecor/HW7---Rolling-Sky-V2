'use strict';
const E = SkyEngine, $ = id => document.getElementById(id), canvas = $('game'), ctx = canvas.getContext('2d');
let selected = 0, state = E.create(), mode = 'ready', last = 0, accumulator = 0, muted = true, audio, best = 0;
const keys = new Set();
const PLAYER_Y=575;
const pixelRatio=Math.min(2,window.devicePixelRatio||1);
canvas.width=600*pixelRatio;canvas.height=720*pixelRatio;ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
let musicStep=-1;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let deathElapsed = 0, particles = [], trail = [], trailClock = 0, collectPulse = 0;
function resetEffects() { musicStep=-1; deathElapsed=0; particles=[]; trail=[]; trailClock=0; collectPulse=0; document.querySelector('.game-section').style.transform=''; }
function burst(x,y,count,color) {
  if(reducedMotion)return;
  for(let i=0;i<count;i++){const angle=Math.PI*2*i/count; const speed=80+Math.random()*230; particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-80,life:0.7+Math.random()*0.35,max:1.05,color});}
}
function collected() { beep(1000,0.1); collectPulse=0.3; burst(state.x,PLAYER_Y,12,'#8ef0f4'); }
function beginDeath() {
  mode='dying'; keys.clear(); deathElapsed=0; trail=[];
  if(state.deathType==='crash'){burst(state.x,PLAYER_Y,36,'#d8ff91');burst(state.x,PLAYER_Y,15,'#ffad73');beep(75,0.4,'sawtooth');}
  else beep(190,0.55,'triangle');
}
function updateEffects(dt) {
  if(mode==='paused')return;
  collectPulse=Math.max(0,collectPulse-dt);
  for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=280*dt;} particles=particles.filter(p=>p.life>0);
  for(const p of trail)p.life-=dt;trail=trail.filter(p=>p.life>0);
  if(mode==='playing'&&!reducedMotion){trailClock+=dt;if(trailClock>0.025){trailClock=0;trail.push({x:state.x,y:PLAYER_Y,life:0.24});}for(const p of trail)p.y+=180*dt;}
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
    const t=deathElapsed;ctx.strokeStyle=`rgba(255,180,120,${Math.max(0,1-t*2)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(state.x,PLAYER_Y,20+t*180,0,Math.PI*2);ctx.stroke();
    if(!reducedMotion){ctx.fillStyle=`rgba(255,137,93,${Math.max(0,0.2-t)})`;ctx.fillRect(0,0,600,720);}
  }
  if(mode==='dying'&&state.deathType==='fall'){
    const t=Math.min(1,deathElapsed/1.1),scale=Math.pow(1-t,2);ctx.translate(state.x + Math.sign(state.vx || 0) * Math.min(45, Math.abs(state.vx || 0)*0.12) * t,PLAYER_Y+85*t*t);ctx.scale(scale,scale);ctx.globalAlpha=1-t*0.75;drawBall(deathElapsed*14);
  }
  if(collectPulse>0){ctx.globalAlpha=collectPulse/0.3;ctx.fillStyle='#a9f6ef';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText('+100',state.x,500-(0.3-collectPulse)*80);}
  ctx.restore();
}
function drawBall(rotation) {
  ctx.save();ctx.rotate(rotation);const g=ctx.createRadialGradient(-7,-8,2,0,0,20);g.addColorStop(0,'#ffffdc');g.addColorStop(0.3,'#ceff48');g.addColorStop(1,'#6bc522');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#528527aa';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,8,17,0,0,Math.PI*2);ctx.stroke();pixel(-5,-13,5,5,'#f8ffe0');ctx.restore();
}
try { const saved=Number(localStorage.getItem('skyline-best'));best=Number.isSafeInteger(saved)&&saved>=0?saved:0; } catch (_) { /* Private browsing can disable storage. */ }
$('best').textContent = String(best).padStart(5, '0');
function beep(freq, duration, type = 'sine', volume = .045) {
  if (muted) return;
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); const osc = audio.createOscillator(), gain = audio.createGain(); osc.type = type; osc.frequency.value = freq; gain.gain.setValueAtTime(volume, audio.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration); osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration); } catch (_) {}
}
function playMusic(){
  if(muted||mode!=='playing')return;
  const beat=Math.floor(state.time/.36);if(beat===musicStep)return;musicStep=beat;
  const melody=selected?[220,261.63,329.63,293.66,220,392,329.63,261.63]:[261.63,329.63,392,523.25,392,329.63,293.66,392];
  beep(melody[beat%melody.length],.19,'sine',.009);
}
function overlay(label, title, copy, button, hint) {
  $('overlay').classList.remove('hidden'); $('screen-label').textContent = label; $('screen-title').textContent = title; $('screen-copy').textContent = copy; $('start').textContent = button; $('screen-hint').textContent = hint;
}
function start() { resetEffects(); state = E.create(selected); mode = 'playing';document.body?.classList.add('playing');document.body?.classList.remove('victory'); keys.clear(); accumulator = 0; $('overlay').classList.add('hidden'); $('pause').textContent = 'Ⅱ'; beep(440, 0.15); updateHUD(); }
function pause() {
  if (mode === 'playing') { mode = 'paused'; keys.clear(); overlay('TAKE A BREATHER', 'Sky on standby.', 'Your run is right where you left it.', 'Continue ↗', 'P TO RESUME'); $('pause').textContent = '▶'; }
  else if (mode === 'paused') { mode = 'playing'; $('overlay').classList.add('hidden'); $('pause').textContent = 'Ⅱ'; }
  $('pause').setAttribute('aria-label', mode === 'paused' ? 'Resume game' : 'Pause game');
}
function finish() {
  mode = state.status;document.body?.classList.remove('playing');document.body?.classList.toggle('victory',mode==='won'); keys.clear(); const score = E.score(state);
  if (score > best) { best = score; try { localStorage.setItem('skyline-best', String(best)); } catch (_) {} }
  $('best').textContent = String(best).padStart(5, '0');
  overlay(mode === 'won' ? 'ROUTE COMPLETE' : 'EVERY RUN IS A NEW START', mode === 'won' ? 'Above and beyond.' : 'One more roll?', `${mode === 'won' ? 'Finish line reached!' : state.reason} Score: ${score} · Diamonds: ${state.diamonds}`, 'Roll again ↗', 'SPACE TO RESTART · OR CHOOSE ANOTHER ROUTE');
  if(mode==='won'){beep(880,0.35);burst(300,350,50,'#d8ff91');}
}
function updateHUD() { const fraction=state.distance/E.LEVELS[selected].length; $('challenge').textContent = fraction>=0.25&&fraction<0.50 ? '☾ NIGHTFALL · FOLLOW YOUR LIGHT' : fraction>=0.55&&fraction<0.65 ? '↔ CROSSWIND · FOLLOW THE ROAD' : '● LIVE FROM THE SKY'; const p = Math.floor(state.distance / E.LEVELS[selected].length * 100); $('score').textContent = String(E.score(state)).padStart(5, '0'); $('percent').textContent = p + '%'; $('diamonds').textContent=state.diamonds+'◇'; $('progress').style.width = p + '%'; document.querySelector('.progress').setAttribute('aria-valuenow', p); $('speed').textContent = (1 + E.LEVELS[selected].acceleration / E.LEVELS[selected].speed * p / 100).toFixed(1) + '×'; }
$('start').onclick = () => mode === 'paused' ? pause() : start(); $('pause').onclick = pause;
$('sound').onclick = () => { muted = !muted; $('sound').textContent = muted ? 'Audio off' : 'Audio on'; $('sound').setAttribute('aria-pressed', !muted); beep(650, 0.1); };
document.querySelectorAll('[data-level]').forEach(button => button.onclick = () => { resetEffects(); selected = Number(button.dataset.level); state = E.create(selected); mode = 'ready';document.body?.classList.remove('playing','victory'); keys.clear(); document.querySelectorAll('[data-level]').forEach(b => b.classList.toggle('active', b === button)); $('route-name').textContent = E.LEVELS[selected].name.toUpperCase(); overlay('READY WHEN YOU ARE', 'The sky is yours.', 'Steer around obstacles. Jump the gaps. Follow the diamonds to the finish.', 'Let’s roll ↗', '← → TO STEER · ↑ TO JUMP'); updateHUD(); });
function press(key, repeat = false) { if (key === 'ArrowUp' && !repeat && mode === 'playing') { E.jump(state); beep(330, 0.1); } if (key.toLowerCase() === 'p' && !repeat) pause(); if (key === ' ' && !repeat && ['lost', 'won'].includes(mode)) start(); keys.add(key); }
window.addEventListener('keydown', e => { if (['playing','lost','won'].includes(mode) && ['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) e.preventDefault(); press(e.key, e.repeat); });
window.addEventListener('keyup', e => keys.delete(e.key));
window.addEventListener('blur', () => { keys.clear(); if (mode === 'playing') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') pause(); });
document.querySelectorAll('[data-key]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); b.setPointerCapture(e.pointerId); press(b.dataset.key); }; b.onpointerup = b.onpointercancel = b.onlostpointercapture = () => keys.delete(b.dataset.key); });
function rounded(x, y, w, h, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
// Orthographic top-down projection: equal-size tiles, no vanishing point.
function project(x,d,onRoad=true){
  return {x:x+(onRoad?E.roadOffset(state):0),y:PLAYER_Y-(d-state.distance),scale:1};
}
function poly(points, color) {
  ctx.fillStyle = color; ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fill();
}
function ground(x1, x2, d1, d2, color) {
  poly([project(x1,d1),project(x2,d1),project(x2,d2),project(x1,d2)],color);
}
function pixel(x,y,w,h,color) { ctx.fillStyle=color; ctx.fillRect(x,y,w,h); }
// Retain the inherited sprite helper, using flat bevels instead of extruded faces.
function voxel(x,y,w,h,top,front,side){
  rounded(x,y,w,h,5,side);rounded(x+2,y+2,w-4,h-4,4,front);
  ctx.strokeStyle=top;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+5,y+3);ctx.lineTo(x+w-5,y+3);ctx.stroke();
}
function scenery(o) {
  const p=project(E.objectX(o,state.time),o.d); if(p.y>800 || p.y< -100)return;
  ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.scale,p.scale);
  ctx.fillStyle='#334d4b35';ctx.beginPath();ctx.ellipse(3,5,30,29,0,0,Math.PI*2);ctx.fill();
  const kind=o.type==='moving'?'duck':o.skin;
  // Orange ground markers show the hazard footprint, including under tall canopies.
  ctx.strokeStyle='#ff9b45';ctx.lineWidth=2;ctx.strokeRect(-28,-31,56,62);
  if(kind==='tree') {
    voxel(-6,-10,12,23,'#f8ad56','#b56a30','#774128');
    voxel(-25,-27,50,52,'#a3e641','#42b445','#197a4d');
    voxel(-17,-19,34,36,'#c2f45c','#6cd338','#268c49');
    pixel(-17,-10,7,6,'#81e33e');pixel(4,-16,7,5,'#d8ff83');
  } else if(kind==='mountain') {
    voxel(-26,-28,52,56,'#bea1ef','#8d69ce','#6143a2');
    voxel(-18,-19,36,38,'#dac5ff','#ab87e7','#7855b9');
    voxel(-9,-10,18,20,'#ffffff','#e8f2f5','#c1d4df');
    pixel(-16,-12,7,5,'#f2f9fb');
  } else if(kind==='duck') {
    const direction=Math.cos(state.time*1.6+o.phase)>=0?1:-1;
    ctx.scale(direction,1); const walk=Math.sin(state.time*14)*4;
    pixel(-12,-20+walk,10,5,'#ff8b21');pixel(-12,15-walk,10,5,'#ff8b21');
    voxel(-25,-14,42,28,'#ffffff','#f7f5de','#d4dfcf');
    pixel(-17,-8,20,16,'#e3e9d8');voxel(6,-10,20,20,'#fffde7','#fff9d8','#e2dfb5');
    pixel(25,-4,8,8,'#ffb51b');pixel(18,-5,4,4,'#273d4b');pixel(-30,-6,8,12,'#ffffff');
  } else {
    voxel(-25,-27,50,54,'#d8f1ad','#79aa68','#3f6853');
    voxel(-17,-18,34,36,'#e3f7b8','#91bd76','#537d59');pixel(-15,-15,8,6,'#d2eab0');
  }
  ctx.restore();
}
function draw() {
  const distance=state.distance, violet=selected===1;
  const sky=ctx.createLinearGradient(0,0,0,720);
  sky.addColorStop(0,violet?'#29105d':'#101c56');sky.addColorStop(0.6,'#163c87');sky.addColorStop(1,'#091735');
  ctx.fillStyle=sky;ctx.fillRect(0,0,600,720);
  // A flat star field and fine circuit lines frame the two-dimensional board.
  for(let i=0;i<45;i++){const x=(i*173+25)%600,y=(i*89+(reducedMotion?0:distance*.08))%720;ctx.globalAlpha=.15+(i%3)*.09;pixel(x,y,1+i%2,1+i%2,'#bce7ed');}ctx.globalAlpha=1;
  ctx.strokeStyle=violet?'#b091e526':'#72d6dd26';ctx.lineWidth=1;
  for(const x of [26,54,546,574]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,720);ctx.stroke();}
  if(mode==='playing'&&!reducedMotion){ctx.strokeStyle='#9bdae242';ctx.lineWidth=2;for(let i=0;i<10;i++){const x=i%2?557:43,y=(i*73+distance*.7)%720;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+22);ctx.stroke();}}
  // World-indexed tiles never reset or flip color when a row scrolls past.
  const first=Math.floor((distance-300)/84), last= Math.ceil((distance+800)/84);
  for(let row=last;row>=first;row--) {
    const near=row*84,far=near+84;
    ground(86,90,near,far,'#5bdfc7');ground(510,514,near,far,'#5bdfc7');
    for(let lane=0;lane<5;lane++) {
      const x=90+lane*84;
      const path=lane>0&&lane<4;
      const colors=path?(violet?['#7044c9','#8355df']:['#286aca','#3179df']):['#13866e','#18a17d'];
      ground(x,x+84,near-0.5,far+0.5,colors[((row+lane)%2+2)%2]);
      ground(x+2,x+82,near+2,near+3,'#b9f3e736');ground(x+1,x+2,near+2,far-2,'#081f5144');
      if(row%3===0 && lane===2){ground(x+34,x+50,near+30,near+33,'#b2d8ed55');ground(x+41,x+44,near+25,near+38,'#b2d8ed55');}
      // Sparse pixel grain travels with each tile, rather than flickering per frame.
      const seed=((row*13+lane*7)%17+17)%17;
      ground(x+12+seed,x+21+seed,near+22,near+28,path?(violet?'#a575ef':'#428aed'):'#29b78a');
      if(!path)ground(x+53,x+59,near+55,near+62,'#62d998');
    }
  }
  // Gaps reveal sky, not a dark painted tile; the soil lip makes edges legible.
  for(const o of state.objects.filter(o=>o.type==='gap')) {
    if(o.d-distance < -300 || o.d-distance>800)continue;
    ground(o.x-o.w/2,o.x+o.w/2,o.d-o.h/2,o.d+o.h/2,sky);
    ground(o.x-o.w/2,o.x+o.w/2,o.d+o.h/2,o.d+o.h/2+5,'#ffcf89');
    ground(o.x-o.w/2,o.x+o.w/2,o.d-o.h/2-5,o.d-o.h/2,'#ffcf89');
  }
  const finish=E.LEVELS[selected].length;
  if(finish-distance<800)for(let r=0;r<2;r++)for(let c=0;c<14;c++)ground(90+c*30,120+c*30,finish+r*24,finish+(r+1)*24,(r+c)%2?'#55788c':'#fff9dd');
  const sprites=state.objects.filter(o=>o.type!=='gap'&&!o.collected&&o.d>distance-300&&o.d<distance+800).map(o=>({d:o.d,o}));
  if(state.status!=='lost')sprites.push({d:distance,ball:true});sprites.sort((a,b)=>b.d-a.d);
  for(const sprite of sprites) {
    if(sprite.ball) {
      const p=project(state.x,distance,false),h=E.height(state);
      ctx.fillStyle='#34586b45';ctx.beginPath();ctx.ellipse(p.x+2+h*.09,p.y+4+h*.08,18-h/20,17-h/20,0,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.translate(p.x,p.y);ctx.scale(1+h/210,1+h/210);drawBall(distance/19);ctx.restore();
      if(h>0){ctx.strokeStyle='#d5ffad88';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,23+h/8,-Math.PI/2,-Math.PI/2+Math.PI*2*h/65);ctx.stroke();}
    } else if(sprite.o.type==='diamond') {
      const p=project(sprite.o.x,sprite.d);ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);poly([{x:0,y:-15},{x:11,y:0},{x:0,y:15},{x:-11,y:0}],'#00e1ee');poly([{x:0,y:-15},{x:0,y:15},{x:-11,y:0}],'#a6ffff');ctx.strokeStyle='#008fbf';ctx.lineWidth=2;ctx.stroke();ctx.restore();
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
  playMusic();updateEffects(dt);draw();drawEffects();
  // Canvas only: score, progress, controls and result text remain fully readable.
  const dim=E.darkness(state);
  if(dim>0)drawFlashlight(dim);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
