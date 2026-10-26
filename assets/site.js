/* Prossimo Business Solutions — site.js */
(function(){
'use strict';
var I = {};
try { I = JSON.parse(document.getElementById('i18n').textContent); } catch(e){}
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };
var lastFocus = null;

/* language preference */
try { localStorage.setItem('prossimo_lang', document.documentElement.lang); } catch(e){}

/* ---------- progress ---------- */
(function(){
  var bar = $('#prog'); if (!bar) return; var tick = false;
  function upd(){ var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ')'; tick = false; }
  addEventListener('scroll', function(){ if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive:true }); upd();
})();

/* ---------- nav ---------- */
function closeAllPop(except){ $$('.has-mega.open,.langsel.open').forEach(function(el){ if (el !== except) { el.classList.remove('open'); var b = el.querySelector('button'); if (b) b.setAttribute('aria-expanded','false'); } }); }
$$('.has-mega,.langsel').forEach(function(el){
  var btn = el.querySelector('button');
  btn.addEventListener('click', function(e){ e.stopPropagation(); var o = !el.classList.contains('open'); closeAllPop(el); el.classList.toggle('open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  if (el.classList.contains('has-mega') && matchMedia('(hover: hover)').matches) {
    var t; el.addEventListener('mouseenter', function(){ clearTimeout(t); closeAllPop(el); el.classList.add('open'); btn.setAttribute('aria-expanded','true'); });
    el.addEventListener('mouseleave', function(){ t = setTimeout(function(){ el.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }, 180); });
  }
});
document.addEventListener('click', function(e){ if (!e.target.closest('.has-mega,.langsel')) closeAllPop(); });
var burger = $('#burger'), mnav = $('#mnav');
function closeMenu(){ if (!mnav) return; mnav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); document.body.style.overflow = ''; }
if (burger) burger.addEventListener('click', function(){ var o = mnav.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); document.body.style.overflow = o ? 'hidden' : ''; });
$$('#mnav a').forEach(function(a){ a.addEventListener('click', closeMenu); });
document.addEventListener('keydown', function(e){ if (e.key === 'Escape') { closeAllPop(); closeMenu(); } });

/* ---------- reveal & counters ---------- */
function animateCounter(el){
  var raw = el.getAttribute('data-count'), target = parseFloat(raw.replace(',', '.')), dec = (raw.split(/[.,]/)[1] || '').length, sep = raw.indexOf(',') > -1 ? ',' : '.', suffix = el.getAttribute('data-suffix') || '';
  function fmt(v){ return v.toFixed(dec).replace('.', sep) + suffix; }
  if (reduce) { el.textContent = fmt(target); return; }
  var start = null, dur = 1500;
  function step(ts){ if (start === null) start = ts; var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(e * target); if (p < 1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .08 });
  $$('.rv').forEach(function(el){ io.observe(el); });
  var cio = new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); } }); }, { threshold: .5 });
  $$('[data-count]').forEach(function(el){ cio.observe(el); });
} else { $$('.rv').forEach(function(el){ el.classList.add('in'); }); }

/* ---------- timelines (scroll-lit) ---------- */
(function(){
  var lists = $$('.tl,.st'); if (!lists.length) return;
  function upd(){
    var mid = innerHeight * .62;
    lists.forEach(function(ul){
      var items = $$('li', ul), fill = ul.querySelector('.fill');
      items.forEach(function(li){ li.classList.toggle('on', reduce || li.getBoundingClientRect().top < mid); });
      if (fill) { var r = ul.getBoundingClientRect(); var h = Math.max(0, Math.min(r.height - 40, mid - r.top - 20)); fill.style.height = (reduce ? r.height - 40 : h) + 'px'; }
    });
  }
  addEventListener('scroll', function(){ requestAnimationFrame(upd); }, { passive:true }); addEventListener('resize', upd); upd();
})();

