// Dependency-free WebGL2 ray caster. Never sends data to an external service.
const $ = id => document.getElementById(id);
const canvas = $('volume');
const gl = canvas.getContext('webgl2', {alpha:false, antialias:false});
const panel = $('load-panel');
const progress = $('load-progress');
const arc = $('load-arc');
let unavailable = false;

function showLoading(title, detail, percent) {
 panel.hidden = false;
 canvas.setAttribute('aria-busy', 'true');
 // Keeping the announcement separate from byte counts avoids reading every packet aloud.
 if ($('load-title').textContent !== title) $('load-title').textContent = title;
 $('load-detail').textContent = detail;
 if (percent === null) {
  progress.removeAttribute('value');
 } else {
  progress.value = percent;
  arc.setAttribute('stroke-dashoffset', 100 - percent);
 }
}

function hideLoading() {
 panel.hidden = true;
 canvas.setAttribute('aria-busy', 'false');
}

function showError(message, retry) {
 $('error').style.display = 'block';
 $('error-message').textContent = message;
 $('retry').hidden = !retry;
 $('retry').onclick = retry;
}

function clearError() {
 $('error').style.display = 'none';
 $('error-message').textContent = '';
 $('retry').onclick = null;
}

function fail(error) {
 unavailable = true;
 hideLoading();
 $('status').textContent = '';
 $('stage').append($('error'));
 showError(String(error.message || error), () => location.reload());
}

