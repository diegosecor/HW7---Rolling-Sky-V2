/* Original two-dimensional pixel artwork. The inherited engine owns all rules. */
(function(root){
  'use strict';
  const THEMES=[
    {name:'Luminous wetlands',top:'#152c46',bottom:'#336a78',water:'#244c65',ripple:'#82c7bd',glow:'#c4f3b1',petal:'#f5bbba',stone:['#28495e','#4b7887','#8bb6b2'],grass:['#234951','#39735f','#75a17c'],leaf:['#254b51','#42755c','#74a373','#bad297'],moss:'#a3c395'},
    {name:'Moonflower garden',top:'#24223f',bottom:'#725d80',water:'#3e3d64',ripple:'#ada1d0',glow:'#f7dfa5',petal:'#e7b7d6',stone:['#3f4263','#746e96','#bdadc2'],grass:['#2b4659','#456b70','#89a597'],leaf:['#294858','#4e6c75','#879c98','#c4cdb1'],moss:'#b8bfd0'}
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
    // Scalloped garden banks and overlapping reeds frame the water, outside the road.
    for(const side of [0,1]){
      for(let y=-8;y<728;y+=4){
        const width=14+Math.round(8*Math.sin((y-scroll*.6)*.016)+6*Math.sin((y-scroll*.6)*.043));
        const x=side?600-width:0;
        rect(c,side?x-4:0,y,width+4,4,theme.ripple+'22');
        rect(c,x,y,width,4,theme.leaf[0]);
        rect(c,side?x+4:0,y,Math.max(2,width-4),4,theme.leaf[1]+'99');
      }
      for(let i=0;i<7;i++){
        const x=side?590-(i*13)%20:10+(i*11)%20,y=(i*129+scroll*.6)%920-100;
        for(let n=0;n<5;n++){
          const px=x-8+n*4,py=y+(n%2)*6;
          rect(c,px,py-14-n%3*4,2,24+n%3*4,theme.leaf[2]);
          rect(c,px-4,py-8,6,2,theme.leaf[1]);rect(c,px+2,py-14,4,2,theme.leaf[3]);
          if(n%3===0){rect(c,px-2,py-26,4,8,'#ab9a72');rect(c,px,py-26,2,4,'#e2c9a2');}
        }
        if(i%2)flower(c,x+10,y-5,theme,i);
      }
    }
    // Submerged pebbles and reflected light vary both garden palettes.
    for(let i=0;i<15;i++){
      const x=i%2?526+(i*11)%60:12+(i*7)%60,y=(i*107+scroll*.7)%820-50;
      oval(c,x,y,7+i%3*2,4+i%2*2,theme.ripple+'18');
      rect(c,x-4,y-2,6,2,theme.ripple+'20');
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
    if(garden){
      rect(c,x,y,84,84,palette[0]);
      for(let strip=0;strip<7;strip++)rect(c,x+2,y+2+strip*12,80,12,blend(palette[1],palette[0],strip/12));
      // Uneven soft grass islands, fine blades and little flower clusters.
      for(let n=0;n<5;n++){
        const px=12+(seed+n*29)%62,py=10+(seed*3+n*19)%66;
        oval(c,x+px,y+py,9+n%3*3,5+n%2*2,palette[2]+'33');
      }
      for(let n=0;n<16;n++){
        const px=6+(seed+n*19)%72,py=8+(seed*3+n*13)%68;
        rect(c,x+px,y+py,2,4+n%2*2,n%3?palette[0]:palette[2]);
        rect(c,x+px-2,y+py+2,2,2,palette[2]+'99');
      }
      if((row+lane)%3===0){flower(c,x+20+seed%40,y+24+seed%28,theme,seed);flower(c,x+14+seed%40,y+32+seed%28,theme,seed+1);}
      // A scalloped stone edging separates garden strips from the central paving.
      const edge=lane===0?x+76:x+2;
      for(let n=0;n<7;n++){
        rect(c,edge,y+n*12+2,6,8,palette[0]);
        rect(c,edge,y+n*12,4,8,theme.stone[1]);rect(c,edge,y+n*12,4,2,theme.stone[2]);
      }
      return;
    }
    // Cut limestone slabs: shaded joints, broken corners and a soft mineral grain.
    rect(c,x,y,84,84,palette[0]);
    const shift=(seed%3-1)*.04;
    for(let strip=0;strip<10;strip++){
      const shade=blend(palette[2],palette[1],Math.max(0,Math.min(1,.25+strip*.052+shift)));
      rect(c,x+4,y+4+strip*8,76,8,shade);
    }
    rect(c,x+8,y+2,68,2,palette[2]);rect(c,x+4,y+6,2,70,palette[2]+'88');
    rect(c,x+8,y+80,68,2,palette[0]);rect(c,x+78,y+8,2,68,palette[0]);
    for(const [cx,cy] of [[2,2],[76,2],[2,76],[76,76]])rect(c,x+cx,y+cy,6,6,palette[0]);
    for(let n=0;n<18;n++){
      const px=10+(seed+n*23)%62,py=10+(seed*3+n*17)%62;
      rect(c,x+px,y+py,n%4?2:6,2,n%2?palette[2]+'44':palette[0]+'33');
    }
    if(seed%3===0){
      // Worn, inset lotus mosaics are floor ornament, with no sparkling collectible cue.
      const dark=palette[0]+'55',light=palette[2]+'77';
      // Curved petal outlines, deliberately lower contrast than gems or obstacles.
      for(let py=0;py<8;py+=2){
        const half=2+Math.min(py,8-py);
        rect(c,x+42-half,y+30+py,half*2,2,dark);
        rect(c,x+26+py,y+40+py,4,2,dark);rect(c,x+54-py,y+40+py,4,2,dark);
      }
      rect(c,x+40,y+32,2,10,light);rect(c,x+32,y+42,2,4,light);rect(c,x+50,y+42,2,4,light);
      rect(c,x+34,y+50,16,2,dark);rect(c,x+38,y+52,8,2,light);
    }else if(seed%4===0){
      rect(c,x+52,y+6,14,2,palette[0]+'88');rect(c,x+50,y+8,4,12,palette[0]+'77');rect(c,x+46,y+20,6,2,palette[0]+'77');
    }
    if(seed%2===0){
      rect(c,x+6,y+70,12,4,theme.leaf[1]);rect(c,x+4,y+66,6,6,theme.moss+'bb');rect(c,x+12,y+72,10,2,theme.leaf[2]);
    }
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
  function orb(c,rotation,size=1){
    const palette=['#24364b','#694e51','#9b624c','#c78650','#e9ad60','#f5ce83','#ffe5ad','#fff4d5'];
    // Warm rim, dark contour, curved inlays and a fixed light make the player distinct.
    const radius=Math.max(1,Math.round(10*size));
    ring(c,0,0,(radius+2)*2,'#f4d69220',2);
    for(let py=-radius;py<=radius;py++)for(let px=-radius;px<=radius;px++){
      const x=px*10/radius,y=py*10/radius,r=x*x+y*y;if(r>100)continue;
      let color=palette[0];
      if(r<90){
        const z=Math.sqrt(100-r)/10,light=Math.max(0,Math.min(1,.14+z*.56-(x+y)*.035));
        color=palette[Math.min(7,1+Math.floor(light*6))];
        if(r>76)color=(x+y<0)?'#e4c389':'#775c56';
        else {
          const seam=Math.sin(y*.29+rotation*.8+x*.06);
          if(Math.abs(seam)<.18)color=light>.65?'#c3d7b5':'#527e79';
          if((x*3+y)%7===0&&light<.65)color=palette[Math.max(1,Math.floor(light*6))];
        }
      }
      rect(c,px*2,py*2,2,2,color);
    }
    rect(c,-10*size,-12*size,6,4,'#fff9e3');rect(c,-12*size,-8*size,2,4,'#fff0c7');
    rect(c,-6*size,-14*size,4,2,'#fff9e3');rect(c,10*size,10*size,4,2,'#e9b979');rect(c,12*size,6*size,2,4,'#dca669');
  }
  function ring(c,x,y,r,color,size=2){
    const count=Math.max(24,Math.ceil(r*2));for(let i=0;i<count;i++){const a=i/count*Math.PI*2;rect(c,x+Math.cos(a)*r,y+Math.sin(a)*r,size,size,color);}
  }
  function shadow(c,x,y,height){
    const k=Math.min(1,height/65);
    oval(c,x+3+k*6,y+4+k*5,23-k*5,20-k*5,'#102c4620');
    oval(c,x+3+k*6,y+4+k*5,18-k*4,15-k*4,'#112b4940');
    oval(c,x+2+k*5,y+3+k*4,12-k*3,10-k*3,'#152b494d');
  }
  function gem(c,time,phase,reduced){
    const frame=reduced?0:Math.floor(time*4+phase)%4;
    const p=['#193c54','#39798c','#54a6b5','#8de1dc','#c8fff1','#f3fff4'];
    for(let y=-8;y<=8;y++){
      const width=Math.max(0,Math.round((8-Math.abs(y))*.72));
      for(let x=-width;x<=width;x++){
        let color=Math.abs(x)===width?p[0]:x<0?(y<0?p[5]:p[3]):y<0?p[4]:p[2];
        if(x===0&&y<4&&y>-6)color=p[4];
        rect(c,x*2,y*2,2,2,color);
      }
    }
    rect(c,-4,-8,4,2,p[5]);rect(c,0,12,2,2,p[4]);
    if(frame===0)spark(c,-14,-10,'#ddffef',2);if(frame===2)spark(c,12,8,'#ddffef',2);
  }
  function tree(c,index,seed=0){
    const theme=THEMES[index],p=theme.leaf;
    oval(c,2,3,27,28,p[0]);
    for(const [x,y,rx,ry] of [[-11,-11,15,14],[12,-10,13,16],[-12,10,13,15],[10,11,15,14],[0,-1,18,20]]){
      oval(c,x,y,rx,ry,p[1]);oval(c,x-2,y-3,rx-3,ry-4,p[2]);
      rect(c,x-6,y-ry+4,8,2,p[3]);rect(c,x-rx+4,y-4,4,2,p[3]);
    }
    for(let i=0;i<21;i++){
      const x=-21+(i*17+seed*3)%42,y=-23+(i*23+seed)%46;
      rect(c,x,y,i%3?2:4,2,i%2?p[0]+'88':p[3]+'99');
    }
    flower(c,-11,-11,theme,seed);flower(c,12,8,theme,seed+1);
    rect(c,-3,-6,2,13,p[1]);rect(c,-2,2,10,2,p[1]);
  }
  function rock(c,index,seed=0){
    const theme=THEMES[index],p=['#2d4850','#557a70','#7b9e85','#b0c7a0','#d7ddba'];
    for(let y=-27;y<=27;y+=2){
      const w=Math.floor(25*Math.sqrt(Math.max(0,1-y*y/(28*28)))/2)*2;
      if(!w)continue;
      rect(c,-w,y,w*2,2,p[0]);
      if(w>4){const shade=y< -12?p[3]:y<8?p[2]:p[1];rect(c,-w+2,y,w*2-4,2,shade);}
      if(y>-20&&y<18&&w>10)rect(c,-w+4,y,4,2,p[4]+'55');
    }
    // Offset fractures and mineral facets give every stone a less boxy silhouette.
    for(let i=0;i<6;i++){rect(c,-3+i*2,-20+i*6,2,6,p[0]);if(i%2===0)rect(c,-2+i*2,-20+i*6,6,2,p[1]);}
    rect(c,-16,1,8,2,p[3]);rect(c,7,-13,6,2,p[4]);rect(c,12,-11,2,8,p[3]);
    oval(c,-14,17,11,6,theme.leaf[1]);rect(c,-21,13,8,2,theme.moss);
    if(seed%2===0)flower(c,-17,12,theme,seed);
  }
  function peak(c,index,time,reduced){
    const p=index?['#3b3a59','#71648e','#a68fb2','#dcc9dc','#fff1e7']:['#354b63','#6e829e','#a6b8cd','#d4dce0','#fbf4e5'];
    for(const [cx,cy,rx,ry] of [[-13,9,12,17],[13,8,12,20],[0,-5,14,26]]){
      for(let y=-ry;y<=ry;y+=2){
        const width=Math.max(0,Math.floor(rx*(1-Math.abs(y)/ry)/2)*2);
        if(!width)continue;
        rect(c,cx-width,cy+y,width*2,2,p[0]);
        if(width>2){rect(c,cx-width+2,cy+y,width-2,2,y<0?p[3]:p[2]);rect(c,cx,cy+y,width-2,2,y<0?p[2]:p[1]);}
      }
      rect(c,cx-2,cy-ry+6,2,12,p[4]);
    }
    if(reduced||Math.floor(time*2)%5===0)spark(c,-5,-20,p[4],2);
  }
  function gap(c,x,y,w,h,index,time,reduced){
    const theme=THEMES[index];rect(c,x,y,w,h,'#13283f');
    for(let band=0;band<6;band++)rect(c,x+2,y+band*h/6+2,w-4,h/6,blend('#162d47',theme.water,band/10));
    rect(c,x,y,w,2,'#0d2337');rect(c,x,y,2,h,'#0d2337');
    for(const lip of [y-4,y+h]){
      rect(c,x,lip,w,4,'#947b5d');
      for(let n=0;n<w;n+=16)rect(c,x+n,lip,8,2,'#f0d19a');
    }
    rect(c,x+4,y+4,w-8,2,theme.ripple+'44');rect(c,x+5,y+h-6,w-10,2,theme.ripple+'22');
    const t=reduced?0:Math.floor(time*2);
    for(let i=0;i<Math.floor(w/40);i++){const px=x+12+(i*43+t*4)%Math.max(2,w-26),py=y+10+(i*17)%Math.max(2,h-20);rect(c,px,py,10,2,theme.ripple+'30');}
  }
  const GLYPHS={
    '+':['00000','00100','00100','11111','00100','00100','00000'],
    '0':['01110','11011','11011','11011','11011','11011','01110'],
    '1':['00100','01100','00100','00100','00100','00100','01110'],
    'F':['11111','10000','10000','11110','10000','10000','10000'],
    'I':['11111','00100','00100','00100','00100','00100','11111'],
    'N':['10001','11001','11001','10101','10011','10011','10001'],
    'S':['01111','10000','10000','01110','00001','00001','11110'],
    'H':['10001','10001','10001','11111','10001','10001','10001']
  };
  function text(c,value,x,y,size,color){
    for(let i=0;i<value.length;i++){const glyph=GLYPHS[value[i]];if(!glyph)continue;glyph.forEach((row,r)=>[...row].forEach((on,col)=>{if(on==='1')rect(c,x+(i*6+col)*size,y+r*size,size,size,color);}));}
  }
  function finish(c,x,y,w,index){
    const theme=THEMES[index];rect(c,x+126,y-28,168,22,'#1a3448');rect(c,x+130,y-26,160,2,'#cccca3');
    text(c,'FINISH',x+(w-70)/2,y-22,2,'#eee2b4');
    for(const sx of [x+12,x+w-12]){flower(c,sx,y-8,theme,0);flower(c,sx,y+16,theme,1);}
  }
  function medal(c){
    for(const side of [-1,1])for(let i=0;i<5;i++){
      const x=side*(14+Math.round(4*Math.sin(i/4*Math.PI))),y=-12+i*6;
      oval(c,x,y,4,3,'#87a582');rect(c,x-2,y-2,4,2,'#c4d6a0');
    }
    rect(c,-8,14,6,8,'#779b96');rect(c,2,14,6,8,'#a588a8');
    oval(c,0,0,14,16,'#775a49');oval(c,0,-2,12,14,'#e2b467');oval(c,-1,-4,10,11,'#f2d497');
    const star=['000010000','000010000','000111000','111111111','011111110','001111100','001101100','011000110','010000010'];
    star.forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit==='1')rect(c,-8+x*2,-12+y*2,2,2,'#fff0c8');}));
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
  const api={THEMES,rect,oval,spark,flower,backdrop,tile,panel,duck,orb,gem,vignette,ring,shadow,tree,rock,peak,gap,text,finish,medal};
  if(typeof module!=='undefined')module.exports=api;root.SkyPixelArt=api;
})(typeof window!=='undefined'?window:globalThis);
