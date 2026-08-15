// ═══════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════
var S = {
  cMode:'single', cImg:null, cScale:1, cRegions:[], cShape:'rect', calCurve:null, analyzed:false,
  bMode:'sep', bStrips:[], bActiveStrip:0, bShape:'rect',
  bResults:null, bMultiResults:[],
  simRes:null, charts:{}, drawing:false, sx:0, sy:0,
  ironCalImg:null, ironCalRois:[], ironCalShape:'rect', ironCalDrawing:false, ironCalDragStart:null, ironCalCurrentShape:null,
  ironSampleImg:null, ironSampleRois:[], ironSampleShape:'rect', ironSampleDrawing:false, ironSampleDragStart:null, ironSampleCurrentShape:null,
  ironModel:null, ironResults:null
};

/* Built-in iron calibration standards with real image color data */
var IRON_BUILTIN_STANDARDS = [
  { level:1, concentration:100, dilutionFactor:1, absorbance560:0.419, colorData:{avgR:24,avgG:14,avgB:16,hsv:{h:348,s:41.7,v:9.4},lab:{L:4.93,a:2.44,b:1.22},intensity:16.62} },
  { level:2, concentration:50, dilutionFactor:2, absorbance560:0.386, colorData:{avgR:104,avgG:22,avgB:4,hsv:{h:10.8,s:96.2,v:40.8},lab:{L:22.04,a:33.5,b:30.2},intensity:41.06} },
  { level:3, concentration:25, dilutionFactor:4, absorbance560:0.517, colorData:{avgR:164,avgG:95,avgB:3,hsv:{h:34.3,s:98.2,v:64.3},lab:{L:47.09,a:25.6,b:53.8},intensity:104.51} },
  { level:4, concentration:12.5, dilutionFactor:8, absorbance560:0.407, colorData:{avgR:170,avgG:157,avgB:71,hsv:{h:52.1,s:58.2,v:66.7},lab:{L:64.25,a:5.2,b:38.1},intensity:152.96} },
  { level:5, concentration:6.25, dilutionFactor:16, absorbance560:0.230, colorData:{avgR:177,avgG:189,avgB:147,hsv:{h:77.1,s:22.2,v:74.1},lab:{L:74.73,a:-8.1,b:22.5},intensity:180.69} },
  { level:6, concentration:3.125, dilutionFactor:32, absorbance560:0.316, colorData:{avgR:170,avgG:194,avgB:180,hsv:{h:145,s:12.4,v:76.1},lab:{L:76.33,a:-9.5,b:5.8},intensity:185.42} },
  { level:7, concentration:1.5625, dilutionFactor:64, absorbance560:0.234, colorData:{avgR:170,avgG:196,avgB:185,hsv:{h:154.6,s:13.3,v:76.9},lab:{L:77.00,a:-10.2,b:4.1},intensity:187.18} },
  { level:8, concentration:0.78125, dilutionFactor:128, absorbance560:0.122, colorData:{avgR:156,avgG:183,avgB:172,hsv:{h:155.6,s:14.8,v:71.8},lab:{L:72.17,a:-10.8,b:3.5},intensity:175.35} }
];

var IRON_DEFAULT_CONCS = [100, 50, 25, 12.5, 6.25, 3.125, 1.5625, 0.78125];
var IRON_DEFAULT_DILUTIONS = [1, 2, 4, 8, 16, 32, 64, 128];
var IRON_DEFAULT_ABSORBANCES = [0.419, 0.386, 0.517, 0.407, 0.230, 0.316, 0.234, 0.122];

var VEG_DB = [
  {name:'Spinach',iron:2.7,type:'Leafy green',vitC:28,note:'High oxalates — pair with vitamin C'},
  {name:'Kale',iron:1.6,type:'Leafy green',vitC:120,note:'Excellent vitamin C'},
  {name:'Swiss Chard',iron:1.8,type:'Leafy green',vitC:30,note:'Rich in magnesium'},
  {name:'Beet Greens',iron:2.7,type:'Leafy green',vitC:30,note:'Cook to reduce oxalates'},
  {name:'Lentils',iron:3.3,type:'Legume',vitC:1.5,note:'Cook with lemon juice'},
  {name:'Chickpeas',iron:2.9,type:'Legume',vitC:1.3,note:'Hummus with lemon'},
  {name:'Kidney Beans',iron:2.9,type:'Legume',vitC:1.2,note:'Pair with bell peppers'},
  {name:'Soybeans',iron:3.6,type:'Legume',vitC:6,note:'Fermented improves absorption'},
  {name:'Tofu',iron:5.4,type:'Soy product',vitC:0.1,note:'Calcium-set — best source'},
  {name:'Pumpkin Seeds',iron:3.3,type:'Seeds',vitC:0.3,note:'Eat raw or roasted'},
  {name:'Sesame Seeds',iron:4.1,type:'Seeds',vitC:0,note:'Tahini in dressings'},
  {name:'Quinoa',iron:1.5,type:'Grain',vitC:0,note:'Complete protein'},
  {name:'Dark Chocolate 70-85%',iron:6.3,type:'Other',vitC:0,note:'High iron — low sugar'},
  {name:'Dried Apricots',iron:2.7,type:'Dried fruit',vitC:1,note:'Convenient snack'},
  {name:'Seaweed (Spirulina)',iron:28.5,type:'Algae',vitC:0,note:'Very high — use as supplement'},
  {name:'Moringa Powder',iron:4.0,type:'Leafy green',vitC:51.7,note:'Iron + vitamin C power'}
];

