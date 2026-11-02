/* A painted top-down garden atlas. This layer has no gameplay or unlocking rules. */
(function(root){
  'use strict';
  const P=typeof module!=='undefined'?require('./pixel-art'):root.SkyPixelArt;
  const LAYOUTS={
    wide:{width:960,height:540,nodes:[[110,340],[290,403],[440,270],[630,400],[840,310],[760,130],[535,95],[280,140]]},
    tall:{width:600,height:820,nodes:[[125,690],[410,710],[460,490],[190,520],[130,310],[410,300],[420,115],[160,110]]}
  };
  const DIGITS=[
    ['111','101','101','101','111'],['010','110','010','010','111'],
    ['111','001','111','100','111'],['111','001','111','001','111'],
    ['101','101','111','001','001'],['111','100','111','001','111'],
    ['111','100','111','101','111'],['111','001','010','010','010'],
    ['111','101','111','101','111'],['111','101','111','001','111']
  ];
  const mix=(a,b,f)=>{
    const c=parseInt(a.slice(1),16),d=parseInt(b.slice(1),16);
    return '#'+[16,8,0].map(s=>Math.round(((c>>s)&255)*(1-f)+((d>>s)&255)*f).toString(16).padStart(2,'0')).join('');
  };
  function digits(c,value,x,y,color){
    [...value].forEach((digit,i)=>DIGITS[Number(digit)].forEach((row,py)=>[...row].forEach((on,px)=>{
      if(on==='1')P.micro(c,x+(i*4+px)*3,y+py*3,3,3,color);
    })));
  }
  function route(layout){
    const nodes=layout.nodes,points=[];
    for(let segment=0;segment<nodes.length-1;segment++){
      const a=nodes[Math.max(0,segment-1)],b=nodes[segment],d=nodes[segment+1],e=nodes[Math.min(nodes.length-1,segment+2)];
      const count=Math.ceil(Math.hypot(d[0]-b[0],d[1]-b[1])/4);
      for(let j=0;j<count;j++){
        const t=j/count,t2=t*t,t3=t2*t;
        const axis=k=>.5*((2*b[k])+(-a[k]+d[k])*t+(2*a[k]-5*b[k]+4*d[k]-e[k])*t2+(-a[k]+3*b[k]-3*d[k]+e[k])*t3);
        points.push({x:axis(0),y:axis(1),segment});
      }
    }
    points.push({x:nodes.at(-1)[0],y:nodes.at(-1)[1],segment:6});return points;
  }
  function bamboo(c,x,y,t){
    for(const dx of [-9,0,10]){
      P.rect(c,x+dx,y-22,4,45,t.leaf[1]);P.micro(c,x+dx,y-21,1,42,t.leaf[3]);
      for(let n=0;n<4;n++){P.rect(c,x+dx-2,y-16+n*10,8,2,t.leaf[0]);P.thread(c,x+dx+2,y-12+n*9,x+dx+14,y-20+n*9,t.leaf[2]);}
    }
  }
  function lantern(c,x,y,t){
    P.thread(c,x-4,y+21,x-4,y-28,t.leaf[0]);P.thread(c,x-4,y-28,x+8,y-28,t.leaf[1]);
    P.thread(c,x+8,y-28,x+8,y-21,'#b1b49a');P.rect(c,x,y-20,16,20,'#986e73');
    P.rect(c,x+2,y-18,12,16,'#d9a080');P.rect(c,x+6,y-18,4,16,'#f9d9a1');
    P.micro(c,x+1,y-21,14,1,'#e6c995');P.micro(c,x+1,y,14,1,'#e6c995');P.thread(c,x+8,y+1,x+8,y+8,'#d2a48a');
  }
  function paint(c,layout,journal){
    const {width:w,height:h,nodes}=layout,points=route(layout);
    c.save();c.imageSmoothingEnabled=false;
    for(let y=0;y<h;y+=6)P.rect(c,0,y,w,6,mix('#133449','#3f7279',Math.round(y/h*20)/20));
    for(let i=0;i<240;i++){
      const x=(i*137+31)%w,y=(i*83+17)%h;
      P.rect(c,x,y,8+i%4*5,2,i%2?'#a7d5c51c':'#071f3522');
      if(i%3===0)P.micro(c,x+3,y+4,6,1,'#a5d6cc30');
    }
    // Irregular shoreline at the edges frames a continuous ribbon of garden land.
    for(const side of [0,1])for(let y=-12;y<h+20;y+=6){
      const width=13+Math.sin(y*.023)*9+Math.sin(y*.061)*5,x=side?w-width:0;
      P.rect(c,side?x-4:0,y,width+4,6,'#142f3d');P.rect(c,x,y,width,6,'#355e57');
    }
    for(const p of points)P.oval(c,p.x+1,p.y+7,53,43,'#102d3f77');
    for(const p of points)P.oval(c,p.x,p.y,50,41,'#234b4b');
    for(const p of points)P.oval(c,p.x,p.y-2,46,37,'#52806a');
    for(const p of points)P.oval(c,p.x,p.y-3,39,31,'#769879');
    for(let i=0;i<points.length;i+=8){
      const p=points[i],next=points[Math.min(points.length-1,i+1)],angle=Math.atan2(next.y-p.y,next.x-p.x)+Math.PI/2;
      for(const sign of [-1,1]){
        const px=p.x+Math.cos(angle)*37*sign,py=p.y+Math.sin(angle)*31*sign;
        P.rect(c,px,py,3,5,'#355e51');P.micro(c,px-1,py,4,1,'#b4c393');
        if(i%24===0)P.flower(c,px,py,P.THEMES[Math.floor(i/24)%8],i);
      }
    }
    // Small stone pavers follow the bends rather than forming a straight menu grid.
    for(const p of points)P.oval(c,p.x,p.y,14,13,'#50685d');
    for(const p of points)P.oval(c,p.x,p.y-1,11,10,'#c7bc91');
    for(let i=0;i<points.length;i+=4){
      const p=points[i],clear=journal[p.segment]?.cleared;
      P.rect(c,p.x-6,p.y-4,11,6,clear?'#a0ba8c':'#ded0a4');P.micro(c,p.x-5,p.y-4,8,1,'#f5e5b9');
      P.micro(c,p.x+4,p.y,1,3,'#7d8b6d');
    }
    // Eight hand-built garden pockets surround their selectable stone seals.
    nodes.forEach(([x,y],i)=>{
      const t=P.THEMES[i];P.oval(c,x,y,51,42,t.leaf[0]);P.oval(c,x,y-2,48,39,t.grass[1]);
      P.oval(c,x-5,y-8,41,31,t.grass[2]+'66');
      const props=[[-44,-22],[40,27],[-34,34],[39,-31]];
      props.forEach(([dx,dy],n)=>{
        c.save();c.translate(Math.round(x+dx),Math.round(y+dy));
        if(i===3&&n%2===0)bamboo(c,0,0,t);
        else if(i===6&&n===3)lantern(c,0,0,t);
        else if((i===5||i===7)&&n%2===0)P.peak(c,i,0,true);
        else if(n===2&&i%2)P.rock(c,i,i);
        else if(n<2)P.tree(c,i,n+i);
        else P.fern(c,0,0,t,i+n);
        c.restore();
      });
      for(let n=0;n<10;n++){
        const a=n/10*Math.PI*2,px=x+Math.cos(a)*42,py=y+Math.sin(a)*35;
        P.flower(c,px,py,t,n);
      }
      P.oval(c,x+2,y+5,32,31,'#18374788');P.oval(c,x,y,32,31,t.stone[0]);
      P.oval(c,x,y-2,29,28,t.stone[2]);P.oval(c,x,y-2,26,25,t.stone[1]);
      c.save();c.translate(x-16,y-22);P.emblem(c,i);c.restore();
      digits(c,String(i+1).padStart(2,'0'),x-10,y+10,'#f9edcc');
      if(journal[i]?.cleared){
        P.oval(c,x+24,y-23,9,8,'#244e47');P.thread(c,x+19,y-23,x+23,y-19,'#e2eac0');P.thread(c,x+23,y-19,x+29,y-26,'#e2eac0');
      }
    });
    const ponds=layout===LAYOUTS.wide?[[65,142],[505,470],[897,75],[900,470]]:[[50,440],[540,610],[55,70],[335,795]];
    ponds.forEach(([x,y],i)=>{
      P.lily(c,x,y,P.THEMES[i%2],i%2===0);
      if(i===0)P.frog(c,x,y-3,P.THEMES[0],false);
      if(i===1){c.save();c.translate(x+40,y+4);P.duck(c,1.2,0,true);c.restore();}
      if(i===2)P.fish(c,x-12,y+29,0,false);
    });
    for(let i=0;i<35;i++){
      const x=(i*179+29)%w,y=(i*101+51)%h;
      if(points.every(p=>Math.hypot(p.x-x,p.y-y)>72)){
        P.lily(c,x,y,P.THEMES[i%2],i%6===0);
        if(i%5===0)P.fish(c,x+18,y+22,0,i%2===0);
      }
    }
    c.restore();
  }
  function animate(c,layout,selected,time,reduced){
    c.save();const t=reduced?0:time,[x,y]=layout.nodes[selected];
    for(let i=0;i<22;i++){
      const px=(i*173+55)%layout.width,py=(i*107+29)%layout.height;
      c.globalAlpha=reduced?.5:.28+(.5+.5*Math.sin(t*1.3+i))*.4;P.spark(c,px,py,'#d8e5b0',1);
    }
    c.globalAlpha=1;
    for(let i=0;i<4;i++){
      const angle=i/4*Math.PI*2+Math.PI/4;
      P.spark(c,x+Math.cos(angle)*37,y+Math.sin(angle)*34,'#f5db9e',2);
    }
    P.ring(c,x,y-1,35,'#f2d39cbb',2);
    const lift=reduced?0:Math.round(Math.sin(t*2.2)*2);
    P.oval(c,x,y-35,9,3,'#17364477');c.translate(x,y-47+lift);P.orb(c,0,.4);c.restore();
  }
  const api={LAYOUTS,route,paint,animate};if(typeof module!=='undefined')module.exports=api;root.SkyAtlas=api;
})(typeof window!=='undefined'?window:globalThis);
