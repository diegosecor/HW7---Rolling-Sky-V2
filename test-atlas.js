const assert=require('node:assert/strict'),fs=require('node:fs');
const Atlas=require('./atlas-art');
const journal=Array.from({length:8},(_,i)=>({cleared:i<2}));
for(const layout of Object.values(Atlas.LAYOUTS)){
  assert.equal(layout.nodes.length,8);
  for(const [x,y] of layout.nodes)assert.ok(x>40&&x<layout.width-40&&y>40&&y<layout.height-40,'every stop fits its responsive map');
  const route=Atlas.route(layout);assert.ok(route.length>100);
  assert.deepEqual([route[0].x,route[0].y],layout.nodes[0]);assert.deepEqual([route.at(-1).x,route.at(-1).y],layout.nodes[7]);
  assert.ok(route.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>0&&p.x<layout.width&&p.y>0&&p.y<layout.height));
  const stack=[],calls=[];
  const c={globalAlpha:1,fillStyle:'#000000',imageSmoothingEnabled:false,
    save(){stack.push([this.globalAlpha,this.fillStyle]);},restore(){assert.ok(stack.length);[this.globalAlpha,this.fillStyle]=stack.pop();},
    fillRect(x,y,w,h){assert.ok([x,y,w,h].every(Number.isFinite));assert.ok([x,y,w,h].every(Number.isInteger));assert.ok(w>0&&h>0);assert.match(this.fillStyle,/^#[0-9a-f]{6}([0-9a-f]{2})?$/i);calls.push([x,y,w,h,this.fillStyle,this.globalAlpha]);},
    translate(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));},scale(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));}
  };
  Atlas.paint(c,layout,journal);assert.equal(stack.length,0);assert.ok(calls.length>0,'the home map paints a visible scene');
  for(let selected=0;selected<8;selected++){Atlas.animate(c,layout,selected,3,false);assert.equal(stack.length,0);}
  calls.length=0;Atlas.animate(c,layout,0,0,true);const still=JSON.stringify(calls);calls.length=0;Atlas.animate(c,layout,0,100,true);assert.equal(JSON.stringify(calls),still,'reduced-motion atlas stays still');
}
const html=fs.readFileSync(__dirname+'/index.html','utf8');
assert.equal([...html.matchAll(/class="map-stop(?: active)?"/g)].length,8);
assert.ok(!html.includes('class="level-picker"')&&!html.includes('class="route-journal"'),'the old text-heavy home panels are removed');
assert.match(html,/<details class="home-help">/);assert.ok(!html.includes('<details class="home-help" open'));
console.log('PASS: eight connected map stops, wide/tall layouts, painted terrain, integer pixels, reduced motion and a compact default home.');