//var HEALTHY = { rbc:{rgb:[180,38,40],lab:{L:38,A:42,B:20}}, plasma:{rgb:[228,212,160],lab:{L:86,A:2,B:22}}, buffy:{rgb:[210,205,190],lab:{L:82,A:1,B:10}} };
var HEALTHY = {
  rbc:    { rgb: [94, 13, 25],   lab: { L: 19,   A: 35.8, B: 15.9 } },
  plasma: { rgb: [178, 88, 58],  lab: { L: 47.9, A: 34.2, B: 34   } },
  buffy:  { rgb: [210, 205, 190],lab: { L: 82,   A: 1,    B: 10   } }
};
// ═══════════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════════
function goTo(id){
  document.querySelectorAll('.pg').forEach(function(p){p.classList.remove('on');});
  document.getElementById('pg-'+id).classList.add('on');
  document.querySelectorAll('.nt').forEach(function(b){b.classList.remove('on');});
  var el=document.querySelector('.nt[data-tab="'+id+'"]');
  if(el)el.classList.add('on');
  document.querySelectorAll('.dnav').forEach(function(b){b.classList.remove('on');});
  el=document.querySelector('.dnav[data-tab="'+id+'"]');
  if(el)el.classList.add('on');
  window.scrollTo({top:0,behavior:'instant'});
}
function toggleDrawer(){
  var d=document.getElementById('side-drawer'),o=document.getElementById('drawer-overlay'),h=document.getElementById('hamburger');
  if(d.classList.contains('open'))closeDrawer();else{d.classList.add('open');o.classList.add('on');h.classList.add('open');document.body.style.overflow='hidden';}
}
function closeDrawer(){
  document.getElementById('side-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('on');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDrawer();});
function setBModeFromDrawer(mode){
  document.querySelectorAll('.dmode').forEach(function(b){b.classList.remove('on');});
  var el=document.querySelector('.dmode[data-bmode="'+mode+'"]');
  if(el)el.classList.add('on');
  document.querySelectorAll('#pg-b .mb').forEach(function(b){b.classList.remove('on');});
  document.querySelectorAll('#pg-b .mb').forEach(function(b){
    if(b.textContent.toLowerCase().includes(mode==='sep'?'layer':mode==='dil'?'serial':mode==='time'?'time':'reference'))b.classList.add('on');
  });
  S.bMode=mode;updateBModeInfo();
}
function setCModeFromDrawer(mode){
  document.querySelectorAll('.dcmode').forEach(function(b){b.classList.remove('on');});
  var el=document.querySelector('.dcmode[data-cmode="'+mode+'"]');
  if(el)el.classList.add('on');
  document.querySelectorAll('#pg-c .mb').forEach(function(b){b.classList.remove('on');});
  var lm={single:'single',blank:'blank',standard:'standard',calib:'calibration',compare:'compare'};
  document.querySelectorAll('#pg-c .mb').forEach(function(b){
    if(b.textContent.toLowerCase().includes(lm[mode]?lm[mode].slice(0,4):mode.slice(0,4)))b.classList.add('on');
  });
  S.cMode=mode;updateModeInfo();
}

// ═══════════════════════════════════════════════════════════════
//  COLORIMETRY
// ═══════════════════════════════════════════════════════════════
function loadImage(ev){
  var f=ev.target.files[0];if(!f)return;
  var url=URL.createObjectURL(f);var img=new Image();
  img.onload=function(){
    S.cImg=img;
    var uz=document.getElementById('c-upload');
    uz.innerHTML='<img class="thumb" src="'+url+'"><div class="ul" style="font-size:9px">'+f.name+'</div><input type="file" id="c-file" accept="image/*" onchange="loadImage(event)" style="display:none">';
    uz.classList.add('loaded');
    uz.onclick=function(){document.getElementById('c-file').click();};
    setupCanvas(img,'c');
    toast('✓ Image: '+f.name);
  };
  img.src=url;
}
function setupCanvas(img,prefix){
  var box=document.getElementById(prefix+'-cbox'),ph=document.getElementById(prefix+'-ph');
  if(ph)ph.style.display='none';
  var cv=document.getElementById(prefix+'-cv'),maxW=box.clientWidth-4||600,scale=Math.min(1,maxW/img.width);
  cv.width=Math.round(img.width*scale);cv.height=Math.round(img.height*scale);cv.style.display='block';
  if(prefix==='c'){S.cScale=scale;S.cImg=img;}
  drawCanvas(prefix);addCanvasEvents(cv,prefix);
  var btn=document.getElementById(prefix+'-analyze-btn');
  if(btn)btn.disabled=false;
}
function drawCanvas(prefix){
  var cv=document.getElementById(prefix+'-cv');
  var img,regions;
  if(prefix==='c'){img=S.cImg;regions=S.cRegions;}
  else{var si=S.bStrips[S.bActiveStrip];if(!si)return;img=si.img;regions=si.regions;}
  if(!img||!cv.width)return;
  var ctx=cv.getContext('2d');ctx.drawImage(img,0,0,cv.width,cv.height);
  var colors=['#00e5a0','#3b82f6','#f97316','#eab308','#ef4444','#a855f7','#ec4899','#06b6d4'];
  regions.forEach(function(r,i){
    var c=colors[i%colors.length];ctx.strokeStyle=c;ctx.lineWidth=2;ctx.setLineDash([]);
    if(r.shape==='circle'){ctx.beginPath();ctx.ellipse(r.x+r.w/2,r.y+r.h/2,r.w/2,r.h/2,0,0,Math.PI*2);ctx.stroke();}
    else{ctx.strokeRect(r.x,r.y,r.w,r.h);}
    ctx.fillStyle=c;ctx.font='bold 10px monospace';ctx.fillText(r.name||('R'+(i+1)),r.x+3,r.y+13);
    if(r.layer){var lc={rbc:'#ef4444',plasma:'#f0d060',buffy:'#e8e0c8'};ctx.fillStyle=lc[r.layer]||'#64748b';ctx.font='8px monospace';ctx.fillText(r.layer.toUpperCase(),r.x+3,r.y+26);}
    if(r.type){var tc={blank:'#64748b',sample:'#00e5a0',standard:'#3b82f6'};ctx.fillStyle=tc[r.type]||'#64748b';ctx.font='8px monospace';ctx.fillText(r.type.toUpperCase(),r.x+3,r.y+26);}
  });
}
function setShape(shape,el){S.cShape=shape;document.querySelectorAll('#pg-c .stb').forEach(function(b){b.classList.remove('on');});el.classList.add('on');}
function setBShape(shape,el){S.bShape=shape;document.querySelectorAll('#pg-b .stb').forEach(function(b){b.classList.remove('on');});el.classList.add('on');}
function addCanvasEvents(cv,prefix){
  function toXY(cx,cy){var rc=cv.getBoundingClientRect();return{x:(cx-rc.left)*(cv.width/rc.width),y:(cy-rc.top)*(cv.height/rc.height)};}
  cv.onmousedown=function(e){S.drawing=true;var p=toXY(e.clientX,e.clientY);S.sx=p.x;S.sy=p.y;};
  cv.onmousemove=function(e){if(!S.drawing)return;var p=toXY(e.clientX,e.clientY);drawCanvas(prefix);var ctx=cv.getContext('2d');ctx.strokeStyle='#00e5a0';ctx.lineWidth=2;ctx.setLineDash([6,3]);var shape=(prefix==='c')?S.cShape:S.bShape;if(shape==='circle'){ctx.beginPath();ctx.ellipse(S.sx+(p.x-S.sx)/2,S.sy+(p.y-S.sy)/2,Math.abs((p.x-S.sx)/2),Math.abs((p.y-S.sy)/2),0,0,Math.PI*2);ctx.stroke();}else{ctx.strokeRect(S.sx,S.sy,p.x-S.sx,p.y-S.sy);}ctx.setLineDash([]);};
  cv.onmouseup=function(e){if(!S.drawing)return;S.drawing=false;var p=toXY(e.clientX,e.clientY);finishRegion(p.x,p.y,prefix);};
  cv.onmouseleave=function(){if(S.drawing){S.drawing=false;drawCanvas(prefix);}};
  function finishRegion(x,y,pref){
    var rx=Math.min(S.sx,x),ry=Math.min(S.sy,y),rw=Math.abs(x-S.sx),rh=Math.abs(y-S.sy);
    if(rw<5||rh<5)return;
    var regions,shape=(pref==='c')?S.cShape:S.bShape;
    if(pref==='c'){regions=S.cRegions;}else{var si=S.bStrips[S.bActiveStrip];if(!si)return;regions=si.regions;}
    var id=regions.length+1;var nm=(pref==='c')?'Region '+id:'Layer '+id;var defLayer=(pref==='c')?'sample':'rbc';
    regions.push({id:id,shape:shape,name:nm,type:defLayer,layer:defLayer,x:rx,y:ry,w:rw,h:rh});
    drawCanvas(pref);
    if(pref==='c')renderCRegionList();else renderBRegionList();
    toast('✓ '+(pref==='c'?'Region':'Layer')+' '+id+' added');
  }
  var td=false,pinch=false;
  cv.ontouchstart=function(e){if(e.touches.length>=2){pinch=true;td=false;S.drawing=false;return;}pinch=false;e.preventDefault();var t=e.touches[0],p=toXY(t.clientX,t.clientY);td=true;S.drawing=true;S.sx=p.x;S.sy=p.y;};
  cv.ontouchmove=function(e){if(pinch||e.touches.length>=2){pinch=true;td=false;S.drawing=false;return;}if(!td)return;e.preventDefault();var t=e.touches[0],p=toXY(t.clientX,t.clientY);drawCanvas(prefix);var ctx=cv.getContext('2d');ctx.strokeStyle='#00e5a0';ctx.lineWidth=3;ctx.setLineDash([8,4]);var shape=(prefix==='c')?S.cShape:S.bShape;if(shape==='circle'){ctx.beginPath();ctx.ellipse(S.sx+(p.x-S.sx)/2,S.sy+(p.y-S.sy)/2,Math.abs((p.x-S.sx)/2),Math.abs((p.y-S.sy)/2),0,0,Math.PI*2);ctx.stroke();}else{ctx.strokeRect(S.sx,S.sy,p.x-S.sx,p.y-S.sy);}ctx.setLineDash([]);};
  cv.ontouchend=function(e){if(pinch){pinch=false;return;}if(!td)return;td=false;S.drawing=false;e.preventDefault();var t=e.changedTouches[0],p=toXY(t.clientX,t.clientY);finishRegion(p.x,p.y,prefix);};
  setupPinchZoom(cv);
}
function setupPinchZoom(cv){
  var wrap=cv.closest('.cbox');var scale=1,lastDist=0;
  wrap.style.transformOrigin='0 0';
  wrap.addEventListener('touchstart',function(e){if(e.touches.length===2)lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);},{passive:true});
  wrap.addEventListener('touchmove',function(e){if(e.touches.length===2){e.preventDefault();var dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(lastDist>0){scale*=dist/lastDist;scale=Math.min(4,Math.max(1,scale));cv.style.transform='scale('+scale+')';cv.style.transformOrigin='0 0';}lastDist=dist;}},{passive:false});
  wrap.addEventListener('touchend',function(e){if(e.touches.length<2)lastDist=0;},{passive:true});
  wrap._resetZoom=function(){scale=1;cv.style.transform='scale(1)';};
}
function resetZoom(prefix){var el=document.getElementById(prefix+'-cbox');if(el&&el._resetZoom)el._resetZoom();}

// ═══════════════════════════════════════════════════════════════
//  COLORIMETRY REGIONS & ANALYSIS
// ═══════════════════════════════════════════════════════════════
function renderCRegionList(){
  var el=document.getElementById('c-region-list');
  if(!S.cRegions.length){el.innerHTML='<p style="font-size:12px;color:var(--muted);text-align:center;padding:16px">No regions.</p>';return;}
  var si={rect:'▭',circle:'○'},tc={blank:'#64748b',sample:'#00e5a0',standard:'#3b82f6'};
  el.innerHTML=S.cRegions.map(function(r,i){
    return '<div class="region-item"><div class="ri-header"><div class="ri-id"><span style="color:'+(tc[r.type]||'#fff')+'">'+(si[r.shape]||'▭')+'</span>R'+r.id+'<span class="ri-shape">'+r.shape+'</span></div><button class="ri-del" onclick="deleteCRegion('+i+')">✕</button></div><div class="ri-fields"><input type="text" value="'+r.name+'" onchange="updateCRegion('+i+',\'name\',this.value)"><select onchange="updateCRegion('+i+',\'type\',this.value)"><option value="blank"'+(r.type==='blank'?'selected':'')+'>Blank</option><option value="sample"'+(r.type==='sample'?'selected':'')+'>Sample</option><option value="standard"'+(r.type==='standard'?'selected':'')+'>Standard</option></select></div><div class="ri-color"><span class="ri-swatch" style="background:'+(r.rgb?'rgb('+r.rgb.R+','+r.rgb.G+','+r.rgb.B+')':'#333')+'"></span>'+(r.rgb?'RGB('+r.rgb.R+','+r.rgb.G+','+r.rgb.B+') OD:'+r.od:'Not measured')+'</div></div>';
  }).join('');
}
function updateCRegion(idx,f,v){if(f==='type')S.cRegions[idx].type=v;else S.cRegions[idx].name=v;drawCanvas('c');renderCRegionList();}
function deleteCRegion(idx){S.cRegions.splice(idx,1);drawCanvas('c');renderCRegionList();if(!S.cRegions.length)document.getElementById('c-analyze-btn').disabled=true;}
function clearAllRegions(){S.cRegions=[];S.analyzed=false;S.calCurve=null;if(S.cImg)drawCanvas('c');renderCRegionList();document.getElementById('c-results').innerHTML='<p style="font-size:12px;color:var(--muted);text-align:center;padding:20px">Cleared.</p>';document.getElementById('c-analyze-btn').disabled=true;document.getElementById('cal-eq').innerHTML='';}
function setAnalysisMode(mode,el){
  S.cMode=mode;
  document.querySelectorAll('#pg-c .mb').forEach(function(b){b.classList.remove('on');});
  el.classList.add('on');
  document.querySelectorAll('.dcmode').forEach(function(b){b.classList.remove('on');});
  var d=document.querySelector('.dcmode[data-cmode="'+mode+'"]');if(d)d.classList.add('on');
  // Show/hide iron cards
  var ironCal=document.getElementById('iron-cal-builder-card');
  var ironSample=document.getElementById('iron-sample-card');
  if(ironCal)ironCal.style.display=(mode==='iron')?'block':'none';
  if(ironSample)ironSample.style.display=(mode==='iron')?'block':'none';
  updateModeInfo();
  if(mode==='iron')updateIronModelStatus();
}
function updateModeInfo(){
  var ms={single:'Single Sample — analyzes Sample regions.',blank:'vs Blank — compares Sample against Blank.',standard:'vs Standard — compares Sample against Standard.',calib:'Full Calibration — Standards build curve, quantifies Samples.',compare:'Compare Samples — side-by-side Sample comparison.',iron:'Iron Analysis — Build iron calibration from μPAD image, then analyze sample μPAD for iron concentration.'};
  document.getElementById('c-mode-info').innerHTML='<strong>'+S.cMode+'</strong> — '+(ms[S.cMode]||'');
}

// ═══════════════════════════════════════════════════════════════
//  COLOUR MATHS
// ═══════════════════════════════════════════════════════════════
function getPixels(cv,x,y,w,h){return cv.getContext('2d').getImageData(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h))).data;}
function getPixelsCircle(cv,cx,cy,rx,ry){
  var x0=Math.round(cx-rx),y0=Math.round(cy-ry),w=Math.max(1,Math.round(rx*2)),h=Math.max(1,Math.round(ry*2));
  var fd=cv.getContext('2d').getImageData(x0,y0,w,h).data,r=[],a2=rx*rx,b2=ry*ry;
  for(var py=0;py<h;py++)for(var px=0;px<w;px++){var dx=px-rx,dy=py-ry;if((dx*dx)/a2+(dy*dy)/b2<=1){var i=(py*w+px)*4;r.push(fd[i],fd[i+1],fd[i+2],fd[i+3]);}}
  return new Uint8Array(r);
}
function meanRGB(px){var r=0,g=0,b=0,n=0;for(var i=0;i<px.length;i+=4){r+=px[i];g+=px[i+1];b+=px[i+2];n++;}return n>0?{R:Math.round(r/n),G:Math.round(g/n),B:Math.round(b/n)}:{R:0,G:0,B:0};}
function toHSV(r,g,b){r/=255;g/=255;b/=255;var M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;var h=0,s=M?d/M:0,v=M;if(d){if(M===r)h=((g-b)/d)%6;else if(M===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=Math.round(h*60);if(h<0)h+=360;}return{H:h,S:+(s*100).toFixed(1),V:+(v*100).toFixed(1)};}
function toLAB(r,g,b){var R=r/255,G=g/255,B=b/255;var lin=function(v){return v>.04045?Math.pow((v+.055)/1.055,2.4):v/12.92;};R=lin(R);G=lin(G);B=lin(B);var X=R*.4124+G*.3576+B*.1805,Y=R*.2126+G*.7152+B*.0722,Z=R*.0193+G*.1192+B*.9505;X/=.95047;Y/=1;Z/=1.08883;var f=function(t){return t>.008856?Math.cbrt(t):7.787*t+16/116;};return{L:+(116*f(Y)-16).toFixed(1),A:+(500*(f(X)-f(Y))).toFixed(1),B:+(200*(f(Y)-f(Z))).toFixed(1)};}
function toOD(rgb,blank){var I=(rgb.R+rgb.G+rgb.B)/3,I0=blank?(blank.R+blank.G+blank.B)/3:240;return+Math.max(0,Math.log10(I0/Math.max(1,I))).toFixed(4);}
function dE(l1,l2){return+Math.sqrt((l1.L-l2.L)*(l1.L-l2.L)+(l1.A-l2.A)*(l1.A-l2.A)+(l1.B-l2.B)*(l1.B-l2.B)).toFixed(2);}
function concFromOD(od){if(!S.calCurve)return null;return+Math.max(0,(od-S.calCurve.intercept)/S.calCurve.slope).toFixed(3);}
function classify(hb,grp){var t={child:11,'teen-m':13,'teen-f':12,'adult-m':13,'adult-f':12,pregnant:11,'post-m':12,elder:12};var thr=t[grp]||12;if(hb>=thr)return{l:'Normal',c:'bg'};if(hb>=10)return{l:'Mild Anaemia',c:'by'};if(hb>=7)return{l:'Moderate Anaemia',c:'bo'};return{l:'Severe Anaemia',c:'br'};}
function measureRegion(r,prefix){
  var cv=document.getElementById(prefix+'-cv');
  var px;if(r.shape==='circle')px=getPixelsCircle(cv,r.x+r.w/2,r.y+r.h/2,r.w/2,r.h/2);else px=getPixels(cv,r.x,r.y,r.w,r.h);
  var rgb=meanRGB(px),hsv=toHSV(rgb.R,rgb.G,rgb.B),lab=toLAB(rgb.R,rgb.G,rgb.B),od=toOD(rgb),de=dE(lab,{L:96,A:0,B:2}),conc=concFromOD(od);
  if(prefix==='b'){var step=Math.max(1,Math.floor(px.length/4/10000));var sampled=[];for(var i=0;i<px.length;i+=step*4){sampled.push(px[i],px[i+1],px[i+2],px[i+3]);}r.rawPx=new Uint8Array(sampled);}
  Object.assign(r,{rgb:rgb,hsv:hsv,lab:lab,od:od,dE:de,conc:conc});return r;
}

// ═══════════════════════════════════════════════════════════════
//  COLORIMETRY ANALYZE
// ═══════════════════════════════════════════════════════════════
function analyzeRegions(){
  if(!S.cImg){toast('Upload image first');return;}
  if(!S.cRegions.length){toast('Draw regions first');return;}
  S.cRegions.forEach(function(r){measureRegion(r,'c');});renderCRegionList();
  var mode=S.cMode,bl=S.cRegions.filter(function(r){return r.type==='blank';}),sm=S.cRegions.filter(function(r){return r.type==='sample';}),st=S.cRegions.filter(function(r){return r.type==='standard';});
  var res=[];
  switch(mode){
    case'single':if(!sm.length){toast('No Sample regions');return;}res=sm.map(function(r){return Object.assign({},r,{blankCorrectedOD:r.od,concentration:concFromOD(r.od)});});break;
    case'blank':if(!bl.length||!sm.length){toast('Need Blank and Sample');return;}var ab=bl.reduce(function(s,r){return s+r.od;},0)/bl.length;res=sm.map(function(r){return Object.assign({},r,{blankCorrectedOD:+Math.max(0,r.od-ab).toFixed(4),concentration:null});});break;
    case'standard':if(!st.length||!sm.length){toast('Need Standard and Sample');return;}var as=st.reduce(function(s,r){return s+r.od;},0)/st.length;res=sm.map(function(r){return Object.assign({},r,{blankCorrectedOD:r.od,stdRatio:+(r.od/as).toFixed(4),concentration:null});});break;
    case'calib':if(st.length<3){toast('Need 3+ Standards');return;}if(!sm.length){toast('Need Sample');return;}toast('Use Calibration panel');res=sm.map(function(r){return Object.assign({},r,{blankCorrectedOD:r.od,concentration:concFromOD(r.od)});});break;
    case'compare':if(sm.length<2){toast('Need 2+ Samples');return;}res=sm.map(function(r){return Object.assign({},r,{blankCorrectedOD:r.od,concentration:concFromOD(r.od)});});break;
  }
  S.analyzed=true;renderCResults(res,mode);updateCCharts(res);toast('✓ Analyzed '+res.length+' regions');
}
function renderCResults(results,mode){
  var el=document.getElementById('c-results');
  if(!results||!results.length){el.innerHTML='<p style="font-size:12px;color:var(--muted);text-align:center;padding:20px">No results.</p>';return;}
  var aO=results.reduce(function(s,r){return s+r.od;},0)/results.length,hC=results.some(function(r){return r.concentration!=null;}),aC=hC?results.reduce(function(s,r){return s+(r.concentration||0);},0)/results.length:null;
  var h='<div class="analysis-summary"><div class="as-item"><div class="as-val">'+results.length+'</div><div class="as-lbl">Regions</div></div><div class="as-item"><div class="as-val">'+aO.toFixed(4)+'</div><div class="as-lbl">Avg OD</div></div>'+(hC?'<div class="as-item"><div class="as-val">'+aC.toFixed(3)+'</div><div class="as-lbl">Avg Conc</div></div>':'')+'<div class="as-item"><div class="as-val">'+mode+'</div><div class="as-lbl">Mode</div></div></div>';
  h+='<div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>#</th><th>Name</th><th>Type</th><th>Color</th><th>R</th><th>G</th><th>B</th><th>Hue°</th><th>Sat%</th><th>LAB L</th><th>OD</th><th>ΔE</th>'+(mode==='blank'?'<th>Corr OD</th>':'')+(hC?'<th>Conc</th>':'')+'</tr></thead><tbody>';
  results.forEach(function(r){h+='<tr><td>R'+r.id+'</td><td style="max-width:80px;overflow:hidden;text-overflow:ellipsis">'+r.name+'</td><td><span class="badge '+(r.type==='blank'?'bc':r.type==='sample'?'bg':'bp')+'">'+r.type+'</span></td><td><span class="sw" style="background:rgb('+r.rgb.R+','+r.rgb.G+','+r.rgb.B+')"></span></td><td>'+r.rgb.R+'</td><td>'+r.rgb.G+'</td><td>'+r.rgb.B+'</td><td>'+r.hsv.H+'</td><td>'+r.hsv.S+'</td><td>'+r.lab.L+'</td><td>'+r.od+'</td><td>'+r.dE+'</td>'+(mode==='blank'?'<td>'+(r.blankCorrectedOD||'—')+'</td>':'')+(hC?'<td><b>'+(r.concentration!=null?r.concentration+' mg/L':'—')+'</b></td>':'')+'</tr>';});
  h+='</tbody></table></div>';el.innerHTML=h;
}
function mk(id,config){
  if(S.charts[id]){try{S.charts[id].destroy();}catch(e){}}
  var el=document.getElementById(id);if(!el)return;
  try{S.charts[id]=new Chart(el,config);}catch(e){console.warn('Chart error for',id,e);}
}
var gO={color:'#2a3a50'},tO={color:'#64748b',font:{size:9}},lO={labels:{color:'#64748b',font:{size:9}}};
function updateCCharts(results){
  if(!results||!results.length)return;
  var cv=document.getElementById('c-cv'),r0=results[0];
  var px;if(r0.shape==='circle')px=getPixelsCircle(cv,r0.x+r0.w/2,r0.y+r0.h/2,r0.w/2,r0.h/2);else px=getPixels(cv,r0.x,r0.y,r0.w,r0.h);
  var rH=new Array(32).fill(0),gH=new Array(32).fill(0),bH=new Array(32).fill(0);
  for(var i=0;i<px.length;i+=4){rH[px[i]>>3]++;gH[px[i+1]>>3]++;bH[px[i+2]>>3]++;}
  var lx=Array.from({length:32},function(_,i){return i*8;});
  mk('c-hist',{type:'line',data:{labels:lx,datasets:[{label:'R',data:rH,borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,.1)',fill:true,tension:.4,pointRadius:0,borderWidth:1.5},{label:'G',data:gH,borderColor:'#00e5a0',backgroundColor:'rgba(0,229,160,.1)',fill:true,tension:.4,pointRadius:0,borderWidth:1.5},{label:'B',data:bH,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.1)',fill:true,tension:.4,pointRadius:0,borderWidth:1.5}]},options:{responsive:true,plugins:{legend:lO},scales:{x:{ticks:tO,grid:gO},y:{ticks:tO,grid:gO}}}});
  mk('c-hsv',{type:'bar',data:{labels:results.map(function(r){return r.name;}),datasets:[{label:'Hue°/3.6',data:results.map(function(r){return r.hsv.H/3.6;}),backgroundColor:'rgba(234,179,8,.7)'},{label:'Sat%',data:results.map(function(r){return r.hsv.S;}),backgroundColor:'rgba(0,229,160,.7)'},{label:'Val%',data:results.map(function(r){return r.hsv.V;}),backgroundColor:'rgba(59,130,246,.7)'}]},options:{responsive:true,plugins:{legend:lO},scales:{x:{ticks:tO,grid:gO},y:{ticks:tO,grid:gO,max:100}}}});
  mk('c-comp',{type:'bar',data:{labels:results.map(function(r){return r.name;}),datasets:[{label:'OD',data:results.map(function(r){return r.od;}),backgroundColor:results.map(function(r){return r.type==='blank'?'rgba(100,116,139,.7)':r.type==='standard'?'rgba(59,130,246,.7)':'rgba(0,229,160,.7)';})},{label:'ΔE/50',data:results.map(function(r){return r.dE/50;}),backgroundColor:'rgba(168,85,247,.7)'}]},options:{responsive:true,plugins:{legend:lO},scales:{x:{ticks:tO,grid:gO},y:{ticks:tO,grid:gO}}}});
  if(S.calCurve)drawCurveChart();
}
function drawCurveChart(){var c=S.calCurve;if(!c)return;var xs=Array.from({length:60},function(_,i){return i;});var ys=xs.map(function(x){return c.slope*x+c.intercept;});var pts=S.cRegions.filter(function(r){return r.conc!=null;}).map(function(r){return{x:r.conc,y:r.od};});mk('c-curve',{type:'scatter',data:{datasets:[{label:'y='+c.slope.toFixed(4)+'x+'+c.intercept.toFixed(4)+' R²='+c.r2.toFixed(4),data:xs.map(function(x,i){return{x:x,y:ys[i]};}),type:'line',borderColor:'#3b82f6',pointRadius:0,fill:false},{label:'Samples',data:pts,backgroundColor:'#00e5a0',pointRadius:6}]},options:{responsive:true,plugins:{legend:lO},scales:{x:{title:{display:true,text:'Conc (mg/L)',color:'#64748b'},ticks:tO,grid:gO},y:{title:{display:true,text:'OD',color:'#64748b'},ticks:tO,grid:gO}}}});}
var CAL_DEFAULTS=[[0,0],[1.56,0.070],[3.125,0.140],[6.25,0.277],[12.5,0.508],[25,0.858],[50,1.190]];
function buildCalRows(){var c=document.getElementById('cal-rows');c.innerHTML='';CAL_DEFAULTS.forEach(function(arr,i){var d=document.createElement('div');d.className='cal-row';d.innerHTML='<span class="rn">'+(i+1)+'</span><input type="number" class="cc" placeholder="conc" value="'+(arr[0]||'')+'" step="any"><input type="number" class="ca" placeholder="OD" value="'+(arr[1]||'')+'" step="any">';c.appendChild(d);});}
function addCalRow(){var c=document.getElementById('cal-rows'),d=document.createElement('div');d.className='cal-row';d.innerHTML='<span class="rn">'+(c.children.length+1)+'</span><input type="number" class="cc" placeholder="conc" step="any"><input type="number" class="ca" placeholder="OD" step="any">';c.appendChild(d);}
function buildCalibrationCurve(){var cc=document.querySelectorAll('.cc'),ca=document.querySelectorAll('.ca'),pts=[];cc.forEach(function(ci,i){var x=parseFloat(ci.value),y=parseFloat(ca[i].value);if(!isNaN(x)&&!isNaN(y))pts.push({x:x,y:y});});if(pts.length<3){toast('Need 3+ points');return;}computeCalCurve(pts);}
function computeCalCurve(pts){var n=pts.length,sx=pts.reduce(function(a,p){return a+p.x;},0),sy=pts.reduce(function(a,p){return a+p.y;},0),sxy=pts.reduce(function(a,p){return a+p.x*p.y;},0),sx2=pts.reduce(function(a,p){return a+p.x*p.x;},0);var slope=(n*sxy-sx*sy)/(n*sx2-sx*sx),intercept=(sy-slope*sx)/n,ym=sy/n,r2=1-pts.reduce(function(a,p){return a+(p.y-(slope*p.x+intercept))*(p.y-(slope*p.x+intercept));},0)/pts.reduce(function(a,p){return a+(p.y-ym)*(p.y-ym);},0);S.calCurve={slope:slope,intercept:intercept,r2:r2,pts:pts};document.getElementById('cal-eq').innerHTML='✓ <b>Absorbance = '+slope.toFixed(5)+' × Conc + '+intercept.toFixed(5)+'</b><br>R² = <b>'+r2.toFixed(4)+'</b> '+(r2>.99?'✅ Excellent':r2>.95?'✓ Good':'⚠ Check data');S.cRegions.forEach(function(r){if(r.od!=null)r.conc=concFromOD(r.od);});renderCRegionList();if(S.analyzed){var sm=S.cRegions.filter(function(r){return r.type==='sample';});renderCResults(sm.map(function(r){return Object.assign({},r,{blankCorrectedOD:r.od,concentration:r.conc});}),S.cMode);}drawCurveChart();toast('✓ Curve built');}
function loadCalFromRegions(){var st=S.cRegions.filter(function(r){return r.type==='standard'&&r.od!=null;});if(st.length<3){toast('Need 3+ measured Standards');return;}var c=document.getElementById('cal-rows');c.innerHTML='';st.forEach(function(r,i){var d=document.createElement('div');d.className='cal-row';d.innerHTML='<span class="rn">'+(i+1)+'</span><input type="number" class="cc" placeholder="conc" step="any"><input type="number" class="ca" placeholder="OD" value="'+r.od+'" step="any">';c.appendChild(d);});toast('Standard ODs loaded. Enter concentrations.');}

// ═══════════════════════════════════════════════════════════════
//  BLOOD ANALYSIS
// ═══════════════════════════════════════════════════════════════
function pallor(labL){return+Math.min(100,Math.max(0,(labL-38)/0.62)).toFixed(1);}
function icterusFlag(lab){return lab.B>32;}
function lipemiaFlag(hsv,lab){return lab.L>88&&hsv.S<12;}
function buffyScore(hpct){if(hpct<1)return{n:0,l:'Not visible'};if(hpct<2)return{n:1,l:'Faintly visible'};if(hpct<5)return{n:2,l:'Clearly visible'};return{n:3,l:'Abnormally thick'};}

function addBloodStrip(ev){
  var f=ev.target.files[0];if(!f)return;
  var url=URL.createObjectURL(f);var img=new Image();
  img.onload=function(){
    var id=S.bStrips.length+1;
    var strip={id:id,img:img,regions:[],role:'sample',timePoint:'Week 0',name:'Strip '+id,scale:1};
    S.bStrips.push(strip);
    S.bActiveStrip=S.bStrips.length-1;
    renderStripTabs();
    var uz=document.getElementById('b-upload');
    uz.innerHTML='<div class="ul" style="font-size:10px">'+S.bStrips.length+' strip(s) loaded. Click to add more.</div><input type="file" id="b-file" accept="image/*" onchange="addBloodStrip(event)" style="display:none">';
    setupCanvas(img,'b');
    renderBRegionList();
    updateStripLabels();
    toast('✓ Strip '+id+' added');
  };
  img.src=url;
}

function renderStripTabs(){
  var el=document.getElementById('b-strip-tabs');
  if(!S.bStrips.length){el.innerHTML='';return;}
  var roleIcons={sample:'🩸',reference:'🏥',dilution:'🧬',time:'📅'};
  el.innerHTML=S.bStrips.map(function(s,i){
    return '<div class="strip-tab '+(i===S.bActiveStrip?'on':'')+'" onclick="switchStrip('+i+')">'+
      (roleIcons[s.role]||'🩸')+' '+s.name+
      '<span class="tab-badge">'+s.regions.length+' layers</span>'+
      (S.bMode==='time'?'<select class="tp-select" onclick="event.stopPropagation()" onchange="setStripTimePoint('+i+',this.value)"><option value="Week 0"'+(s.timePoint==='Week 0'?'selected':'')+'>Wk 0</option><option value="Week 1"'+(s.timePoint==='Week 1'?'selected':'')+'>Wk 1</option><option value="Week 2"'+(s.timePoint==='Week 2'?'selected':'')+'>Wk 2</option><option value="Week 3"'+(s.timePoint==='Week 3'?'selected':'')+'>Wk 3</option><option value="Week 4"'+(s.timePoint==='Week 4'?'selected':'')+'>Wk 4</option><option value="Week 5"'+(s.timePoint==='Week 5'?'selected':'')+'>Wk 5</option><option value="Week 6"'+(s.timePoint==='Week 6'?'selected':'')+'>Wk 6</option><option value="Week 7"'+(s.timePoint==='Week 7'?'selected':'')+'>Wk 7</option><option value="Week 8"'+(s.timePoint==='Week 8'?'selected':'')+'>Wk 8</option></select>':'')+
      (S.bMode==='ref'?'<select class="tp-select" onclick="event.stopPropagation()" onchange="setStripRole('+i+',this.value)"><option value="sample"'+(s.role==='sample'?'selected':'')+'>Sample</option><option value="reference"'+(s.role==='reference'?'selected':'')+'>Reference</option></select>':'')+
      (S.bMode==='dil'?'<select class="tp-select" onclick="event.stopPropagation()" onchange="setStripDilution('+i+',this.value)"><option value="1/1"'+(s.dilution==='1/1'||!s.dilution?'selected':'')+'>1/1</option><option value="1/2"'+(s.dilution==='1/2'?'selected':'')+'>1/2</option><option value="1/4"'+(s.dilution==='1/4'?'selected':'')+'>1/4</option><option value="1/8"'+(s.dilution==='1/8'?'selected':'')+'>1/8</option><option value="1/16"'+(s.dilution==='1/16'?'selected':'')+'>1/16</option></select>':'')+
      '<button style="background:none;border:none;color:var(--red);cursor:pointer;font-size:12px;padding:0 2px" onclick="event.stopPropagation();removeStrip('+i+')">✕</button></div>';
  }).join('');
}
function switchStrip(idx){
  S.bActiveStrip=idx;
  var si=S.bStrips[idx];
  if(si&&si.img){
    var cv=document.getElementById('b-cv'),box=document.getElementById('b-cbox');
    var maxW=box.clientWidth-4||600,scale=Math.min(1,maxW/si.img.width);
    cv.width=Math.round(si.img.width*scale);cv.height=Math.round(si.img.height*scale);
    cv.style.display='block';si.scale=scale;drawCanvas('b');
  }
  renderStripTabs();renderBRegionList();updateStripLabels();
}
function updateStripLabels(){
  var si=S.bStrips[S.bActiveStrip];
  var lbl=si?si.name+' ('+si.role+')':'';
  document.getElementById('b-current-strip-label').textContent='— '+lbl;
  document.getElementById('b-current-strip-label2').textContent='— '+lbl;
}
function setStripTimePoint(idx,val){S.bStrips[idx].timePoint=val;renderStripTabs();}
function setStripRole(idx,val){S.bStrips[idx].role=val;renderStripTabs();}
function setStripDilution(idx,val){S.bStrips[idx].dilution=val;renderStripTabs();}
function removeStrip(idx){
  S.bStrips.splice(idx,1);
  if(S.bActiveStrip>=S.bStrips.length)S.bActiveStrip=Math.max(0,S.bStrips.length-1);
  if(S.bStrips.length){var si=S.bStrips[S.bActiveStrip];if(si&&si.img)switchStrip(S.bActiveStrip);else{document.getElementById('b-cv').style.display='none';document.getElementById('b-ph').style.display='flex';}}
  else{document.getElementById('b-cv').style.display='none';document.getElementById('b-ph').style.display='flex';document.getElementById('b-upload').innerHTML='<div class="ui">🩸</div><div class="ul">Click to add a blood strip image</div><div class="us">Upload multiple strips for multi-strip modes</div><input type="file" id="b-file" accept="image/*" onchange="addBloodStrip(event)" style="display:none">';}
  renderStripTabs();renderBRegionList();updateStripLabels();
  if(!S.bStrips.length)document.getElementById('b-analyze-btn').disabled=true;
}
function renderBRegionList(){
  var el=document.getElementById('b-region-list');
  var si=S.bStrips[S.bActiveStrip];
  if(!si||!si.regions.length){el.innerHTML='<p style="font-size:12px;color:var(--muted);text-align:center;padding:16px">No layers.</p>';return;}
  var si2={rect:'▭',circle:'○'},lc={rbc:'#ef4444',plasma:'#f0d060',buffy:'#e8e0c8'};
  el.innerHTML=si.regions.map(function(r,i){
    return '<div class="region-item"><div class="ri-header"><div class="ri-id"><span style="color:'+(lc[r.layer]||'#fff')+'">'+(si2[r.shape]||'▭')+'</span>'+r.name+'<span class="ri-shape">'+r.shape+'</span></div><button class="ri-del" onclick="deleteBLayer('+i+')">✕</button></div><div class="ri-fields"><input type="text" value="'+r.name+'" onchange="updateBLayer('+i+',\'name\',this.value)"><select onchange="updateBLayer('+i+',\'layer\',this.value)"><option value="rbc"'+(r.layer==='rbc'?'selected':'')+'>🔴 RBC (top)</option><option value="plasma"'+(r.layer==='plasma'?'selected':'')+'>🟡 Plasma (middle)</option><option value="buffy"'+(r.layer==='buffy'?'selected':'')+'>⬜ Buffy (bottom)</option></select></div><div class="ri-color"><span class="ri-swatch" style="background:'+(r.rgb?'rgb('+r.rgb.R+','+r.rgb.G+','+r.rgb.B+')':'#333')+'"></span>'+(r.rgb?'RGB('+r.rgb.R+','+r.rgb.G+','+r.rgb.B+') OD:'+r.od:'Not measured')+'</div></div>';
  }).join('');
}
function updateBLayer(idx,f,v){var si=S.bStrips[S.bActiveStrip];if(!si)return;if(f==='layer')si.regions[idx].layer=v;else si.regions[idx].name=v;drawCanvas('b');renderBRegionList();}
function deleteBLayer(idx){var si=S.bStrips[S.bActiveStrip];if(!si)return;si.regions.splice(idx,1);drawCanvas('b');renderBRegionList();if(!si.regions.length)document.getElementById('b-analyze-btn').disabled=true;}
function clearBloodRegions(){var si=S.bStrips[S.bActiveStrip];if(!si)return;si.regions=[];drawCanvas('b');renderBRegionList();document.getElementById('b-results').innerHTML='<p style="font-size:12px;color:var(--muted);text-align:center;padding:20px">Cleared.</p>';document.getElementById('b-analyze-btn').disabled=true;}
function autoDetectBlood(){
  var si=S.bStrips[S.bActiveStrip];if(!si||!si.img){toast('Upload image first');return;}
  var cv=document.getElementById('b-cv'),h=cv.height,w=cv.width;
  si.regions=[
    {id:1,shape:'rect',name:'RBC Layer',layer:'rbc',x:8,y:0,w:w-16,h:Math.round(h*.42)},
    {id:2,shape:'rect',name:'Plasma',layer:'plasma',x:8,y:Math.round(h*.42),w:w-16,h:Math.round(h*.50)},
    {id:3,shape:'rect',name:'Buffy Coat',layer:'buffy',x:8,y:Math.round(h*.92),w:w-16,h:Math.round(h*.08)}
  ];
  drawCanvas('b');renderBRegionList();document.getElementById('b-analyze-btn').disabled=false;toast('Auto-detected 3 layers');
}
function setBMode(mode,el){
  S.bMode=mode;
  document.querySelectorAll('#pg-b .mb').forEach(function(b){b.classList.remove('on');});el.classList.add('on');
  document.querySelectorAll('.dmode').forEach(function(b){b.classList.remove('on');});
  var d=document.querySelector('.dmode[data-bmode="'+mode+'"]');if(d)d.classList.add('on');
  updateBModeInfo();renderStripTabs();
}
function updateBModeInfo(){
  var ms={sep:'<strong>Layer Separation</strong> — Measures RBC, Plasma, Buffy layers. Compares to healthy reference values.',dil:'<strong>Serial Dilution</strong> — Upload multiple dilution strips. Shows RGB/HSV trends.',time:'<strong>Time Points</strong> — Upload strips for Week 0-12. Tracks Hb recovery.',ref:'<strong>vs Reference</strong> — Upload sample and reference strips. Compares all layers.'};
  document.getElementById('b-mode-info').innerHTML=ms[S.bMode]||ms.sep;
}
function measureStripLayers(strip){
  var cv=document.getElementById('b-cv');
  if(!cv.width){toast('Canvas not ready');return null;}
  var regions=strip.regions;
  regions.forEach(function(r){measureRegion(r,'b');});
  var layers={};regions.forEach(function(r){layers[r.layer]=r;});
  var H=cv.height,rH=0,pH=0,bH=0;
  if(layers.rbc)rH=layers.rbc.h;
  if(layers.plasma)pH=layers.plasma.h;
  if(layers.buffy)bH=layers.buffy.h;
  var tot=rH+pH+bH||1;
  var hct=+(rH/tot*100).toFixed(1);
  var hb=+(hct/3).toFixed(1);
  var rp=+(rH/tot*100).toFixed(1),pp=+(pH/tot*100).toFixed(1),bp=+(bH/tot*100).toFixed(1);
  var flags={};
  if(layers.plasma){flags.icterus=icterusFlag(layers.plasma.lab);flags.lipemia=lipemiaFlag(layers.plasma.hsv,layers.plasma.lab);flags.plasmaClarity=+(100-layers.plasma.dE).toFixed(1);}
  if(layers.buffy){flags.buffyScore=buffyScore(bp);}
  if(layers.rbc){flags.pallorIndex=pallor(layers.rbc.lab.L);}
  var age=parseInt(document.getElementById('b-age').value)||25,sex=document.getElementById('b-sex').value||'female';
  var grp=age<12?'child':age<18?(sex==='male'?'teen-m':'teen-f'):(sex==='male'?'adult-m':'adult-f');
  var cls=classify(hb,grp);
  return{layers:layers,hct:hct,hb:hb,rp:rp,pp:pp,bp:bp,cls:cls,flags:flags,pid:document.getElementById('b-pid').value,date:new Date().toISOString().split('T')[0],grp:grp,stripName:strip.name,role:strip.role,timePoint:strip.timePoint,dilution:strip.dilution};
}
function analyzeBlood(){
  if(!S.bStrips.length){toast('Upload at least one blood strip');return;}
  var si=S.bStrips[S.bActiveStrip];
  if(!si.regions.length){toast('Draw layer regions on the active strip');return;}
  S.bMultiResults=[];
  S.bStrips.forEach(function(s){var result=measureStripLayers(s);if(result)S.bMultiResults.push(result);});
  renderBRegionList();
  var mode=S.bMode;
  if(mode==='sep'){var result=S.bMultiResults[0];if(result){S.bResults=result;renderBloodResults(result);renderIronRecommendation(result);renderBloodCharts(result);}toast('✓ Layer Separation complete');}
  else if(mode==='ref'){var samples=S.bMultiResults.filter(function(r){return r.role==='sample';});var refs=S.bMultiResults.filter(function(r){return r.role==='reference';});if(!samples.length||!refs.length){toast('Need both Sample and Reference strips.');return;}renderRefComparison(samples,refs);renderIronRecommendation(samples[0]);toast('✓ vs Reference complete');}
  else if(mode==='dil'){if(S.bMultiResults.length<2){toast('Upload at least 2 dilution strips');return;}renderDilutionResults(S.bMultiResults);renderIronRecommendation(S.bMultiResults[0]);toast('✓ Serial Dilution complete');}
  else if(mode==='time'){if(S.bMultiResults.length<2){toast('Upload at least 2 time point strips');return;}renderTimeResults(S.bMultiResults);renderIronRecommendation(S.bMultiResults[S.bMultiResults.length-1]);toast('✓ Time Points complete');}
}
function renderBloodResults(r){
  var el=document.getElementById('b-results');
  var f=r.flags||{},fl='';
  if(f.icterus)fl+='<span class="badge by" style="margin-right:4px">⚠ Icterus</span>';
  if(f.lipemia)fl+='<span class="badge by" style="margin-right:4px">⚠ Lipemia</span>';
  if(f.buffyScore&&f.buffyScore.n>=2)fl+='<span class="badge bo" style="margin-right:4px">⚠ '+f.buffyScore.l+'</span>';
  if(f.pallorIndex>30)fl+='<span class="badge br" style="margin-right:4px">⚠ Pallor '+f.pallorIndex+'%</span>';
  var h=(fl?'<div style="margin-bottom:10px;padding:8px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:6px">'+fl+'</div>':'')+
    '<div class="analysis-summary"><div class="as-item"><div class="as-val">'+r.hb+'</div><div class="as-lbl">Hb (g/dL)</div></div><div class="as-item"><div class="as-val">'+r.hct+'%</div><div class="as-lbl">Hct</div></div><div class="as-item"><div class="as-val">'+r.rp+'%</div><div class="as-lbl">RBC</div></div><div class="as-item"><div class="as-val">'+r.pp+'%</div><div class="as-lbl">Plasma</div></div><div class="as-item"><div class="as-val">'+r.bp+'%</div><div class="as-lbl">Buffy</div></div></div>'+
    '<div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>Layer</th><th>Color</th><th>%</th><th>R</th><th>G</th><th>B</th><th>Hue°</th><th>Sat%</th><th>Val%</th><th>LAB L</th><th>LAB A</th><th>LAB B</th><th>OD</th><th>ΔE vs Healthy</th></tr></thead><tbody>';
  ['rbc','plasma','buffy'].forEach(function(name){
    var l=r.layers[name];if(!l)return;
    var dc=l.dE<10?'var(--accent)':l.dE<25?'var(--yellow)':'var(--red)';
    var hp=name==='rbc'?r.rp:name==='plasma'?r.pp:r.bp;
    h+='<tr><td><b>'+name.toUpperCase()+'</b></td><td><span class="sw" style="background:rgb('+l.rgb.R+','+l.rgb.G+','+l.rgb.B+')"></span></td><td>'+hp+'%</td><td>'+l.rgb.R+'</td><td>'+l.rgb.G+'</td><td>'+l.rgb.B+'</td><td>'+l.hsv.H+'</td><td>'+l.hsv.S+'</td><td>'+l.hsv.V+'</td><td>'+l.lab.L+'</td><td>'+l.lab.A+'</td><td>'+l.lab.B+'</td><td>'+l.od+'</td><td style="color:'+dc+';font-weight:700">'+l.dE+'</td></tr>';
  });
  h+='</tbody></table></div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px;font-size:11px"><div style="background:var(--s2);border-radius:6px;padding:8px"><div style="color:var(--muted);font-size:10px;font-weight:700;margin-bottom:3px">PALLOR</div><div style="font-size:18px;font-weight:800;color:'+((f.pallorIndex||0)>30?'var(--red)':'var(--accent)')+'">'+(f.pallorIndex||'—')+'%</div><div style="color:var(--muted);font-size:10px">'+((f.pallorIndex||0)>60?'Severe':(f.pallorIndex||0)>30?'Moderate':'Normal')+'</div></div><div style="background:var(--s2);border-radius:6px;padding:8px"><div style="color:var(--muted);font-size:10px;font-weight:700;margin-bottom:3px">BUFFY</div><div style="font-size:14px;font-weight:700">'+(f.buffyScore?f.buffyScore.l:'—')+'</div><div style="color:var(--muted);font-size:10px">Score '+(f.buffyScore?f.buffyScore.n:'—')+'/3</div></div><div style="background:var(--s2);border-radius:6px;padding:8px"><div style="color:var(--muted);font-size:10px;font-weight:700;margin-bottom:3px">PLASMA</div><div style="font-size:14px;font-weight:700">'+(f.icterus?'Icteric':f.lipemia?'Lipemic':'Clear')+'</div><div style="color:var(--muted);font-size:10px">Clarity '+(f.plasmaClarity||'—')+'%</div></div></div>';
  el.innerHTML=h;
  document.getElementById('b-r-hct').textContent=r.hct+'%';
  document.getElementById('b-r-hb').textContent=r.hb+' g/dL';
  document.getElementById('b-r-rp').textContent=r.rp+'%';
  document.getElementById('b-r-pp').textContent=r.pp+'%';
  document.getElementById('b-r-bp').textContent=r.bp+'%';
  document.getElementById('b-r-cls').innerHTML='<span class="badge '+r.cls.c+'">'+r.cls.l+'</span>';
  if(r.layers.rbc){var l=r.layers.rbc;document.getElementById('b-sl-r').style.cssText='background:rgb('+l.rgb.R+','+l.rgb.G+','+l.rgb.B+');height:'+r.rp+'%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:7px';}
  if(r.layers.plasma){l=r.layers.plasma;document.getElementById('b-sl-p').style.cssText='background:rgb('+l.rgb.R+','+l.rgb.G+','+l.rgb.B+');height:'+r.pp+'%;display:flex;align-items:center;justify-content:center;color:#333;font-size:7px';}
  if(r.layers.buffy){l=r.layers.buffy;document.getElementById('b-sl-b').style.cssText='background:rgb('+l.rgb.R+','+l.rgb.G+','+l.rgb.B+');height:'+r.bp+'%;display:flex;align-items:center;justify-content:center;color:#333;font-size:7px';}
  document.getElementById('b-g-num').textContent=r.hb+' g/dL';
  var pct=Math.min(100,Math.max(0,(r.hb-5)/12*100));
  document.getElementById('b-g-ptr').style.left=pct+'%';
  var hbC=r.hb>=12?'#00e5a0':r.hb>=10?'#eab308':r.hb>=7?'#f97316':'#ef4444';
  document.getElementById('b-g-num').style.color=hbC;
}
function renderRefComparison(samples,refs){
  var el=document.getElementById('b-results');
  // Compute average reference from user-uploaded reference strips (not HEALTHY)
  var avgRef={rbc:{rgb:{R:0,G:0,B:0},hsv:{H:0,S:0,V:0},lab:{L:0,A:0,B:0},od:0},plasma:{rgb:{R:0,G:0,B:0},hsv:{H:0,S:0,V:0},lab:{L:0,A:0,B:0},od:0},buffy:{rgb:{R:0,G:0,B:0},hsv:{H:0,S:0,V:0},lab:{L:0,A:0,B:0},od:0}};
  var layerNames=['rbc','plasma','buffy'];
  layerNames.forEach(function(n){
    refs.forEach(function(r){
      var l=r.layers[n];if(!l)return;
      avgRef[n].rgb.R+=l.rgb.R;avgRef[n].rgb.G+=l.rgb.G;avgRef[n].rgb.B+=l.rgb.B;
      avgRef[n].hsv.H+=l.hsv.H;avgRef[n].hsv.S+=l.hsv.S;avgRef[n].hsv.V+=l.hsv.V;
      avgRef[n].lab.L+=l.lab.L;avgRef[n].lab.A+=l.lab.A;avgRef[n].lab.B+=l.lab.B;
      avgRef[n].od+=l.od;
    });
    var c=refs.filter(function(r){return r.layers[n];}).length||1;
    avgRef[n].rgb.R=Math.round(avgRef[n].rgb.R/c);avgRef[n].rgb.G=Math.round(avgRef[n].rgb.G/c);avgRef[n].rgb.B=Math.round(avgRef[n].rgb.B/c);
    avgRef[n].hsv.H=+(avgRef[n].hsv.H/c).toFixed(1);avgRef[n].hsv.S=+(avgRef[n].hsv.S/c).toFixed(1);avgRef[n].hsv.V=+(avgRef[n].hsv.V/c).toFixed(1);
    avgRef[n].lab.L=+(avgRef[n].lab.L/c).toFixed(1);avgRef[n].lab.A=+(avgRef[n].lab.A/c).toFixed(1);avgRef[n].lab.B=+(avgRef[n].lab.B/c).toFixed(1);
    avgRef[n].od=+(avgRef[n].od/c).toFixed(4);
  });
  
  // Build results table
  var h='<div class="analysis-summary"><div class="as-item"><div class="as-val">'+samples.length+'</div><div class="as-lbl">Samples</div></div><div class="as-item"><div class="as-val">'+refs.length+'</div><div class="as-lbl">References</div></div></div>';
  h+='<div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>Sample</th><th>Layer</th><th>Metric</th><th>Sample</th><th>Reference</th><th>Δ</th><th>Status</th></tr></thead><tbody>';
  samples.forEach(function(s,si){
    layerNames.forEach(function(n){
      var l=s.layers[n];if(!l)return;
      var r=avgRef[n];
      var dRGB=Math.round(Math.abs(l.rgb.R-r.rgb.R)+Math.abs(l.rgb.G-r.rgb.G)+Math.abs(l.rgb.B-r.rgb.B));
      var dLab=dE(l.lab,{L:r.lab.L,A:r.lab.A,B:r.lab.B});
      var status=dLab<10?'<span class="badge bg">Normal</span>':dLab<25?'<span class="badge by">Slight diff</span>':'<span class="badge br">Different</span>';
      h+='<tr><td><b>'+s.stripName+'</b></td><td><b>'+n.toUpperCase()+'</b></td><td>RGB</td><td>'+l.rgb.R+','+l.rgb.G+','+l.rgb.B+'</td><td>'+r.rgb.R+','+r.rgb.G+','+r.rgb.B+'</td><td>'+dRGB+'</td><td>'+status+'</td></tr>';
      h+='<tr><td></td><td></td><td>OD</td><td>'+l.od+'</td><td>'+r.od+'</td><td>'+(l.od-r.od).toFixed(4)+'</td><td></td></tr>';
      h+='<tr><td></td><td></td><td>ΔE</td><td colspan="2">vs Reference</td><td>'+dLab.toFixed(2)+'</td><td>'+status+'</td></tr>';
    });
  });
  h+='</tbody></table></div>';
  el.innerHTML=h;
  
  // Draw comparison charts (vs user reference, not HEALTHY)
  var sampleLabels=samples.map(function(s){return s.stripName||'Sample';});
  var refLabel=refs.length===1?(refs[0].stripName||'Reference'):'Avg Reference';
  
  // Layer % comparison chart
  var layerLabels=['RBC','Plasma','Buffy'];
  var samplePcts=layerNames.map(function(n){
    var avg=0,c=0;
    samples.forEach(function(s){if(s.layers[n]){avg+=n==='rbc'?s.rp:n==='plasma'?s.pp:s.bp;c++;}});
    return c?Math.round(avg/c):0;
  });
  var refPcts=layerNames.map(function(n){
    var avg=0,c=0;
    refs.forEach(function(s){if(s.layers[n]){avg+=n==='rbc'?s.rp:n==='plasma'?s.pp:s.bp;c++;}});
    return c?Math.round(avg/c):0;
  });
  mk('b-layers',{type:'bar',data:{labels:layerLabels,datasets:[{label:'Sample Avg',data:samplePcts,backgroundColor:'rgba(0,229,160,.7)'},{label:refLabel,data:refPcts,backgroundColor:'rgba(59,130,246,.7)'}]},options:{responsive:true,plugins:{legend:lO,title:{display:true,text:'Layer %: Sample vs Reference',color:'#e2e8f0',font:{size:10}}},scales:{x:{ticks:tO,grid:gO},y:{max:100,ticks:tO,grid:gO}}}});
  
  // RGB comparison chart
  var rgbLabels=['R','G','B'];
  var sampleRGB=[0,0,0],refRGB=[0,0,0];
  layerNames.forEach(function(n){
    samples.forEach(function(s){if(s.layers[n]){sampleRGB[0]+=s.layers[n].rgb.R;sampleRGB[1]+=s.layers[n].rgb.G;sampleRGB[2]+=s.layers[n].rgb.B;}});
    refs.forEach(function(s){if(s.layers[n]){refRGB[0]+=s.layers[n].rgb.R;refRGB[1]+=s.layers[n].rgb.G;refRGB[2]+=s.layers[n].rgb.B;}});
  });
  var sc=samples.length*3||1,rc=refs.length*3||1;
  sampleRGB=[Math.round(sampleRGB[0]/sc),Math.round(sampleRGB[1]/sc),Math.round(sampleRGB[2]/sc)];
  refRGB=[Math.round(refRGB[0]/rc),Math.round(refRGB[1]/rc),Math.round(refRGB[2]/rc)];
  mk('b-rgb',{type:'bar',data:{labels:rgbLabels,datasets:[{label:'Sample Avg',data:sampleRGB,backgroundColor:'rgba(0,229,160,.7)'},{label:refLabel,data:refRGB,backgroundColor:'rgba(59,130,246,.7)'}]},options:{responsive:true,plugins:{legend:lO,title:{display:true,text:'RGB: Sample vs Reference',color:'#e2e8f0',font:{size:10}}},scales:{x:{ticks:tO,grid:gO},y:{max:255,ticks:tO,grid:gO}}}});
  
  // ΔE comparison per layer
  var dEdata=layerNames.map(function(n){
    var avg=0,c=0;
    samples.forEach(function(s){
      if(s.layers[n]&&avgRef[n]){avg+=dE(s.layers[n].lab,{L:avgRef[n].lab.L,A:avgRef[n].lab.A,B:avgRef[n].lab.B});c++;}
    });
    return c?+(avg/c).toFixed(1):0;
  });
  mk('b-hsv',{type:'bar',data:{labels:layerLabels.map(function(l){return l.toUpperCase();}),datasets:[{label:'ΔE vs Reference',data:dEdata,backgroundColor:['rgba(239,68,68,.7)','rgba(240,208,96,.7)','rgba(200,200,200,.7)']}]},options:{responsive:true,plugins:{legend:lO,title:{display:true,text:'ΔE per Layer vs Reference',color:'#e2e8f0',font:{size:10}}},scales:{x:{ticks:tO,grid:gO},y:{ticks:tO,grid:gO}}}});
  
  // Store first sample for strip viz
  if(samples[0]){S.bResults=samples[0];renderBloodResults(samples[0]);}
}
function renderDilutionResults(results){var el=document.getElementById('b-results');var sorted=[].concat(results).sort(function(a,b){return parseFloat(b.dilution?b.dilution.split('/')[1]:1)-parseFloat(a.dilution?a.dilution.split('/')[1]:1);});var h='<div class="analysis-summary"><div class="as-item"><div class="as-val">'+results.length+'</div><div class="as-lbl">Dilutions</div></div></div>';h+='<div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>Dilution</th><th>Layer</th><th>R</th><th>G</th><th>B</th><th>Hue°</th><th>Sat%</th><th>Val%</th><th>OD</th><th>Hb</th></tr></thead><tbody>';sorted.forEach(function(r){['rbc','plasma','buffy'].forEach(function(n){var l=r.layers[n];if(!l)return;h+='<tr><td><b>'+(r.dilution||'?')+'</b></td><td>'+n.toUpperCase()+'</td><td>'+l.rgb.R+'</td><td>'+l.rgb.G+'</td><td>'+l.rgb.B+'</td><td>'+l.hsv.H+'</td><td>'+l.hsv.S+'</td><td>'+l.hsv.V+'</td><td>'+l.od+'</td><td>'+(n==='rbc'?r.hb+' g/dL':'')+'</td></tr>';});});h+='</tbody></table></div>';el.innerHTML=h;}
function renderTimeResults(results){var el=document.getElementById('b-results');var sorted=[].concat(results).sort(function(a,b){return(a.timePoint||'Week 0').localeCompare(b.timePoint||'Week 0');});var labels=sorted.map(function(r){return r.timePoint||'?';});var hbData=sorted.map(function(r){return r.hb;});var hctData=sorted.map(function(r){return r.hct;});mk('b-layers',{type:'line',data:{labels:labels,datasets:[{label:'Hb (g/dL)',data:hbData,borderColor:'#00e5a0',backgroundColor:'rgba(0,229,160,.1)',fill:true,tension:.4,pointRadius:6,borderWidth:2},{label:'Hct%',data:hctData,borderColor:'#3b82f6',borderDash:[5,3],fill:false,tension:.4,pointRadius:4,borderWidth:1.5}]},options:{responsive:true,plugins:{legend:lO,title:{display:true,text:'Hb Recovery Over Time',color:'#e2e8f0',font:{size:11}}},scales:{x:{ticks:tO,grid:gO},y:{min:0,max:18,ticks:tO,grid:gO,title:{display:true,text:'Hb (g/dL)',color:'#64748b'}}}}});
  var h='<div class="analysis-summary"><div class="as-item"><div class="as-val">'+results.length+'</div><div class="as-lbl">Time Points</div></div><div class="as-item"><div class="as-val">'+(hbData[hbData.length-1]-hbData[0]).toFixed(1)+'</div><div class="as-lbl">Hb Change</div></div></div>';
  h+='<div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>Time</th><th>Hb</th><th>Hct</th><th>RBC%</th><th>Plasma%</th><th>Buffy%</th><th>RBC R</th><th>RBC G</th><th>RBC B</th><th>Status</th></tr></thead><tbody>';
  sorted.forEach(function(r){var l=r.layers.rbc;h+='<tr><td><b>'+(r.timePoint||'?')+'</b></td><td>'+r.hb+'</td><td>'+r.hct+'%</td><td>'+r.rp+'%</td><td>'+r.pp+'%</td><td>'+r.bp+'%</td><td>'+(l?l.rgb.R:'—')+'</td><td>'+(l?l.rgb.G:'—')+'</td><td>'+(l?l.rgb.B:'—')+'</td><td><span class="badge '+r.cls.c+'">'+r.cls.l+'</span></td></tr>';});
  h+='</tbody></table></div>';el.innerHTML=h;}
function renderBloodCharts(r){mk('b-layers',{type:'bar',data:{labels:['Your Sample','Healthy Ref'],datasets:[{label:'RBC%',data:[r.rp,42],backgroundColor:'rgba(192,40,42,.8)'},{label:'Plasma%',data:[r.pp,50],backgroundColor:'rgba(240,208,96,.8)'},{label:'Buffy%',data:[r.bp,8],backgroundColor:'rgba(232,224,200,.8)'}]},options:{responsive:true,plugins:{legend:lO},scales:{x:{stacked:true,ticks:tO,grid:gO},y:{stacked:true,max:100,ticks:tO,grid:gO}}}});if(r.layers.rbc&&r.layers.rbc.rawPx){var px=r.layers.rbc.rawPx;var rH=new Array(16).fill(0),gH=new Array(16).fill(0),bH=new Array(16).fill(0);for(var i=0;i<px.length;i+=4){rH[px[i]>>4]++;gH[px[i+1]>>4]++;bH[px[i+2]>>4]++;}mk('b-hist',{type:'line',data:{labels:Array.from({length:16},function(_,i){return i*16;}),datasets:[{label:'R',data:rH,borderColor:'#ef4444',fill:true,backgroundColor:'rgba(239,68,68,.1)',tension:.4,pointRadius:0,borderWidth:1.5},{label:'G',data:gH,borderColor:'#00e5a0',fill:true,backgroundColor:'rgba(0,229,160,.1)',tension:.4,pointRadius:0,borderWidth:1.5},{label:'B',data:bH,borderColor:'#3b82f6',fill:true,backgroundColor:'rgba(59,130,246,.1)',tension:.4,pointRadius:0,borderWidth:1.5}]},options:{responsive:true,plugins:{legend:lO},scales:{x:{ticks:tO,grid:gO},y:{ticks:tO,grid:gO}}}});}var names=['RBC','Plasma','Buffy'];var healthy=[[192,40,42],[240,208,96],[232,224,200]];var yours=[r.layers.rbc?[r.layers.rbc.rgb.R,r.layers.rbc.rgb.G,r.layers.rbc.rgb.B]:[128,128,128],r.layers.plasma?[r.layers.plasma.rgb.R,r.layers.plasma.rgb.G,r.layers.plasma.rgb.B]:[128,128,128],r.layers.buffy?[r.layers.buffy.rgb.R,r.layers.buffy.rgb.G,r.layers.buffy.rgb.B]:[128,128,128]];mk('b-sw',{type:'bar',data:{labels:names,datasets:[{label:'Your R',data:yours.map(function(c){return c[0];}),backgroundColor:yours.map(function(c){return 'rgb('+c[0]+','+c[1]+','+c[2]+')';}),borderWidth:1,borderColor:'#2a3a50'},{label:'Healthy R',data:healthy.map(function(c){return c[0];}),backgroundColor:healthy.map(function(c){return 'rgba('+c[0]+','+c[1]+','+c[2]+',.5)';}),borderWidth:1,borderColor:'#2a3a50'}]},options:{responsive:true,plugins:{legend:lO},scales:{x:{ticks:tO,grid:gO},y:{max:255,ticks:tO,grid:gO}}}});renderRadarChart(r);}
function renderRadarChart(r){if(!r)return;var ld=['rbc','plasma','buffy'].map(function(n){return r.layers[n]?r.layers[n].lab:{L:0,A:0,B:0};});mk('b-lab',{type:'radar',data:{labels:['LAB L','LAB A','LAB B'],datasets:ld.map(function(l,i){return{label:['RBC','Plasma','Buffy'][i],data:[l.L,l.A,l.B],borderColor:['#ef4444','#f0d060','#ccc'][i],backgroundColor:['rgba(239,68,68,.1)','rgba(240,208,96,.1)','rgba(200,200,200,.1)'][i],pointRadius:3};})},options:{responsive:true,plugins:{legend:lO},scales:{r:{ticks:{color:'#64748b',font:{size:8}},grid:{color:'#2a3a50'},pointLabels:{color:'#64748b',font:{size:9}}}}}});}

function renderIronRecommendation(r){
  var el=document.getElementById('b-iron-rec');var hb=r.hb,grp=r.grp||'adult-f';var thr={child:11,'teen-m':13,'teen-f':12,'adult-m':13,'adult-f':12,pregnant:11,'post-m':12,elder:12};var normalHb=thr[grp]||12;var status,severity;
  if(hb>=normalHb){status='normal';severity='Normal';}else if(hb>=10){status='mild';severity='Mild Anaemia';}else if(hb>=7){status='moderate';severity='Moderate Anaemia';}else{status='severe';severity='Severe Anaemia';}
  var wt=parseFloat(document.getElementById('s-wt').value)||60;var estBloodVol=wt*65;var hbDeficit=normalHb-hb;var ironDeficit=hbDeficit*estBloodVol*3.4/1000;var sorted=[].concat(VEG_DB).sort(function(a,b){return b.iron-a.iron;});var top3=sorted.slice(0,3);var bestVeg=top3[0];
  var h='<div style="margin-bottom:8px"><div style="font-size:13px;font-weight:700;color:'+(status==='normal'?'var(--accent)':'var(--orange)')+'">'+(status==='normal'?'✅ Hb Normal':severity)+'</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Hb: <strong style="color:var(--text)">'+hb+' g/dL</strong> · Target: <strong style="color:var(--accent)">'+normalHb+' g/dL</strong> · Deficit: <strong style="color:var(--orange)">'+ironDeficit.toFixed(1)+' mg Fe</strong></div></div>';
  if(status!=='normal'){h+='<div class="veg-rec"><div style="font-size:10px;color:var(--muted);margin-bottom:4px">🥇 Best Iron-Rich Food</div><div class="vr-name">'+bestVeg.name+'</div><div class="vr-detail">'+bestVeg.iron+' mg Fe/100g · '+bestVeg.type+' · '+bestVeg.note+'</div></div>';h+='<table class="veg-table"><thead><tr><th>#</th><th>Food</th><th>Fe mg/100g</th><th>Type</th><th>Note</th></tr></thead><tbody>'+top3.map(function(v,i){return '<tr><td>'+(i+1)+'</td><td><strong>'+v.name+'</strong></td><td>'+v.iron+'</td><td>'+v.type+'</td><td style="font-size:9px;color:var(--muted)">'+v.note+'</td></tr>';}).join('')+'</tbody></table>';h+='<div style="font-size:10px;color:var(--muted);margin-top:6px">💡 Click <strong>"Load Best Vegetable Iron"</strong> in Simulation tab to use '+bestVeg.name+'.</div>';}else{h+='<div style="font-size:11px;color:var(--muted)">Maintain diet with iron-rich foods like <strong>'+sorted[0].name+'</strong> ('+sorted[0].iron+' mg/100g).</div>';}el.innerHTML=h;
}

// ═══════════════════════════════════════════════════════════════
//  SIMULATION
// ═══════════════════════════════════════════════════════════════
var PROF = {
  child:{nHb:12.5,rda:9,thr:11.0,ab:0.12,label:'Child 6mo-11yr'},
  'teen-m':{nHb:14.5,rda:11,thr:13.0,ab:0.10,label:'Teen Boy 12-17'},
  'teen-f':{nHb:13.0,rda:15,thr:12.0,ab:0.12,label:'Teen Girl 12-17'},
  'adult-m':{nHb:15.5,rda:8,thr:13.0,ab:0.08,label:'Adult Male 18-50'},
  'adult-f':{nHb:13.5,rda:18,thr:12.0,ab:0.10,label:'Adult Female 18-50'},
  pregnant:{nHb:12.0,rda:27,thr:11.0,ab:0.20,label:'Pregnant Woman'},
  'post-m':{nHb:13.5,rda:8,thr:12.0,ab:0.08,label:'Post-menopausal'},
  elder:{nHb:13.0,rda:8,thr:12.0,ab:0.09,label:'Elderly 65+'}
};
var FE_PER_HB = 3.4;
var DAILY_LOSS = 0.9;
var BLOOD_VOL_PER_KG = 65;

function runSim() {
  var grp = document.getElementById('s-age').value;
  var p = PROF[grp];
  var hb0 = parseFloat(document.getElementById('s-hb').value);
  var fe100 = parseFloat(document.getElementById('s-fe').value);
  var sv = parseFloat(document.getElementById('s-sv').value);
  var wks = parseInt(document.getElementById('s-wk').value);
  var wt = parseFloat(document.getElementById('s-wt').value) || 60;
  var vc = parseFloat(document.getElementById('s-vc').value);
  var inh = parseFloat(document.getElementById('s-inh').value);
  if (!hb0 || hb0 < 1 || hb0 > 18) { toast('Enter valid Hb (1-18 g/dL)'); return; }
  if (!fe100 || fe100 < 0.1) { toast('Enter valid iron content'); return; }
  if (!sv || sv < 10) { toast('Enter valid serving size'); return; }
  var feDay = (fe100 / 100) * sv;
  var deficit = Math.max(0.1, (p.nHb - hb0) / p.nHb);
  var totalBloodVol = wt * BLOOD_VOL_PER_KG;
  var totalHbMass = hb0 * totalBloodVol / 100;
  var totalIronInHb = totalHbMass * 3.4;
  var targetHbMass = p.thr * totalBloodVol / 100;
  var targetIronInHb = targetHbMass * 3.4;
  var totalIronDeficit = Math.max(0, targetIronInHb - totalIronInHb);
  var severity, sevColor;
  if (hb0 >= p.thr) { severity = 'Normal'; sevColor = '#00e5a0'; }
  else if (hb0 >= p.nHb * 0.85) { severity = 'Mild Anaemia'; sevColor = '#eab308'; }
  else if (hb0 >= p.nHb * 0.65) { severity = 'Moderate Anaemia'; sevColor = '#f97316'; }
  else { severity = 'Severe Anaemia'; sevColor = '#ef4444'; }
  var hb = hb0, totFeAbs = 0, rows = [], dailyFeData = [];
  for (var d = 0; d <= wks * 7; d++) {
    var w = Math.floor(d / 7);
    var currentDeficit = Math.max(0.1, (p.nHb - hb) / p.nHb);
    var absRate = Math.min(0.35, p.ab * (1 + currentDeficit * 2) * vc * inh);
    var feAbsorbed = feDay * absRate;
    var netFe = feAbsorbed - DAILY_LOSS;
    var hbGainPerDay = netFe / FE_PER_HB;
    if (d % 7 === 0) {
      hb = Math.min(p.nHb, Math.max(1, hb));
      var hct = +(hb * 3).toFixed(1);
      var cls = classify(hb, grp);
      rows.push({ w: w, hb: +hb.toFixed(2), hct: hct, feAbs: +(feAbsorbed * 7).toFixed(2), ar: +(absRate * 100).toFixed(1), cls: cls, cumFe: +(totFeAbs + feAbsorbed * 7).toFixed(1) });
    }
    hb += hbGainPerDay;
    totFeAbs += feAbsorbed;
    dailyFeData.push({ d: d, hb: +hb.toFixed(3), feAbsorbed: feAbsorbed, absRate: absRate });
  }
  var fHb = rows.length > 0 ? rows[rows.length - 1].hb : hb0;
  var recWeek = null;
  for (var i = 0; i < rows.length; i++) { if (rows[i].hb >= p.thr) { recWeek = rows[i].w; break; } }
  var additionalNeeded = 0, bestVeg = null;
  if (fHb < p.thr) {
    var remainingDeficit = p.thr - fHb;
    var remainingFe = remainingDeficit * FE_PER_HB * 7;
    additionalNeeded = remainingFe;
    var sorted = [].concat(VEG_DB).sort(function(a,b){return b.iron - a.iron;});
    bestVeg = sorted[0];
  }
  S.simRes = { rows: rows, p: p, grp: grp, hb0: hb0, fHb: fHb, feDay: feDay, totFeAbs: +totFeAbs.toFixed(1), rec: recWeek, severity: severity, sevColor: sevColor, totalIronDeficit: +totalIronDeficit.toFixed(1), additionalNeeded: +additionalNeeded.toFixed(1), bestVeg: bestVeg, wt: wt, fe100: fe100, sv: sv, wks: wks, vc: vc, inh: inh, dailyFeData: dailyFeData };
  renderSim();
  toast('✓ Clinical simulation complete');
}

function renderSim() {
  var r = S.simRes; if (!r) return;
  var rows = r.rows, p = r.p, hb0 = r.hb0, fHb = r.fHb, rec = r.rec, severity = r.severity, sevColor = r.sevColor, totalIronDeficit = r.totalIronDeficit, additionalNeeded = r.additionalNeeded, bestVeg = r.bestVeg, feDay = r.feDay, totFeAbs = r.totFeAbs;
  var ok = fHb >= p.thr;
  document.getElementById('s-stats').style.display = 'flex';
  document.getElementById('ss-s').innerHTML = hb0 + '<span class="su">g/dL</span>';
  document.getElementById('ss-f').innerHTML = fHb + '<span class="su">g/dL</span>';
  document.getElementById('ss-r').innerHTML = (rec || (fHb >= p.thr ? '0' : '—')) + '<span class="su">wks</span>';
  document.getElementById('ss-fe').innerHTML = totFeAbs + '<span class="su">mg</span>';
  document.getElementById('ss-ar').innerHTML = (rows[0] ? rows[0].ar : 0) + '<span class="su">%</span>';
  var summary = '<div style="font-size:14px;font-weight:700;color:' + sevColor + ';margin-bottom:6px">' + severity + ' ' + (ok ? '— Recovery Achieved ✅' : '— Treatment Required') + '</div>';
  summary += '<div style="font-size:11px;color:var(--muted);line-height:1.7">';
  summary += '🩸 <b>Haemoglobin:</b> ' + hb0 + ' → <b style="color:' + sevColor + '">' + fHb + ' g/dL</b> ';
  summary += ok ? '(Normal ≥ ' + p.thr + ')' : '(Target: ' + p.thr + ' g/dL)';
  if (rec) summary += ' · Normal at <b>Week ' + rec + '</b>';
  summary += '<br>🧪 <b>Iron deficit:</b> ' + totalIronDeficit + ' mg · <b>Daily intake:</b> ' + feDay.toFixed(1) + ' mg Fe/day · <b>Absorption rate:</b> ' + (rows[0] ? rows[0].ar : 0) + '%';
  summary += '<br>📊 <b>Group:</b> ' + p.label + ' · <b>Normal Hb:</b> ' + p.nHb + ' g/dL · <b>RDA:</b> ' + p.rda + ' mg/day';
  if (!ok && additionalNeeded > 0 && bestVeg) {
    var extraServings = Math.ceil(additionalNeeded / (bestVeg.iron / 100 * 100));
    summary += '<br>🥦 <b>Recommended:</b> Increase intake by <b>' + additionalNeeded + ' mg Fe/week</b>';
    summary += '<br>💡 <b>Best food:</b> ' + bestVeg.name + ' (' + bestVeg.iron + ' mg/100g) — ~' + extraServings + 'g/day extra';
  }
  summary += '</div>';
  document.getElementById('s-summary').innerHTML = summary;
  mk('s-hb', { type: 'line', data: { labels: rows.map(function(r){return 'W' + r.w;}), datasets: [{ label: 'Hb (g/dL)', data: rows.map(function(r){return r.hb;}), borderColor: '#00e5a0', backgroundColor: 'rgba(0,229,160,.1)', fill: true, tension: .4, pointRadius: 3, borderWidth: 2 }, { label: 'Hct%÷3', data: rows.map(function(r){return r.hct / 3;}), borderColor: '#3b82f6', borderDash: [5, 3], fill: false, tension: .4, pointRadius: 0, borderWidth: 1.5 }, { label: 'Normal threshold', data: rows.map(function(){return p.thr;}), borderColor: '#eab308', borderDash: [8, 4], fill: false, pointRadius: 0, borderWidth: 1 }] }, options: { responsive: true, plugins: { legend: lO, title: { display: true, text: 'Haemoglobin Recovery Projection', color: '#e2e8f0', font: { size: 11 } } }, scales: { x: { ticks: Object.assign({}, tO, {maxTicksLimit: 14}), grid: gO, title: { display: true, text: 'Week', color: '#64748b' } }, y: { min: Math.max(0, hb0 - 2), max: Math.max(18, p.nHb + 2), ticks: tO, grid: gO, title: { display: true, text: 'Hb (g/dL)', color: '#64748b' } } } } });
  document.getElementById('s-tbody').innerHTML = rows.map(function(r){return '<tr><td>' + r.w + '</td><td><b>' + r.hb + '</b></td><td>' + r.hct + '</td><td>' + r.feAbs + '</td><td>' + r.ar + '%</td><td>' + r.cumFe + '</td><td><span class="badge ' + r.cls.c + '">' + r.cls.l + '</span></td></tr>';}).join('');
  var step = Math.max(1, Math.floor(rows.length / 8));
  var kw = rows.filter(function(_, i){return i % step === 0 || i === rows.length - 1;});
  document.getElementById('s-tline').innerHTML = kw.map(function(r){
    var hct = r.hct, pp = Math.max(5, 100 - hct - 3);
    var rC = 'hsl(0,' + Math.min(80, 30 + hct) + '%,' + Math.max(20, 50 - hct / 2) + '%)';
    var pC = 'hsl(50,' + Math.min(60, 10 + hct / 3) + '%,' + Math.min(85, 60 + hct / 4) + '%)';
    var hC = r.hb >= p.thr ? '#00e5a0' : r.hb >= 10 ? '#eab308' : '#ef4444';
    return '<div class="ti"><div class="tw">Week ' + r.w + '</div><div class="ts" style="height:70px"><div style="height:' + hct + '%;background:' + rC + ';display:flex;align-items:center;justify-content:center;color:#fff;font-size:6px">R</div><div style="height:3%;background:#ddd"></div><div style="height:' + pp + '%;background:' + pC + ';display:flex;align-items:center;justify-content:center;color:#333;font-size:6px">P</div></div><div class="th" style="color:' + hC + '">' + r.hb + '</div><div class="thc">' + hct + '%</div></div>';
  }).join('');
  renderSimIronRecommendation();
}

function renderSimIronRecommendation() {
  var r = S.simRes; if (!r) return;
  var el = document.getElementById('b-iron-rec');
  var hb0 = r.hb0, p = r.p, severity = r.severity, totalIronDeficit = r.totalIronDeficit, feDay = r.feDay, bestVeg = r.bestVeg, additionalNeeded = r.additionalNeeded;
  var scored = VEG_DB.map(function(v){var bioavail = v.vitC > 20 ? 1.3 : v.vitC > 5 ? 1.15 : 1.0; var score = v.iron * bioavail; return Object.assign({}, v, {score: +score.toFixed(1)});}).sort(function(a,b){return b.score - a.score;});
  var top5 = scored.slice(0, 5), bestScored = top5[0];
  var h = '<div style="margin-bottom:8px"><div style="font-size:13px;font-weight:700;color:' + r.sevColor + '">' + severity + ' — Iron Deficiency Assessment</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Current Hb: <strong style="color:var(--text)">' + hb0 + ' g/dL</strong> · Target: <strong style="color:var(--accent)">' + p.thr + ' g/dL</strong> · Deficit: <strong style="color:var(--orange)">' + totalIronDeficit + ' mg Fe</strong></div></div>';
  if (hb0 < p.thr) {
    h += '<div class="veg-rec"><div style="font-size:10px;color:var(--muted);margin-bottom:2px">🥇 Optimal Iron-Rich Food (bioavailability-weighted)</div><div class="vr-name">' + bestScored.name + '</div><div class="vr-detail">' + bestScored.iron + ' mg Fe/100g · Bioavailability score: ' + bestScored.score + ' · ' + bestScored.note + '</div></div>';
    h += '<table class="veg-table"><thead><tr><th>Rank</th><th>Food</th><th>Fe mg/100g</th><th>Vit C</th><th>BioScore</th><th>Recommendation</th></tr></thead><tbody>' + top5.map(function(v,i){return '<tr><td>' + (i+1) + '</td><td><strong>' + v.name + '</strong></td><td>' + v.iron + '</td><td>' + v.vitC + 'mg</td><td>' + v.score + '</td><td style="font-size:9px;color:var(--muted)">' + v.note + '</td></tr>';}).join('') + '</tbody></table>';
    if (additionalNeeded > 0) {
      var dailyG = Math.ceil(additionalNeeded / 7 / (bestScored.iron / 100) * 10) * 10;
      h += '<div style="font-size:10px;color:var(--muted);margin-top:6px">💡 To reach target Hb, consume ~<strong>' + dailyG + 'g</strong> of ' + bestScored.name + ' daily, or combine with vitamin C-rich foods (bell peppers, citrus) to boost absorption.</div>';
    }
  } else { h += '<div style="font-size:11px;color:var(--muted)">Maintain a balanced diet. Top iron-rich choices: <strong>' + top5[0].name + '</strong> (' + top5[0].iron + ' mg/100g), <strong>' + top5[1].name + '</strong> (' + top5[1].iron + ' mg/100g).</div>'; }
  el.innerHTML = h;
}

function loadFromBlood() {
  if (!S.bResults) { toast('Run blood analysis first (Blood Analysis tab)'); return; }
  document.getElementById('s-hb').value = S.bResults.hb;
  toast('✓ Hb loaded: ' + S.bResults.hb + ' g/dL from blood analysis');
}
function loadFromColor() {
  // First check if iron analysis results are available (Iron Analysis mode)
  if (S.ironResults && S.ironResults.stats && S.ironResults.stats.mean !== null) {
    var ironConc = S.ironResults.stats.mean;
    // Convert mg/L to mg/100g (assuming 1g sample in 10mL, factor ~2)
    var per100g = +(ironConc * 2).toFixed(2);
    document.getElementById('s-fe').value = per100g;
    toast('✓ Iron loaded: ' + per100g + ' mg/100g from iron analysis (mean conc: ' + ironConc + ' mg/L)');
    return;
  }
  // Fall back to standard colorimetry calibration
  var r = null; for (var i = 0; i < S.cRegions.length; i++) { if (S.cRegions[i].conc != null) { r = S.cRegions[i]; break; } }
  if (!r || !S.calCurve) { toast('Run colorimetry with calibration curve or iron analysis first'); return; }
  var per100g = +(r.conc * (10 / 0.5) / 10).toFixed(2);
  document.getElementById('s-fe').value = per100g;
  toast('✓ Iron loaded: ' + per100g + ' mg/100g from colorimetry');
}
function loadBestVeg() {
  var scored = VEG_DB.map(function(v){var bioavail = v.vitC > 20 ? 1.3 : v.vitC > 5 ? 1.15 : 1.0; return Object.assign({}, v, {score: v.iron * bioavail});}).sort(function(a,b){return b.score - a.score;});
  var best = scored[0];
  document.getElementById('s-fe').value = best.iron;
  toast('✓ Loaded ' + best.name + ': ' + best.iron + ' mg Fe/100g');
}

// ═══════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════
function doExport(fmt,tab){
  if(!tab||tab==='c')exportColorimetry(fmt);
  else if(tab==='b')exportBlood(fmt);
  else if(tab==='s')exportSim(fmt);
}
function dl(content,name,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:type}));a.download=name;a.click();}

function exportColorimetry(fmt){
  var regions=[];for(var i=0;i<S.cRegions.length;i++){if(S.cRegions[i].rgb)regions.push(S.cRegions[i]);}
  if(!regions.length){toast('No data');return;}
  if(fmt==='csv'){
    var csv='Region,Name,Type,Shape,R,G,B,Hue,Sat,Val,LAB_L,LAB_A,LAB_B,OD,DeltaE';if(S.calCurve)csv+=',Conc_mgL';csv+='\n';
    regions.forEach(function(r){csv+='R'+r.id+','+r.name+','+r.type+','+r.shape+','+r.rgb.R+','+r.rgb.G+','+r.rgb.B+','+r.hsv.H+','+r.hsv.S+','+r.hsv.V+','+r.lab.L+','+r.lab.A+','+r.lab.B+','+r.od+','+r.dE;if(S.calCurve)csv+=','+(r.conc||'');csv+='\n';});
    dl(csv,'colorimetry.csv','text/csv');toast('✓ CSV');
  } else if(fmt==='json'){
    var data={type:'colorimetry',date:new Date().toISOString().split('T')[0],experiment:document.getElementById('c-name').value,analyte:document.getElementById('c-analyte').value,mode:S.cMode,calibration:S.calCurve,regions:regions.map(function(r){var o={};for(var k in r){if(k!=='rawPx')o[k]=r[k];}return o;})};
    dl(JSON.stringify(data,null,2),'colorimetry.json','application/json');toast('✓ JSON');
  } else if(fmt==='pdf'){
    try{if(typeof window.jspdf!=='undefined'&&window.jspdf.jsPDF){var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});var W=210;
    doc.setFillColor(15,17,23);doc.rect(0,0,W,297,'F');doc.setFillColor(24,30,42);doc.rect(0,0,W,16,'F');
    doc.setTextColor(0,229,160);doc.setFontSize(11);doc.setFont('helvetica','bold');doc.text('μFluidic Lab Analyser — Colorimetry Report',10,10);
    doc.setTextColor(100,116,139);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text(new Date().toLocaleString(),W-10,10,{align:'right'});var y=24;
    doc.setTextColor(226,232,240);doc.setFontSize(9);doc.setFont('helvetica','normal');
    doc.text('Experiment: '+document.getElementById('c-name').value,10,y);y+=6;
    doc.text('Analyte: '+document.getElementById('c-analyte').value,10,y);y+=6;
    doc.text('Mode: '+S.cMode,10,y);y+=6;
    doc.text('Regions: '+regions.length,10,y);y+=10;
    regions.forEach(function(r){doc.setFillColor(r.rgb.R,r.rgb.G,r.rgb.B);doc.rect(10,y,8,8,'F');doc.setTextColor(226,232,240);doc.setFontSize(8);doc.text(r.name+' — RGB('+r.rgb.R+','+r.rgb.G+','+r.rgb.B+') OD:'+r.od,22,y+5);y+=10;});
    doc.save('colorimetry_report.pdf');toast('✓ PDF');}else{toast('PDF library not loaded');}
    }catch(e){toast('PDF export error');}
  } else if(fmt==='png'){['c-hist','c-hsv','c-comp','c-curve'].forEach(function(id,i){setTimeout(function(){var cv=document.getElementById(id);if(!cv)return;var a=document.createElement('a');a.download='colorimetry_chart_'+(i+1)+'.png';a.href=cv.toDataURL('image/png');a.click();},i*400);});toast('✓ PNG');}
}

