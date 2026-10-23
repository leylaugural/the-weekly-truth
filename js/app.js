/* ==========================================================
   THE WEEKLY TRUTH — interaction
   1. Click a story            → an Error window opens
   2. Click more stories       → more Errors stack on top (Figma "Desktop - 4")
   3. X on a window            → that window closes, back to the paper
   4. Fix on a window          → the site breaks into that story's code page
   Routes: #/  (index)   #/code/<story>  (code page)
   ========================================================== */
(function () {
  const index = document.getElementById('index');
  const codePage = document.getElementById('code');
  const codeText = document.getElementById('code-text');
  const layer = document.getElementById('errors');
  const tpl = document.getElementById('error-tpl');

  /* ---- scale the 1440px Figma frame to the window (desktop/tablet) ---- */
  let zoom = 1;
  function fit() {
    zoom = innerWidth >= 760 ? Math.min(1, innerWidth / 1440) : 1;
    document.querySelectorAll('.page').forEach(p => { p.style.zoom = zoom; });
    layer.style.zoom = zoom;
  }
  addEventListener('resize', fit);
  fit();

  /* ---- error windows ----
     Offsets between stacked windows come from Figma "Desktop - 4"
     (frames at 559,668 → 535,723 → 485,776 → 425,871). */
  const STEPS = [[-24, 55], [-50, 53], [-60, 95]];
  const W = 431, H = 241;
  let stack = [];

  function nextPosition() {
    const vw = innerWidth / zoom, vh = innerHeight / zoom;
    if (!stack.length) return [Math.round((vw - W) / 2 + 40), Math.round((vh - H) / 2 - 60)];
    const last = stack[stack.length - 1];
    const [dx, dy] = STEPS[(stack.length - 1) % STEPS.length];
    let x = last.x + dx, y = last.y + dy;
    // keep the pile on screen: wrap back up and nudge right
    if (y + H > vh - 8 || x < 8) { x = Math.round((vw - W) / 2 + 40 + stack.length * 12); y = Math.max(8, Math.round((vh - H) / 2 - 140)); }
    return [x, y];
  }

  function openError(story) {
    const el = tpl.content.firstElementChild.cloneNode(true);
    const [x, y] = nextPosition();
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    const entry = { el, story, x, y };
    el.querySelector('.err-close').addEventListener('click', e => { e.stopPropagation(); closeError(entry); });
    el.querySelector('.err-fix').addEventListener('click', e => { e.stopPropagation(); fix(story); });
    layer.appendChild(el);
    stack.push(entry);
  }

  function closeError(entry) {
    entry.el.remove();
    stack = stack.filter(s => s !== entry);
  }
  function clearErrors() { stack.forEach(s => s.el.remove()); stack = []; }

  document.querySelectorAll('[data-story]').forEach(el => {
    el.addEventListener('click', () => openError(el.dataset.story));
  });

  /* ---- Fix: break into code ----
     Not a keyframed animation: every "frame" is random — random timing,
     random torn strips, random colour split — so it feels like a real
     display failing rather than a designed transition. */
  const rand = (a, b) => a + Math.random() * (b - a);
  const chance = p => Math.random() < p;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function glitch(done) {
    if (reduced) return done();
    const layers = {};
    const make = cls => {
      const wrap = document.createElement('div');
      wrap.className = 'gl-layer ' + cls;
      const inner = document.createElement('div');
      inner.style.marginTop = -scrollY + 'px';
      const copy = index.cloneNode(true);
      copy.removeAttribute('id');
      copy.style.zoom = zoom;
      inner.appendChild(copy); wrap.appendChild(inner);
      document.body.appendChild(wrap);
      return wrap;
    };
    layers.red = make('gl-red'); layers.cyan = make('gl-cyan');
    layers.s1 = make(''); layers.s2 = make(''); layers.s3 = make('');
    const blank = document.createElement('div'); blank.className = 'gl-blank'; document.body.appendChild(blank);

    const hide = el => { el.style.visibility = 'hidden'; };
    const show = el => { el.style.visibility = 'visible'; };
    const start = performance.now(), D = rand(1000, 1300);
    let timer;

    function frame() {
      const t = (performance.now() - start) / D;
      // a couple of quiet frames first, then it gets worse
      const k = t < 0.18 ? 0.25 : t < 0.55 ? rand(0.4, 0.8) : rand(0.7, 1);

      // colour split: offset red / cyan copies of the page
      if (chance(0.35 + 0.5 * k)) {
        const off = rand(2, 4 + 16 * k) * (chance(0.5) ? 1 : -1);
        layers.red.style.transform = `translate(${off}px, ${rand(-1, 1) * k * 3}px)`;
        layers.cyan.style.transform = `translate(${-off * rand(0.6, 1.2)}px, 0)`;
        show(layers.red); show(layers.cyan);
      } else { hide(layers.red); hide(layers.cyan); }

      // torn horizontal strips that slide sideways
      [layers.s1, layers.s2, layers.s3].forEach((L, i) => {
        if (chance(0.25 + 0.6 * k - i * 0.15)) {
          const h = chance(0.7) ? rand(0.4, 4) : rand(6, 22);      // mostly thin slivers, sometimes a big band
          const top = rand(0, 100 - h);
          L.style.clipPath = `inset(${top}% 0 ${100 - top - h}% 0)`;
          L.style.transform = `translateX(${rand(-1, 1) * (20 + 180 * k)}px)`;
          L.style.filter = chance(0.2 * k) ? 'invert(1)' : chance(0.25) ? `hue-rotate(${rand(60, 300)}deg) saturate(${rand(2, 5)})` : 'none';
          show(L);
        } else hide(L);
      });

      // the page underneath judders and loses its colour now and then
      index.style.transform = chance(0.35 * k) ? `translate(${rand(-1, 1) * 8 * k}px, ${rand(-1, 1) * 4 * k}px)` : 'none';
      index.style.filter =
        chance(0.06 * k) ? 'invert(1)' :
        chance(0.18 * k) ? `hue-rotate(${rand(90, 270)}deg) saturate(${rand(1.5, 4)}) contrast(${rand(1.1, 1.6)})` :
        chance(0.1) ? `brightness(${rand(1.2, 1.8)})` : 'none';

      // dropped frames: a flash of nothing, sometimes with scanlines
      if (t > 0.3 && chance(0.08 + 0.12 * k)) { blank.classList.toggle('scan', chance(0.5)); show(blank); } else hide(blank);

      if (t < 1) timer = setTimeout(frame, chance(0.15) ? rand(140, 260) : rand(28, 90)); // uneven timing, with the odd freeze
      else finish();
    }

    function finish() {
      // last moment: everything drops out to a blank screen, then the code comes through
      Object.values(layers).forEach(hide);
      blank.classList.add('scan'); show(blank);
      index.style.transform = index.style.filter = '';
      setTimeout(() => {
        Object.values(layers).forEach(l => l.remove());
        done();
        setTimeout(() => blank.remove(), rand(60, 120));
      }, rand(90, 160));
    }
    frame();
  }

  /* the code page doesn't fade in — it comes through in uneven chunks, like a slow connection */
  function stutterIn() {
    if (reduced) return;
    let shown = 0, timer;
    const H = innerHeight;
    codeText.style.clipPath = 'inset(0 0 100% 0)';
    (function step() {
      shown += chance(0.2) ? rand(H * 0.15, H * 0.35) : rand(H * 0.02, H * 0.09);
      if (chance(0.08)) shown = Math.max(0, shown - rand(20, 80));          // a hiccup: a few lines vanish again
      codeText.style.opacity = chance(0.1) ? rand(0.35, 0.7) : 1;
      const rect = codeText.getBoundingClientRect();
      const visiblePx = (shown - rect.top) / zoom;   // clip-path works in the zoomed page units
      if (shown >= H) { codeText.style.clipPath = ''; codeText.style.opacity = ''; return; }
      codeText.style.clipPath = `inset(0 0 calc(100% - ${Math.max(0, visiblePx)}px) 0)`;
      timer = setTimeout(step, chance(0.12) ? rand(120, 220) : rand(25, 70));
    })();
  }

  function fix(story) {
    clearErrors();
    glitch(() => { location.hash = '#/code/' + story; });
  }

  /* ---- routing ---- */
  function render() {
    const m = location.hash.match(/^#\/code\/([\w-]+)/);
    const html = m && TWT.code[m[1]];
    if (html) {
      clearErrors();
      codeText.innerHTML = html;
      // the <THE_DAILY_TRUTH> opening and closing lines lead back to the paper
      const lines = codeText.querySelectorAll('.ln');
      [lines[0], lines[lines.length - 1]].forEach(l => { l.classList.add('home'); l.addEventListener('click', goHome); });
      index.hidden = true;
      codePage.hidden = false;
      document.body.classList.add('code-mode');
      stutterIn();
      document.title = 'ERROR — The Weekly Truth';
    } else {
      codePage.hidden = true;
      index.hidden = false;
      document.body.classList.remove('code-mode');
      document.title = 'The Weekly Truth';
    }
    scrollTo(0, 0);
  }
  function goHome() { location.hash = '#/'; }
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (!codePage.hidden) goHome(); else if (stack.length) closeError(stack[stack.length - 1]); } });
  addEventListener('hashchange', render);
  render();
})();
