// Wasserstein-geodesic lecture navigator.
// Draws an SVG curve from a source point-cloud (left) to a target point-cloud
// (right), with lecture nodes positioned along the curve and grouped by
// section. Clicking a node navigates to /lectures/NN/.

(function(){
  const host = document.getElementById('geodesic');
  if (!host) return;
  const lectures = window.CS2840_LECTURES || [];
  const sections = window.CS2840_SECTIONS || [];
  const n = lectures.length;

  const PAD_X = 100, PAD_Y = 70;
  const W_VB = 1400, H_VB = 300;
  const curveY_mid = H_VB * 0.55;
  const curveY_amp = H_VB * 0.16;

  // Parametric curve: a soft sinusoid between the two clouds (reads as a
  // low-curvature geodesic).
  function pt(t){
    const x = PAD_X + t * (W_VB - 2*PAD_X);
    const y = curveY_mid - Math.sin(t * Math.PI) * curveY_amp;
    return [x, y];
  }

  // Build smooth path
  const SAMPLES = 80;
  let d = '';
  for (let i=0; i<=SAMPLES; i++){
    const [x,y] = pt(i/SAMPLES);
    d += (i===0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` L${x.toFixed(1)},${y.toFixed(1)}`);
  }

  // Source + target point clouds (Gaussian scatter)
  function cloudDots(cx, cy, sx, sy, k){
    let out = '';
    for (let i=0; i<k; i++){
      const u1 = Math.random() || 1e-6, u2 = Math.random();
      const r = Math.sqrt(-2*Math.log(u1));
      const z1 = r*Math.cos(2*Math.PI*u2), z2 = r*Math.sin(2*Math.PI*u2);
      const x = cx + z1*sx, y = cy + z2*sy;
      const rad = (0.9 + Math.random()*0.6).toFixed(2);
      const a = (0.35 + Math.random()*0.5).toFixed(2);
      out += `<circle class="cloud-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad}" opacity="${a}"/>`;
    }
    return out;
  }
  const srcCloud = cloudDots(PAD_X-55, curveY_mid, 24, 44, 90);
  const tgtCloud = cloudDots(W_VB - PAD_X + 55, curveY_mid, 24, 44, 90);

  // Section bands below the curve
  let bandsSVG = '';
  for (const s of sections){
    const [a,b] = s.range;
    const tA = (a-0.5)/n, tB = (b-0.5)/n;      // extend band to cover first/last node
    const [xa] = pt(tA), [xb] = pt(tB);
    const yBand = H_VB - 30;
    bandsSVG += `
      <line class="section-tick" x1="${xa.toFixed(1)}" y1="${(curveY_mid+18).toFixed(1)}" x2="${xa.toFixed(1)}" y2="${yBand-12}" />
      <line class="section-tick" x1="${xb.toFixed(1)}" y1="${(curveY_mid+18).toFixed(1)}" x2="${xb.toFixed(1)}" y2="${yBand-12}" />
      <text class="section-band" x="${((xa+xb)/2).toFixed(1)}" y="${yBand}" style="fill:${s.accent}">${s.label}</text>`;
  }

  // Lecture nodes along the curve
  let nodesSVG = '';
  const nodeData = [];
  for (let i=0; i<n; i++){
    const L = lectures[i];
    const t = (i + 0.5)/n;
    const [x,y] = pt(t);
    // On the landing nav, missing-slide lectures are visually identical to
    // guest lectures — the "slides unavailable" detail is surfaced only on
    // the lecture page itself.
    const cls = L.kind === 'own' ? 'node node--own' : 'node node--guest';
    const href = `lectures/${String(L.n).padStart(2,'0')}/`;
    nodesSVG += `
      <a class="${cls}" href="${href}" data-idx="${i}" tabindex="0" aria-label="Lecture ${L.n}: ${L.title.replace(/"/g,'&quot;')}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/>
        <text class="node__label" x="${x.toFixed(1)}" y="${(y-14).toFixed(1)}">${L.n}</text>
      </a>`;
    nodeData.push({x,y,L});
  }

  // Full SVG
  host.innerHTML = `
    <svg viewBox="0 0 ${W_VB} ${H_VB}" preserveAspectRatio="xMidYMid meet" aria-label="Course lecture navigator">
      <defs>
        <linearGradient id="geodesic-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="var(--accent-i)"   stop-opacity=".55"/>
          <stop offset="33%"  stop-color="var(--accent-ii)"  stop-opacity=".55"/>
          <stop offset="66%"  stop-color="var(--accent-iii)" stop-opacity=".55"/>
          <stop offset="100%" stop-color="var(--accent-iv)"  stop-opacity=".55"/>
        </linearGradient>
      </defs>
      <g>${srcCloud}</g>
      <g>${tgtCloud}</g>
      <path class="curve" d="${d}"/>
      ${bandsSVG}
      ${nodesSVG}
    </svg>
    <div class="tooltip" id="geo-tooltip" role="status" aria-live="polite"></div>
  `;

  // Tooltip wiring
  const tip = host.querySelector('#geo-tooltip');
  const nodes = host.querySelectorAll('.node');
  const svg = host.querySelector('svg');

  function showTip(idx, clientX, clientY){
    const L = lectures[idx];
    const guestLine = L.guest ? `<div class="t-meta">Guest: ${L.guest}</div>` : '';
    tip.innerHTML = `
      <span class="t-num">Lecture ${L.n}</span>
      <div class="t-title">${L.title}</div>
      <div class="t-meta">${L.date}</div>
      ${guestLine}`;
    const hostRect = host.getBoundingClientRect();
    const x = clientX - hostRect.left;
    const y = clientY - hostRect.top;
    tip.style.left = `${x}px`;
    tip.style.top  = `${y - 10}px`;
    tip.classList.add('show');
  }
  function hideTip(){ tip.classList.remove('show'); }

  nodes.forEach(a=>{
    a.addEventListener('mouseenter', e=>{
      const r = a.getBoundingClientRect();
      showTip(+a.dataset.idx, r.left + r.width/2, r.top);
    });
    a.addEventListener('mousemove', e=>{
      showTip(+a.dataset.idx, e.clientX, e.clientY - 4);
    });
    a.addEventListener('mouseleave', hideTip);
    a.addEventListener('focus', e=>{
      const r = a.getBoundingClientRect();
      showTip(+a.dataset.idx, r.left + r.width/2, r.top);
    });
    a.addEventListener('blur', hideTip);
  });
})();