/* ---------- command menu ---------- */
(function(){
  var cmd = $('#cmd'); if (!cmd) return;
  var inp = $('#cmdIn'), list = $('#cmdList'), sel = 0, items = [];
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var key = $('#cmdKey'); if (key) key.textContent = isMac ? '⌘ K' : 'Ctrl K';
  function render(){
    var q = inp.value.trim().toLowerCase();
    items = (I.cmd || []).filter(function(i){ return !q || i.l.toLowerCase().indexOf(q) > -1; });
    sel = Math.min(sel, Math.max(items.length - 1, 0)); list.innerHTML = '';
    if (!items.length) { var e = document.createElement('li'); e.className = 'cmd-e'; e.textContent = I.cmd_empty; list.appendChild(e); return; }
    items.forEach(function(it, n){
      var li = document.createElement('li'); li.setAttribute('role','option'); li.setAttribute('aria-selected', n === sel ? 'true' : 'false');
      var a = document.createElement('span'); a.textContent = it.l; var b = document.createElement('small'); b.textContent = it.k || '';
      li.appendChild(a); li.appendChild(b);
      li.addEventListener('click', function(){ run(n); }); li.addEventListener('mousemove', function(){ if (sel !== n) { sel = n; paint(); } });
      list.appendChild(li);
    });
  }
  function paint(){ $$('li', list).forEach(function(li, n){ li.setAttribute('aria-selected', n === sel ? 'true' : 'false'); }); var a = list.children[sel]; if (a && a.scrollIntoView) a.scrollIntoView({ block:'nearest' }); }
  function open(){ lastFocus = document.activeElement; inp.value = ''; sel = 0; render(); cmd.classList.add('open'); document.body.style.overflow = 'hidden'; setTimeout(function(){ inp.focus(); }, 30); }
  function close(){ cmd.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function run(n){ var it = items[n]; if (!it) return; close(); if (it.x) window.open(it.u, '_blank', 'noopener'); else location.href = it.u; }
  $$('[data-cmd]').forEach(function(b){ b.addEventListener('click', function(){ var fromMenu = !!b.closest('#mnav'); if (fromMenu) closeMenu(); open(); if (fromMenu) lastFocus = burger; }); });
  cmd.addEventListener('click', function(e){ if (e.target === cmd) close(); });
  inp.addEventListener('input', function(){ sel = 0; render(); });
  addEventListener('keydown', function(e){
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmd.classList.contains('open') ? close() : open(); return; }
    if (!cmd.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
  });
})();

/* ---------- calculator ---------- */
(function(){
  var h = $('#c-h'), r = $('#c-r'); if (!h) return;
  function calc(){
    $('#o-h').textContent = h.value; $('#o-r').textContent = r.value;
    $('#o-y').textContent = new Intl.NumberFormat(I.locale || 'de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(+h.value * +r.value * 46);
  }
  h.addEventListener('input', calc); r.addEventListener('input', calc); calc();
})();

/* ---------- workflow demo ---------- */
(function(){
  var box = $('.wf'); if (!box || !I.wf) return;
  var TAGS = [['in','sc','ai','hu'],['in','ai','sc','hu'],['in','sc','ai','hu']];
  var idx = 0, step = -1, timer = null, vis = false, steps = $$('.wf-step', box);
  function render(){ steps.forEach(function(li, n){ var tg = TAGS[idx][n], t = li.querySelector('.wf-tag'); t.textContent = I.wf.tags[tg]; t.className = 'wf-tag' + (tg === 'ai' ? ' ai' : tg === 'hu' ? ' hu' : ''); li.querySelector('h3').textContent = I.wf.s[idx][n][0]; li.querySelector('p').textContent = I.wf.s[idx][n][1]; }); }
  function paint(){ steps.forEach(function(li, n){ li.classList.toggle('on', n <= step); li.classList.toggle('cur', n === step); li.classList.toggle('done', n < step); }); }
  function tick(){ clearTimeout(timer); if (!vis) return; step++; if (step > 3) { step = -1; paint(); timer = setTimeout(tick, 900); return; } paint(); timer = setTimeout(tick, step === 3 ? 3200 : 1500); }
  function set(i){ idx = i; $$('.tab', box).forEach(function(b){ b.setAttribute('aria-selected', +b.getAttribute('data-wf') === i ? 'true' : 'false'); }); render(); step = reduce ? 3 : -1; paint(); if (!reduce) { clearTimeout(timer); timer = setTimeout(tick, 300); } }
  $$('.tab', box).forEach(function(b){ b.addEventListener('click', function(){ vis = true; set(+b.getAttribute('data-wf')); }); });
  render();
  if (reduce || !('IntersectionObserver' in window)) { step = 3; paint(); return; }
  new IntersectionObserver(function(en){ vis = en[0].isIntersecting; clearTimeout(timer); if (vis) timer = setTimeout(tick, 500); }, { threshold: .35 }).observe(box);
})();

/* ---------- scroll hint (home) ---------- */
(function(){
  var a = $('.scrolldn'); if (!a) return;
  function hide(){ a.classList.add('gone'); removeEventListener('scroll', onScroll); }
  function onScroll(){ if (scrollY > 24) hide(); }
  if (scrollY > 24) { hide(); return; }
  /* only show while there is free room under the hero text, so it never covers a button */
  var txt = $('.hero-home .txt');
  function fit(){ if (txt) a.classList.toggle('nospace', innerHeight - txt.getBoundingClientRect().bottom < 72); }
  fit(); addEventListener('resize', fit);
  addEventListener('scroll', onScroll, { passive:true });
  a.addEventListener('click', function(e){ var t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block:'start' }); });
})();

