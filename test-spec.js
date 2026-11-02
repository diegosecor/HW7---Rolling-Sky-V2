// Acceptance-oriented checks for the 2D handoff; no third-party dependencies.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('./engine');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length);
const nodes=new Map(),listeners={},classes=new Set(),saved=new Map();
const gradient=()=>({addColorStop(){}});
const context=new Proxy({}, {get:(_,key)=>key==='createRadialGradient'||key==='createLinearGradient'?gradient:()=>{},set:()=>true});
function node(id,dataset={}){
 if(!nodes.has(id))nodes.set(id,{dataset,textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext:()=>context,setPointerCapture(){}});
 return nodes.get(id);
}
const routes=E.LEVELS.map((_,i)=>node('route'+i,{level:String(i)}));
const controls=['ArrowLeft','ArrowUp','ArrowRight'].map(key=>node(key,{key}));
const body={classList:{add:(...n)=>n.forEach(x=>classes.add(x)),remove:(...n)=>n.forEach(x=>classes.delete(x)),toggle(n,on){if(on)classes.add(n);else classes.delete(n);}}};
const sandbox={SkyEngine:E,SkyPixelArt:require('./pixel-art'),Math,Number,String,Set,window:{matchMedia:()=>({matches:false}),addEventListener:(name,fn)=>listeners[name]=fn},document:{body,hidden:false,getElementById:id=>{assert.ok(ids.includes(id));return node(id);},querySelector:node,querySelectorAll:q=>q==='[data-level]'?routes:q==='[data-key]'?controls:[],addEventListener:(name,fn)=>listeners[name]=fn},localStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v))},requestAnimationFrame(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
assert.equal(run('mode'),'ready');assert.match(html,/<h2 id="screen-title">Rolling Sky/);
assert.ok(html.includes('← → to steer. ↑ to jump.'));
node('start').onclick();assert.equal(run('mode'),'playing');assert.ok(classes.has('playing'));
for(let index=0;index<E.LEVELS.length;index++){
 routes[index].onclick();assert.equal(run('selected'),index);node('start').onclick();
 for(const distance of [0,1500,E.LEVELS[index].length*.575,E.LEVELS[index].length]){
  run(`state.distance=${distance};`);
  for(const ahead of [-100,0,100,400,800]){
   assert.equal(run(`project(90,state.distance+${ahead}).scale`),1,'all objects retain world scale');
   assert.ok(Math.abs(run(`project(174,state.distance+${ahead}).x-project(90,state.distance+${ahead}).x`)-84)<1e-9,'tile width never shrinks');
   assert.ok(Math.abs(run(`project(300,state.distance+${ahead}).y`)-(575-ahead))<1e-9,'linear top-down scrolling');
  }
  run('draw();drawEffects();');
 }
}
run('start();state.objects=[];');
listeners.keydown({key:'ArrowRight',repeat:false,preventDefault(){}});run('last=1000;frame(1033);');assert.ok(run('state.x')>300);
listeners.keyup({key:'ArrowRight'});assert.equal(run("keys.has('ArrowRight')"),false);
listeners.keydown({key:'ArrowUp',repeat:false,preventDefault(){}});assert.ok(run('state.jump')>0);
node('pause').onclick();assert.equal(run('mode'),'paused');const pausedDistance=run('state.distance');run('frame(1100);');assert.equal(run('state.distance'),pausedDistance);
node('start').onclick();assert.equal(run('mode'),'playing');
run('start();state.objects=[{type:"block",x:300,d:3,w:56,h:62}];last=2000;frame(2033);');
assert.equal(run('state.status'),'lost');assert.equal(run('mode'),'dying');const stopped=run('state.distance');run('frame(2100);');assert.equal(run('state.distance'),stopped,'collision stops the simulation immediately');
run('updateEffects(1);');assert.equal(run('mode'),'lost');
listeners.keydown({key:' ',repeat:false,preventDefault(){}});assert.equal(run('mode'),'playing');assert.equal(run('state.distance'),0);
run('state.objects=[];state.distance=E.LEVELS[selected].length-1;last=3000;frame(3033);');assert.equal(run('mode'),'won');assert.ok(classes.has('victory'));assert.ok(saved.has('skyline-best'));
assert.match(node('next-route').textContent,/PLAY LEVEL 01 · AZURE ASCENT/,'clearing the last garden first points to an unfinished garden');
run('start();state.objects=[{type:"diamond",x:300,d:3,w:20,h:20}];E.step(state,1/120,0,collected);updateHUD();');
assert.equal(run('state.diamonds'),1);assert.equal(node('diamonds').textContent,'1◇');assert.ok(Number(node('score').textContent)>=100);
let notes=0;sandbox.captureNote=()=>notes++;
run('beep=captureNote;muted=false;state.time=1;playMusic();playMusic();');assert.equal(notes,1,'music schedules once per beat');
run('state.time=1.5;playMusic();pause();state.time=2;playMusic();');assert.equal(notes,2,'music pauses with the game');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g))assert.ok(fs.existsSync(__dirname+'/'+match[1]),'local asset exists: '+match[1]);
// Campaign navigation and persistence use the same actions as the visible buttons.
routes[0].onclick();node('start').onclick();
run("state.objects=[];state.distance=E.LEVELS[0].length-1;last=4000;frame(4033);");
assert.equal(run('mode'),'won');assert.equal(node('next-route').hidden,false);
assert.equal(node('screen-label').textContent,'LEVEL 01 / 08 COMPLETE');
assert.match(node('next-route').textContent,/PLAY LEVEL 02 · VIOLET VELOCITY/);
assert.equal(node('current-level').textContent,'LEVEL 01 / 08');
listeners.keydown({key:'Enter',repeat:false,preventDefault(){}});assert.equal(run('selected'),1);assert.equal(run('mode'),'playing');
assert.equal(node('current-level').textContent,'LEVEL 02 / 08');
assert.match(node('banner-title').textContent,/LEVEL 02 · VIOLET VELOCITY/);
node('pause').onclick();node('back-map').onclick();assert.equal(run('mode'),'ready');assert.equal(run('state.distance'),0);assert.ok(!classes.has('playing'));
for(let index=0;index<E.LEVELS.length;index++){
 routes[index].onclick();node('start').onclick();
 run(`state.objects=[];state.distance=E.LEVELS[${index}].length-1;last=5000;frame(5033);`);
 assert.equal(run('mode'),'won');
}
assert.equal(node('campaign-count').textContent,'8 / 8 CLEARED');
assert.equal(node('screen-label').textContent,'ALL EIGHT GARDENS CLEARED');assert.equal(node('next-route').hidden,true);
const stored=JSON.parse(saved.get('sky-garden-journal'));assert.equal(stored.length,8);assert.ok(stored.every(j=>j.cleared));
const reopened={...sandbox};vm.createContext(reopened);vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),reopened);
assert.equal(node('campaign-count').textContent,'8 / 8 CLEARED','atlas stamps survive a reload');
saved.set('sky-garden-journal',JSON.stringify(stored.map((j,i)=>({...j,cleared:i<2}))));
const continued={...sandbox};vm.createContext(continued);vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),continued);
assert.equal(vm.runInContext('selected',continued),2,'reload selects the first unfinished garden');
assert.equal(node('current-level').textContent,'LEVEL 03 / 08');
assert.match(node('journey-next').textContent,/NEXT 04 · JADE SANCTUARY/);
saved.set('sky-garden-journal','{invalid');
const recovered={...sandbox};vm.createContext(recovered);vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),recovered);
assert.equal(node('campaign-count').textContent,'0 / 8 CLEARED','damaged storage does not break the game');
// A portable preview must initialize from its own embedded scripts, after the UI.
const portable=fs.readFileSync(__dirname+'/JUGAR.html','utf8');
assert.ok(!/<(?:script|link)\b[^>]*(?:src|href)="(?!#)/i.test(portable),'portable game needs no sibling script or stylesheet');
const embedded=[...portable.matchAll(/<script data-source="([^"]+)">([\s\S]*?)<\/script>/g)];
assert.deepEqual(embedded.map(s=>s[1]),['engine.js','pixel-art.js','game.js']);
assert.ok(portable.indexOf('<script data-source=')>portable.indexOf('id="start"'),'portable scripts run after the game interface exists');
const standalone={...sandbox,matchMedia:()=>({matches:false}),addEventListener(){}};
standalone.window=standalone;vm.createContext(standalone);
for(const script of embedded)vm.runInContext(script[2],standalone,{filename:script[1]});
vm.runInContext('draw();start();E.jump(state);last=1000;frame(1033);',standalone);
assert.equal(vm.runInContext('mode',standalone),'playing');assert.ok(vm.runInContext('E.height(state)',standalone)>0);
console.log('PASS: single-file JUGAR.html embeds its assets, initializes, starts, renders and jumps.');
console.log('PASS: eight-garden atlas, named next route/Enter shortcut, current-level cues, continue on reload, return to map, per-route records, all-gardens victory and storage recovery.');
console.log('PASS: orthographic 2D view, consistent tile scale, all eight routes, start/input/pause/restart, immediate collision stop, victory, gems, best score and music.');
