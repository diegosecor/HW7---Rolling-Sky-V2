// Pack the local game into one HTML file for previews that cannot load sibling assets.
const fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
let html=read('index.html');
for(const name of ['style.css','polish.css','pixel-art.css']){
  const link='<link rel="stylesheet" href="'+name+'">';
  if(!html.includes(link))throw new Error('Missing stylesheet: '+name);
  html=html.replace(link,'<style data-source="'+name+'">\n'+read(name).replace(/<\/style/gi,'<\\/style')+'\n</style>');
}
const scripts=['engine.js','pixel-art.js','game.js'];
for(const name of scripts){
  const tag='<script defer src="'+name+'"></script>';
  if(!html.includes(tag))throw new Error('Missing script: '+name);
  html=html.replace(tag,'');
}
// Inline scripts must run after the complete interface exists; inline defer is ignored.
const code=scripts.map(name=>'<script data-source="'+name+'">\n'+read(name).replace(/<\/script/gi,'<\\/script')+'\n</script>').join('\n');
html=html.replace('href="./index.html"','href="#game-screen"').replace('</body>',code+'\n</body>');
if(/<(?:script|link)\b[^>]*(?:src|href)="(?!#)/i.test(html))throw new Error('Portable game still references a sibling asset.');
const destination=path.join(__dirname,'JUGAR.html');fs.writeFileSync(destination,html,'utf8');
console.log('Created JUGAR.html with all three stylesheets and all three scripts included.');