/* ---------- form (Web3Forms, no cookies) ---------- */
(function(){
  var form = $('#cform'); if (!form) return;
  form.noValidate = true; /* native validation stays on when JS is missing */
  var F = I.form || {}, btn = $('#sbtn'), msg = $('#fmsg'), label0 = btn.textContent, locked = false, timer = 0;
  var el = function(id){ return document.getElementById(id); };
  var RULES = {
    'f-name': [function(v){ return v.length > 1; }, 'e_name'],
    'f-mail': [function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }, 'e_mail'],
    'f-svc': [function(v){ return !!v; }, 'e_svc'],
    'f-tel': [function(v){ return !v || (/^[0-9+\s().\/-]{5,25}$/.test(v) && v.replace(/\D/g, '').length >= 5); }, 'e_tel'],
    'f-msg': [function(v){ return v.length > 1; }, 'e_msg'],
    'f-ok': [function(v, c){ return c.checked; }, 'e_ok']
  };
  var q = new URLSearchParams(location.search).get('s');
  if (q) { var o = form.querySelector('option[data-k="' + q.replace(/[^\w-]/g, '') + '"]'); if (o) o.selected = true; }
  function show(t, s){ msg.className = 'fmsg ' + t; msg.textContent = s; }
  function check(id, quiet){
    var inp = el(id), r = RULES[id], ok = r[0](inp.value.trim(), inp), err = el('e-' + id.slice(2)), box = inp.closest(id === 'f-ok' ? '.consent' : '.cf-g'), base = inp.getAttribute('data-desc');
    box.classList.toggle('bad', !ok);
    err.textContent = ok ? '' : (F[r[1]] || '');
    if (ok) { inp.removeAttribute('aria-invalid'); if (base) inp.setAttribute('aria-describedby', base); else inp.removeAttribute('aria-describedby'); }
    else { inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', err.id + (base ? ' ' + base : '')); }
    return ok;
  }
  function validate(){ var first = null; Object.keys(RULES).forEach(function(id){ if (!check(id) && !first) first = el(id); }); return first; }
  function recheck(e){ var id = e.target.id; if (RULES[id] && e.target.closest('.bad')) check(id); }
  form.addEventListener('input', recheck); form.addEventListener('change', recheck);
  function payload(){
    var v = function(id){ return el(id).value.trim(); }, h = function(n){ return form.elements[n].value; };
    var mail = v('f-mail'), p = v('f-tel'), cc = el('f-cc').value;
    var d = { access_key: h('access_key'), subject: h('subject'), from_name: h('from_name'), replyto: mail, Name: v('f-name'), 'E-Mail': mail };
    if (v('f-co')) d.Firma = v('f-co');
    d.Leistung = el('f-svc').value;
    if (p) d.Telefon = (!cc || /^(\+|00)/.test(p)) ? p : cc + ' ' + p;
    d.Nachricht = v('f-msg'); d.Einwilligung = 'Ja'; d.Sprache = h('Sprache'); d.Seite = location.href.split('#')[0];
    return d;
  }
  function restore(){ locked = false; btn.removeAttribute('aria-disabled'); btn.removeAttribute('aria-busy'); btn.removeAttribute('data-state'); btn.textContent = label0; }
  function done(){
    form.reset(); btn.removeAttribute('aria-busy'); btn.setAttribute('data-state', 'sent'); btn.textContent = F.sent;
    show('ok', F.ok); msg.setAttribute('tabindex', '-1'); msg.focus({ preventScroll: true }); msg.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    clearTimeout(timer); timer = setTimeout(restore, 6000);
  }
  function fail(){ restore(); show('err', F.err); }
  form.addEventListener('submit', function(e){
    e.preventDefault(); if (locked) return;
    var bad = validate();
    if (bad) { show('err', F.req); bad.focus(); return; }
    msg.className = 'fmsg'; msg.textContent = '';
    locked = true; btn.setAttribute('aria-disabled', 'true'); btn.setAttribute('aria-busy', 'true'); btn.textContent = F.sending;
    if (el('f-bot').checked) { done(); return; } /* honeypot ticked: look successful, send nothing */
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function(){ if (ctl) ctl.abort(); }, 20000);
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload()), signal: ctl ? ctl.signal : undefined })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if (!r.ok || !j.success) throw new Error('send'); }); })
      .then(done, fail)
      .then(function(){ clearTimeout(to); });
  });
})();

/* ---------- tilt ---------- */
(function(){
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('.pc').forEach(function(card){
    card.addEventListener('mousemove', function(e){ var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; card.style.transition = 'transform .08s ease'; card.style.transform = 'perspective(1400px) rotateX(' + (((y - r.height/2) / (r.height/2)) * -5) + 'deg) rotateY(' + (((x - r.width/2) / (r.width/2)) * 5) + 'deg) scale3d(1.015,1.015,1.015)'; });
    card.addEventListener('mouseleave', function(){ card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)'; card.style.transform = ''; });
  });
})();

/* =========================================================
   ANIMATIONS
   ========================================================= */
function Stage(canvas, draw, opts){
  var ctx = canvas.getContext('2d'), self = { W:0, H:0, t:0, ctx:ctx, run:false, raf:0 };
  function size(){ var dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect(); self.W = r.width; self.H = r.height; canvas.width = Math.max(1, r.width * dpr); canvas.height = Math.max(1, r.height * dpr); ctx.setTransform(dpr,0,0,dpr,0,0); if (opts && opts.resize) opts.resize(self); }
  var last = 0;
  function loop(ts){ if (!self.run) return; var dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts; self.t += dt; draw(self, dt); self.raf = requestAnimationFrame(loop); }
  size(); addEventListener('resize', function(){ size(); if (reduce || !self.run) draw(self, 0); });
  if (reduce) { self.t = (opts && opts.still) || 3; draw(self, 0); return self; }
  draw(self, 0);
  var host = (opts && opts.host) || canvas;
  if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ var v = en[0].isIntersecting; if (v && !self.run) { self.run = true; last = 0; self.raf = requestAnimationFrame(loop); } else if (!v) { self.run = false; cancelAnimationFrame(self.raf); } }).observe(host);
  else { self.run = true; requestAnimationFrame(loop); }
  return self;
}
var ACC = '94,92,230', ACCD = '154,152,255', CY = '94,224,255';

