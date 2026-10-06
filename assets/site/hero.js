// Point-cloud hero: particles morph between a Gaussian source distribution,
// the "CS 2840" text (sampled from a hidden canvas), and a Gaussian target —
// a literal Wasserstein-style interpolation. Reuses the signature motif
// from the course title slide.

(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W=0, H=0;

  const N = 4200;             // particle count
  const DUR_PHASE = 3200;     // ms per morph phase
  const DUR_HOLD = 1600;      // ms held at each state

  const particles = new Array(N);

  function resize(){
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    rebuildTargets();
  }

  // Sample points from text drawn to offscreen canvas.
  function sampleText(text, w, h){
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const o = off.getContext('2d');
    o.fillStyle = '#fff';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    // Oversized bold display — matches the slide-title "CS 2840" wordmark.
    // The *0.56 vertical factor leaves room for Safari's SF Pro Display em-box,
    // which is taller than Chrome's Helvetica fallback and otherwise clips.
    const fontPx = Math.round(Math.min(w/5.4, h*0.56));
    o.font = `800 ${fontPx}px -apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;
    o.fillText(text, w/2, h/2);
    const img = o.getImageData(0,0,w,h).data;
    const pts = [];
    // Denser sampling → the "CS 2840" cloud reads crisply even at N particles
    const step = Math.max(2, Math.round(Math.sqrt((w*h)/(N*5))));
    for (let y=0; y<h; y+=step){
      for (let x=0; x<w; x+=step){
        const i = (y*w + x)*4 + 3; // alpha
        if (img[i] > 128){
          // small jitter — mimic the slide's loose scatter
          pts.push([x + (Math.random()-.5)*step*1.6, y + (Math.random()-.5)*step*1.6]);
        }
      }
    }
    return pts;
  }

  function gaussian(cx, cy, sx, sy){
    const pts = new Array(N);
    for (let i=0; i<N; i++){
      // Box-Muller
      const u1 = Math.random() || 1e-6, u2 = Math.random();
      const r = Math.sqrt(-2*Math.log(u1));
      const z1 = r*Math.cos(2*Math.PI*u2), z2 = r*Math.sin(2*Math.PI*u2);
      pts[i] = [cx + z1*sx, cy + z2*sy];
    }
    return pts;
  }

  function resample(src, n){
    // Expand or trim an array of points to exactly n items.
    if (src.length === 0) return gaussian(W/2, H/2, 40, 20);
    const out = new Array(n);
    for (let i=0; i<n; i++) out[i] = src[i % src.length];
    // Shuffle so particles' identities across phases aren't correlated
    for (let i=n-1; i>0; i--){
      const j = (Math.random()*(i+1))|0;
      const t = out[i]; out[i]=out[j]; out[j]=t;
    }
    return out;
  }

  // Phases: 0=source gaussian, 1=CS2840 text, 2=target gaussian
  let phases = [[],[],[]];
  function rebuildTargets(){
    if (W < 50 || H < 50) return;
    const srcX = W*0.12, tgtX = W*0.88, cy = H*0.5;
    // Perfectly isotropic σ, sized so the 3σ extent (99.7% of the mass) sits
    // comfortably inside the hero band. Height-constrained so the blob never
    // gets clipped top/bottom (which was reading as a vertical stripe).
    const r = Math.min(W*0.035, H*0.13);
    const sigmaX = r, sigmaY = r;
    phases[0] = resample(gaussian(srcX, cy, sigmaX, sigmaY), N);
    phases[2] = resample(gaussian(tgtX, cy, sigmaX, sigmaY), N);
    const sw = Math.min(W, 1200), sh = H*0.85;
    const text = sampleText('CS 2840', sw, sh);
    const ox = (W - sw)/2, oy = (H - sh)/2;
    const shifted = text.map(p => [p[0]+ox, p[1]+oy]);
    phases[1] = resample(shifted, N);

    for (let i=0; i<N; i++){
      if (!particles[i]){
        const g = phases[0][i];
        particles[i] = { x:g[0], y:g[1], _r: 0.6 + Math.random()*0.9, _a: 0.35 + Math.random()*0.5 };
      }
    }
  }

  function easeInOut(t){ return t<0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }

  // Dev override: ?phase=0|1|2 pins the hero to a specific state (used for
  // headless screenshot verification; harmless in production).
  const pinned = new URLSearchParams(location.search).get('phase');
  let t0 = -1;
  function frame(now){
    if (t0 < 0) t0 = now;
    const dt = now - t0;
    const cycle = DUR_PHASE*2 + DUR_HOLD*3; // 0 -> 1 -> 2 -> (restart)
    const T = pinned != null
      ? ({'0':600, '1':DUR_HOLD+DUR_PHASE+DUR_HOLD/2, '2':DUR_HOLD*2+DUR_PHASE*2+DUR_HOLD/2}[pinned] || 0)
      : (dt % cycle);
    let from, to, local;
    if (T < DUR_HOLD){ from=0; to=0; local=0; }
    else if (T < DUR_HOLD + DUR_PHASE){ from=0; to=1; local=(T-DUR_HOLD)/DUR_PHASE; }
    else if (T < DUR_HOLD*2 + DUR_PHASE){ from=1; to=1; local=0; }
    else if (T < DUR_HOLD*2 + DUR_PHASE*2){ from=1; to=2; local=(T-DUR_HOLD*2-DUR_PHASE)/DUR_PHASE; }
    else { from=2; to=2; local=0; }

    const e = easeInOut(local);
    ctx.clearRect(0,0,W,H);
    for (let i=0; i<N; i++){
      const a = phases[from][i], b = phases[to][i];
      const x = a[0] + (b[0]-a[0])*e;
      const y = a[1] + (b[1]-a[1])*e;
      const p = particles[i];
      p.x = x; p.y = y;
      ctx.beginPath();
      ctx.arc(x, y, p._r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${p._a})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  requestAnimationFrame(frame);
})();
