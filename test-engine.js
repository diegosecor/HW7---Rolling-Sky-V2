const assert = require('node:assert/strict');
const E = require('./engine.js');
function stateWith(object) { const s = E.create(); s.objects = object ? [object] : []; return s; }
let s = stateWith(); E.step(s,1/120,1); assert.ok(s.vx>0 && s.vx<550); assert.ok(s.x>300 && s.x<301);
for(let i=0;i<20;i++) E.step(s,1/120,1); const speed=s.vx, releaseX=s.x;
E.step(s,1/120,0); assert.ok(s.vx>0 && s.vx<speed); assert.ok(s.x>releaseX);
for(let i=0;i<100;i++) E.step(s,1/120,0); assert.equal(s.vx,0); assert.equal(s.status,'playing');
for(const direction of [-1,1]) { s=stateWith(); for(let i=0;i<200 && s.status==='playing';i++) E.step(s,1/120,direction); assert.equal(s.status,'lost'); assert.equal(s.deathType,'fall'); assert.ok(direction<0?s.x<90:s.x>510); const x=s.x;E.step(s,1/120,-direction);assert.equal(s.x,x); }
s=stateWith();E.step(s,1/120,1);const before=s.vx;E.step(s,1/120,-1);assert.ok(s.vx<before);
const a=stateWith(),b=stateWith();for(let i=0;i<12;i++)E.step(a,1/120,1);for(let i=0;i<6;i++)E.step(b,1/60,1);assert.ok(Math.abs(a.x-b.x)<1e-8);
s = stateWith({type:'block',x:300,d:3,w:56,h:62}); E.jump(s); E.step(s,1/120,0); assert.equal(s.status,'lost'); assert.equal(s.deathType,'crash');
s = stateWith({type:'gap',x:300,d:3,w:420,h:65}); E.step(s,1/120,0); assert.equal(s.status,'lost'); assert.equal(s.deathType,'fall');
s = stateWith({type:'gap',x:300,d:3,w:420,h:65}); s.jump=0.5; E.step(s,1/120,0); assert.equal(s.status,'playing');
s = stateWith({type:'diamond',x:300,d:3,w:20,h:20}); E.step(s,1/120,0); E.step(s,1/120,0); assert.equal(s.diamonds,1); assert.equal(E.score(s),100);
s = stateWith(); s.distance=E.LEVELS[0].length-1; E.step(s,1/120,0); assert.equal(s.status,'won'); assert.equal(s.distance,E.LEVELS[0].length);
s = stateWith(); E.jump(s); E.step(s,0.3,0); const remaining=s.jump; E.jump(s); assert.equal(s.jump,remaining); E.step(s,0.6,0); assert.equal(s.jump,0);
assert.notEqual(E.objectX({type:'moving',phase:0},0), E.objectX({type:'moving',phase:0},1));
assert.notDeepEqual(E.layout(0),E.layout(1));
for (let index=0;index<2;index++) { s=E.create(index); for(let i=0;i<20000 && s.status==='playing';i++){ const next=s.objects.find(o=>o.type!=='diamond' && o.d>s.distance-70); let direction=0; if(next){ if(next.type==='gap'&&next.w===420){ if(next.d-s.distance<65&&next.d>s.distance&&s.jump===0) E.jump(s); }else { const row=s.objects.filter(o=>o.d===next.d&&o.type!=='diamond'); const safe=[0,1,2,3,4].map(E.laneX).sort((a,b)=>Math.abs(a+E.roadOffset(s)-s.x)-Math.abs(b+E.roadOffset(s)-s.x)).find(x=>row.every(o=>Math.abs(x-E.objectX(o,s.time + Math.max(0,o.d-s.distance)/(E.LEVELS[index].speed+E.LEVELS[index].acceleration*s.distance/E.LEVELS[index].length)))>o.w/2+45)); if(safe!==undefined) direction=Math.abs(safe+E.roadOffset(s)-s.x)>3?Math.sign(safe+E.roadOffset(s)-s.x):0; } } E.step(s,1/120,direction); } assert.equal(s.status,'won',`Level ${index+1} must be traversable: ${s.reason} at ${s.distance}, x=${s.x}`); }
console.log('PASS: smooth steering, edge falls, block collisions, gaps, jumping, diamonds, finish, moving obstacles, and both complete courses.');
// Progression windows: exact endpoints, smooth ramps, and real shifted collisions.
for(const index of [0,1]){
  const s=E.create(index);s.objects=[];const length=E.LEVELS[index].length;
  for(const p of [0,0.25,0.5,1]){s.distance=p*length;assert.equal(E.darkness(s),0);}
  s.distance=0.3*length;assert.ok(Math.abs(E.darkness(s)-0.97)<1e-10);
  s.distance=0.275*length;const before=E.darkness(s);s.distance=0.475*length;assert.ok(Math.abs(E.darkness(s)-before)<1e-10);
  for(const p of [0,0.55,0.65,1]){s.distance=p*length;assert.equal(E.roadOffset(s),0);}
  s.distance=0.575*length;assert.ok(E.roadOffset(s)>30);
  s.distance=0.625*length;assert.ok(E.roadOffset(s)<-30);
  s.distance=0.55*length;const a=E.roadOffset(s);s.distance+=0.001;assert.ok(Math.abs(E.roadOffset(s)-a)<0.00001);
  s.distance=0.575*length;s.x=100;E.step(s,1/120,0);assert.equal(s.deathType,'fall');
  const hit=E.create(index);hit.distance=0.575*length;hit.x=300+E.roadOffset(hit);hit.objects=[{type:'block',x:300,d:hit.distance,w:56,h:62}];E.step(hit,1/120,0);assert.equal(hit.deathType,'crash');
  const gem=E.create(index);gem.distance=0.575*length;gem.x=300+E.roadOffset(gem);gem.objects=[{type:'diamond',x:300,d:gem.distance,w:20,h:20}];E.step(gem,1/120,0);assert.equal(gem.diamonds,1);
}
console.log('PASS: dimming and shifting windows, smooth transitions, shifted edge/collision/collectible rules.');

for(const index of [0,1]){const s=E.create(index);for(const p of [0.30,0.35,0.40,0.45]){s.distance=p*E.LEVELS[index].length;assert.ok(Math.abs(E.darkness(s)-0.97)<1e-9);}s.distance=0.49999*E.LEVELS[index].length;assert.ok(E.darkness(s)<1e-6);}
console.log('PASS: extended night plateau and smooth recovery at 50%.');
for(const index of [0,1]){
  const rows=[...new Set(E.layout(index).filter(o=>o.type!=='diamond').map(o=>o.d))];
  const previousRows=Math.ceil((E.LEVELS[index].length-500-900)/(index?440:410));
  assert.ok(rows.length>=previousRows*1.25);
  assert.ok(rows.at(-1)-rows.at(-2)<rows[1]-rows[0]);
}
console.log('PASS: at least 25% more hazard rows, with spacing tightening toward the finish.');