/* ---- dot map (EU / world) ---- */
function decodeMask(M){
  var rows = M.rows.map(function(h){ var s = ''; for (var i = 0; i < h.length; i++) s += ('000' + parseInt(h[i], 16).toString(2)).slice(-4); return s; });
  return { land: function(lat, lon){ var r = Math.floor((M.lat0 + M.step/2 - lat) / M.step), c = Math.floor((lon - (M.lon0 - M.step/2)) / M.step); if (r < 0 || r >= M.h || c < 0 || c >= M.w) return false; return rows[r].charAt(c) === '1'; }, step: M.step };
}
var CITIES = { toulon:[43.12,5.93,'Toulon'], paris:[48.86,2.35,'Paris'], lyon:[45.76,4.84,'Lyon'], zurich:[47.37,8.54,'Zürich'], munich:[48.14,11.58,'München'], berlin:[52.52,13.4,'Berlin'], hamburg:[53.55,9.99,'Hamburg'], frankfurt:[50.11,8.68,'Frankfurt'], milan:[45.46,9.19,'Milano'], rome:[41.9,12.5,'Roma'], vienna:[48.21,16.37,'Wien'],
  ny:[40.71,-74.0,'New York'], boston:[42.36,-71.06,'Boston'], houston:[29.76,-95.37,'Houston'], la:[34.05,-118.24,'Los Angeles'], chicago:[41.88,-87.63,'Chicago'], dubai:[25.2,55.27,'Dubai'], riyadh:[24.71,46.68,'Riyadh'], doha:[25.29,51.53,'Doha'] };
