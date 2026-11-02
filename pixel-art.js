/* Original two-dimensional pixel artwork. The inherited engine owns all rules. */
(function(root){
  'use strict';
  const THEMES=[
    {name:'Luminous wetlands',top:'#152c46',bottom:'#336a78',water:'#244c65',ripple:'#82c7bd',glow:'#c4f3b1',petal:'#f5bbba',stone:['#244a64','#32667c','#528e99'],grass:['#234951','#39735f','#75a17c'],leaf:['#254b51','#42755c','#74a373','#bad297'],moss:'#a3c395'},
    {name:'Moonflower garden',top:'#24223f',bottom:'#725d80',water:'#3e3d64',ripple:'#ada1d0',glow:'#f7dfa5',petal:'#e7b7d6',stone:['#3d426c','#62618b','#9a8aa9'],grass:['#2b4659','#456b70','#89a597'],leaf:['#294858','#4e6c75','#879c98','#c4cdb1'],moss:'#b8bfd0'}
  ];
  const colors=new Map();
  function blend(a,b,t){
    const key=a+b+t;if(colors.has(key))return colors.get(key);
    const ca=parseInt(a.slice(1),16),cb=parseInt(b.slice(1),16);
    const channel=shift=>Math.round(((ca>>shift)&255)*(1-t)+((cb>>shift)&255)*t);
    const color='#'+[channel(16),channel(8),channel(0)].map(v=>v.toString(16).padStart(2,'0')).join('');
    colors.set(key,color);return color;
  }
  function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,Math.max(2,Math.round(w/2)*2),Math.max(2,Math.round(h/2)*2));}
  function oval(c,x,y,rx,ry,color){
    for(let row=-ry;row<=ry;row+=2){const width=Math.floor(rx*Math.sqrt(Math.max(0,1-row*row/(ry*ry)))/2)*2;if(width)rect(c,x-width,y+row,width*2,2,color);}
  }
  function spark(c,x,y,color,size=2){rect(c,x-size,y,size*3,size,color);rect(c,x,y-size,size,size*3,color);}
  function flower(c,x,y,theme,phase=0){
    rect(c,x,y+2,2,6,theme.leaf[1]);rect(c,x-4,y+4,4,2,theme.leaf[2]);
    const petals=theme.petal;rect(c,x-4,y-2,10,4,petals);rect(c,x-2,y-4,6,8,petals);rect(c,x,y-2,2,2,phase%2?'#fff1c8':'#ffe4a1');
  }
  function lily(c,x,y,theme,bloom){
    oval(c,x+2,y+4,20,12,'#112d4266');oval(c,x,y,19,11,theme.leaf[0]);oval(c,x-2,y-2,17,9,theme.leaf[1]);
    rect(c,x-12,y-6,14,2,theme.leaf[2]);rect(c,x-10,y-4,2,4,theme.leaf[2]);
    rect(c,x+2,y,14,2,theme.water);rect(c,x+4,y+2,10,2,theme.water);
    if(bloom){
      rect(c,x-12,y-7,8,6,theme.petal);rect(c,x+4,y-7,8,6,theme.petal);
      rect(c,x-8,y-12,6,10,theme.petal);rect(c,x+2,y-12,6,10,theme.petal);
      rect(c,x-3,y-16,6,14,'#f5dbd1');rect(c,x-6,y-6,12,4,'#fff1d8');
      rect(c,x-2,y-7,4,4,'#edc87e');
    }
  }
  function frog(c,x,y,theme,frame){
    const green=['#20484b','#507d5c','#9aba7d','#d6dfa7'];
    rect(c,x-14,y+6,8,6,green[0]);rect(c,x+8,y+6,8,6,green[0]);
    oval(c,x,y,13,12,green[0]);oval(c,x,y-2,11,10,green[1]);oval(c,x-1,y-1,7,7,green[2]);
    rect(c,x-10,y-11,7,7,green[2]);rect(c,x+5,y-11,7,7,green[2]);
    rect(c,x-8,y-10,4,4,green[3]);rect(c,x+6,y-10,4,4,green[3]);
    rect(c,x-6,y-9,2,frame?2:4,'#233e47');rect(c,x+7,y-9,2,frame?2:4,'#233e47');
    rect(c,x-4,y+3,10,2,green[0]);rect(c,x-7,y-1,2,2,'#e0b4a5');rect(c,x+7,y-1,2,2,'#e0b4a5');
  }
  function fish(c,x,y,time,reverse){
    c.save();c.translate(Math.round(x/2)*2,Math.round(y/2)*2);if(reverse)c.scale(-1,1);
    const flick=Math.floor(time*4)%3-1;
    rect(c,-21,-5+flick*2,8,4,'#c39787');rect(c,-21,3+flick*2,8,4,'#c39787');
    rect(c,-15,-2,6,4,'#e6c6a7');oval(c,1,2,14,7,'#152e4566');oval(c,1,0,14,7,'#5c7d85');
    oval(c,1,-1,12,5,'#d1d7c6');rect(c,-5,-5,6,4,'#d28e7c');rect(c,5,-3,8,4,'#cf8d7d');
    rect(c,-7,3,5,3,'#b5c9bf');rect(c,2,-7,6,2,'#ddd4bd');rect(c,9,-3,2,2,'#283b4c');
    rect(c,-3,-5,6,2,'#f2e3c7');rect(c,14,-1,2,2,'#f1d0b0');c.restore();
  }
  function backdrop(c,index,distance,time,reduced){
    const theme=THEMES[index],t=reduced?0:time,scroll=reduced?0:distance*.09;
    c.save();
    for(let y=0;y<720;y+=12)rect(c,0,y,600,12,blend(theme.top,theme.bottom,Math.round(y/720*24)/24));
    // Small blocks bridge gradient bands, like ordered dithering in painted pixel art.
    for(let i=0;i<150;i++){
      const x=(i*149+19)%600,y=(i*83+23)%720;
      rect(c,x,y,2,2,blend(theme.top,theme.bottom,Math.max(0,Math.min(1,Math.round(y/720*24)/24+(i%2?.04:-.04)))));
    }
    for(let i=0;i<19;i++){
      const x=i%2?540+(i*7)%50:10+(i*13)%50,y=(i*91+scroll)%800-40;
      const width=10+(i%3)*6;
      rect(c,x,y,width,2,theme.ripple+'30');rect(c,x+4,y+4,width+8,2,theme.ripple+'18');
    }
    // Garden-bank fragments stay outside the playable tiles and never affect collisions.
    for(const side of [0,1])for(let i=0;i<8;i++){
      const x=side?590-(i*13)%34:10+(i*11)%34,y=(i*121+scroll*.6)%920-100;
      oval(c,x,y,22,27,theme.leaf[0]);oval(c,x-3,y-5,17,21,theme.leaf[1]);
      for(let n=0;n<7;n++)rect(c,x-13+(n*11)%24,y-17+(n*13)%30,4,2,theme.leaf[2]);
      if(i%2)flower(c,x-4,y-13,theme,i);
    }
    for(let i=0;i<7;i++){
      const x=i%2?550+(i*9)%36:24+(i*11)%38,y=(110+i*119+scroll)%920-80;
      lily(c,x,y,theme,i%3===0);
      if(i===2||i===5)frog(c,x,y-3,theme,Math.floor(t*2+i)%16===0);
    }
    fish(c,43+Math.sin(t*.4)*5,(240+scroll*.55)%820-50,t,false);
    fish(c,555+Math.sin(t*.35+2)*5,(600+scroll*.45)%820-50,t+2,true);
    for(let i=0;i<20;i++){
      const side=i%2,x=(side?550:24)+Math.sin(t*.45+i*2)*20,y=(i*67+scroll*.3)%720;
      c.globalAlpha=.28+(reduced?.2:.45*(.5+.5*Math.sin(t*1.4+i)));
      spark(c,x,y,theme.glow,2);
    }
    c.globalAlpha=1;
    // Butterflies use three discrete wing poses instead of continuously blurred motion.
    for(let i=0;i<4;i++){
      const x=(i%2?555:35)+Math.sin(t*.6+i)*13,y=(i*173+67+scroll*.4)%720;
      const frame=reduced?1:Math.floor(t*5+i)%3,width=[4,8,6][frame];
      rect(c,x-width-2,y-3,width,6,theme.petal);rect(c,x+2,y-3,width,6,theme.petal);
      rect(c,x-width,y-1,2,2,'#fff3d5');rect(c,x+4,y-1,2,2,'#fff3d5');rect(c,x,y-4,2,8,'#213747');
    }
    c.restore();
  }
  function tile(c,x,y,row,lane,index){
    const theme=THEMES[index],garden=lane===0||lane===4,palette=garden?theme.grass:theme.stone;
    const seed=((row*37+lane*13)%97+97)%97;
    for(let strip=0;strip<10;strip++){
      const f=strip/9,t=strip<5?f*.9:.45+(f-.5)*.25;
      const shade=blend(palette[2],palette[0],Math.round(t*12)/12);
      rect(c,x+2,y+2+strip*8,80,8,shade);
    }
    rect(c,x+4,y+2,76,2,palette[2]);rect(c,x+2,y+4,2,72,palette[1]);
    rect(c,x+4,y+80,76,2,palette[0]);rect(c,x+80,y+4,2,76,palette[0]);
    // Chipped corners, mineral flecks and moss remain attached to their world tile.
    rect(c,x+2,y+2,4,4,'#192c44');rect(c,x+78,y+78,4,4,'#192c44');
    for(let n=0;n<10;n++){
      const px=8+(seed+n*23)%64,py=8+(seed*3+n*17)%66;
      rect(c,x+px,y+py,n%3?2:4,2,n%2?palette[2]+'55':palette[0]+'66');
    }
    if(garden){
      for(let n=0;n<7;n++){const px=8+(seed+n*19)%66,py=10+(seed*3+n*13)%61;rect(c,x+px,y+py,2,6,palette[0]);rect(c,x+px-2,y+py+2,2,2,palette[2]);}
      if((row+lane)%3===0)flower(c,x+18+seed%44,y+22+seed%32,theme,seed);
      if((row+lane)%4===0){rect(c,x+48,y+57,12,8,theme.leaf[0]);rect(c,x+50,y+55,8,4,theme.petal);rect(c,x+51,y+54,2,2,'#fff0d6');}
    }else if((row+lane)%5===0){
      const hue=index?'#c8b6da':'#8fb8c0';
      rect(c,x+34,y+32,16,2,hue+'66');rect(c,x+30,y+36,24,2,hue+'55');
      rect(c,x+32,y+40,20,2,hue+'55');rect(c,x+36,y+44,12,2,hue+'44');
    }
    if(seed%3===0){rect(c,x+6,y+70,12,4,theme.leaf[1]);rect(c,x+4,y+66,6,6,theme.moss);rect(c,x+12,y+72,10,2,theme.leaf[2]);}
    if(seed%4===0){rect(c,x+54,y+8,14,2,palette[0]);rect(c,x+52,y+10,4,10,palette[0]);rect(c,x+48,y+20,6,2,palette[0]);}
  }
  function panel(c,x,y,w,h,top,front,side){
    rect(c,x+4,y,w-8,h,side);rect(c,x,y+4,w,h-8,side);
    for(let band=0;band<5;band++)rect(c,x+2,y+4+band*(h-8)/5,w-4,(h-8)/5,blend(top,front,band/4));
    rect(c,x+6,y+2,w-12,2,top);rect(c,x+2,y+6,2,h-12,top+'88');
    rect(c,x+4,y+h-4,w-8,2,side);
    for(let n=0;n<Math.floor(w*h/65);n++){
      const px=4+(n*13+Math.abs(x))%Math.max(4,w-10),py=6+(n*17+Math.abs(y))%Math.max(4,h-12);
      rect(c,x+px,y+py,n%3?2:4,2,n%2?top+'77':side+'66');
    }
  }
  function duck(c,time,phase,reduced){
    const t=reduced?0:time,pose=reduced?1:Math.floor(t*7+phase)%4;
    const palettes=[
      ['#272e3d','#879b96','#c6d0b7','#f0e8c7','#fff9df','#316357','#58967c','#9fc3a1','#eeb96c'],
      ['#2d2c42','#858b96','#c0c7cc','#e5e8d9','#fffae5','#5a697f','#8c9baf','#c4d3ce','#e9b689'],
      ['#302e3e','#9d806c','#c6a17a','#e9c49a','#ffe9bf','#4d666b','#7b9b91','#bed3b4','#efb578']
    ];
    const p=palettes[((Math.floor(phase)%3)+3)%3],step=[-2,0,2,0][pose];
    // Webbed feet, tail, feathered body, wing panels, neck ring and rounded head.
    rect(c,-12,-20+step,10,6,'#b67450');rect(c,-12,15-step,10,6,'#b67450');
    rect(c,-14,-20+step,4,2,p[8]);rect(c,-14,19-step,4,2,p[8]);
    rect(c,-29,-8,8,16,p[0]);rect(c,-33,-4,6,8,p[2]);rect(c,-30,-6,4,4,p[4]);
    oval(c,-5,2,24,16,p[0]);oval(c,-6,0,23,15,p[1]);oval(c,-7,-2,21,13,p[2]);
    oval(c,-7,-4,18,10,p[3]);rect(c,-18,-10,14,2,p[4]);
    const wing=pose===0?-2:pose===2?2:0;
    oval(c,-7,-7+wing,15,7,p[1]);oval(c,-9,-9+wing,13,5,p[2]);
    rect(c,-20,-8+wing,18,2,p[4]);rect(c,-19,-4+wing,18,2,p[3]);
    rect(c,-18,2+wing,19,4,p[0]);rect(c,-15,2+wing,13,2,'#597c94');rect(c,-16,6+wing,16,2,p[4]);
    for(let n=0;n<6;n++){rect(c,-21+n*4,-1+wing,2,4,p[3]);rect(c,-21+n*4,9,2,2,p[1]);}
    oval(c,13,-1,10,11,p[0]);oval(c,13,-3,9,9,p[3]);
    rect(c,7,-11,4,18,p[4]);rect(c,9,-12,4,2,p[3]);
    oval(c,17,-6,11,10,p[0]);oval(c,16,-8,10,8,p[5]);oval(c,15,-10,7,5,p[6]);
    rect(c,10,-13,10,2,p[7]);rect(c,11,-11,4,2,p[7]);
    rect(c,25,-7,10,7,'#935e4d');rect(c,25,-7,9,4,p[8]);rect(c,32,-5,4,2,'#f7d89b');
    const blink=Math.floor(t*3+phase)%23===0;
    rect(c,19,-11,4,blink?2:4,p[0]);if(!blink)rect(c,19,-11,2,2,'#fff8e4');
    rect(c,18,-4,5,2,p[6]);rect(c,28,-6,2,2,'#755247');
  }
  function orb(c,rotation){
    const palette=['#314557','#4c6556','#87915e','#c3bd70','#e5d28c','#f5e6ad','#fff1d0','#fffae8'];
    for(let y=-9;y<=9;y++)for(let x=-9;x<=9;x++){
      const r=x*x+y*y;if(r>81)continue;
      if(r>68){rect(c,x*2,y*2,2,2,palette[0]);continue;}
      const z=Math.sqrt(81-r)/9,light=Math.max(0,Math.min(1,.5+(-x-y)*.029+z*.35));
      let color=palette[Math.min(7,1+Math.floor(light*6))];
      const band=Math.sin(y*.22+Math.sin(rotation)*1.5+x*.08);
      if(Math.abs(band)<.14 && r<62)color='#809d91';
      if((x+y)%4===0 && light<.65)color=palette[Math.max(1,Math.floor(light*6))];
      rect(c,x*2,y*2,2,2,color);
    }
    rect(c,-8,-12,6,4,'#fffce9');rect(c,-10,-10,2,4,'#fffce9');rect(c,-5,-12,2,2,'#ffffff');
  }
  function gem(c,time,phase,reduced){
    const frame=reduced?0:Math.floor(time*4+phase)%4,colors=['#204858','#428b9d','#78c5cc','#acf3e8','#e5fff0'];
    for(let row=-7;row<=7;row++){
      const w=Math.max(0,Math.floor((7-Math.abs(row))*.7));
      for(let x=-w;x<=w;x++)rect(c,x*2,row*2,2,2,colors[x<0?3:row<0?4:2]);
    }
    rect(c,0,-14,2,2,colors[1]);rect(c,0,14,2,2,colors[1]);
    if(frame===0)spark(c,-12,-10,'#dcffef',2);if(frame===2)spark(c,10,8,'#dcffef',2);
  }
  function vignette(c,index,time,reduced){
    const theme=THEMES[index];c.save();
    for(let y=0;y<104;y+=4)rect(c,0,y,300,4,blend(theme.top,theme.water,y/104));
    for(let i=0;i<12;i++){const x=i*29%300,y=12+(i*23)%80;rect(c,x,y,16,2,theme.ripple+'44');}
    lily(c,38,70,theme,true);lily(c,257,33,theme,false);frog(c,258,29,theme,false);
    c.save();c.translate(147,50);c.scale(1.6,1.6);duck(c,time,2,reduced);c.restore();
    for(let i=0;i<6;i++)flower(c,12+i*54,92-i%2*6,theme,i);
    spark(c,93,24,theme.glow,2);spark(c,205,72,theme.glow,2);c.restore();
  }
  const api={THEMES,rect,oval,spark,flower,backdrop,tile,panel,duck,orb,gem,vignette};
  if(typeof module!=='undefined')module.exports=api;root.SkyPixelArt=api;
})(typeof window!=='undefined'?window:globalThis);