function exportBlood(fmt){
  if(!S.bResults){toast('No blood data');return;}
  var r=S.bResults;
  if(fmt==='csv'){
    var csv='Patient,'+r.pid+'\nDate,'+r.date+'\nHematocrit%,'+r.hct+'\nHb_gdL,'+r.hb+'\nRBC%,'+r.rp+'\nPlasma%,'+r.pp+'\nBuffy%,'+r.bp+'\nClassification,'+r.cls.l+'\n\nLayer,R,G,B,Hue,Sat,LAB_L,LAB_A,OD\n';
    ['rbc','plasma','buffy'].forEach(function(n){var l=r.layers[n];if(!l)return;csv+=n+','+l.rgb.R+','+l.rgb.G+','+l.rgb.B+','+l.hsv.H+','+l.hsv.S+','+l.lab.L+','+l.lab.A+','+l.od+'\n';});
    dl(csv,'blood_analysis.csv','text/csv');toast('✓ CSV');
  } else if(fmt==='json'){
    var data={type:'blood',date:new Date().toISOString().split('T')[0]};for(var k in r){if(k!=='layers')data[k]=r[k];}data.layers={};for(var n in r.layers){var o={};for(var k2 in r.layers[n]){if(k2!=='rawPx')o[k2]=r.layers[n][k2];}data.layers[n]=o;}
    dl(JSON.stringify(data,null,2),'blood.json','application/json');toast('✓ JSON');
  } else if(fmt==='pdf'){
    try{if(typeof window.jspdf!=='undefined'&&window.jspdf.jsPDF){var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});var W=210;
    doc.setFillColor(15,17,23);doc.rect(0,0,W,297,'F');doc.setFillColor(24,30,42);doc.rect(0,0,W,16,'F');
    doc.setTextColor(0,229,160);doc.setFontSize(11);doc.setFont('helvetica','bold');doc.text('μFluidic Lab Analyser — Blood Report',10,10);
    doc.setTextColor(100,116,139);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text(new Date().toLocaleString(),W-10,10,{align:'right'});var y=24;
    doc.setTextColor(226,232,240);doc.setFontSize(9);doc.setFont('helvetica','normal');
    doc.text('Patient: '+(r.pid||'Unknown')+' | Date: '+r.date,10,y);y+=8;
    doc.text('Hb: '+r.hb+' g/dL | Hct: '+r.hct+'% | Classification: '+r.cls.l,10,y);y+=8;
    ['rbc','plasma','buffy'].forEach(function(n){var l=r.layers[n];if(!l)return;doc.text(n.toUpperCase()+': '+(n==='rbc'?r.rp:n==='plasma'?r.pp:r.bp)+'% | RGB('+l.rgb.R+','+l.rgb.G+','+l.rgb.B+') | OD:'+l.od,10,y);y+=6;});
    doc.save('blood_report.pdf');toast('✓ PDF');}else{toast('PDF library not loaded');}
    }catch(e){toast('PDF export error');}
  } else if(fmt==='png'){['b-layers','b-hist','b-rgb','b-hsv','b-sw','b-lab'].forEach(function(id,i){setTimeout(function(){var cv=document.getElementById(id);if(!cv)return;var a=document.createElement('a');a.download='blood_chart_'+(i+1)+'.png';a.href=cv.toDataURL('image/png');a.click();},i*400);});toast('✓ PNG');}
}

