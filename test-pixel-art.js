// Test the artwork's determinism and drawing contracts without native dependencies.
const assert=require('node:assert/strict');
const Art=require('./pixel-art');
function recorder(){
  const calls=[],stack=[];
  const c={fillStyle:'#000000',globalAlpha:1,
    fillRect(x,y,w,h){for(const n of [x,y,w,h]){assert.ok(Number.isFinite(n));assert.ok(n%2===0,'pixel rectangles stay on the two-unit grid');}assert.ok(w>0&&h>0);assert.match(this.fillStyle,/^#[0-9a-f]{6}([0-9a-f]{2})?$/i);assert.ok(this.globalAlpha>=0&&this.globalAlpha<=1);calls.push(['rect',x,y,w,h,this.fillStyle,this.globalAlpha]);},
    save(){stack.push([this.fillStyle,this.globalAlpha]);calls.push(['save']);},
    restore(){assert.ok(stack.length);[this.fillStyle,this.globalAlpha]=stack.pop();calls.push(['restore']);},
    translate(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));calls.push(['translate',x,y]);},
    scale(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));calls.push(['scale',x,y]);}
  };
  return {c,calls,stack};
}
function render(callback){const r=recorder();callback(r.c);assert.equal(r.stack.length,0,'balanced drawing state');return JSON.stringify(r.calls);}
assert.equal(Art.THEMES.length,2);assert.notEqual(Art.THEMES[0].stone[1],Art.THEMES[1].stone[1]);
for(let index=0;index<2;index++){
  const a=render(c=>Art.backdrop(c,index,1200,3.4,false));
  assert.equal(a,render(c=>Art.backdrop(c,index,1200,3.4,false)),'same world/time draws identical pixels');
  assert.notEqual(a,render(c=>Art.backdrop(c,index,1200,4.4,false)),'environment has animated elements');
  assert.equal(render(c=>Art.backdrop(c,index,0,0,true)),render(c=>Art.backdrop(c,index,9999,300,true)),'reduced-motion scenery remains still');
  for(let row=-3;row<=8;row++)for(let lane=0;lane<5;lane++)render(c=>Art.tile(c,90+lane*84,row*84,row,lane,index));
  render(c=>Art.vignette(c,index,3.4,false));render(c=>Art.vignette(c,index,3.4,true));
  for(const seed of [0,1,2,19]){render(c=>Art.tree(c,index,seed));render(c=>Art.rock(c,index,seed));}
  render(c=>Art.peak(c,index,3.4,false));render(c=>Art.finish(c,90,200,420,index));
  for(const width of [80,420]){
    render(c=>Art.gap(c,90,200,width,65,index,3.4,false));
    assert.equal(render(c=>Art.gap(c,90,200,width,65,index,0,true)),render(c=>Art.gap(c,90,200,width,65,index,99,true)),'reduced-motion gap ripples remain still');
  }
}
const variants=[];
for(let phase=0;phase<3;phase++){
  variants.push(render(c=>Art.duck(c,.3,phase,false)));
  assert.ok(render(c=>Art.duck(c,0,phase,false))!==render(c=>Art.duck(c,.16,phase,false)),'duck walking/wing poses animate');
  assert.equal(render(c=>Art.duck(c,0,phase,true)),render(c=>Art.duck(c,10,phase,true)),'reduced-motion duck pose stays still');
}
assert.equal(new Set(variants).size,3,'three distinct feather palettes');
assert.notEqual(render(c=>Art.orb(c,0)),render(c=>Art.orb(c,1)),'sphere surface mark rolls');
for(const h of [0,1,32,65]){render(c=>Art.shadow(c,300,575,h));render(c=>Art.orb(c,.5,1+h/240));}
render(c=>Art.medal(c));render(c=>Art.text(c,'+100',0,0,2,'#d6fff0'));
for(const t of [0,.2,.7,1,3]){render(c=>Art.gem(c,t,3,false));render(c=>Art.panel(c,-25,-27,50,54,'#d8f1ad','#79aa68','#3f6853'));}
const tile=recorder();Art.tile(tile.c,90,0,1,2,0);
assert.ok(new Set(tile.calls.filter(c=>c[0]==='rect').map(c=>c[5])).size>8,'tile shading uses a rich stepped palette');
console.log('PASS: two pixel palettes, consistent pixel grid, deterministic textures, animal variations/animation, reduced motion, shading and drawing-state balance.');
