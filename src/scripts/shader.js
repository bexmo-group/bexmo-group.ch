/* Wist molten shader background. Auto-attaches to .wist-dark-grid, .wist-dark-grid2, .wist-dark-grid3 and .wist-shader.
   One shared WebGL2 context renders each visible element and blits into a per-element 2D canvas.
   Optional attrs: data-ref-height (px; renders at the same noise scale as an element of that height — use on thin strips), data-seed (int), data-palette="coral|joyette|tidepool|rosewood", data-stretch, data-warp, data-ink, data-gloss, data-grain, data-speed. */
(() => {
  if (window.__wistShader) return; window.__wistShader = true;
  const SEL = '.wist-dark-grid,.wist-dark-grid2,.wist-dark-grid3,.wist-shader';
  const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform float uStretch;uniform float uWarp;uniform float uInk;uniform float uGloss;uniform float uGrain;uniform float uFrame;uniform float uRefH;uniform vec3 uSeed;uniform sampler2D uRamp;
out vec4 outColor;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float a=0.55,s=0.0;for(int i=0;i<3;i++){s+=a*snoise(p);p=p*1.97+vec3(17.1,3.7,1.3);a*=0.42;}return s;}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float rh=uRefH>0.0?uRefH:uRes.y;vec2 p=(gl_FragCoord.xy-0.5*uRes)/rh;
  vec2 sp=vec2(p.x/uStretch,p.y)*0.85;float t=uTime;
  vec3 b1=vec3(sp+vec2(-t*0.010,0.0),t*0.045)+uSeed;vec2 q=vec2(fbm(b1),fbm(b1+vec3(5.2,1.3,2.1)));
  vec3 b2=vec3(sp+uWarp*1.25*q,t*0.060)+uSeed;vec2 r=vec2(fbm(b2+vec3(1.7,9.2,0.0)),fbm(b2+vec3(8.3,2.8,4.0)));
  vec3 b3=vec3(sp+uWarp*vec2(2.1,0.8)*r,t*0.035)+uSeed;float f=fbm(b3);
  float s=0.52+0.95*f+0.30*r.x;s+=(uInk-0.5)*0.36;
  vec3 col=texture(uRamp,vec2(clamp(s,0.002,0.998),0.5)).rgb;
  vec2 g=vec2(dFdx(s),dFdy(s))*rh*0.22;vec3 n=normalize(vec3(-g,1.0));
  vec3 L=normalize(vec3(-0.55,0.65,0.75));vec3 H=normalize(L+vec3(0.0,0.0,1.0));
  float spec=pow(max(dot(n,H),0.0),10.0)*smoothstep(0.0,0.25,1.0-n.z);
  spec*=1.0-smoothstep(0.5,1.3,length(g));float rim=1.0-n.z;
  vec3 hi=texture(uRamp,vec2(0.02,0.5)).rgb;
  col+=hi*spec*0.55*uGloss;col*=1.0-rim*0.35*uGloss;
  col=mix(col,col*1.12+hi*0.10,smoothstep(0.55,0.0,uv.x)*0.55);
  vec2 v=uv-0.5;col*=1.0-dot(v,v)*0.45;
  float luma=dot(col,vec3(0.299,0.587,0.114));
  float n1=hash(gl_FragCoord.xy+mod(uFrame,61.0)*vec2(17.3,29.1));
  float n2=hash(gl_FragCoord.xy*1.37+mod(uFrame,53.0)*vec2(41.7,7.9));
  float grain=(n1+n2-1.0);float mid=0.55+0.45*(1.0-abs(luma*2.0-1.0));
  col+=grain*uGrain*0.16*mid;col+=(n1-0.5)/255.0*2.0;
  outColor=vec4(col,1.0);
}`;
  const PALETTES = {
    coral: [[0,'#efe6ff'],[.12,'#b48bff'],[.24,'#8a3dff'],[.36,'#6a00ff'],[.46,'#e6b1e8'],[.53,'#5600d6'],[.60,'#4200a8'],[.66,'#c862bd'],[.71,'#350090'],[.77,'#170040'],[.84,'#07001a'],[1,'#030008']],
    joyette: [[0,'#f6e2b0'],[.12,'#ecc16a'],[.24,'#d9a21f'],[.36,'#e88a28'],[.46,'#d7a823'],[.53,'#e6741d'],[.60,'#cf5418'],[.66,'#e0a020'],[.71,'#c9561a'],[.77,'#4a1505'],[.84,'#0e0301'],[1,'#050100']],
    tidepool: [[0,'#eef0e2'],[.12,'#b8d4cf'],[.24,'#5fa3a6'],[.36,'#2e7f8f'],[.46,'#d9c47e'],[.53,'#2c6b84'],[.60,'#1f4e72'],[.66,'#e3cf8c'],[.71,'#244a6d'],[.77,'#0f2238'],[.84,'#040a12'],[1,'#020407']],
    rosewood: [[0,'#fbe3d6'],[.12,'#f2b4a4'],[.24,'#e0807c'],[.36,'#c94d5f'],[.46,'#f0a88a'],[.53,'#b13049'],[.60,'#8c1f3a'],[.66,'#f2b89a'],[.71,'#7e1b35'],[.77,'#3a0a18'],[.84,'#120207'],[1,'#070103']],
  };
  const DEF = { stretch: 2.2, warp: 0.25, ink: 0.6, gloss: 0.7, grain: 0.6, speed: 0.5 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SCALE = 0.6;
  // Everything below (WebGL context, shader compile, render loop) waits until the page has loaded and the main thread is idle,
  // so it never competes with first paint / LCP.
  async function init() {
  const glc = document.createElement('canvas');
  const gl = glc.getContext('webgl2', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) return; // CSS fallback (dark ground) stays
  // Software rasterizers (no GPU, e.g. SwiftShader in headless Chrome / Lighthouse) run the shader on the CPU and block the main thread — keep the CSS fallback.
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  if (/swiftshader|llvmpipe|software|basic render/i.test(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '')) return;
  const mk = (t, s) => { const h = gl.createShader(t); gl.shaderSource(h, s); gl.compileShader(h); return h; };
  const prog = gl.createProgram();
  const vs = mk(gl.VERTEX_SHADER, '#version 300 es\nin vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}'), fs = mk(gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  // Querying compile/link status blocks the main thread until the driver is done (~1 s on slow devices). Poll the async status instead.
  const par = gl.getExtension('KHR_parallel_shader_compile');
  if (par) while (!gl.getProgramParameter(prog, par.COMPLETION_STATUS_KHR)) await new Promise(r => setTimeout(r, 50));
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getShaderInfoLog(fs) || gl.getShaderInfoLog(vs) || gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['uRes','uTime','uStretch','uWarp','uInk','uGloss','uGrain','uFrame','uRefH','uSeed','uRamp'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

  const ramps = {}; const rc = document.createElement('canvas'); rc.width = 512; rc.height = 1; const rx = rc.getContext('2d');
  function ramp(name) {
    if (ramps[name]) return ramps[name];
    const g = rx.createLinearGradient(0, 0, 512, 0); (PALETTES[name] || PALETTES.joyette).forEach(([o, c]) => g.addColorStop(o, c));
    rx.fillStyle = g; rx.fillRect(0, 0, 512, 1);
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, rc);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
    return ramps[name] = t;
  }
  gl.uniform1i(U.uRamp, 0); gl.activeTexture(gl.TEXTURE0);

  const items = new Map(); let idx = 0;
  const io = new IntersectionObserver(es => es.forEach(e => { const it = items.get(e.target); if (it) it.visible = e.isIntersecting; }), { rootMargin: '100px' });
  function attach(el) {
    if (items.has(el)) return;
    const c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true'); c.dataset.wistShaderCanvas = '';
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:-1;pointer-events:none;border-radius:inherit';
    el.prepend(c);
    const i = el.dataset.seed != null ? +el.dataset.seed : idx++;
    items.set(el, { c, ctx: c.getContext('2d'), visible: true, seed: [3.1 + i * 11.7, 7.4 + i * 5.3, 1.9 + i * 2.9] });
    io.observe(el);
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.matches(SEL)) attach(root);
    root.querySelectorAll(SEL).forEach(attach);
  }
  function prune() { items.forEach((it, el) => { if (!el.isConnected) { io.unobserve(el); items.delete(el); } }); }
  new MutationObserver(ms => { ms.forEach(m => m.addedNodes.forEach(scan)); prune(); }).observe(document.documentElement, { childList: true, subtree: true });
  scan(document.documentElement);

  const num = (el, k) => { const v = parseFloat(el.dataset[k]); return isNaN(v) ? DEF[k] : v; };
  let prev = performance.now(), time = 0, frame = 0, slow = 0;
  function loop(now) {
    const t0 = performance.now();
    const dt = Math.min(0.1, (now - prev) / 1000); prev = now;
    time += dt * (reduce ? 0.25 : 1); frame = (frame + 1) % 100000;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    items.forEach((it, el) => {
      if (!it.visible) return;
      const w = Math.max(1, Math.round(el.clientWidth * dpr * SCALE)), h = Math.max(1, Math.round(el.clientHeight * dpr * SCALE));
      if (w < 2 || h < 2) return;
      if (it.c.width !== w || it.c.height !== h) { it.c.width = w; it.c.height = h; }
      if (glc.width < w || glc.height < h) { glc.width = Math.max(glc.width, w); glc.height = Math.max(glc.height, h); }
      gl.viewport(0, 0, w, h);
      gl.bindTexture(gl.TEXTURE_2D, ramp(el.dataset.palette || 'coral'));
      gl.uniform2f(U.uRes, w, h);
      gl.uniform1f(U.uTime, time * num(el, 'speed'));
      gl.uniform1f(U.uStretch, num(el, 'stretch')); gl.uniform1f(U.uWarp, num(el, 'warp'));
      gl.uniform1f(U.uInk, num(el, 'ink')); gl.uniform1f(U.uGloss, num(el, 'gloss')); gl.uniform1f(U.uGrain, num(el, 'grain'));
      const rh = parseFloat(el.dataset.refHeight); gl.uniform1f(U.uRefH, isNaN(rh) ? 0 : rh * dpr * SCALE);
      gl.uniform1f(U.uFrame, frame); gl.uniform3f(U.uSeed, it.seed[0], it.seed[1], it.seed[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      it.ctx.drawImage(glc, 0, glc.height - h, w, h, 0, 0, w, h);
    });
    // Weak GPU: if frames keep blocking the main thread, freeze on the current frame instead of animating.
    slow = performance.now() - t0 > 30 ? slow + 1 : 0;
    if (slow < 5) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  }
  const start = () => (window.requestIdleCallback ? requestIdleCallback(init, { timeout: 3000 }) : setTimeout(init, 200));
  document.readyState === 'complete' ? start() : addEventListener('load', start, { once: true });
})();