function exportSim(fmt){
  if(!S.simRes){toast('Run simulation first');return;}
  var r=S.simRes;
  if(fmt==='csv'){
    var csv='';csv+='Export Date,'+new Date().toISOString().split('T')[0]+'\n';
    csv+='Patient Group,'+(r.p.label||r.grp)+'\n';csv+='Severity,'+r.severity+'\n';csv+='Start Hb (g/dL),'+r.hb0+'\n';csv+='Final Hb (g/dL),'+r.fHb+'\n';
    csv+='Target Hb (g/dL),'+r.p.thr+'\n';csv+='Normal Hb (g/dL),'+r.p.nHb+'\n';csv+='Iron Deficiency (mg Fe),'+r.totalIronDeficit+'\n';
    csv+='Daily Fe Intake (mg/day),'+r.feDay.toFixed(1)+'\n';csv+='Total Fe Absorbed (mg),'+r.totFeAbs+'\n';csv+='Recovery at Week,'+(r.rec||'Not achieved')+'\n';
    csv+='\n=== Weekly Data ===\n';csv+='Week,Hb (g/dL),Hct (%),Fe Absorbed (mg/wk),Absorption Rate (%),Cumulative Fe (mg),Status\n';
    r.rows.forEach(function(row){csv+=row.w+','+row.hb+','+row.hct+','+row.feAbs+','+row.ar+','+row.cumFe+','+row.cls.l+'\n';});
    dl(csv,'simulation_data.csv','text/csv');toast('✓ CSV exported');
  } else if(fmt==='json'){
    var data={exportType:'simulation',date:new Date().toISOString().split('T')[0],analyser:'μFluidic Lab Analyser',patient:{group:r.grp,groupLabel:r.p.label,bodyWeight_kg:r.wt,normalHb_gdL:r.p.nHb,anaemiaThreshold_gdL:r.p.thr,ironRDA_mgPerDay:r.p.rda},clinicalAssessment:{severity:r.severity,startHb_gdL:r.hb0,finalHb_gdL:r.fHb,targetHb_gdL:r.p.thr,ironDeficit_mg:r.totalIronDeficit,recoveryAtWeek:r.rec||null,recoveryAchieved:r.fHb>=r.p.thr},nutrition:{ironInFood_mgPer100g:r.fe100,dailyServing_g:r.sv,dailyIronIntake_mgPerDay:+r.feDay.toFixed(1),totalIronAbsorbed_mg:r.totFeAbs,vitaminC_modifier:r.vc,inhibitor_modifier:r.inh,absorptionRate_pct:r.rows[0]?r.rows[0].ar:0},durationWeeks:r.wks,parameters:{fePerHb_mg:FE_PER_HB,dailyIronLoss_mg:DAILY_LOSS,bloodVolPerKg_mL:BLOOD_VOL_PER_KG},weeklyData:r.rows.map(function(row){return{week:row.w,hb_gdL:row.hb,hct_pct:row.hct,feAbsorbed_mgPerWeek:row.feAbs,absorptionRate_pct:row.ar,cumulativeFe_mg:row.cumFe,status:row.cls.l};})};
    dl(JSON.stringify(data,null,2),'simulation_data.json','application/json');toast('✓ JSON exported');
  } else if(fmt==='pdf'){
    try{if(typeof window.jspdf!=='undefined'&&window.jspdf.jsPDF){var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});var W=210;
    doc.setFillColor(15,17,23);doc.rect(0,0,W,297,'F');doc.setFillColor(24,30,42);doc.rect(0,0,W,16,'F');
    doc.setTextColor(0,229,160);doc.setFontSize(11);doc.setFont('helvetica','bold');doc.text('μFluidic Lab Analyser — Clinical Simulation Report',10,10);
    doc.setTextColor(100,116,139);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text(new Date().toLocaleString(),W-10,10,{align:'right'});var y=24;
    doc.setTextColor(226,232,240);doc.setFontSize(9);doc.setFont('helvetica','normal');
    doc.text('Group: '+r.p.label+' | Severity: '+r.severity,10,y);y+=6;
    doc.text('Haemoglobin: '+r.hb0+' → '+r.fHb+' g/dL (Target: '+r.p.thr+' g/dL)',10,y);y+=6;
    doc.text('Iron Deficit: '+r.totalIronDeficit+' mg | Daily Intake: '+r.feDay.toFixed(1)+' mg Fe/day',10,y);y+=6;
    doc.text('Total Fe Absorbed: '+r.totFeAbs+' mg | Absorption Rate: '+(r.rows[0]?r.rows[0].ar:0)+'%',10,y);y+=6;
    doc.text('Recovery: '+(r.rec?'Week '+r.rec:'Not achieved within window'),10,y);y+=10;
    r.rows.forEach(function(row,i){if(i<30){doc.text('W'+row.w+': Hb='+row.hb+' Hct='+row.hct+'% Fe='+row.feAbs+'mg Status='+row.cls.l,10,y);y+=5;}});
    doc.save('simulation_report.pdf');toast('✓ PDF exported');}else{toast('PDF library not loaded');}
    }catch(e){toast('PDF export error');}
  } else if(fmt==='png'){
    var cv=document.getElementById('s-hb');if(cv){var a=document.createElement('a');a.download='hb_recovery_curve.png';a.href=cv.toDataURL('image/png');a.click();}
    toast('✓ PNG exported');
  }
}

