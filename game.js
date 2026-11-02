'use strict';
const E = SkyEngine, $ = id => document.getElementById(id), canvas = $('game'), ctx = canvas.getContext('2d');
let selected = 0, state = E.create(), mode = 'ready', last = 0, accumulator = 0, muted = true, audio, best = 0;
const keys = new Set();
const PLAYER_Y=575;
// One real pixel per two world units; CSS enlarges the artwork without smoothing.
canvas.width=300;canvas.height=360;ctx.setTransform(.5,0,0,.5,0,0);ctx.imageSmoothingEnabled=false;
const guideCanvas=$('field-guide'),guideCtx=guideCanvas?.getContext('2d');
const portrait=$('hero-portrait'),portraitCtx=portrait?.getContext('2d');
let musicStep=-1;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let artClock=0;
let deathElapsed = 0, particles = [], trail = [], trailClock = 0, collectPulse = 0;
function resetEffects() { artClock=0; musicStep=-1; deathElapsed=0; particles=[]; trail=[]; trailClock=0; collectPulse=0; document.querySelector('.game-section').style.transform=''; }
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
  if(!reducedMotion)artClock+=dt;
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
  for(const p of trail){ctx.globalAlpha=p.life/0.24*0.22;SkyPixelArt.oval(ctx,p.x,p.y,12*p.life/0.24,10*p.life/0.24,'#f5d59b');}
  for(const p of particles){ctx.globalAlpha=Math.min(1,p.life/p.max);pixel(p.x,p.y,5,5,p.color);}
  ctx.globalAlpha=1;
  if(mode==='dying'&&state.deathType==='crash'){
    const t=deathElapsed;ctx.globalAlpha=Math.max(0,1-t*2);SkyPixelArt.ring(ctx,state.x,PLAYER_Y,20+t*180,'#efbd91',4);ctx.globalAlpha=1;
    if(!reducedMotion){ctx.fillStyle=`rgba(255,137,93,${Math.max(0,0.2-t)})`;ctx.fillRect(0,0,600,720);}
  }
  if(mode==='dying'&&state.deathType==='fall'){
    const t=Math.min(1,deathElapsed/1.1),scale=Math.pow(1-t,2);ctx.translate(state.x + Math.sign(state.vx || 0) * Math.min(45, Math.abs(state.vx || 0)*0.12) * t,PLAYER_Y+85*t*t);ctx.scale(scale,scale);ctx.globalAlpha=1-t*0.75;drawBall(deathElapsed*14);
  }
  if(collectPulse>0){ctx.globalAlpha=collectPulse/0.3;SkyPixelArt.text(ctx,'+100',state.x-24,500-(0.3-collectPulse)*80,2,'#d6fff0');}
  ctx.restore();
}
function drawBall(rotation,size=1) { SkyPixelArt.orb(ctx,rotation,size); }

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
  if(mode==='won'){beep(880,0.35);burst(300,350,24,'#f4d39c');burst(300,350,18,'#a0d5c1');burst(300,350,18,'#e6b7c8');}
}
function updateHUD() { const fraction=state.distance/E.LEVELS[selected].length; $('challenge').textContent = fraction>=0.25&&fraction<0.50 ? '☾ NIGHTFALL · FOLLOW YOUR LIGHT' : fraction>=0.55&&fraction<0.65 ? '↔ CROSSWIND · FOLLOW THE ROAD' : '● LIVE FROM THE SKY'; const p = Math.floor(state.distance / E.LEVELS[selected].length * 100); $('score').textContent = String(E.score(state)).padStart(5, '0'); $('percent').textContent = p + '%'; $('diamonds').textContent=state.diamonds+'◇'; $('progress').style.width = p + '%'; document.querySelector('.progress').setAttribute('aria-valuenow', p); $('speed').textContent = (1 + E.LEVELS[selected].acceleration / E.LEVELS[selected].speed * p / 100).toFixed(1) + '×'; }
$('start').onclick = () => mode === 'paused' ? pause() : start(); $('pause').onclick = pause;
$('sound').onclick = () => { muted = !muted; $('sound').textContent = muted ? 'Audio off' : 'Audio on'; $('sound').setAttribute('aria-pressed', !muted); beep(650, 0.1); };
document.querySelectorAll('[data-level]').forEach(button => button.onclick = () => { resetEffects(); selected = Number(button.dataset.level); state = E.create(selected);if(document.body?.dataset)document.body.dataset.world=String(selected); mode = 'ready';document.body?.classList.remove('playing','victory'); keys.clear(); document.querySelectorAll('[data-level]').forEach(b => b.classList.toggle('active', b === button)); $('route-name').textContent = E.LEVELS[selected].name.toUpperCase(); overlay('READY WHEN YOU ARE', 'The sky is yours.', 'Steer around obstacles. Jump the gaps. Follow the diamonds to the finish.', 'Let’s roll ↗', '← → TO STEER · ↑ TO JUMP'); updateHUD(); });
function press(key, repeat = false) { if (key === 'ArrowUp' && !repeat && mode === 'playing') { E.jump(state); beep(330, 0.1); } if (key.toLowerCase() === 'p' && !repeat) pause(); if (key === ' ' && !repeat && ['lost', 'won'].includes(mode)) start(); keys.add(key); }
window.addEventListener('keydown', e => { if (['playing','lost','won'].includes(mode) && ['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) e.preventDefault(); press(e.key, e.repeat); });
window.addEventListener('keyup', e => keys.delete(e.key));
window.addEventListener('blur', () => { keys.clear(); if (mode === 'playing') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') pause(); });
document.querySelectorAll('[data-key]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); b.setPointerCapture(e.pointerId); press(b.dataset.key); }; b.onpointerup = b.onpointercancel = b.onlostpointercapture = () => keys.delete(b.dataset.key); });
// Orthographic top-down projection: equal-size tiles, no vanishing point.
function project(x,d,onRoad=true){
  return {x:x+(onRoad?E.roadOffset(state):0),y:PLAYER_Y-(d-state.distance),scale:1};
}
function ground(x1,x2,d1,d2,color) {
  const p=project(x1,d2);SkyPixelArt.rect(ctx,p.x,p.y,x2-x1,d2-d1,color);
}
function pixel(x,y,w,h,color) { SkyPixelArt.rect(ctx,x,y,w,h,color); }
function scenery(o) {
  const p=project(E.objectX(o,state.time),o.d); if(p.y>800 || p.y< -100)return;
  ctx.save(); ctx.translate(Math.round(p.x/2)*2,Math.round(p.y/2)*2); ctx.scale(p.scale,p.scale);
  SkyPixelArt.oval(ctx,3,5,29,27,'#142e423d');
  const kind=o.type==='moving'?'duck':o.skin;
  // Small amber corner marks show the inherited hazard footprints.
  for(const x of [-30,26])for(const y of [-33,29]){pixel(x,y,6,2,'#f1c697');pixel(x,y,2,5,'#f1c697');}
  if(kind==='tree')SkyPixelArt.tree(ctx,selected,Math.floor(o.phase||0));
  else if(kind==='mountain')SkyPixelArt.peak(ctx,selected,artClock,reducedMotion);
  else if(kind==='duck') {
    const direction=Math.cos(state.time*1.6+o.phase)>=0?1:-1;
    ctx.scale(direction,1);SkyPixelArt.duck(ctx,state.time,o.phase,reducedMotion);
  } else SkyPixelArt.rock(ctx,selected,Math.floor(o.phase||0));
  ctx.restore();
}
function draw() {
  const distance=state.distance,theme=SkyPixelArt.THEMES[selected];
  SkyPixelArt.backdrop(ctx,selected,distance,artClock,reducedMotion);
  if(guideCtx && mode!=='playing' && mode!=='dying')SkyPixelArt.vignette(guideCtx,selected,artClock,reducedMotion);
  if(portraitCtx && mode!=='playing' && mode!=='dying'){
    portraitCtx.clearRect(0,0,48,48);portraitCtx.save();portraitCtx.translate(24,24);
    if(mode==='won')SkyPixelArt.medal(portraitCtx);else SkyPixelArt.orb(portraitCtx,reducedMotion?0:artClock*.4);
    portraitCtx.restore();
  }
  // World-indexed tiles never reset or flip color when a row scrolls past.
  const first=Math.floor((distance-300)/84), last= Math.ceil((distance+800)/84);
  for(let row=last;row>=first;row--) {
    const near=row*84,far=near+84;
    ground(84,90,near,far,theme.leaf[0]);ground(510,516,near,far,theme.leaf[0]);
    for(let lane=0;lane<5;lane++) {
      const x=90+lane*84;
      const path=lane>0&&lane<4;
      const colors=path?theme.stone:theme.grass;
      ground(x,x+84,near,far,colors[((row+lane)%2+2)%2]);
      const p=project(x,far);SkyPixelArt.tile(ctx,p.x,p.y,row,lane,selected);
    }
  }
  // Recessed water, striped lips and strong contrast distinguish lethal gaps.
  for(const o of state.objects.filter(o=>o.type==='gap')) {
    if(o.d-distance < -300 || o.d-distance>800)continue;
    const p=project(o.x-o.w/2,o.d+o.h/2);
    SkyPixelArt.gap(ctx,p.x,p.y,o.w,o.h,selected,artClock,reducedMotion);
  }
  const finish=E.LEVELS[selected].length;
  if(finish-distance<800){
    for(let r=0;r<2;r++)for(let c=0;c<14;c++)ground(90+c*30,120+c*30,finish+r*24,finish+(r+1)*24,(r+c)%2?theme.stone[0]:'#eee0b5');
    const p=project(90,finish+48);SkyPixelArt.finish(ctx,p.x,p.y,420,selected);
  }
  const sprites=state.objects.filter(o=>o.type!=='gap'&&!o.collected&&o.d>distance-300&&o.d<distance+800).map(o=>({d:o.d,o}));
  if(state.status!=='lost')sprites.push({d:distance,ball:true});sprites.sort((a,b)=>b.d-a.d);
  for(const sprite of sprites) {
    if(sprite.ball) {
      const p=project(state.x,distance,false),h=E.height(state);
      SkyPixelArt.shadow(ctx,p.x,p.y,h);
      // Repaint the enlarged jump sprite on the pixel grid instead of stretching it.
      ctx.save();ctx.translate(Math.round(p.x/2)*2,Math.round(p.y/2)*2);drawBall(distance/19,1+h/240);ctx.restore();
      if(h>0){ctx.globalAlpha=.16+h/240;SkyPixelArt.ring(ctx,p.x,p.y,25+h/9,'#f2dcaa',2);ctx.globalAlpha=1;}
    } else if(sprite.o.type==='diamond') {
      const p=project(sprite.o.x,sprite.d);ctx.save();ctx.translate(Math.round(p.x/2)*2,Math.round(p.y/2)*2);SkyPixelArt.gem(ctx,state.time,sprite.d*.01,reducedMotion);ctx.restore();
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