const vertex = `#version 300 es
in vec2 position; out vec2 uv;
void main(){ uv=position; gl_Position=vec4(position,0.,1.); }`;
const fragment = `#version 300 es
precision highp float; precision highp sampler3D;
in vec2 uv; out vec4 color;
${Array.from({length:6},(_,i)=>`uniform sampler3D field${i};`).join(' ')} uniform sampler2D lut;
uniform vec3 eye,right,up,halfBox,bg; uniform vec4 enabled; uniform vec2 enabledHeating;
uniform float aspect,scale,unitDistance,cutFraction; uniform int steps;
void main(){
 vec3 ro=eye+scale*(right*uv.x*aspect+up*uv.y), rd=normalize(-eye);
 vec3 inverse=1./(rd+vec3(1.e-9));
 vec3 ta=(-halfBox-ro)*inverse, tb=(halfBox-ro)*inverse;
 vec3 tmin=min(ta,tb),tmax=max(ta,tb);
 float entry=max(max(tmin.x,tmin.y),tmin.z), finish=min(min(tmax.x,tmax.y),tmax.z);
 if(finish<=max(entry,0.)){color=vec4(bg,1.);return;}
 float dt=(finish-entry)/float(steps); vec4 acc=vec4(0.);
 for(int i=0;i<768;i++){
  if(i>=steps || acc.a>.995)break;
  vec3 p=(ro+(entry+(float(i)+.5)*dt)*rd)/(2.*halfBox)+.5;
  if(p.x>cutFraction)continue;
  vec3 rgb=vec3(0.); float sigma=0.;
  ${Array.from({length:6},(_,i)=>`if (${i<4?'enabled['+i+']':'enabledHeating['+(i-4)+']'}>0.) {
   const int f=${i}; float strength=${i<4?'enabled['+i+']':'enabledHeating['+(i-4)+']'};
   float q=texture(field${i},p).r;
   if(q>=.5/255.){
   float u=clamp((q*255.-1.)/254.,0.,1.);
   float at=u*255., lower=floor(at);
   vec4 c=mix(texelFetch(lut,ivec2(int(lower),f),0),texelFetch(lut,ivec2(min(int(lower)+1,255),f),0),fract(at));
   float s=-log(max(1.-c.a,.001))*strength; rgb+=s*c.rgb; sigma+=s;
  }}`).join('\n')}
  if(sigma>0.){float a=1.-exp(-sigma*dt/unitDistance);acc.rgb+=(1.-acc.a)*a*rgb/sigma; acc.a+=(1.-acc.a)*a;}
 }
 // Keep the full-domain border visible even while cutting away volume.
 vec3 nearPoint=abs((ro+entry*rd)/halfBox);
 float edge=0.;
 if((nearPoint.x>.992&&nearPoint.y>.992)||(nearPoint.x>.992&&nearPoint.z>.992)||(nearPoint.y>.992&&nearPoint.z>.992))edge=.55;
 color=vec4(mix(acc.rgb+(1.-acc.a)*bg,vec3(.40,.48,.57),edge),1.);
}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
async function json(path){const r=await fetch(path);if(!r.ok)throw Error(`${path}: HTTP ${r.status}`);return r.json();}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function norm(a){const l=Math.hypot(...a);return a.map(v=>v/l);}
function interp(points,x,col){if(x<=points[0][0])return points[0][col];for(let i=1;i<points.length;i++)if(x<=points[i][0]){let t=(x-points[i-1][0])/(points[i][0]-points[i-1][0]);return points[i-1][col]*(1-t)+points[i][col]*t;}return points.at(-1)[col];}

async function start(){
 if(!gl)throw Error('This viewer requires WebGL2. Enable browser hardware acceleration or try a recent browser.');
 showLoading('Opening the 3D viewer…', '', null);
 const [meta,style]=await Promise.all([json('manifest.json'),json('style.json')]);
 if(style.fields.length!==6 || style.fields.some(f=>!meta.fields.includes(f.key)))throw Error('This viewer needs a six-field export including saved Ohmic and viscous heating. Re-export the snapshot.');
 const n=meta.web_size;
 if(!Number.isSafeInteger(n)||n<1||6*n**3>768*1024**2)throw Error('This product exceeds the six-layer desktop texture budget (768 MiB).');
 if(n>gl.getParameter(gl.MAX_3D_TEXTURE_SIZE))throw Error('This GPU cannot hold the web volume.');
 const fieldMiB=n**3*(meta.web_textures?1:4)/1024**2;
 $('transfer').textContent=`Each field loads separately (${Number(fieldMiB.toFixed(1))} MiB). Pause rotation for the fine view.`;
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const loc=name=>gl.getUniformLocation(program,name);
 const layers=[];
 for(const f of style.fields){
  const [lo,hi]=f.range;
  const row=document.createElement('div');row.className='layer';
  const toggle=document.createElement('label');toggle.className='toggle';const input=document.createElement('input');input.type='checkbox';input.checked=f.key==='plasma_beta';toggle.append(input,document.createTextNode(f.title));
  const unit=document.createElement('div');unit.className='unit';unit.textContent=f.label;
  const ramp=document.createElement('div');ramp.className='ramp';ramp.style.background='linear-gradient(to right,'+f.rgb.map(p=>`rgb(${p.slice(1).map(v=>Math.round(v*255)).join(',')}) ${100*(p[0]-lo)/(hi-lo)}%`).join(',')+')';
  const ticks=document.createElement('div');ticks.className='ticks';for(let v of [lo,(lo+hi)/2,hi]){let e=document.createElement('span');e.textContent=String(v);ticks.append(e);}
  const opacity=document.createElement('label');opacity.className='opacity';opacity.append(document.createTextNode('Opacity'));const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=3;slider.step=.05;slider.value=1;slider.setAttribute('aria-label',f.title+' opacity');opacity.append(slider);
  row.append(toggle,unit,ramp,ticks,opacity);$('layers').append(row);layers.push({input,slider,row});
 }
 // One single-channel texture per selected field. Unselected samplers share
 // a complete 1³ zero texture; enabling one layer never allocates the other five.
 gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
 const placeholder=gl.createTexture();
 function bind(q,tex){gl.activeTexture(gl.TEXTURE0+q);gl.bindTexture(gl.TEXTURE_3D,tex);}
 function filters(){
  for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_3D,p,gl.LINEAR);
  for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T,gl.TEXTURE_WRAP_R])gl.texParameteri(gl.TEXTURE_3D,p,gl.CLAMP_TO_EDGE);
 }
 bind(0,placeholder);gl.texImage3D(gl.TEXTURE_3D,0,gl.R8,1,1,1,0,gl.RED,gl.UNSIGNED_BYTE,new Uint8Array(1));filters();
 layers.forEach((_,q)=>{bind(q,placeholder);gl.uniform1i(loc('field'+q),q);});
 function gpuCheck(field){const err=gl.getError();if(err!==gl.NO_ERROR)throw Error(`GPU could not upload ${field} (WebGL error ${err}).`);}
 async function verified(file,size,expected,signal,onBytes){
  const url=new URL(file,document.baseURI);
  if(url.origin!==location.origin||!url.pathname.startsWith(new URL('.',document.baseURI).pathname))throw Error('Unexpected volume asset URL');
  const response=await fetch(url,{signal});if(!response.ok)throw Error(`${file}: HTTP ${response.status}`);
  let data;
  if (response.body?.getReader) {
   const reader = response.body.getReader();
   const bytes = new Uint8Array(size);
   let received = 0;
   try {
    while (true) {
     const {done, value} = await reader.read();
     signal.throwIfAborted();
     if (done) break;
     if (received + value.byteLength > size) throw Error(`Wrong byte count for ${file}`);
     bytes.set(value, received);
     received += value.byteLength;
     onBytes(received);
    }
   } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
   } finally {
    reader.releaseLock();
   }
   if (received !== size) throw Error(`Wrong byte count for ${file}`);
   data = bytes.buffer;
  } else {
   data = await response.arrayBuffer();
   signal.throwIfAborted();
   if(data.byteLength!==size)throw Error(`Wrong byte count for ${file}`);
   onBytes(data.byteLength);
  }
  if(crypto.subtle){
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
   if(digest!==expected)throw Error(`Checksum mismatch for ${file}`);
  }
  signal.throwIfAborted();return data;
 }
 async function loadField(q,signal){
  const f=style.fields[q], desc=meta.web_textures?.[f.key],tex=gl.createTexture();
  const total = meta.web_textures ? n**3 : 4*n**3;
  const totalMiB = total / 1024**2;
  const name = f.title;
  const title = 'Loading ' + name + '…';
  let paintedAt = -Infinity;
  function report(received) {
   if (signal.aborted || unavailable) return;
   const now = performance.now();
   // Cap DOM updates without delaying the first packet or the final byte.
   if (received < total && now - paintedAt < 100) return;
   paintedAt = now;
   const percent = Math.floor(100 * received / total);
   const amount = (received / 1024**2).toLocaleString('en-US', {maximumFractionDigits:1});
   const detail = `${amount} of ${totalMiB.toLocaleString('en-US')} MiB · ${percent}%`;
   showLoading(received === total ? 'Preparing ' + name + '…' : title, detail, percent);
  }
  showLoading(title, `0 of ${totalMiB.toLocaleString('en-US')} MiB · 0%`, 0);
  try {
   bind(q,tex);gl.texStorage3D(gl.TEXTURE_3D,1,gl.R8,n,n,n);filters();gpuCheck(f.title);
   if(meta.web_textures){
    if(!desc||desc.encoding!=='style-r8-v1'||JSON.stringify(desc.range)!==JSON.stringify(f.range)||
       !Array.isArray(desc.chunks)||!desc.chunks.length||
       desc.chunks.some(c=>!Number.isSafeInteger(c.bytes)||c.bytes<=0||c.bytes>16*1024**2||c.bytes%(n*n)!==0)||
       desc.chunks.reduce((v,c)=>v+c.bytes,0)!==n**3)throw Error(`Invalid texture manifest for ${f.key}`);
    let z=0;
    for(const c of desc.chunks){
     const data=new Uint8Array(await verified(c.file,c.bytes,c.sha256,signal,bytes => report(z*n*n + bytes)));bind(q,tex);
     const depth=c.bytes/(n*n);gl.texSubImage3D(gl.TEXTURE_3D,0,0,0,z,n,n,depth,gl.RED,gl.UNSIGNED_BYTE,data);gpuCheck(f.title);z+=depth;
    }
   } else {
    // Legacy Float32 packages: preserve the original little-endian log mapping.
    const data=new DataView(await verified(f.key+'.f32',4*n**3,meta.web_sha256[f.key],signal,report));
    const [lo,hi]=f.range,plane=n*n,depth=Math.min(n,Math.max(1,Math.floor(8*1024**2/plane)));
    const slab=new Uint8Array(plane*depth);
    for(let z=0;z<n;z+=depth){
     const dz=Math.min(depth,n-z);
     for(let i=0;i<plane*dz;i++){
      const x=data.getFloat32((z*plane+i)*4,true);if(!Number.isFinite(x))throw Error('Invalid volume sample');
      slab[i]=x<-90?0:1+Math.round(254*Math.max(0,Math.min(1,(x-lo)/(hi-lo))));
     }
     bind(q,tex);gl.texSubImage3D(gl.TEXTURE_3D,0,0,0,z,n,n,dz,gl.RED,gl.UNSIGNED_BYTE,slab);gpuCheck(f.title);
     if(z+dz<n)await new Promise(resolve=>setTimeout(resolve,0));signal.throwIfAborted();
    }
   }
   return tex;
  }catch(e){gl.deleteTexture(tex);bind(q,placeholder);throw e;}
 }
 const colors=new Float32Array(256*4*style.fields.length);
 for(let q=0;q<style.fields.length;q++)for(let i=0;i<256;i++){
  let f=style.fields[q],x=f.range[0]+i/255*(f.range[1]-f.range[0]);
  for(let c=0;c<3;c++)colors[4*(q*256+i)+c]=interp(f.rgb,x,c+1);
  colors[4*(q*256+i)+3]=interp(f.opacity,x,1);
 }
 const lut=gl.createTexture();gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,lut);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,256,style.fields.length,0,gl.RGBA,gl.FLOAT,colors);
 for(let p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);
 for(let p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
 gl.uniform1i(loc('lut'),6);
 const lengths=meta.grid.map((v,i)=>v*meta.spacing_kpc[i]), maxLength=Math.max(...lengths), half=lengths.map(v=>v/maxLength/2);
 gl.uniform3fv(loc('halfBox'),half);gl.uniform3fv(loc('bg'),style.background);
 gl.uniform1f(loc('unitDistance'),style.opacity_unit_box_fraction*Math.min(...lengths)/maxLength);
 $('hud').textContent=`${meta.run} · ${meta.snapshot}\n${lengths.map(v=>v.toFixed(2)).join(' × ')} kpc · t/t_eddy = ${meta.time_eddy.toFixed(3)}`;$('hud').style.whiteSpace='pre-line';
 $('description').textContent=`Source grid: ${meta.grid.join(' × ')}. Interactive display: ${n}³ volume cells; each is the linear volume-weighted mean of ${meta.web_factor.join(' × ')} source cells. This is one fixed snapshot, not a time sequence.`;
 $('sampling').textContent='The GPU display uses 8-bit logarithmic sampling (maximum half-step error: '+Math.max(...style.fields.map(f=>(f.range[1]-f.range[0])/508)).toFixed(3)+' dex inside the color limits), with trilinear interpolation. Values beyond each legend saturate. '+(meta.web_textures?'Only selected display fields are downloaded. The display bytes are not quantitative source data.':'The downloaded model retains Float32 logs.');
 let az=style.camera.azimuth_deg*Math.PI/180, el=style.camera.elevation_deg*Math.PI/180, zoom=style.camera.web_parallel_scale_box_fraction ?? style.camera.parallel_scale_box_fraction;
 let rotating=false, dragging=false, dirty=true, last=0, dragX=0,dragY=0;
 let busy = false;
 let failedLayer = null;
 async function syncFields(){
  if (unavailable) return;
  for(const [q,l] of layers.entries())if(!l.input.checked){
   l.controller?.abort();
   if(l.tex){gl.deleteTexture(l.tex);l.tex=null;bind(q,placeholder);}
  }
  if (!layers.some(layer => layer.input.checked)) hideLoading();
  if(busy)return;
  busy = true;
  try {
   while (!unavailable) {
    const q = layers.findIndex(layer => layer.input.checked && !layer.tex);
    if (q < 0) break;
    const layer = layers[q];
    const controller = new AbortController();
    layer.controller = controller;
    if (failedLayer === layer) { clearError(); failedLayer = null; }
    try {
     layer.tex = await loadField(q, controller.signal);
    } catch (error) {
     if (controller.signal.aborted || unavailable) continue;
     layer.input.checked = false;
     failedLayer = layer;
     updateMode();
     showError(`Could not load ${style.fields[q].title}. ${error.message || error}`, () => {
      layer.input.checked = true;
      mode();
     });
    } finally {
     layer.controller = null;
     dirty = true;
    }
   }
  } finally {
   busy = false;
   dirty = true;
  }
 }
 function updateMode(){
  for(const l of layers)l.row.classList.toggle('active',l.input.checked);
  const count=layers.filter(l=>l.input.checked).length;
  $('mode').textContent=count>1?'Illustrative blend · multiple scalar fields':count===1?'Single field · fixed logarithmic scale':'Select a field to reveal the volume.';
  // Keep a failed field's retry next to its checkbox when another field is in use.
  if (failedLayer && !unavailable) {
   const target = count ? failedLayer.row : $('stage');
   if ($('error').parentElement !== target) target.append($('error'));
  }
 }
 function mode(){updateMode();syncFields().catch(fail);dirty=true;}
 for(let l of layers){l.input.onchange=mode;l.slider.oninput=()=>dirty=true;}mode();
 $('quality').onchange=()=>dirty=true;
 $('cut').oninput=()=>{const f=Number($('cut').value)/100;const label=f===1?'Full box':`Cutaway · x1 ≤ ${(meta.origin_kpc[0]+f*lengths[0]).toFixed(2)} kpc`;$('cut-label').textContent=label;dirty=true;};
 $('rotate').onclick=()=>{rotating=!rotating;$('rotate').textContent=rotating?'Ⅱ Pause':'▶ Rotate';$('rotate').setAttribute('aria-pressed',String(rotating));dirty=true;};
 $('reset').onclick=()=>{az=style.camera.azimuth_deg*Math.PI/180;el=style.camera.elevation_deg*Math.PI/180;zoom=style.camera.web_parallel_scale_box_fraction ?? style.camera.parallel_scale_box_fraction;$('cut').value=100;$('cut').oninput();dirty=true;};
 $('clear').onclick=()=>{if(unavailable)return;clearError();failedLayer=null;layers.forEach(l=>l.input.checked=false);mode();};
 canvas.onpointerdown=e=>{dragging=true;dragX=e.clientX;dragY=e.clientY;canvas.setPointerCapture(e.pointerId);};
 canvas.onpointermove=e=>{if(!dragging)return;az-=(e.clientX-dragX)*.006;el=Math.max(-1.4,Math.min(1.4,el+(e.clientY-dragY)*.006));dragX=e.clientX;dragY=e.clientY;dirty=true;};
 canvas.onpointerup=canvas.onpointercancel=()=>{dragging=false;dirty=true;};
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(2.5,zoom*Math.exp(e.deltaY*.001)));dirty=true;},{passive:false});
 canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')az-=.08;if(e.key==='ArrowRight')az+=.08;if(e.key==='ArrowUp')el=Math.min(1.4,el+.08);if(e.key==='ArrowDown')el=Math.max(-1.4,el-.08);if(['+','='].includes(e.key))zoom=Math.max(.35,zoom*.9);if(e.key==='-')zoom=Math.min(2.5,zoom/ .9);dirty=true;};
 new ResizeObserver(()=>dirty=true).observe(canvas);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();layers.forEach(l=>l.controller?.abort());fail('Graphics context lost. Reload this page to restore the volume.');});
 function axes(right,up){const colors=['#b6c9de','#9cafc5','#dce6ef'];let svg='';for(let i=0;i<3;i++){let x=50+right[i]*34,y=50-up[i]*34;svg+=`<line x1="50" y1="50" x2="${x}" y2="${y}" stroke="${colors[i]}"/><text x="${x+4}" y="${y-4}">x${i+1}</text>`;}$('axes').innerHTML=svg;}
 function draw(time){
  if (unavailable) return;
  if(rotating&&!dragging&&!document.hidden){az+=Math.min((time-last)/1000,.1)*2*Math.PI/45;dirty=true;}last=time;
  if(dirty){
   const moving=rotating||dragging;
   // Preserve the full spatial grid, reducing pixels and ray samples only
   // during motion. Pausing or releasing the pointer restores fine sampling.
   const motionPixels=layers.filter(l=>l.input.checked).length>3?400000:500000;
   const ratio=moving?Math.min(devicePixelRatio||1,1,Math.sqrt(motionPixels/Math.max(1,canvas.clientWidth*canvas.clientHeight))):Math.min(devicePixelRatio||1,1.5),w=Math.round(canvas.clientWidth*ratio),h=Math.round(canvas.clientHeight*ratio);
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);
   const direction=[Math.cos(el)*Math.cos(az),Math.cos(el)*Math.sin(az),Math.sin(el)],right=norm(cross([0,0,1],direction)),up=cross(direction,right);
   gl.uniform3fv(loc('eye'),direction.map(v=>v*3.5));gl.uniform3fv(loc('right'),right);gl.uniform3fv(loc('up'),up);
   const weights=layers.map(l=>l.tex&&l.input.checked?Number(l.slider.value):0);
   gl.uniform1f(loc('aspect'),w/h);gl.uniform1f(loc('scale'),zoom*Math.max(1,h/w));gl.uniform4fv(loc('enabled'),weights.slice(0,4));gl.uniform2fv(loc('enabledHeating'),weights.slice(4));
   gl.uniform1f(loc('cutFraction'),Number($('cut').value)/100);
   gl.uniform1i(loc('steps'),moving?Math.min(256,Number($('quality').value)):Number($('quality').value));gl.drawArrays(gl.TRIANGLES,0,3);axes(right,up);
   if (!busy && !panel.hidden) hideLoading();
   $('status').textContent=layers.some(l=>l.tex&&l.input.checked)?`${n}³ display · ${moving?'orbit preview · ':''}${Number($('cut').value)<100?'spatial cutaway · ':''}opacity is illustrative` : '';
   const ready = style.fields.filter((_,q)=>layers[q].tex && layers[q].input.checked);
   const previous = (canvas.dataset.readyFields || '').split(',');
   const added = ready.filter(field=>!previous.includes(field.key));
   if (added.length) $('load-notice').textContent = added.map(field=>field.title).join(', ') + ' ready to explore.';
   else if (!ready.length) $('load-notice').textContent = '';
   canvas.dataset.readyFields = ready.map(field=>field.key).join(',');
   dirty=false;
  }
  requestAnimationFrame(draw);
 }
 requestAnimationFrame(draw);
}
start().catch(fail);