// ── TOAST ──
function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');clearTimeout(window._tto);window._tto=setTimeout(function(){t.classList.remove('on');},2600);}

// ═══════════════════════════════════════════════════════════════
//  ENHANCED CALIBRATION (Beer-Lambert, Image-based, Statistics)
// ═══════════════════════════════════════════════════════════════
var S_calMethod = 'absorbance';
var S_enhancedCal = null;

var DEFAULT_CAL_DATA = [
  {conc:0, val:0.000, label:'Blank'},
  {conc:1.56, val:0.086, label:'Std 1'},
  {conc:3.13, val:0.132, label:'Std 2'},
  {conc:6.25, val:0.214, label:'Std 3'},
  {conc:12.5, val:0.368, label:'Std 4'},
  {conc:25, val:0.612, label:'Std 5'},
  {conc:50, val:0.973, label:'Std 6'},
  {conc:100, val:1.865, label:'Std 7'}
];

function setCalMethod(method, el) {
  S_calMethod = method;
  document.querySelectorAll('.cms').forEach(function(b){b.classList.remove('on');});
  el.classList.add('on');
  var labels = {
    absorbance: 'Absorbance',
    rgb: 'Mean Red (0-255)',
    hsv: 'Hue° / 3.6',
    lab: 'LAB L* (0-100)',
    od: 'Optical Density'
  };
  document.getElementById('cal-value-label').textContent = labels[method] || 'Value';
  // Rebuild rows with current method hint
  buildEnhancedCalRows();
}

