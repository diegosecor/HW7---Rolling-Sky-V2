/* Original two-dimensional pixel artwork. The inherited engine owns all rules. */
(function(root){
  'use strict';
  const THEMES=[
    {name:'Luminous wetlands',top:'#152c46',bottom:'#336a78',water:'#244c65',ripple:'#82c7bd',glow:'#c4f3b1',petal:'#f5bbba',stone:['#28495e','#4b7887','#8bb6b2'],grass:['#234951','#39735f','#75a17c'],leaf:['#254b51','#42755c','#74a373','#bad297'],moss:'#a3c395'},
    {name:'Moonflower garden',top:'#24223f',bottom:'#725d80',water:'#3e3d64',ripple:'#ada1d0',glow:'#f7dfa5',petal:'#e7b7d6',stone:['#3f4263','#746e96','#bdadc2'],grass:['#2b4659','#456b70','#89a597'],leaf:['#294858','#4e6c75','#879c98','#c4cdb1'],moss:'#b8bfd0'},
    {name:"Amber orchard",top:"#342c3c",bottom:"#79645c",water:"#534451",ripple:"#e8c59a",glow:"#ffe3a2",petal:"#e5a383",stone:["#694f4c","#ad826e","#dfbc92"],grass:["#3c4944","#687c57","#b8ae76"],leaf:["#59474a","#a16e4e","#d8a56b","#eed29b"],moss:"#afb184"},
    {name:"Jade sanctuary",top:"#123b3f",bottom:"#3b7672",water:"#225654",ripple:"#a6d7b7",glow:"#e1efb2",petal:"#f3c3b7",stone:["#2c5753","#62958a","#b5ceac"],grass:["#254b3d","#43784f","#9cbb79"],leaf:["#234b46","#4c8262","#8ab984","#c8d7a4"],moss:"#b3cc8e"},
    {name:"Coral tide",top:"#243e57",bottom:"#617f8d",water:"#3b657b",ripple:"#badfda",glow:"#ffe7be",petal:"#f3b7b3",stone:["#725c73","#ac8c97","#e4c9bf"],grass:["#315c60","#5a8c82","#a6bca0"],leaf:["#514762","#987889","#cc9b9e","#edc5b2"],moss:"#b8c9b8"},
    {name:"Frostpetal pass",top:"#233851",bottom:"#6e94a6",water:"#3d617c",ripple:"#d3e8ed",glow:"#e6f8ed",petal:"#e8d6e7",stone:["#52677d","#91afbc","#dae6df"],grass:["#395965","#6f9599","#bed0c3"],leaf:["#3c5d6c","#779a9e","#afcac2","#e1e9d2"],moss:"#d6e4cb"},
    {name:"Ember lanterns",top:"#352b43",bottom:"#75535e",water:"#493b55",ripple:"#cba1af",glow:"#ffdb9b",petal:"#e6a59d",stone:["#514663","#8e7187","#ccacb1"],grass:["#354b4f","#5e7668","#aba985"],leaf:["#4f4559","#86656d","#b98d87","#e2bca4"],moss:"#b6b58e"},
    {name:"Starlit crown",top:"#1b2747",bottom:"#4b527e",water:"#303c68",ripple:"#b5bfdc",glow:"#f6dfa1",petal:"#d7bbd9",stone:["#3a476d","#7385a1","#c3d1d1"],grass:["#2b465c","#4d7180","#a5b8b0"],leaf:["#34485e","#677d96","#a5b6c0","#e0dbc1"],moss:"#c1c6ac"}
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
  // Broad shapes use two-pixel clusters; final engraving uses single-pixel threads.
  function micro(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
  function thread(c,x1,y1,x2,y2,color){
    let x=Math.round(x1),y=Math.round(y1);const endX=Math.round(x2),endY=Math.round(y2);
    const dx=Math.abs(endX-x),dy=-Math.abs(endY-y),sx=x<endX?1:-1,sy=y<endY?1:-1;let error=dx+dy;
    for(;;){micro(c,x,y,1,1,color);if(x===endX&&y===endY)break;const e=2*error;if(e>=dy){error+=dy;x+=sx;}if(e<=dx){error+=dx;y+=sy;}}
  }
  function fern(c,x,y,theme,seed=0){
    const bend=seed%2?1:-1;
    oval(c,x+1,y+10,8,4,theme.leaf[0]+'99');oval(c,x,y+9,6,3,theme.leaf[1]+'88');
    thread(c,x,y+10,x+bend*4,y-13,theme.leaf[1]);
    for(let n=0;n<6;n++){
      const py=y-10+n*4,width=3+Math.sin(n/5*Math.PI)*5,cx=x+bend*(3-n*.4);
      thread(c,cx,py,cx-width,py-5,theme.leaf[2]);thread(c,cx,py,cx+width,py-4,theme.leaf[2]);
      micro(c,cx-width,py-5,3,1,theme.leaf[3]);micro(c,cx+width-2,py-4,3,1,theme.leaf[3]);
    }
  }
  function oval(c,x,y,rx,ry,color){
    for(let row=-ry;row<=ry;row+=2){const width=Math.floor(rx*Math.sqrt(Math.max(0,1-row*row/(ry*ry)))/2)*2;if(width)rect(c,x-width,y+row,width*2,2,color);}
  }
  function spark(c,x,y,color,size=2){rect(c,x-size,y,size*3,size,color);rect(c,x,y-size,size,size*3,color);}
  function flower(c,x,y,theme,phase=0){
    thread(c,x,y+2,x+1,y+9,theme.leaf[1]);thread(c,x+1,y+6,x-5,y+3,theme.leaf[2]);micro(c,x-5,y+2,3,2,theme.leaf[2]);
    const shadow=blend(theme.petal,theme.leaf[0],.25);
    for(let n=0;n<6;n++){
      const a=n/6*Math.PI*2,px=x+Math.cos(a)*4,py=y+Math.sin(a)*3;
      oval(c,px,py,3,3,n<3?theme.petal:shadow);
      micro(c,px-1,py-2,2,1,'#f8e2d1');micro(c,px+2,py,1,2,shadow);
    }
    micro(c,x-2,y-2,5,4,'#d9ac6f');micro(c,x-1,y-2,3,2,'#ffebad');
    micro(c,x-2,y-2,1,1,'#fff7db');micro(c,x+2,y+1,1,1,'#a3815b');
  }
  function emblem(c,index){
    const t=THEMES[index];c.save();oval(c,16,16,14,14,t.top);oval(c,16,15,12,12,t.water);
    if(index===0){
      oval(c,16,22,11,5,t.leaf[1]);
      for(const [px,py] of [[8,16],[24,16],[11,12],[21,12],[16,9]]){oval(c,px,py,4,7,t.petal);thread(c,px,py-4,16,21,'#fae3d4');}
      micro(c,13,19,7,3,'#f4d895');
    }else if(index===1){
      oval(c,15,15,10,11,'#e7cdd8');oval(c,20,12,8,10,t.water);
      micro(c,8,17,1,4,'#fff0d6');spark(c,22,23,'#f5d99e',1);micro(c,24,7,1,1,'#fff0dc');
    }else if(index===2){
      const leaf=['000000010000000','000100111001000','000110111011000','010111111111010','011111111111110','001111111111100','000111111111000','011111111111110','001111111111100','000011111110000','000001111100000','000001111100000','000000111000000','000000010000000'];
      leaf.forEach((row,y)=>[...row].forEach((on,x)=>{if(on==='1')micro(c,x+9,y+7,1,1,y<7?'#dfb779':'#c28d65');}));
      thread(c,16,10,16,26,'#f2d29a');thread(c,16,18,11,14,'#f2d29a');thread(c,16,18,21,14,'#f2d29a');
    }else if(index===3){
      for(const [px,py] of [[10,6],[17,9],[23,5]]){
        micro(c,px,py,3,21,'#85b58b');micro(c,px,py,1,21,'#d0dba6');
        for(let n=0;n<3;n++){micro(c,px-1,py+4+n*6,5,1,'#355d53');thread(c,px+2,py+8+n*5,px+7,py+4+n*5,'#afcc99');}
      }
    }else if(index===4){
      for(let y=-8;y<=9;y++){
        const w=Math.round(10*Math.sqrt(Math.max(0,1-y*y/100)));
        micro(c,16-w,15+y,w*2,1,y<0?'#efcfc0':'#bb8e9c');
        if(y%3===0)micro(c,17-w,15+y,Math.max(1,w*2-2),1,'#dab2b2');
      }
      for(const dx of [-7,-3,2,6])thread(c,16,25,16+dx,8,'#f9e7d2');
      oval(c,16,23,4,3,'#f8e9cf');micro(c,14,21,2,1,'#ffffff');
    }else if(index===5){
      for(let i=0;i<6;i++){
        const a=i/6*Math.PI*2;
        thread(c,16,16,16+Math.cos(a)*11,16+Math.sin(a)*11,'#d9ecdf');
        for(const side of [-1,1])thread(c,16+Math.cos(a)*7,16+Math.sin(a)*7,16+Math.cos(a)*7+Math.cos(a+side*1.3)*4,16+Math.sin(a)*7+Math.sin(a+side*1.3)*4,'#b5d7d5');
      }
      micro(c,15,15,3,3,'#fff7df');
    }else if(index===6){
      micro(c,10,8,13,17,'#ae7580');micro(c,12,8,9,17,'#dfa387');
      for(const px of [13,16,19])thread(c,px,9,px,23,'#f5d9a4');
      micro(c,11,6,11,2,'#e3c291');micro(c,11,25,11,2,'#e3c291');micro(c,16,27,1,4,'#e5be9d');
      thread(c,11,6,16,3,'#bda59b');thread(c,16,3,21,6,'#bda59b');
    }else{
      const star=['0000001000000','0000011100000','0000011100000','0011111111100','1111111111111','0011111111100','0001111111000','0011111111100','0011101011100','0111000001110','0110000000110'];
      star.forEach((row,y)=>[...row].forEach((on,x)=>{if(on==='1')micro(c,10+x,10+y,1,1,y<5?'#fae9b8':'#d7b57b');}));
      micro(c,15,13,3,3,'#fff6dc');micro(c,6,8,1,1,'#e4dbbb');micro(c,25,24,1,1,'#e4dbbb');
    }
    c.restore();
  }
  function lily(c,x,y,theme,bloom){
    oval(c,x+2,y+4,20,12,'#112d4266');oval(c,x,y,19,11,theme.leaf[0]);oval(c,x-2,y-2,17,9,theme.leaf[1]);
    rect(c,x-12,y-6,14,2,theme.leaf[2]);rect(c,x-10,y-4,2,4,theme.leaf[2]);
    rect(c,x+2,y,14,2,theme.water);rect(c,x+4,y+2,10,2,theme.water);
    for(const [dx,dy] of [[-12,-3],[-8,-6],[-6,5],[8,-4]])thread(c,x,y-1,x+dx,y+dy,theme.leaf[2]+'aa');
    micro(c,x-12,y-5,5,1,theme.leaf[3]+'aa');
    if(bloom){
      rect(c,x-12,y-7,8,6,theme.petal);rect(c,x+4,y-7,8,6,theme.petal);
      rect(c,x-8,y-12,6,10,theme.petal);rect(c,x+2,y-12,6,10,theme.petal);
      rect(c,x-3,y-16,6,14,'#f5dbd1');rect(c,x-6,y-6,12,4,'#fff1d8');
      rect(c,x-2,y-7,4,4,'#edc87e');
      for(const dx of [-7,-3,3,7])thread(c,x+dx,y-10+Math.abs(dx)/2,x,y-4,'#fce6d3');micro(c,x-2,y-8,2,1,'#fff6d7');
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
    rect(c,-3,-5,6,2,'#f2e3c7');rect(c,14,-1,2,2,'#f1d0b0');
    for(let n=0;n<10;n++)micro(c,-10+n*2,-3+n%3*2,1,1,n%2?'#fff0d5':'#ad8a7d');
    thread(c,-18,-5,-23,-9+flick,'#edcda9');thread(c,-18,4,-23,8+flick,'#dcab91');
    micro(c,10,-3,1,1,'#fff8dc');micro(c,12,0,1,1,'#3f4e5c');c.restore();
  }
  function atmosphere(c,index,time,scroll,theme){
    for(let i=0;i<12;i++){
      const side=i%2,x=(side?540:14)+(i*17)%48+Math.sin(time*.5+i)*5,y=(i*71+scroll*.7+time*(index===5?8:3))%800-40;
      if(index===2){
        rect(c,x,y,6,4,theme.leaf[2]);rect(c,x+2,y-2,4,2,theme.petal);rect(c,x+2,y+2,2,6,theme.leaf[0]);
      }else if(index===3 && i<6){
        rect(c,x,y-20,4,50,theme.leaf[1]);for(let n=0;n<4;n++){rect(c,x-2,y-18+n*12,8,2,theme.leaf[3]);rect(c,x+4,y-12+n*12,8,2,theme.leaf[2]);}
      }else if(index===4){
        ring(c,x,y,3+i%3,theme.ripple+'66',2);
        if(i<4){rect(c,x,y+8,4,24,theme.leaf[1]);rect(c,x-6,y+16,16,4,theme.petal+'aa');rect(c,x-6,y+10,2,10,theme.petal+'aa');rect(c,x+8,y+12,2,8,theme.petal+'aa');}
      }else if(index===5){
        spark(c,x,y,'#edf0e6aa',2);if(i%3===0){rect(c,x-4,y-4,2,2,'#edf0e688');rect(c,x+4,y+4,2,2,'#edf0e688');}
      }else if(index===6 && i%3===0){
        rect(c,x-8,y-12,16,20,'#875968');rect(c,x-6,y-10,12,16,'#d69579');rect(c,x-2,y-10,4,16,'#f8d5a1');
        rect(c,x-6,y-14,12,2,'#d5af89');rect(c,x-6,y+8,12,2,'#d5af89');rect(c,x,y+10,2,6,'#b28c8d');
      }else if(index===7){
        spark(c,x,y,theme.glow+'aa',2);
        if(i%3===0)for(let n=1;n<7;n++)rect(c,x+n*4,y-n*2,2,2,theme.ripple+'44');
      }
    }
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
    if(index!==5&&index!==7){fish(c,43+Math.sin(t*.4)*5,(240+scroll*.55)%820-50,t,false);fish(c,555+Math.sin(t*.35+2)*5,(600+scroll*.45)%820-50,t+2,true);}
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
    for(const side of [0,1])for(let i=0;i<4;i++){
      const x=side?578-(i*11)%16:19+(i*13)%17,y=(i*193+scroll*.6+55)%920-80;
      fern(c,x,y,theme,i+index);
      if(i%2===0)flower(c,x+(side?-9:9),y+9,theme,i);
    }
    for(let i=0;i<15;i++){
      const x=i%2?547+(i*11)%32:12+(i*7)%43,y=(i*53+scroll)%760-20;
      thread(c,x,y,x+12,y-2,theme.ripple+'38');thread(c,x+12,y-2,x+19,y,theme.ripple+'25');
    }
    atmosphere(c,index,t,scroll,theme);
    c.restore();
  }
  function hash(row,lane,index){
    let value=Math.imul(row,374761393)^Math.imul(lane+11,668265263)^Math.imul(index+1,1274126177);
    value=Math.imul(value^(value>>>13),1274126177);return (value^(value>>>16))>>>0;
  }
  function stone(c,x,y,w,h,p,seed){
    rect(c,x,y,w,h,p[0]);
    const wear=(seed%5)/16;
    for(let band=0;band<4;band++){
      const shade=blend(p[2],p[1],Math.round((.20+band*.14+wear)*16)/16);
      rect(c,x+2,y+2+band*(h-4)/4,w-4,(h-4)/4,shade);
    }
    rect(c,x+4,y,Math.max(2,w-8),2,p[2]+'bb');rect(c,x,y+4,2,Math.max(2,h-8),p[2]+'66');
    rect(c,x+4,y+h-2,Math.max(2,w-8),2,p[0]+'bb');
    for(let n=0;n<Math.max(3,w*h/180);n++){
      const px=4+(seed+n*17)%Math.max(2,w-8),py=4+(seed*3+n*13)%Math.max(2,h-8);
      rect(c,x+px,y+py,n%4?2:4,2,n%2?p[2]+'44':p[0]+'44');
    }
    // Fine pores, worn chamfers and a few mineral seams finish the larger clusters.
    for(let n=0;n<Math.max(3,w*h/220);n++){
      const px=x+3+(seed+n*31)%Math.max(2,w-6),py=y+3+(seed+n*17)%Math.max(2,h-6);
      micro(c,px,py,1,1,n%2?p[2]+'55':p[0]+'44');
    }
    micro(c,x+4,y+1,Math.max(1,w-9),1,p[2]+'88');micro(c,x+w-2,y+5,1,Math.max(1,h-10),p[0]+'66');
    if(seed%7===0&&w>26&&h>24){
      const px=x+8+seed%Math.max(2,w-18),py=y+5;
      thread(c,px,py,px+4,py+8,p[2]+'55');thread(c,px+4,py+8,px-1,py+16,p[2]+'55');
      micro(c,px+5,py+9,2,1,p[0]+'55');
    }
    if(seed%4===0 && w>28 && h>24){
      rect(c,x+w-12,y+4,2,8,p[0]+'77');rect(c,x+w-16,y+12,6,2,p[0]+'77');
    }
  }
  function inlay(c,x,y,index,p,large=false){
    const dark=p[0]+'66',light=p[2]+'99',r=large?26:14;
    // Each garden has an engraved motif. These subdued marks never sparkle like gems.
    if(index===0||index===4){
      for(let i=0;i<5;i++){
        const a=(i-2)*.55,px=x+Math.sin(a)*r*.7,py=y-Math.cos(a)*r*.6;
        oval(c,px,py,large?7:4,large?11:6,dark);
        rect(c,px-2,py-(large?6:2),2,large?8:4,light);
      }
      rect(c,x-r*.7,y+r*.45,r*1.4,2,light);rect(c,x-r*.4,y+r*.6,r*.8,2,dark);
    }else if(index===1){
      for(let py=-r;py<=r;py+=2){
        const w=Math.sqrt(Math.max(0,r*r-py*py));
        rect(c,x-w,y+py,w*.65,2,dark);rect(c,x-w,y+py,2,2,light);
      }
      spark(c,x+r*.45,y-r*.45,light,2);
    }else if(index===2){
      for(let py=-r;py<=r;py+=2){
        const w=Math.max(2,(r-Math.abs(py))*.6);rect(c,x-w+py*.3,y+py,w*2,2,dark);
        rect(c,x+py*.3,y+py,2,2,light);
      }
    }else if(index===3){
      for(const dx of [-r*.5,0,r*.5]){
        rect(c,x+dx,y-r,4,r*2,dark);
        for(let n=-r+4;n<r;n+=8)rect(c,x+dx-2,y+n,8,2,light);
      }
    }else if(index===5||index===7){
      const rays=index===5?6:8;
      for(let i=0;i<rays;i++){
        const a=i/rays*Math.PI*2;
        for(let n=4;n<=r;n+=2){
          const px=x+Math.cos(a)*n,py=y+Math.sin(a)*n;rect(c,px,py,2,2,n%4?dark:light);
          if(n===r-6){rect(c,px+Math.cos(a+.8)*5,py+Math.sin(a+.8)*5,2,2,light);rect(c,px+Math.cos(a-.8)*5,py+Math.sin(a-.8)*5,2,2,light);}
        }
      }
    }else{
      ring(c,x,y,r*.7,dark,2);rect(c,x-r*.5,y-4,r,8,dark);
      rect(c,x-2,y-r,4,r*2,light);rect(c,x-8,y+r-2,16,2,dark);
    }
  }
  function tile(c,x,y,row,lane,index){
    const theme=THEMES[index],garden=lane===0||lane===4,p=garden?theme.grass:theme.stone;
    const seed=hash(row,lane,index),section=((Math.floor(row/5)+index)%5+5)%5;
    if(garden){
      rect(c,x,y,84,84,p[0]);
      for(let strip=0;strip<6;strip++)rect(c,x+2,y+strip*14,80,14,blend(p[1],p[0],strip/12));
      for(let n=0;n<7;n++){
        const px=10+(seed+n*29)%64,py=8+(seed*3+n*19)%68;
        oval(c,x+px,y+py,8+n%3*3,4+n%2*2,p[2]+'33');
      }
      for(let n=0;n<19;n++){
        const px=6+(seed+n*19)%72,py=8+(seed*3+n*13)%68;
        rect(c,x+px,y+py,2,4+n%2*2,n%3?p[0]:p[2]);rect(c,x+px-2,y+py+2,2,2,p[2]+'88');
      }
      if(seed%3===0){flower(c,x+18+seed%44,y+20+(seed>>>4)%42,theme,seed);flower(c,x+12+seed%44,y+28+(seed>>>4)%42,theme,seed+1);}
      if(seed%5===0){
        oval(c,x+30,y+44,9,5,theme.stone[0]);oval(c,x+28,y+42,7,4,theme.stone[1]);rect(c,x+24,y+40,6,2,theme.stone[2]);
        flower(c,x+45,y+40,theme,seed);
      }
      const edge=lane===0?x+76:x+2;
      for(let n=0;n<7;n++){rect(c,edge,y+n*12+2,6,8,p[0]);rect(c,edge,y+n*12,4,8,theme.stone[1]);rect(c,edge,y+n*12,4,2,theme.stone[2]);}
      if(seed%7===0)fern(c,x+24+(seed%32),y+26+(seed%24),theme,seed);
      if(seed%11===0){
        thread(c,x+55,y+57,x+65,y+53,theme.leaf[0]);oval(c,x+58,y+53,4,4,'#b6ac89');
        micro(c,x+57,y+52,2,1,'#ead5ab');micro(c,x+59,y+54,1,2,'#7f836e');micro(c,x+66,y+51,1,2,theme.leaf[3]);
      }
      if(index===5)for(let n=0;n<5;n++)rect(c,x+8+(seed+n*19)%62,y+6+(seed+n*23)%70,8,2,'#edf0df88');
      return;
    }
    rect(c,x,y,84,84,p[0]);
    // Five paving bonds form sections of a garden, instead of a repeated large square.
    if(section===0){
      const split=seed%2?48:32;
      stone(c,x+2,y+2,split-2,38,p,seed);stone(c,x+split+2,y+2,80-split,38,p,seed+7);
      stone(c,x+2,y+44,80,38,p,seed+19);
    }else if(section===1){
      stone(c,x+2,y+2,80,80,p,seed);
      if(seed%3!==0)inlay(c,x+42,y+42,index,p,false);
      for(let n=0;n<4;n++){rect(c,x+10+n*18,y+8,8,2,p[0]+'44');rect(c,x+10+n*18,y+74,8,2,p[2]+'66');}
    }else if(section===2){
      for(let r=0;r<3;r++)for(let col=0;col<3;col++){
        const dx=r%2?4:0,px=x+4+col*26,py=y+4+r*26;
        stone(c,px,py,24,24,p,seed+r*11+col*7);
        rect(c,px+4+dx,py+4,4,2,p[2]+'77');
      }
    }else if(section===3){
      for(let col=0;col<3;col++){
        const px=x+2+col*28,cut=(row+col)%2?24:52;
        stone(c,px,y+2,24,cut-2,p,seed+col*13);stone(c,px,y+cut+2,24,80-cut,p,seed+col*17+3);
      }
    }else{
      // Near-continuous worn marble with inset seams gives the eyes a quieter section.
      stone(c,x+2,y,80,84,p,seed);
      rect(c,x+8,y+6,2,70,p[2]+'55');rect(c,x+74,y+6,2,70,p[0]+'66');
      if(seed%4===0)inlay(c,x+42,y+42,index,p,false);
    }
    if(seed%3===0){
      const px=x+(seed%2?6:66),py=y+8+(seed>>>5)%52;
      oval(c,px+2,py+4,8,5,theme.leaf[1]+'aa');rect(c,px-2,py,6,2,theme.moss+'bb');rect(c,px+4,py+6,6,2,theme.leaf[2]+'bb');
    }
  }
  function frieze(c,x,y,row,index){
    const t=THEMES[index],phase=((row+index*3)%13+13)%13;
    if(phase===0){
      // A larger compass/flower medallion spans the three central lanes.
      oval(c,x+210,y+42,62,32,t.stone[0]+'33');
      ring(c,x+210,y+42,32,t.stone[2]+'55',2);
      ring(c,x+210,y+42,38,t.stone[0]+'44',2);
      inlay(c,x+210,y+42,index,t.stone,true);
      for(let i=0;i<32;i++){
        const a=i/32*Math.PI*2,px=x+210+Math.cos(a)*35,py=y+42+Math.sin(a)*35;
        micro(c,px,py,1,1,t.stone[2]+'aa');
        if(i%4===0)thread(c,x+210+Math.cos(a)*39,y+42+Math.sin(a)*39,x+210+Math.cos(a)*44,y+42+Math.sin(a)*44,t.stone[2]+'55');
      }
      for(const side of [-1,1])for(let n=0;n<5;n++)rect(c,x+210+side*(44+n*10),y+42+(n%2?2:-2),6,2,t.stone[2]+'66');
    }
    if(phase===6){
      for(let n=0;n<31;n++){
        rect(c,x+86+n*8,y+6,4,2,t.stone[0]+'88');
        rect(c,x+86+n*8,y+10,4,2,t.stone[2]+'88');
      }
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
    rect(c,-18,2+wing,19,4,p[1]);rect(c,-15,2+wing,13,2,'#698d97');rect(c,-16,6+wing,16,2,p[3]);
    for(let n=0;n<6;n++){rect(c,-21+n*4,-1+wing,2,4,p[3]);rect(c,-21+n*4,9,2,2,p[1]);}
    oval(c,13,-1,10,11,p[0]);oval(c,13,-3,9,9,p[3]);
    rect(c,7,-11,4,18,p[4]);rect(c,9,-12,4,2,p[3]);
    oval(c,17,-6,11,10,p[0]);oval(c,16,-8,10,8,p[5]);oval(c,15,-10,7,5,p[6]);
    rect(c,10,-13,10,2,p[7]);rect(c,11,-11,4,2,p[7]);
    rect(c,25,-7,10,7,'#935e4d');rect(c,25,-7,9,4,p[8]);rect(c,32,-5,4,2,'#f7d89b');
    const blink=Math.floor(t*3+phase)%23===0;
    rect(c,19,-11,4,blink?2:4,p[0]);if(!blink)rect(c,19,-11,2,2,'#fff8e4');
    rect(c,18,-4,5,2,p[6]);rect(c,28,-6,2,2,'#755247');
    for(let n=0;n<8;n++){
      const px=-21+n*3,py=-6+(n%2)*2+wing;
      thread(c,px,py,px+1,py+2,p[1]+'99');micro(c,px+1,py-1,1,1,p[3]);
    }
    thread(c,-13,-12+wing,-3,-14+wing,p[4]);thread(c,-21,7,-12,10,p[2]);
    micro(c,19,-10,1,1,blink?p[5]:'#ffffff');micro(c,28,-6,1,1,'#574b49');
    for(const py of [-20+step,19-step]){thread(c,-13,py,-17,py-2,p[8]);thread(c,-13,py,-17,py+2,p[8]);}
  }
  function orb(c,rotation,size=1){
    const p=['#24394b','#69594f','#956d50','#b88755','#d7a464','#ebbd7a','#f7d49b','#ffe9bd','#fff5db'];
    const radius=Math.max(1,Math.round(20*size));ring(c,0,0,radius+4,'#f4d69218',2);
    for(let py=-radius;py<=radius;py++)for(let px=-radius;px<=radius;px++){
      const x=px/radius,y=py/radius,r=x*x+y*y;if(r>1)continue;
      const z=Math.sqrt(Math.max(0,1-r)),light=Math.max(0,Math.min(1,.14+z*.65-(x+y)*.23));
      let color=p[0];
      if(r<.94){
        color=p[Math.max(1,Math.min(8,Math.floor(light*8)))];
        if(r>.82)color=x+y<0?'#d9c291':'#6f6559';
        else {
          const belt=Math.sin(y*3+rotation*.75+x*.65),edge=Math.abs(belt);
          if(edge<.13)color=light>.7?'#afc9ab':light>.5?'#739e8c':'#3c6968';
          else if(edge<.19)color=light>.65?'#f3dda4':'#a68b61';
          if(edge<.1&&Math.sin(x*19+rotation*2)>.92)color='#e8d6a4';
          if((px*7+py*11)%29===0&&light<.65)color=p[Math.max(1,Math.floor(light*7))];
          if(x<-.10&&x>-.60&&y<-.34&&y>-.60&&light>.75)color='#fff3d6';
        }
      }
      micro(c,px,py,1,1,color);
    }
    thread(c,-11*size,-10*size,-6*size,-13*size,'#fff9e6');
    micro(c,-12*size,-8*size,2,3,'#fff3d3');micro(c,-5*size,-14*size,3,1,'#fff9e6');
    thread(c,8*size,13*size,12*size,9*size,'#e7bd7e');
  }
  function ring(c,x,y,r,color,size=2){
    const count=Math.max(24,Math.ceil(r*2));for(let i=0;i<count;i++){const a=i/count*Math.PI*2;rect(c,x+Math.cos(a)*r,y+Math.sin(a)*r,size,size,color);}
  }
  function shadow(c,x,y,height){
    const k=Math.max(0,Math.min(1,height/65)),sx=x+4+k*8,sy=y+6+k*8;
    const shade=alpha=>'#081b2b'+Math.round(alpha*255).toString(16).padStart(2,'0');
    // The shadow stays on the road while the sphere rises away from it.
    oval(c,sx,sy,26-k*6,15-k*5,shade(.17-k*.04));
    oval(c,sx,sy,21-k*5,11-k*3,shade(.35-k*.10));
    oval(c,sx,sy,14-k*3,7-k*2,shade(.48-k*.12));
  }
  function gem(c,time,phase,reduced){
    const frame=reduced?0:Math.floor(time*5+phase)%4,p=['#244356','#3d788e','#65acb8','#8ed8d2','#c3f1df','#efffe9'];
    for(let y=-16;y<=16;y++){
      const width=Math.round((16-Math.abs(y))*.68);
      for(let x=-width;x<=width;x++){
        let color=Math.abs(x)===width?p[0]:y<0?(x<0?p[5]:p[3]):x<0?p[3]:p[1];
        if(Math.abs(x)<width*.25)color=y<0?p[4]:p[2];
        micro(c,x,y,1,1,color);
      }
    }
    thread(c,0,-14,-8,0,'#f2ffed');thread(c,-8,0,0,14,'#b7edda');
    thread(c,0,-14,3,0,'#c6f9e7');thread(c,3,0,0,14,'#6db9bd');
    thread(c,-8,0,8,0,'#e8fff0');micro(c,-3,-7,2,1,'#ffffff');
    if(frame===0)spark(c,-14,-10,'#eaffee',1);if(frame===2)spark(c,12,8,'#eaffee',1);
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
    for(let n=0;n<15;n++){
      const px=-19+(n*13+seed)%37,py=-21+(n*17+seed)%40;
      thread(c,px-2,py+1,px+3,py-2,n%2?p[2]:p[3]);
      micro(c,px,py,1,3,p[1]);micro(c,px+3,py-3,1,1,p[3]);
    }
    fern(c,-13,15,theme,seed);flower(c,9,-16,theme,seed+2);
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
    thread(c,-14,-17,-9,-22,p[4]+'bb');thread(c,-9,-22,2,-23,p[4]+'88');
    thread(c,-18,-4,-11,0,p[3]);thread(c,9,7,17,12,p[0]);
    for(let n=0;n<13;n++)micro(c,-17+n*3,-8+(n*7)%29,1,1,n%2?p[3]+'99':p[0]+'66');
    for(let n=0;n<5;n++)thread(c,-20+n*3,19,-19+n*3,13-n%2*3,theme.leaf[2]);
  }
  function peak(c,index,time,reduced){
    const theme=THEMES[index],p=index===0?['#354b63','#6e829e','#a6b8cd','#d4dce0','#fbf4e5']:index===1?['#3b3a59','#71648e','#a68fb2','#dcc9dc','#fff1e7']:[theme.stone[0],theme.stone[1],theme.leaf[2],theme.stone[2],'#fff1e7'];
    for(const [cx,cy,rx,ry] of [[-13,9,12,17],[13,8,12,20],[0,-5,14,26]]){
      for(let y=-ry;y<=ry;y+=2){
        const width=Math.max(0,Math.floor(rx*(1-Math.abs(y)/ry)/2)*2);
        if(!width)continue;
        rect(c,cx-width,cy+y,width*2,2,p[0]);
        if(width>2){rect(c,cx-width+2,cy+y,width-2,2,y<0?p[3]:p[2]);rect(c,cx,cy+y,width-2,2,y<0?p[2]:p[1]);}
      }
      rect(c,cx-2,cy-ry+6,2,12,p[4]);
      thread(c,cx,cy-ry+3,cx-Math.max(2,rx-3),cy,p[3]);
      thread(c,cx,cy-ry+4,cx+Math.max(2,rx-3),cy,p[0]+'88');
      thread(c,cx,cy+2,cx-2,cy+ry-4,p[2]);micro(c,cx-2,cy-ry+6,1,6,p[4]);
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
    micro(c,x+1,y+3,1,h-6,'#8aa8a15c');micro(c,x+w-2,y+3,1,h-6,'#0a2336');
    for(let n=8;n<w-8;n+=20){
      micro(c,x+n,y-4,1,4,'#685c50');micro(c,x+n+2,y-3,3,1,'#f6deb5');
      micro(c,x+n,y+h+1,1,3,'#685c50');
    }
    micro(c,x+3,y+3,w-6,1,'#0d2339');micro(c,x+3,y+h-3,w-6,1,theme.ripple+'44');
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
    c.save();c.translate(147,50);c.scale(2,2);duck(c,time,2,reduced);c.restore();
    for(let i=0;i<6;i++)flower(c,12+i*54,92-i%2*6,theme,i);
    spark(c,93,24,theme.glow,2);spark(c,205,72,theme.glow,2);c.restore();
  }
  const api={THEMES,rect,micro,thread,fern,emblem,oval,spark,flower,lily,frog,fish,backdrop,tile,frieze,panel,duck,orb,gem,vignette,ring,shadow,tree,rock,peak,gap,text,finish,medal};
  if(typeof module!=='undefined')module.exports=api;root.SkyPixelArt=api;
})(typeof window!=='undefined'?window:globalThis);