function mapAnim(canvas, variant, L){
  if (!window.PMASK) return;
  var mask = decodeMask(variant === 'world' || !window.PMASK_EU ? window.PMASK : window.PMASK_EU), V = variant === 'world'
    ? { lon0:-128, lon1:64, lat0:66, lat1:6, home:'zurich', from:['toulon','zurich'], to:['ny','boston','houston','la','chicago','dubai','riyadh','doha'], st:1.5 }
    : { lon0:-11, lon1:22, lat0:57, lat1:37.5, home:'toulon', from:['toulon'], to:['paris','zurich','munich','milan','berlin','hamburg','lyon','frankfurt','rome','vienna'], st:.25 };
  var tags = (L && L.tags) || [], dots = [], arcs = [], proj, cur = 0, pops = [];
  function setup(S){
    var W = S.W, H = S.H, wide = variant !== 'world' && W > 860;
    var rx0 = wide ? W * .40 : 0, rw = wide ? W * .62 : W, phi = ((V.lat0 + V.lat1) / 2) * Math.PI / 180, cw = Math.cos(phi);
    var spanX = (V.lon1 - V.lon0) * cw, spanY = (V.lat0 - V.lat1), s = Math.min(rw / spanX, (H * (wide ? .92 : .9)) / spanY);
    var ox = rx0 + (rw - spanX * s) / 2, oy = (H - spanY * s) / 2 + (wide ? 0 : H * .02);
    proj = function(lat, lon){ return [ox + (lon - V.lon0) * cw * s, oy + (V.lat0 - lat) * s]; };
    dots = []; var st = V.st, lonA = V.lon0 - (ox / (cw * s)) - 2, lonB = V.lon0 + ((W - ox) / (cw * s)) + 2, latA = V.lat0 + (oy / s) + 2, latB = V.lat0 - ((H - oy) / s) - 2;
    for (var la = Math.min(84, latA); la > Math.max(-58, latB); la -= st) for (var lo = Math.max(-180, lonA); lo < Math.min(180, lonB); lo += st) if (mask.land(la, lo)) { var p = proj(la, lo); dots.push([p[0], p[1], Math.random()]); }
    arcs = V.to.map(function(k, i){ var f = CITIES[V.from[i % V.from.length]], t = CITIES[k], a = proj(f[0], f[1]), b = proj(t[0], t[1]); var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = Math.hypot(b[0] - a[0], b[1] - a[1]); return { a:a, b:b, c:[mx, my - d * .35], name:t[2], tag: tags.length ? tags[i % tags.length] : '', p: -i * .55, done:0 }; });
  }
  function q(a, c, b, t){ var u = 1 - t; return [u*u*a[0] + 2*u*t*c[0] + t*t*b[0], u*u*a[1] + 2*u*t*c[1] + t*t*b[1]]; }
  Stage(canvas, function(S){
    var c = S.ctx, W = S.W, H = S.H, t = S.t; c.clearRect(0, 0, W, H);
    var r = variant === 'world' ? Math.max(1.3, Math.min(2.2, W / 360)) : Math.max(1.8, Math.min(2.8, W / 560));
    for (var i = 0; i < dots.length; i++) { var d = dots[i], tw = .42 + .22 * Math.sin(t * 1.3 + d[2] * 20); c.fillStyle = 'rgba(' + ACCD + ',' + tw + ')'; if (variant === 'world') c.fillRect(d[0] - r/2, d[1] - r/2, r, r); else { c.beginPath(); c.arc(d[0], d[1], r * .62, 0, 6.283); c.fill(); } }
    var cycle = 1.6;
    arcs.forEach(function(A, i){
      var ph = ((t * .5 + A.p) % (arcs.length * .55 + 2)); var prog = Math.max(0, Math.min(1, ph / cycle));
      if (reduce) prog = 1;
      if (prog > 0) {
        c.beginPath(); var steps = 40, end = Math.floor(steps * prog);
        for (var k = 0; k <= end; k++) { var p = q(A.a, A.c, A.b, k / steps); if (k === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
        var g = c.createLinearGradient(A.a[0], A.a[1], A.b[0], A.b[1]); g.addColorStop(0, 'rgba(' + ACCD + ',.15)'); g.addColorStop(1, 'rgba(' + CY + ',.85)');
        c.strokeStyle = g; c.lineWidth = 1.4; c.stroke();
        if (prog < 1) { var hp = q(A.a, A.c, A.b, prog); var gg = c.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], 12); gg.addColorStop(0, 'rgba(' + CY + ',1)'); gg.addColorStop(1, 'rgba(' + CY + ',0)'); c.fillStyle = gg; c.beginPath(); c.arc(hp[0], hp[1], 12, 0, 6.283); c.fill(); }
      }
      if (prog >= 1) {
        var pulse = (t * 1.2 + i) % 2; c.strokeStyle = 'rgba(' + CY + ',' + (.6 * (1 - pulse / 2)) + ')'; c.lineWidth = 1.2; c.beginPath(); c.arc(A.b[0], A.b[1], 4 + pulse * 9, 0, 6.283); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(A.b[0], A.b[1], 3, 0, 6.283); c.fill();
        var lab = A.name + (A.tag ? '  ·  ' + A.tag : ''); c.font = '600 ' + (W < 600 ? 10 : 12) + 'px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
        var tw2 = c.measureText(lab).width + 16, lx = Math.min(W - tw2 - 6, A.b[0] + 9), ly = A.b[1] - 24;
        var al = Math.min(1, (ph - cycle) * 2); if (reduce) al = 1;
        if (al > 0) { c.globalAlpha = al; c.fillStyle = 'rgba(20,20,28,.85)'; rr(c, lx, ly, tw2, 20, 10); c.fill(); c.strokeStyle = 'rgba(' + ACCD + ',.35)'; c.stroke(); c.fillStyle = '#e8e8ff'; c.fillText(lab, lx + 8, ly + 14); c.globalAlpha = 1; }
      }
    });
    V.from.forEach(function(k){ var p = proj(CITIES[k][0], CITIES[k][1]); var pl = (t % 2.4) / 2.4; c.strokeStyle = 'rgba(' + ACCD + ',' + (1 - pl) + ')'; c.lineWidth = 1.5; c.beginPath(); c.arc(p[0], p[1], 5 + pl * 22, 0, 6.283); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(p[0], p[1], 4.5, 0, 6.283); c.fill(); c.fillStyle = 'rgba(' + ACC + ',1)'; c.beginPath(); c.arc(p[0], p[1], 2.4, 0, 6.283); c.fill(); });
  }, { resize: setup, still: 30, host: canvas.parentNode });
}
function rr(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

/* ---- recruiting funnel ---- */
function funnelAnim(canvas, L){
  var P = [], slots = 0, spawn = 0;
  Stage(canvas, function(S, dt){
    var c = S.ctx, W = S.W, H = S.H; c.clearRect(0, 0, W, H);
    var top = H * .12, bot = H * .72, cx = W / 2, wt = W * .78, wb = W * .2, stages = [top + (bot - top) * .3, top + (bot - top) * .62, bot];
    function half(y){ return (wt + (wb - wt) * ((y - top) / (bot - top))) / 2; }
    // funnel walls
    c.strokeStyle = 'rgba(' + ACCD + ',.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - wt/2, top); c.lineTo(cx - wb/2, bot); c.lineTo(cx - wb/2, H * .8); c.moveTo(cx + wt/2, top); c.lineTo(cx + wb/2, bot); c.lineTo(cx + wb/2, H * .8); c.stroke();
    var labs = [L.a, L.b, L.c];
    c.font = '600 ' + (W < 420 ? 11 : 13) + 'px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
    stages.forEach(function(y, i){ var h = half(y); c.setLineDash([4, 6]); c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(cx - h, y); c.lineTo(cx + h, y); c.stroke(); c.setLineDash([]); c.fillStyle = 'rgba(232,232,255,.85)'; c.textAlign = 'right'; c.fillText(labs[i], cx - h - 10, y + 4); });
    c.textAlign = 'left';
    // slots
    var n = 4, sw = Math.min(46, W * .1), gap = sw * .45, sx = cx - (n * sw + (n - 1) * gap) / 2, sy = H * .86;
    for (var i = 0; i < n; i++) { var x = sx + i * (sw + gap), on = i < slots; c.fillStyle = on ? 'rgba(48,209,88,.9)' : 'rgba(255,255,255,.06)'; c.strokeStyle = on ? 'rgba(48,209,88,1)' : 'rgba(255,255,255,.2)'; rr(c, x, sy - sw/2, sw, sw, sw * .3); c.fill(); c.stroke(); if (on) { c.strokeStyle = '#000'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + sw * .3, sy); c.lineTo(x + sw * .45, sy + sw * .15); c.lineTo(x + sw * .72, sy - sw * .16); c.stroke(); c.lineWidth = 1.5; } }
    c.fillStyle = 'rgba(232,232,255,.85)'; c.textAlign = 'center'; c.fillText(L.d, cx, sy + sw / 2 + 20); c.textAlign = 'left';
    if (reduce) { slots = 4; return; }
    // spawn
    spawn += dt; if (spawn > .07) { spawn = 0; P.push({ x: cx + (Math.random() - .5) * wt * .9, y: top - 10, vy: 40 + Math.random() * 30, stage: 0, out: 0, a: 1, ok: Math.random() }); }
    for (var k = P.length - 1; k >= 0; k--) {
      var p = P[k];
      if (p.out) { p.x += p.out * 60 * dt; p.y += 20 * dt; p.a -= dt * 1.6; if (p.a <= 0) { P.splice(k, 1); continue; } }
      else {
        p.y += p.vy * dt; var h = half(Math.min(p.y, bot)) - 4; p.x += ((cx + (p.x - cx) * .985) - p.x); if (p.y > top) { if (p.x < cx - h) p.x = cx - h; if (p.x > cx + h) p.x = cx + h; }
        if (p.stage < 3 && p.y >= stages[p.stage]) { var keep = [.42, .45, .5][p.stage]; if (Math.random() > keep) { p.out = p.x < cx ? -1 : 1; } else p.stage++; }
        if (p.y > H * .8) { P.splice(k, 1); slots++; if (slots > 4) slots = 0; continue; }
      }
      var col = p.out ? '255,255,255' : (p.stage >= 2 ? CY : p.stage === 1 ? ACCD : '200,200,220');
      c.fillStyle = 'rgba(' + col + ',' + (p.out ? p.a * .4 : .9) + ')'; c.beginPath(); c.arc(p.x, p.y, p.stage >= 2 ? 3.6 : 2.6, 0, 6.283); c.fill();
    }
  }, { host: canvas.parentNode });
}