function buildEnhancedCalRows() {
  var c = document.getElementById('cal-rows-enhanced');
  c.innerHTML = '';
  DEFAULT_CAL_DATA.forEach(function(item, i) {
    var d = document.createElement('div');
    d.className = 'cal-row';
    d.innerHTML = '<span class="rn">' + (i + 1) + '</span>' +
      '<input type="number" class="ecc" placeholder="conc" value="' + item.conc + '" step="any">' +
      '<input type="number" class="ecv" placeholder="val" value="' + item.val + '" step="any">' +
      '<span style="font-size:9px;color:var(--muted);width:50px">' + item.label + '</span>';
    c.appendChild(d);
  });
}

function addEnhancedCalRow() {
  var c = document.getElementById('cal-rows-enhanced');
  var d = document.createElement('div');
  d.className = 'cal-row';
  d.innerHTML = '<span class="rn">' + (c.children.length + 1) + '</span>' +
    '<input type="number" class="ecc" placeholder="conc" step="any">' +
    '<input type="number" class="ecv" placeholder="val" step="any">' +
    '<span style="font-size:9px;color:var(--muted);width:50px">Std</span>';
  c.appendChild(d);
}

function resetDefaultCalibration() {
  buildEnhancedCalRows();
  document.getElementById('cal-eq-enhanced').innerHTML = '';
  document.getElementById('cal-stats-enhanced').innerHTML = '';
  S_enhancedCal = null;
  toast('Defaults restored');
}

function getEnhancedCalData() {
  var cc = document.querySelectorAll('.ecc');
  var cv = document.querySelectorAll('.ecv');
  var pts = [];
  for (var i = 0; i < cc.length; i++) {
    var x = parseFloat(cc[i].value);
    var y = parseFloat(cv[i].value);
    if (!isNaN(x) && !isNaN(y)) {
      pts.push({x: x, y: y});
    }
  }
  return pts;
}

function computeLinearRegression(pts) {
  var n = pts.length;
  if (n < 3) return null;
  var sx = 0, sy = 0, sxy = 0, sx2 = 0;
  for (var i = 0; i < n; i++) {
    sx += pts[i].x;
    sy += pts[i].y;
    sxy += pts[i].x * pts[i].y;
    sx2 += pts[i].x * pts[i].x;
  }
  var slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  var intercept = (sy - slope * sx) / n;
  var ym = sy / n;
  var ssRes = 0, ssTot = 0;
  for (var j = 0; j < n; j++) {
    var yPred = slope * pts[j].x + intercept;
    ssRes += (pts[j].y - yPred) * (pts[j].y - yPred);
    ssTot += (pts[j].y - ym) * (pts[j].y - ym);
  }
  var r2 = 1 - ssRes / ssTot;
  var rmse = Math.sqrt(ssRes / n);
  return {
    slope: slope,
    intercept: intercept,
    r2: r2,
    rmse: rmse,
    n: n,
    equation: 'y = ' + slope.toFixed(5) + 'x + ' + intercept.toFixed(5)
  };
}

function buildEnhancedCalibration() {
  var pts = getEnhancedCalData();
  if (pts.length < 3) { toast('Need at least 3 data points'); return; }
  
  var reg = computeLinearRegression(pts);
  if (!reg) { toast('Regression failed'); return; }
  
  S_enhancedCal = { points: pts, regression: reg, method: S_calMethod };
  
  // Update the original calCurve for compatibility
  S.calCurve = { slope: reg.slope, intercept: reg.intercept, r2: reg.r2, pts: pts };
  
  // Display equation
  var quality = reg.r2 > 0.99 ? '✅ Excellent' : reg.r2 > 0.95 ? '✓ Good' : '⚠ Check data';
  document.getElementById('cal-eq-enhanced').innerHTML =
    '<div style="padding:10px;background:var(--s2);border-radius:var(--radius-sm);margin-top:8px;line-height:1.8">' +
    '<b>Beer-Lambert: A = εbc</b><br>' +
    '📈 <b>Equation:</b> y = ' + reg.slope.toFixed(5) + 'x + ' + reg.intercept.toFixed(5) + '<br>' +
    '📊 <b>R²:</b> ' + reg.r2.toFixed(6) + ' — ' + quality + '<br>' +
    '📉 <b>RMSE:</b> ' + reg.rmse.toFixed(6) + '<br>' +
    '📋 <b>Slope (εb):</b> ' + reg.slope.toFixed(5) + ' L/mg · <b>Intercept:</b> ' + reg.intercept.toFixed(5) +
    '</div>';
  
  // Display stats
  var statsHtml = '';
  var stats = [
    {lbl:'Slope', val: reg.slope.toFixed(5)},
    {lbl:'Intercept', val: reg.intercept.toFixed(5)},
    {lbl:'R²', val: reg.r2.toFixed(6)},
    {lbl:'RMSE', val: reg.rmse.toFixed(6)},
    {lbl:'N Points', val: reg.n},
    {lbl:'Method', val: S_calMethod}
  ];
  stats.forEach(function(s) {
    statsHtml += '<div class="cs-item"><div class="cs-val">' + s.val + '</div><div class="cs-lbl">' + s.lbl + '</div></div>';
  });
  document.getElementById('cal-stats-enhanced').innerHTML = statsHtml;
  
  // Draw Beer-Lambert curve
  drawBeerLambertCurve(pts, reg);
  
  // Also update the original standard curve chart
  drawCurveChart();
  
  // Update region concentrations if analyzed
  if (S.analyzed) {
    S.cRegions.forEach(function(r) {
      if (r.od != null) r.conc = concFromOD(r.od);
    });
    renderCRegionList();
    var sm = S.cRegions.filter(function(r){return r.type === 'sample';});
    if (sm.length) renderCResults(sm.map(function(r){return Object.assign({}, r, {blankCorrectedOD: r.od, concentration: r.conc});}), S.cMode);
  }
  
  toast('✓ Calibration curve built (R² = ' + reg.r2.toFixed(4) + ')');
}

function drawBeerLambertCurve(pts, reg) {
  var maxX = 0;
  for (var i = 0; i < pts.length; i++) { if (pts[i].x > maxX) maxX = pts[i].x; }
  maxX = Math.ceil(maxX * 1.1);
  var xs = [];
  for (var j = 0; j <= maxX; j += maxX / 50) xs.push(j);
  var ys = xs.map(function(x){return reg.slope * x + reg.intercept;});
  
  mk('c-beer-lambert', {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Beer-Lambert: y = ' + reg.slope.toFixed(4) + 'x + ' + reg.intercept.toFixed(4) + ' (R²=' + reg.r2.toFixed(4) + ')',
          data: xs.map(function(x, i){return {x: x, y: ys[i]};}),
          type: 'line',
          borderColor: '#00e5a0',
          backgroundColor: 'rgba(0,229,160,.1)',
          pointRadius: 0,
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Standards',
          data: pts.map(function(p){return {x: p.x, y: p.y};}),
          backgroundColor: '#3b82f6',
          pointRadius: 6,
          pointHoverRadius: 8,
          borderColor: '#60a5fa',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: lO,
        title: { display: true, text: 'Beer-Lambert Calibration Curve', color: '#e2e8f0', font: { size: 11 } },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              if (ctx.datasetIndex === 1) {
                return 'Conc: ' + ctx.parsed.x.toFixed(2) + ' mg/L, Value: ' + ctx.parsed.y.toFixed(4);
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Iron Concentration (mg/L)', color: '#64748b' },
          ticks: tO,
          grid: gO,
          min: 0
        },
        y: {
          title: { display: true, text: S_calMethod === 'absorbance' ? 'Absorbance' : 'Measured Value', color: '#64748b' },
          ticks: tO,
          grid: gO,
          min: 0
        }
      }
    }
  });
}

