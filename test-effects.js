// Headless integration checks for animation lifecycle and restart cleanup.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const E=require('./engine.js');
const nodes=new Map();
const context2d=new Proxy({}, {get:(_,key)=>key==='createRadialGradient'||key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
function node(id){if(!nodes.has(id))nodes.set(id,{textContent:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext:()=>context2d});return nodes.get(id);}
const sandbox={SkyEngine:E,Math,Number,String,Set,window:{matchMedia:()=>({matches:false}),addEventListener(){}},document:{getElementById:node,querySelector:node,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
run("start();state.status='lost';state.deathType='fall';beginDeath();");
assert.equal(run('mode'),'dying');const distance=run('state.distance');
run('updateEffects(0.5);draw();drawEffects();');assert.equal(run('mode'),'dying');assert.equal(run('state.distance'),distance);
assert.ok(run('Math.pow(1-deathElapsed/1.1,2)')<0.3);
run('updateEffects(0.7);');assert.equal(run('mode'),'lost');
run("start();state.status='lost';state.deathType='crash';beginDeath();updateEffects(0.1);draw();drawEffects();");
assert.ok(run('particles.length')>30);assert.ok(node('.game-section').style.transform.includes('translate'));
run('updateEffects(0.8);');assert.equal(run('mode'),'lost');assert.equal(node('.game-section').style.transform,'');
run('start();');assert.equal(run('mode'),'playing');assert.equal(run('particles.length'),0);assert.equal(run('state.deathType'),null);assert.equal(run('deathElapsed'),0);
run('collected();pause();');const life=run('particles[0].life');run('updateEffects(0.2);');assert.equal(run('particles[0].life'),life);
console.log('PASS: fall/crash lifecycle, frozen world on death, effects rendering, shake cleanup, restart, and paused particles.');
run('start();');
assert.equal(run('project(300,state.distance).y'),575);
assert.equal(run('project(90,state.distance).x'),90);
assert.ok(run('project(510,state.distance+600).scale')>0.7);
assert.ok(run('project(300,state.distance+600).y')<250);
run('state.objects=[];for(let i=0;i<200&&state.status==="playing";i++)E.step(state,1/120,1);beginDeath();updateEffects(0.3);draw();drawEffects();');
assert.equal(run('state.deathType'),'fall');assert.equal(run('mode'),'dying');
console.log('PASS: higher camera alignment and edge-fall effect integration.');
run('start();state.distance=E.LEVELS[0].length*0.575;');
assert.equal(run('project(300,state.distance).x'),run('300+E.roadOffset(state)'));
assert.equal(run('project(state.x,state.distance,false).x'),run('state.x'));
run('draw();updateHUD();');assert.ok(node('challenge').textContent.includes('CROSSWIND'));
run('state.distance=E.LEVELS[0].length*0.3;draw();updateHUD();');assert.ok(node('challenge').textContent.includes('NIGHTFALL'));
run('start();');assert.equal(run('E.darkness(state)'),0);assert.equal(run('E.roadOffset(state)'),0);
console.log('PASS: road projection alignment, independent player position, challenge labels, restart reset.');

run('state.distance=E.LEVELS[0].length*0.4;state.x=160;draw();drawFlashlight(E.darkness(state));updateHUD();');assert.ok(node('challenge').textContent.includes('NIGHTFALL'));
run('state.x=440;drawFlashlight(E.darkness(state));state.distance=E.LEVELS[0].length*0.5;updateHUD();');assert.ok(!node('challenge').textContent.includes('NIGHTFALL'));
console.log('PASS: flashlight rendering at both steering positions and updated night indicator.');