/* ---- process tangle ---- */
function tangleAnim(canvas, L){
  var N = 6, seeds = []; for (var i = 0; i < N; i++) seeds.push({ f: 1.5 + Math.random() * 3, p: Math.random() * 6.28, a: .25 + Math.random() * .3, f2: 3 + Math.random() * 4 });
  Stage(canvas, function(S){
    var c = S.ctx, W = S.W, H = S.H, t = S.t; c.clearRect(0, 0, W, H);
    var ph = (t % 9) / 9, m = reduce ? 0 : ph < .3 ? 1 : ph < .45 ? 1 - (ph - .3) / .15 : ph < .85 ? 0 : (ph - .85) / .15;
    var e = m * m * (3 - 2 * m), pad = W * .08, x0 = pad, x1 = W - pad, top = H * .2, bot = H * .82;
    for (var i = 0; i < N; i++) {
      var base = top + (bot - top) * (i / (N - 1)), sd = seeds[i];
      var col = i % 2 ? CY : ACCD;
      c.strokeStyle = 'rgba(' + col + ',' + (.45 + .4 * (1 - e)) + ')'; c.lineWidth = 2; c.beginPath();
      for (var x = x0; x <= x1; x += 4) {
        var u = (x - x0) / (x1 - x0), env = Math.sin(u * Math.PI);
        var ty = H / 2 + (Math.sin(u * sd.f * 6.28 + sd.p + t * .7) * sd.a + Math.sin(u * sd.f2 * 6.28 + t * .4) * .12) * (bot - top) * env;
        var y = base * (1 - e) + ty * e; if (x === x0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
      if (e < .35) { var al = 1 - e / .35; for (var j = 0; j < 3; j++) { var u2 = ((t * .18 + j / 3 + i * .07) % 1), px = x0 + u2 * (x1 - x0); c.fillStyle = 'rgba(255,255,255,' + al + ')'; c.beginPath(); c.arc(px, base, 3.2, 0, 6.283); c.fill(); } }
    }
    for (var i2 = 0; i2 < N; i2++) { var b2 = top + (bot - top) * (i2 / (N - 1)); [x0, x1].forEach(function(x){ c.fillStyle = '#0a0a0f'; c.strokeStyle = 'rgba(' + ACCD + ',.9)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, b2 * (1 - e) + (H / 2) * e, 5, 0, 6.283); c.fill(); c.stroke(); }); }
    c.font = '600 ' + (W < 420 ? 13 : 15) + 'px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
    c.fillStyle = 'rgba(255,179,64,' + e + ')'; c.fillText(L.a, pad, H * .1);
    c.fillStyle = 'rgba(48,209,88,' + (1 - e) + ')'; c.fillText(L.b, pad, H * .1);
  }, { host: canvas.parentNode, still: 4 });
}

/* ---- code rain ---- */
function rainAnim(canvas){
  var cols = [], fs = 16, glyphs = '01010110100101{}()[]<>=+;:.#$_/'.split(''), words = ['def','for','if','return','import','SELECT','async','await','lambda','map','json','True','None','yield','class','try'];
  Stage(canvas, function(S, dt){
    var c = S.ctx, W = S.W, H = S.H;
    if (!cols.length || cols.length !== Math.ceil(W / fs)) { cols = []; for (var i = 0; i < Math.ceil(W / fs); i++) cols.push({ y: Math.random() * H, v: 40 + Math.random() * 90, w: null }); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); }
    c.fillStyle = 'rgba(0,0,0,' + (reduce ? 1 : .12) + ')'; c.fillRect(0, 0, W, H);
    c.font = fs - 2 + 'px ui-monospace,SFMono-Regular,Menlo,monospace';
    if (reduce) { for (var r = 0; r < H / fs; r++) for (var k = 0; k < cols.length; k++) if (Math.random() < .25) { c.fillStyle = 'rgba(' + ACCD + ',.35)'; c.fillText(glyphs[(r * 7 + k * 3) % glyphs.length], k * fs, r * fs); } return; }
    cols.forEach(function(col, i){
      col.y += col.v * dt; var ch = glyphs[(Math.random() * glyphs.length) | 0];
      if (Math.random() < .004) col.w = { s: words[(Math.random() * words.length) | 0], i: 0 };
      if (col.w) { ch = col.w.s[col.w.i] || ' '; }
      var bright = Math.random() < .06;
      c.fillStyle = bright ? 'rgba(' + CY + ',.95)' : (col.w ? 'rgba(255,255,255,.85)' : 'rgba(' + ACCD + ',.55)');
      c.fillText(ch, i * fs, col.y);
      if (col.w && col.y % fs < col.v * dt + 1) { col.w.i++; if (col.w.i >= col.w.s.length) col.w = null; }
      if (col.y > H + fs) { col.y = -fs * Math.random() * 10; col.v = 40 + Math.random() * 90; }
    });
  }, { host: canvas.parentNode });
}
function typeCode(pre){
  var T = [['cm','# Prossimo · automation'],['', '\n'],['kw','from'],['',' prossimo '],['kw','import'],['',' inbox, ai, sheet\n\n'],['kw','def'],['fn',' sort_applications'],['','(role):\n    shortlist = []\n    '],['kw','for'],['',' cv '],['kw','in'],['',' inbox.'],['fn','new'],['','():\n        profile = '],['fn','extract'],['','(cv)\n        score = '],['fn','match'],['','(profile, role)\n        '],['kw','if'],['',' score > '],['nu','0.8'],['',':\n            profile.summary = ai.'],['fn','summarize'],['','(cv, lines='],['nu','3'],['',')\n            shortlist.'],['fn','append'],['','(profile)\n    sheet.'],['fn','update'],['','(shortlist)\n    '],['kw','return'],['',' '],['st','"ready for review"'],['','\n']];
  var total = T.reduce(function(a, b){ return a + b[1].length; }, 0), n = 0, timer;
  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function render(k){ var out = '', left = k; for (var i = 0; i < T.length && left > 0; i++) { var s = T[i][1].slice(0, left); left -= s.length; out += T[i][0] ? '<span class="' + T[i][0] + '">' + esc(s) + '</span>' : esc(s); } pre.innerHTML = out + '<span class="cur"></span>'; }
  if (reduce) { render(total); return; }
  var vis = false;
  function tick(){ if (!vis) return; n++; render(n); if (n >= total) { timer = setTimeout(function(){ n = 0; tick(); }, 4200); } else timer = setTimeout(tick, T.length && /\n/.test(pre.textContent.slice(-1)) ? 90 : 26 + Math.random() * 40); }
  render(0);
  new IntersectionObserver(function(en){ vis = en[0].isIntersecting; clearTimeout(timer); if (vis) timer = setTimeout(tick, 400); }).observe(pre);
}

/* ---- HR dashboard ---- */
function dashAnim(host, L){
  var rows = L.r.map(function(r){ return '<div class="drow"><span class="bx"></span><span class="lab">' + r + '</span><span class="s">' + L.open + '</span></div>'; }).join('');
  var bars = L.days.map(function(d){ return '<div><i></i><span>' + d + '</span></div>'; }).join('');
  host.innerHTML = '<div class="dash"><div class="dw list"><h4>' + L.t1 + '</h4>' + rows + '</div><div class="dw"><h4>' + L.t2 + '</h4><div class="bars">' + bars + '</div></div><div class="dw"><h4>' + L.t3 + '</h4><div class="ring"><svg viewBox="0 0 100 100"><defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#9a98ff"/><stop offset="1" stop-color="#5ee0ff"/></linearGradient></defs><circle class="bgc" cx="50" cy="50" r="42"/><circle class="fgc" cx="50" cy="50" r="42" stroke-dasharray="263.9" stroke-dashoffset="263.9"/></svg><b>0%</b></div></div></div>';
  var R = $$('.drow', host), B = $$('.bars i', host), ring = $('.fgc', host), pct = $('.ring b', host), i = 0, timer, vis = false, p = 0, rt;
  function setBars(){ B.forEach(function(b){ b.style.height = (35 + Math.random() * 60) + '%'; }); }
  function setRing(v){ ring.style.strokeDashoffset = 263.9 * (1 - v / 100); pct.textContent = Math.round(v) + '%'; }
  function finish(){ R.forEach(function(r){ r.classList.add('ok'); r.querySelector('.s').textContent = L.done; }); B.forEach(function(b, k){ b.style.height = [62, 80, 71, 88, 55][k % 5] + '%'; }); setRing(100); }
  if (reduce) { finish(); return; }
  function reset(){ R.forEach(function(r){ r.classList.remove('ok'); r.querySelector('.s').textContent = L.open; }); i = 0; p = 0; setRing(0); setBars(); }
  function tick(){ if (!vis) return; if (i < R.length) { R[i].classList.add('ok'); R[i].querySelector('.s').textContent = L.done; i++; setBars(); timer = setTimeout(tick, 1000); } else timer = setTimeout(function(){ reset(); tick(); }, 2600); }
  function ringLoop(){ if (!vis) return; var target = (i / R.length) * 100; p += (target - p) * .08; setRing(p); rt = requestAnimationFrame(ringLoop); }
  setBars();
  new IntersectionObserver(function(en){ vis = en[0].isIntersecting; clearTimeout(timer); cancelAnimationFrame(rt); if (vis) { timer = setTimeout(tick, 600); ringLoop(); } }).observe(host);
}

/* ---- profile builder ---- */
function profileAnim(host, L){
  host.innerHTML = '<div class="pb"><div class="pcard"><div class="cover"></div><div class="body"><div class="av"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21c.8-4.6 4.3-7 8.5-7s7.7 2.4 8.5 7z"/></svg></div><div class="sk t" style="width:60%"><span>' + L.name + '</span></div><div class="sk r" style="width:85%"><span>' + L.role + '</span></div><div class="sk" style="width:70%"></div><div class="kw">' + L.k.map(function(k){ return '<i>' + k + '</i>'; }).join('') + '</div><div class="meter"><div><span>' + L.s + '</span><b>30%</b></div><span><i></i></span></div></div></div></div>';
  var card = $('.pcard', host), sks = $$('.sk', host).slice(0, 2), kws = $$('.kw i', host), bar = $('.meter i', host), val = $('.meter b', host), st = 0, timer, vis = false;
  var seq = [function(){ card.classList.add('s1'); }, function(){ sks[0].classList.add('on'); }, function(){ sks[1].classList.add('on'); }].concat(kws.map(function(k){ return function(){ k.classList.add('on'); }; }));
  function meter(){ var v = 30 + Math.round(66 * (st / seq.length)); bar.style.width = v + '%'; val.textContent = v + '%'; }
  function finish(){ seq.forEach(function(f){ f(); }); st = seq.length; meter(); }
  if (reduce) { finish(); return; }
  function reset(){ card.classList.remove('s1'); sks.forEach(function(s){ s.classList.remove('on'); }); kws.forEach(function(k){ k.classList.remove('on'); }); st = 0; meter(); }
  function tick(){ if (!vis) return; if (st < seq.length) { seq[st](); st++; meter(); timer = setTimeout(tick, st < 3 ? 900 : 550); } else timer = setTimeout(function(){ reset(); timer = setTimeout(tick, 700); }, 3200); }
  meter();
  new IntersectionObserver(function(en){ vis = en[0].isIntersecting; clearTimeout(timer); if (vis) timer = setTimeout(tick, 500); }).observe(host);
}

/* ---- boot animations ---- */
$$('[data-anim]').forEach(function(el){
  var a = el.getAttribute('data-anim'), L = {};
  try { L = JSON.parse(el.getAttribute('data-l') || '{}'); } catch(e){}
  if (a === 'map-eu') mapAnim(el, 'eu', L);
  else if (a === 'map-world') mapAnim(el, 'world', L);
  else if (a === 'funnel') funnelAnim(el, L);
  else if (a === 'tangle') tangleAnim(el, L);
  else if (a === 'rain') rainAnim(el);
  else if (a === 'dash') dashAnim(el, L);
  else if (a === 'profile') profileAnim(el, L);
});
$$('pre[data-type]').forEach(typeCode);

try { console.log('%cProssimo Business Solutions', 'font:600 14px -apple-system,sans-serif;color:#9a98ff', '\n→ dellaportadario@gmail.com'); } catch(e){}
})();