function loadCalFromImageRegions() {
  // Load measured values from image regions (standards) into the calibration table
  var st = S.cRegions.filter(function(r){return r.type === 'standard' && r.rgb;});
  if (st.length < 2) { toast('Need at least 2 measured Standard regions on the image'); return; }
  
  var c = document.getElementById('cal-rows-enhanced');
  c.innerHTML = '';
  
  st.forEach(function(r, i) {
    var val = 0;
    switch (S_calMethod) {
      case 'absorbance': val = r.od || 0; break;
      case 'rgb': val = r.rgb ? r.rgb.R : 0; break;
      case 'hsv': val = r.hsv ? r.hsv.H / 3.6 : 0; break;
      case 'lab': val = r.lab ? r.lab.L : 0; break;
      case 'od': val = r.od || 0; break;
      default: val = r.od || 0;
    }
    var d = document.createElement('div');
    d.className = 'cal-row';
    d.innerHTML = '<span class="rn">' + (i + 1) + '</span>' +
      '<input type="number" class="ecc" placeholder="conc" value="' + (r.conc || '') + '" step="any">' +
      '<input type="number" class="ecv" placeholder="val" value="' + val.toFixed(4) + '" step="any">' +
      '<span style="font-size:9px;color:var(--muted);width:50px">' + r.name + '</span>';
    c.appendChild(d);
  });
  
  toast('✓ Loaded ' + st.length + ' standard values from image regions. Enter concentrations.');
}

// Override buildCalRows to also build enhanced rows
var _origBuildCalRows = buildCalRows;
buildCalRows = function() {
  _origBuildCalRows();
  buildEnhancedCalRows();
};

// ═══════════════════════════════════════════════════════════════
//  IRON CALIBRATION & ANALYSIS
// ═══════════════════════════════════════════════════════════════
var IRON_STORAGE_KEY = 'mf_iron_calibration_model';

function ironGetModel() {
  try { var m = JSON.parse(localStorage.getItem(IRON_STORAGE_KEY)); if (m) return m; } catch(e) {}
  return buildBuiltinIronModel();
}

function buildBuiltinIronModel() {
  var features = ['R','G','B','H','S','V','L*','a*','b*','Intensity'];
  var best = { feature:'', r2:-1, rmse:Infinity, mae:Infinity, model:null };
  features.forEach(function(f) {
    var pts = [];
    IRON_BUILTIN_STANDARDS.forEach(function(s) {
      var val = null;
      if (f==='R') val=s.colorData.avgR;
      else if (f==='G') val=s.colorData.avgG;
      else if (f==='B') val=s.colorData.avgB;
      else if (f==='H') val=s.colorData.hsv.h;
      else if (f==='S') val=s.colorData.hsv.s;
      else if (f==='V') val=s.colorData.hsv.v;
      else if (f==='L*') val=s.colorData.lab.L;
      else if (f==='a*') val=s.colorData.lab.a;
      else if (f==='b*') val=s.colorData.lab.b;
      else if (f==='Intensity') val=s.colorData.intensity;
      if (val!==null) pts.push({x:s.concentration, y:val});
    });
    if (pts.length<3) return;
    var lr = computeLinearRegression(pts);
    if (lr && lr.r2>best.r2) { best={feature:f,r2:lr.r2,rmse:lr.rmse,mae:Math.sqrt(lr.rmse),model:lr}; }
  });
  var concs = IRON_BUILTIN_STANDARDS.map(function(s){return s.concentration;});
  return {
    modelVersion:'1.0', active:true, wavelengthNm:560, stockConcentrationMgL:100,
    standards:IRON_BUILTIN_STANDARDS, selectedFeature:best.feature, regressionType:'linear',
    coefficients:[best.model.slope, best.model.intercept], intercept:best.model.intercept,
    equation:'y = '+best.model.slope.toFixed(4)+'x + '+best.model.intercept.toFixed(4),
    rSquared:best.r2, rmse:best.rmse, mae:best.mae,
    minimumConcentrationMgL:Math.min.apply(null,concs), maximumConcentrationMgL:Math.max.apply(null,concs),
    calibrationDate:new Date().toISOString(), isBuiltIn:true
  };
}

function updateIronModelStatus() {
  var model = ironGetModel();
  var el = document.getElementById('iron-model-status');
  if (el && model && model.active) {
    el.innerHTML = '✅ <strong>Active Model:</strong> ' + model.selectedFeature + ' · R² = ' + model.rSquared.toFixed(4) + ' · Range: ' + model.minimumConcentrationMgL + '–' + model.maximumConcentrationMgL + ' mg/L' + (model.isBuiltIn?' · Built-in':'');
    el.style.background = 'rgba(0,229,160,.08)';
    el.style.borderColor = 'var(--accent)';
  }
}

function useBuiltinIronModel() {
  S.ironModel = buildBuiltinIronModel();
  try { localStorage.removeItem(IRON_STORAGE_KEY); } catch(e) {}
  updateIronModelStatus();
  toast('✓ Built-in iron model activated (R² = ' + S.ironModel.rSquared.toFixed(4) + ')');
}

function loadIronCalImage(ev) {
  var f = ev.target.files[0]; if (!f) return;
  var url = URL.createObjectURL(f); var img = new Image();
  img.onload = function() {
    S.ironCalImg = img;
    var uz = document.getElementById('iron-cal-upload');
    uz.innerHTML = '<div class="ul" style="font-size:10px">'+f.name+'</div><input type="file" id="iron-cal-file" accept="image/*" onchange="loadIronCalImage(event)" style="display:none">';
    uz.classList.add('loaded');
    uz.onclick = function() { document.getElementById('iron-cal-file').click(); };
    var box = document.getElementById('iron-cal-cbox'), ph = document.getElementById('iron-cal-ph');
    if (ph) ph.style.display = 'none';
    var cv = document.getElementById('iron-cal-cv');
    var maxW = box.clientWidth - 4 || 600, scale = Math.min(1, maxW / img.width);
    cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
    cv.style.display = 'block';
    document.getElementById('iron-cal-canvas-section').style.display = 'block';
    document.getElementById('iron-cal-upload').style.display = 'none';
    S.ironCalRois = [];
    drawIronCalCanvas();
    addIronCalCanvasEvents();
    toast('✓ Calibration image loaded');
  };
  img.src = url;
}

function setIronCalShape(shape, el) {
  S.ironCalShape = shape;
  document.querySelectorAll('#iron-cal-canvas-section .stb').forEach(function(b){b.classList.remove('on');});
  el.classList.add('on');
}

function startIronCalDrawing() {
  S.ironCalDrawing = true;
  document.getElementById('iron-cal-start').style.display = 'none';
  document.getElementById('iron-cal-stop').style.display = '';
  toast('Draw ROI on calibration image');
}

function stopIronCalDrawing() {
  S.ironCalDrawing = false;
  document.getElementById('iron-cal-start').style.display = '';
  document.getElementById('iron-cal-stop').style.display = 'none';
}

function clearIronCalRois() {
  S.ironCalRois = [];
  drawIronCalCanvas();
  renderIronCalStandards();
  document.getElementById('iron-cal-results').style.display = 'none';
  document.getElementById('iron-cal-save-btn').style.display = 'none';
}

function drawIronCalCanvas() {
  var cv = document.getElementById('iron-cal-cv');
  if (!cv || !cv.width || !S.ironCalImg) return;
  var ctx = cv.getContext('2d');
  ctx.drawImage(S.ironCalImg, 0, 0, cv.width, cv.height);
  var colors = ['#00e5a0','#3b82f6','#f97316','#eab308','#ef4444','#a855f7','#ec4899','#06b6d4'];
  S.ironCalRois.forEach(function(r, i) {
    var c = colors[i % colors.length];
    ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.fillStyle = c + '25';
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = c; ctx.font = 'bold 10px monospace';
    ctx.fillText('Std ' + (i+1), r.x + 3, r.y > 14 ? r.y - 4 : r.y + r.h + 14);
  });
  if (S.ironCalCurrentShape) {
    ctx.strokeStyle = '#00e5a0'; ctx.lineWidth = 2; ctx.setLineDash([5,3]);
    ctx.fillStyle = 'rgba(0,229,160,0.1)';
    ctx.fillRect(S.ironCalCurrentShape.x, S.ironCalCurrentShape.y, S.ironCalCurrentShape.w, S.ironCalCurrentShape.h);
    ctx.strokeRect(S.ironCalCurrentShape.x, S.ironCalCurrentShape.y, S.ironCalCurrentShape.w, S.ironCalCurrentShape.h);
    ctx.setLineDash([]);
  }
}

function addIronCalCanvasEvents() {
  var cv = document.getElementById('iron-cal-cv');
  function toXY(cx, cy) { var rc = cv.getBoundingClientRect(); return { x: (cx-rc.left)*(cv.width/rc.width), y: (cy-rc.top)*(cv.height/rc.height) }; }
  cv.onmousedown = function(e) { if (!S.ironCalDrawing) return; var p = toXY(e.clientX, e.clientY); S.ironCalDragStart = p; S.ironCalCurrentShape = null; };
  cv.onmousemove = function(e) { if (!S.ironCalDrawing || !S.ironCalDragStart) return; var p = toXY(e.clientX, e.clientY); S.ironCalCurrentShape = { x: Math.min(S.ironCalDragStart.x, p.x), y: Math.min(S.ironCalDragStart.y, p.y), w: Math.abs(p.x-S.ironCalDragStart.x), h: Math.abs(p.y-S.ironCalDragStart.y) }; drawIronCalCanvas(); };
  cv.onmouseup = function(e) { if (!S.ironCalDrawing || !S.ironCalDragStart) return; var p = toXY(e.clientX, e.clientY); var w = Math.abs(p.x-S.ironCalDragStart.x), h = Math.abs(p.y-S.ironCalDragStart.y); if (w > 10 && h > 10) { var roi = { x: Math.min(S.ironCalDragStart.x, p.x), y: Math.min(S.ironCalDragStart.y, p.y), w: w, h: h }; roi.colorData = extractIronCalRoiData(roi); S.ironCalRois.push(roi); drawIronCalCanvas(); renderIronCalStandards(); toast('✓ Standard ' + S.ironCalRois.length + ' added'); } S.ironCalDragStart = null; S.ironCalCurrentShape = null; };
  cv.onmouseleave = function() { if (S.ironCalDrawing) { S.ironCalDragStart = null; S.ironCalCurrentShape = null; drawIronCalCanvas(); } };
  var td = false;
  cv.ontouchstart = function(e) { if (!S.ironCalDrawing) return; e.preventDefault(); var t = e.touches[0], p = toXY(t.clientX, t.clientY); td = true; S.ironCalDragStart = p; S.ironCalCurrentShape = null; };
  cv.ontouchmove = function(e) { if (!td || !S.ironCalDragStart) return; e.preventDefault(); var t = e.touches[0], p = toXY(t.clientX, t.clientY); S.ironCalCurrentShape = { x: Math.min(S.ironCalDragStart.x, p.x), y: Math.min(S.ironCalDragStart.y, p.y), w: Math.abs(p.x-S.ironCalDragStart.x), h: Math.abs(p.y-S.ironCalDragStart.y) }; drawIronCalCanvas(); };
  cv.ontouchend = function(e) { if (!td) return; td = false; var t = e.changedTouches[0], p = toXY(t.clientX, t.clientY); var w = Math.abs(p.x-S.ironCalDragStart.x), h = Math.abs(p.y-S.ironCalDragStart.y); if (w > 10 && h > 10) { var roi = { x: Math.min(S.ironCalDragStart.x, p.x), y: Math.min(S.ironCalDragStart.y, p.y), w: w, h: h }; roi.colorData = extractIronCalRoiData(roi); S.ironCalRois.push(roi); drawIronCalCanvas(); renderIronCalStandards(); toast('✓ Standard ' + S.ironCalRois.length + ' added'); } S.ironCalDragStart = null; S.ironCalCurrentShape = null; };
  setupPinchZoom(cv);
}

function extractIronCalRoiData(roi) {
  var cv = document.getElementById('iron-cal-cv');
  if (!cv) return null;
  var px = getPixels(cv, roi.x, roi.y, roi.w, roi.h);
  var rgb = meanRGB(px);
  var hsv = toHSV(rgb.R, rgb.G, rgb.B);
  var lab = toLAB(rgb.R, rgb.G, rgb.B);
  var intensity = 0.299*rgb.R + 0.587*rgb.G + 0.114*rgb.B;
  return { avgR: rgb.R, avgG: rgb.G, avgB: rgb.B, hsv: hsv, lab: lab, intensity: intensity, pixelCount: px.length/4 };
}

function renderIronCalStandards() {
  var el = document.getElementById('iron-cal-standards-list');
  if (!S.ironCalRois.length) { el.innerHTML = ''; return; }
  var html = '<div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);margin-bottom:6px;letter-spacing:.4px">Calibration Standards (' + S.ironCalRois.length + ')</div>';
  html += '<div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>#</th><th>Conc (mg/L)</th><th>Dil</th><th>A560</th><th>R</th><th>G</th><th>B</th><th>H°</th><th>S%</th><th>V%</th><th>L*</th><th>a*</th><th>b*</th><th>Int.</th><th>✕</th></tr></thead><tbody>';
  S.ironCalRois.forEach(function(roi, i) {
    var d = IRON_DEFAULT_CONCS[i] !== undefined ? IRON_DEFAULT_CONCS[i] : '';
    var dil = IRON_DEFAULT_DILUTIONS[i] !== undefined ? IRON_DEFAULT_DILUTIONS[i] : '';
    var abs = IRON_DEFAULT_ABSORBANCES[i] !== undefined ? IRON_DEFAULT_ABSORBANCES[i] : '';
    var cd = roi.colorData || {};
    html += '<tr><td>'+(i+1)+'</td><td><input type="number" class="ironCalConc" data-idx="'+i+'" value="'+d+'" step="any" style="width:60px;background:var(--s2);border:1px solid var(--border);color:var(--text);padding:3px;border-radius:4px;font-size:10px"></td><td>'+dil+'</td><td><input type="number" class="ironCalAbs" data-idx="'+i+'" value="'+abs+'" step="any" style="width:60px;background:var(--s2);border:1px solid var(--border);color:var(--text);padding:3px;border-radius:4px;font-size:10px"></td><td>'+(cd.avgR||'')+'</td><td>'+(cd.avgG||'')+'</td><td>'+(cd.avgB||'')+'</td><td>'+(cd.hsv?cd.hsv.H:'')+'</td><td>'+(cd.hsv?cd.hsv.S:'')+'</td><td>'+(cd.hsv?cd.hsv.V:'')+'</td><td>'+(cd.lab?cd.lab.L:'')+'</td><td>'+(cd.lab?cd.lab.A:'')+'</td><td>'+(cd.lab?cd.lab.B:'')+'</td><td>'+(cd.intensity!==undefined?cd.intensity.toFixed(2):'')+'</td><td><button class="btn danger btn-sm" style="padding:2px 6px;font-size:10px" onclick="deleteIronCalRoi('+i+')">✕</button></td></tr>';
  });
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function deleteIronCalRoi(idx) {
  S.ironCalRois.splice(idx, 1);
  drawIronCalCanvas();
  renderIronCalStandards();
  document.getElementById('iron-cal-results').style.display = 'none';
  document.getElementById('iron-cal-save-btn').style.display = 'none';
}

function buildIronCalModel() {
  if (S.ironCalRois.length < 3) { toast('Need at least 3 calibration standards'); return; }
  var standards = [];
  for (var i = 0; i < S.ironCalRois.length; i++) {
    var concEl = document.querySelector('.ironCalConc[data-idx="'+i+'"]');
    var absEl = document.querySelector('.ironCalAbs[data-idx="'+i+'"]');
    var conc = concEl ? parseFloat(concEl.value) : NaN;
    var abs = absEl ? parseFloat(absEl.value) : NaN;
    if (isNaN(conc)) { toast('Missing concentration for standard ' + (i+1)); return; }
    var roi = S.ironCalRois[i];
    if (!roi.colorData) roi.colorData = extractIronCalRoiData(roi);
    standards.push({ level: i+1, concentration: conc, dilutionFactor: IRON_DEFAULT_DILUTIONS[i]||1, absorbance560: isNaN(abs)?null:abs, colorData: roi.colorData });
  }
  var features = ['R','G','B','H','S','V','L*','a*','b*','Intensity'];
  var best = { feature:'', r2:-1, rmse:Infinity, mae:Infinity, model:null };
  features.forEach(function(f) {
    var pts = [];
    standards.forEach(function(s) {
      var val = null;
      if (f==='R') val=s.colorData.avgR;
      else if (f==='G') val=s.colorData.avgG;
      else if (f==='B') val=s.colorData.avgB;
      else if (f==='H') val=s.colorData.hsv.H;
      else if (f==='S') val=s.colorData.hsv.S;
      else if (f==='V') val=s.colorData.hsv.V;
      else if (f==='L*') val=s.colorData.lab.L;
      else if (f==='a*') val=s.colorData.lab.A;
      else if (f==='b*') val=s.colorData.lab.B;
      else if (f==='Intensity') val=s.colorData.intensity;
      if (val!==null) pts.push({x:s.concentration, y:val});
    });
    if (pts.length<3) return;
    var lr = computeLinearRegression(pts);
    if (lr && lr.r2>best.r2) { best={feature:f,r2:lr.r2,rmse:lr.rmse,mae:Math.sqrt(lr.rmse),model:lr}; }
  });
  var concs = standards.map(function(s){return s.concentration;});
  var calModel = {
    modelVersion:'1.0', active:true, wavelengthNm:560, stockConcentrationMgL:100,
    standards:standards, selectedFeature:best.feature, regressionType:'linear',
    coefficients:[best.model.slope, best.model.intercept], intercept:best.model.intercept,
    equation:'y = '+best.model.slope.toFixed(4)+'x + '+best.model.intercept.toFixed(4),
    rSquared:best.r2, rmse:best.rmse, mae:best.mae,
    minimumConcentrationMgL:Math.min.apply(null,concs), maximumConcentrationMgL:Math.max.apply(null,concs),
    calibrationDate:new Date().toISOString(), isBuiltIn:false
  };
  S.ironModel = calModel;
  var el = document.getElementById('iron-cal-results');
  el.style.display = 'block';
  el.innerHTML = '<div class="alert" style="background:rgba(0,229,160,.08);border:1px solid var(--accent);border-radius:6px;padding:10px;color:var(--accent);font-size:12px"><strong>✅ Calibration Complete</strong></div>' +
    '<div class="cal-stats"><div class="cs-item"><div class="cs-val">'+best.r2.toFixed(4)+'</div><div class="cs-lbl">R²</div></div>' +
    '<div class="cs-item"><div class="cs-val">'+best.rmse.toFixed(4)+'</div><div class="cs-lbl">RMSE</div></div>' +
    '<div class="cs-item"><div class="cs-val">'+best.mae.toFixed(4)+'</div><div class="cs-lbl">MAE</div></div>' +
    '<div class="cs-item"><div class="cs-val">'+best.feature+'</div><div class="cs-lbl">Best Feature</div></div></div>' +
    '<div style="font-size:11px;font-family:monospace;margin-top:8px;padding:8px;background:var(--s2);border-radius:6px">'+best.model.equation+'</div>';
  document.getElementById('iron-cal-save-btn').style.display = '';
  toast('✓ Iron calibration model built (R² = ' + best.r2.toFixed(4) + ')');
}

function saveIronCalModel() {
  if (!S.ironModel) return;
  try { localStorage.setItem(IRON_STORAGE_KEY, JSON.stringify(S.ironModel)); } catch(e) {}
  updateIronModelStatus();
  document.getElementById('iron-cal-save-btn').style.display = 'none';
  toast('✓ Iron calibration model saved and set as active');
}

function loadIronSampleImage(ev) {
  var f = ev.target.files[0]; if (!f) return;
  var url = URL.createObjectURL(f); var img = new Image();
  img.onload = function() {
    S.ironSampleImg = img;
    var uz = document.getElementById('iron-sample-upload');
    uz.innerHTML = '<div class="ul" style="font-size:10px">'+f.name+'</div><input type="file" id="iron-sample-file" accept="image/*" onchange="loadIronSampleImage(event)" style="display:none">';
    uz.classList.add('loaded');
    uz.onclick = function() { document.getElementById('iron-sample-file').click(); };
    var box = document.getElementById('iron-sample-cbox'), ph = document.getElementById('iron-sample-ph');
    if (ph) ph.style.display = 'none';
    var cv = document.getElementById('iron-sample-cv');
    var maxW = box.clientWidth - 4 || 600, scale = Math.min(1, maxW / img.width);
    cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
    cv.style.display = 'block';
    document.getElementById('iron-sample-canvas-section').style.display = 'block';
    document.getElementById('iron-sample-upload').style.display = 'none';
    S.ironSampleRois = [];
    drawIronSampleCanvas();
    addIronSampleCanvasEvents();
    toast('✓ Sample image loaded');
  };
  img.src = url;
}

function setIronSampleShape(shape, el) {
  S.ironSampleShape = shape;
  document.querySelectorAll('#iron-sample-canvas-section .stb').forEach(function(b){b.classList.remove('on');});
  el.classList.add('on');
}

function startIronSampleDrawing() {
  S.ironSampleDrawing = true;
  document.getElementById('iron-sample-start').style.display = 'none';
  document.getElementById('iron-sample-stop').style.display = '';
  toast('Draw ROI on sample image');
}

function stopIronSampleDrawing() {
  S.ironSampleDrawing = false;
  document.getElementById('iron-sample-start').style.display = '';
  document.getElementById('iron-sample-stop').style.display = 'none';
}

function clearIronSampleRois() {
  S.ironSampleRois = [];
  drawIronSampleCanvas();
  renderIronSampleRois();
  document.getElementById('iron-sample-results').style.display = 'none';
}

function drawIronSampleCanvas() {
  var cv = document.getElementById('iron-sample-cv');
  if (!cv || !cv.width || !S.ironSampleImg) return;
  var ctx = cv.getContext('2d');
  ctx.drawImage(S.ironSampleImg, 0, 0, cv.width, cv.height);
  var colors = ['#00e5a0','#3b82f6','#f97316','#eab308','#ef4444','#a855f7','#ec4899','#06b6d4'];
  S.ironSampleRois.forEach(function(r, i) {
    var c = colors[i % colors.length];
    ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.fillStyle = c + '25';
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = c; ctx.font = 'bold 10px monospace';
    var dilLabel = r.dilutionFactor ? '1:' + r.dilutionFactor : '1:' + (i > 0 ? Math.pow(2, i) : 1);
    ctx.fillText('ROI ' + (i+1) + ' (' + dilLabel + ')', r.x + 3, r.y > 14 ? r.y - 4 : r.y + r.h + 14);
  });
  if (S.ironSampleCurrentShape) {
    ctx.strokeStyle = '#00e5a0'; ctx.lineWidth = 2; ctx.setLineDash([5,3]);
    ctx.fillStyle = 'rgba(0,229,160,0.1)';
    ctx.fillRect(S.ironSampleCurrentShape.x, S.ironSampleCurrentShape.y, S.ironSampleCurrentShape.w, S.ironSampleCurrentShape.h);
    ctx.strokeRect(S.ironSampleCurrentShape.x, S.ironSampleCurrentShape.y, S.ironSampleCurrentShape.w, S.ironSampleCurrentShape.h);
    ctx.setLineDash([]);
  }
}

function addIronSampleCanvasEvents() {
  var cv = document.getElementById('iron-sample-cv');
  function toXY(cx, cy) { var rc = cv.getBoundingClientRect(); return { x: (cx-rc.left)*(cv.width/rc.width), y: (cy-rc.top)*(cv.height/rc.height) }; }
  cv.onmousedown = function(e) { if (!S.ironSampleDrawing) return; var p = toXY(e.clientX, e.clientY); S.ironSampleDragStart = p; S.ironSampleCurrentShape = null; };
  cv.onmousemove = function(e) { if (!S.ironSampleDrawing || !S.ironSampleDragStart) return; var p = toXY(e.clientX, e.clientY); S.ironSampleCurrentShape = { x: Math.min(S.ironSampleDragStart.x, p.x), y: Math.min(S.ironSampleDragStart.y, p.y), w: Math.abs(p.x-S.ironSampleDragStart.x), h: Math.abs(p.y-S.ironSampleDragStart.y) }; drawIronSampleCanvas(); };
  cv.onmouseup = function(e) { if (!S.ironSampleDrawing || !S.ironSampleDragStart) return; var p = toXY(e.clientX, e.clientY); var w = Math.abs(p.x-S.ironSampleDragStart.x), h = Math.abs(p.y-S.ironSampleDragStart.y); if (w > 10 && h > 10) { var roi = { x: Math.min(S.ironSampleDragStart.x, p.x), y: Math.min(S.ironSampleDragStart.y, p.y), w: w, h: h }; roi.colorData = extractIronSampleRoiData(roi); S.ironSampleRois.push(roi); drawIronSampleCanvas(); renderIronSampleRois(); toast('✓ Sample ROI ' + S.ironSampleRois.length + ' added'); } S.ironSampleDragStart = null; S.ironSampleCurrentShape = null; };
  cv.onmouseleave = function() { if (S.ironSampleDrawing) { S.ironSampleDragStart = null; S.ironSampleCurrentShape = null; drawIronSampleCanvas(); } };
  var td = false;
  cv.ontouchstart = function(e) { if (!S.ironSampleDrawing) return; e.preventDefault(); var t = e.touches[0], p = toXY(t.clientX, t.clientY); td = true; S.ironSampleDragStart = p; S.ironSampleCurrentShape = null; };
  cv.ontouchmove = function(e) { if (!td || !S.ironSampleDragStart) return; e.preventDefault(); var t = e.touches[0], p = toXY(t.clientX, t.clientY); S.ironSampleCurrentShape = { x: Math.min(S.ironSampleDragStart.x, p.x), y: Math.min(S.ironSampleDragStart.y, p.y), w: Math.abs(p.x-S.ironSampleDragStart.x), h: Math.abs(p.y-S.ironSampleDragStart.y) }; drawIronSampleCanvas(); };
  cv.ontouchend = function(e) { if (!td) return; td = false; var t = e.changedTouches[0], p = toXY(t.clientX, t.clientY); var w = Math.abs(p.x-S.ironSampleDragStart.x), h = Math.abs(p.y-S.ironSampleDragStart.y); if (w > 10 && h > 10) { var roi = { x: Math.min(S.ironSampleDragStart.x, p.x), y: Math.min(S.ironSampleDragStart.y, p.y), w: w, h: h }; roi.colorData = extractIronSampleRoiData(roi); S.ironSampleRois.push(roi); drawIronSampleCanvas(); renderIronSampleRois(); toast('✓ Sample ROI ' + S.ironSampleRois.length + ' added'); } S.ironSampleDragStart = null; S.ironSampleCurrentShape = null; };
  setupPinchZoom(cv);
}

function extractIronSampleRoiData(roi) {
  var cv = document.getElementById('iron-sample-cv');
  if (!cv) return null;
  var px = getPixels(cv, roi.x, roi.y, roi.w, roi.h);
  var rgb = meanRGB(px);
  var hsv = toHSV(rgb.R, rgb.G, rgb.B);
  var lab = toLAB(rgb.R, rgb.G, rgb.B);
  var intensity = 0.299*rgb.R + 0.587*rgb.G + 0.114*rgb.B;
  return { avgR: rgb.R, avgG: rgb.G, avgB: rgb.B, hsv: hsv, lab: lab, intensity: intensity, pixelCount: px.length/4 };
}

function renderIronSampleRois() {
  var el = document.getElementById('iron-sample-roi-list');
  if (!S.ironSampleRois.length) { el.innerHTML = ''; return; }
  var html = '<div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);margin-bottom:6px;letter-spacing:.4px">Sample ROIs (' + S.ironSampleRois.length + ')</div>';
  html += '<div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>#</th><th>Dilution</th><th>R</th><th>G</th><th>B</th><th>H°</th><th>S%</th><th>V%</th><th>L*</th><th>a*</th><th>b*</th><th>Int.</th><th>✕</th></tr></thead><tbody>';
  S.ironSampleRois.forEach(function(roi, i) {
    var cd = roi.colorData || {};
    var defaultDil = i === 0 ? 2 : Math.pow(2, i+1);
    var dil = roi.dilutionFactor || defaultDil;
    html += '<tr><td>'+(i+1)+'</td><td><select class="ironSampleDil" data-idx="'+i+'" style="width:60px;background:var(--s3);border:1px solid var(--border);color:var(--text);padding:3px;border-radius:4px;font-size:10px"><option value="1"'+(dil==1?'selected':'')+'>1:1</option><option value="2"'+(dil==2?'selected':'')+'>1:2</option><option value="4"'+(dil==4?'selected':'')+'>1:4</option><option value="8"'+(dil==8?'selected':'')+'>1:8</option><option value="16"'+(dil==16?'selected':'')+'>1:16</option><option value="32"'+(dil==32?'selected':'')+'>1:32</option><option value="64"'+(dil==64?'selected':'')+'>1:64</option><option value="128"'+(dil==128?'selected':'')+'>1:128</option></select></td><td>'+(cd.avgR||'')+'</td><td>'+(cd.avgG||'')+'</td><td>'+(cd.avgB||'')+'</td><td>'+(cd.hsv?cd.hsv.H:'')+'</td><td>'+(cd.hsv?cd.hsv.S:'')+'</td><td>'+(cd.hsv?cd.hsv.V:'')+'</td><td>'+(cd.lab?cd.lab.L:'')+'</td><td>'+(cd.lab?cd.lab.A:'')+'</td><td>'+(cd.lab?cd.lab.B:'')+'</td><td>'+(cd.intensity!==undefined?cd.intensity.toFixed(2):'')+'</td><td><button class="btn danger btn-sm" style="padding:2px 6px;font-size:10px" onclick="deleteIronSampleRoi('+i+')">✕</button></td></tr>';
  });
  html += '</tbody></table></div>';
  el.innerHTML = html;
  S.ironSampleRois.forEach(function(roi, i) {
    var sel = document.querySelector('.ironSampleDil[data-idx="'+i+'"]');
    if (sel) sel.addEventListener('change', function() { roi.dilutionFactor = parseInt(this.value); drawIronSampleCanvas(); });
  });
}

function deleteIronSampleRoi(idx) {
  S.ironSampleRois.splice(idx, 1);
  drawIronSampleCanvas();
  renderIronSampleRois();
  document.getElementById('iron-sample-results').style.display = 'none';
}

function runIronAnalysis() {
  var model = ironGetModel();
  if (!model || !model.active) { toast('No active iron calibration model. Build or use built-in model first.'); return; }
  if (!S.ironSampleRois.length) { toast('Draw at least one sample ROI'); return; }
  S.ironModel = model;
  var results = [];
  S.ironSampleRois.forEach(function(roi, idx) {
    var dilSel = document.querySelector('.ironSampleDil[data-idx="'+idx+'"]');
    var dilFactor = dilSel ? parseInt(dilSel.value) : (roi.dilutionFactor || 1);
    roi.dilutionFactor = dilFactor;
    var cd = roi.colorData || extractIronSampleRoiData(roi);
    if (!cd) return;
    var featureVal = null;
    if (model.selectedFeature==='R') featureVal=cd.avgR;
    else if (model.selectedFeature==='G') featureVal=cd.avgG;
    else if (model.selectedFeature==='B') featureVal=cd.avgB;
    else if (model.selectedFeature==='H') featureVal=cd.hsv.H;
    else if (model.selectedFeature==='S') featureVal=cd.hsv.S;
    else if (model.selectedFeature==='V') featureVal=cd.hsv.V;
    else if (model.selectedFeature==='L*') featureVal=cd.lab.L;
    else if (model.selectedFeature==='a*') featureVal=cd.lab.A;
    else if (model.selectedFeature==='b*') featureVal=cd.lab.B;
    else if (model.selectedFeature==='Intensity') featureVal=cd.intensity;
    var rawConc = null;
    if (featureVal !== null) {
      rawConc = (featureVal - model.intercept) / model.coefficients[0];
      rawConc = Math.max(0, parseFloat(rawConc.toFixed(4)));
    }
    var correctedConc = rawConc !== null ? parseFloat((rawConc * dilFactor).toFixed(4)) : null;
    var inRange = rawConc !== null && rawConc >= model.minimumConcentrationMgL && rawConc <= model.maximumConcentrationMgL;
    var isSaturated = cd.avgR > 250 && cd.avgG > 250 && cd.avgB > 250;
    var isTooDark = cd.intensity < 10;
    var isTooBright = cd.intensity > 245;
    var isValid = inRange && !isSaturated && !isTooDark && !isTooBright;
    results.push({
      idx: idx, label: 'ROI ' + (idx+1), dilution: '1:' + dilFactor, dilFactor: dilFactor,
      r: cd.avgR, g: cd.avgG, b: cd.avgB, h: cd.hsv.H, s: cd.hsv.S, v: cd.hsv.V,
      L: cd.lab.L, a: cd.lab.A, b: cd.lab.B, intensity: cd.intensity, featureVal: featureVal,
      rawConc: rawConc, correctedConc: correctedConc, inRange: inRange,
      isSaturated: isSaturated, isTooDark: isTooDark, isTooBright: isTooBright, isValid: isValid
    });
  });
  var validResults = results.filter(function(r){return r.isValid && r.correctedConc !== null;});
  var correctedVals = validResults.map(function(r){return r.correctedConc;});
  var stats = { count:0, mean:null, median:null, sd:null, cv:null, min:null, max:null };
  if (correctedVals.length > 0) {
    var sum = correctedVals.reduce(function(a,b){return a+b;},0);
    stats.count = correctedVals.length;
    stats.mean = parseFloat((sum/stats.count).toFixed(4));
    var sorted = correctedVals.slice().sort(function(a,b){return a-b;});
    stats.median = stats.count%2===0 ? parseFloat(((sorted[stats.count/2-1]+sorted[stats.count/2])/2).toFixed(4)) : sorted[Math.floor(stats.count/2)];
    var variance = correctedVals.reduce(function(a,v){return a+Math.pow(v-stats.mean,2);},0)/stats.count;
    stats.sd = parseFloat(Math.sqrt(variance).toFixed(4));
    stats.cv = stats.mean>0 ? parseFloat((stats.sd/stats.mean*100).toFixed(2)) : null;
    stats.min = parseFloat(Math.min.apply(null,correctedVals).toFixed(4));
    stats.max = parseFloat(Math.max.apply(null,correctedVals).toFixed(4));
  }
  S.ironResults = { results: results, stats: stats, model: model };
  var el = document.getElementById('iron-sample-results');
  el.style.display = 'block';
  var html = '<div class="info-box" style="font-size:10px"><strong>📋 Calibration:</strong> ' + (model.isBuiltIn?'Built-in':'Custom') + ' · Feature: ' + model.selectedFeature + ' · R²: ' + model.rSquared.toFixed(4) + ' · Range: ' + model.minimumConcentrationMgL + '–' + model.maximumConcentrationMgL + ' mg/L</div>';
  html += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Individual ROI Results</div>';
  html += '<div style="overflow-x:auto"><table class="rtbl"><thead><tr><th>ROI</th><th>Dil</th><th>R</th><th>G</th><th>B</th><th>Feature</th><th>Raw Conc</th><th>Corr Conc</th><th>Status</th></tr></thead><tbody>';
  results.forEach(function(r) {
    var status = r.isValid ? '✅ Valid' : '⚠️ ' + (!r.inRange?'OUT OF RANGE':r.isSaturated?'SATURATED':r.isTooDark?'TOO DARK':r.isTooBright?'TOO BRIGHT':'INVALID');
    var sc = r.isValid ? 'var(--accent)' : 'var(--red)';
    html += '<tr><td><b>'+r.label+'</b></td><td>'+r.dilution+'</td><td>'+r.r+'</td><td>'+r.g+'</td><td>'+r.b+'</td><td><b>'+(r.featureVal!==null?r.featureVal.toFixed(2):'N/A')+'</b></td><td>'+(r.rawConc!==null?r.rawConc:'N/A')+'</td><td style="color:var(--accent);font-weight:800">'+(r.correctedConc!==null?r.correctedConc:'N/A')+'</td><td style="color:'+sc+';font-weight:700;font-size:9px">'+status+'</td></tr>';
  });
  html += '</tbody></table></div>';
  if (stats.count > 0) {
    html += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);margin:12px 0 6px">🌿 Leaf Iron Result — Final Summary</div>';
    html += '<div class="cal-stats">';
    html += '<div class="cs-item"><div class="cs-val">'+stats.mean+'</div><div class="cs-lbl">Mean Conc (mg/L)</div></div>';
    html += '<div class="cs-item"><div class="cs-val">'+stats.median+'</div><div class="cs-lbl">Median (mg/L)</div></div>';
    html += '<div class="cs-item"><div class="cs-val">'+stats.sd+'</div><div class="cs-lbl">Std Dev</div></div>';
    html += '<div class="cs-item"><div class="cs-val">'+(stats.cv!==null?stats.cv+'%':'N/A')+'</div><div class="cs-lbl">CV (%)</div></div>';
    html += '<div class="cs-item"><div class="cs-val">'+stats.min+'</div><div class="cs-lbl">Min (mg/L)</div></div>';
    html += '<div class="cs-item"><div class="cs-val">'+stats.max+'</div><div class="cs-lbl">Max (mg/L)</div></div>';
    html += '</div>';
    html += '<div style="font-size:10px;color:var(--muted);margin-top:8px">Final iron concentration: <strong style="color:var(--accent)">'+stats.mean+' mg/L</strong> (mean of '+stats.count+' valid ROIs)</div>';
  } else {
    html += '<div class="alert" style="background:rgba(249,115,22,.08);border:1px solid var(--orange);border-radius:6px;padding:10px;color:var(--orange);font-size:12px;margin-top:10px"><strong>⚠️ No valid ROIs</strong> — All ROIs are outside calibration range or have quality issues.</div>';
  }
  el.innerHTML = html;
  toast('✓ Iron analysis complete');
}

// ── INIT ──
buildCalRows();
