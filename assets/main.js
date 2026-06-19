/* ================================================================
   GOWRISHANKAR — main.js
   All interactive behaviors: particles, tilt, theme, menu, modals
   ================================================================ */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Theme toggle ── */
  function initTheme() {
    $$('.icon-btn[aria-label="Toggle theme"]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
      });
    });
  }

  /* ── Mobile menu ── */
  function initMobileMenu() {
    const btn = $('#menuBtn') || $('[aria-controls="mobileMenu"]');
    const menu = $('#mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      const open = menu.hasAttribute('hidden');
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') { menu.hidden = true; btn.setAttribute('aria-expanded','false'); }
    });
  }

  /* ── Page transitions ── */
  function initTransitions() {
    $$('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('#') || href.startsWith('http') || a.target === '_blank') return;
      a.addEventListener('click', e => {
        e.preventDefault();
        document.body.style.transition = 'opacity .25s';
        document.body.style.opacity = '0';
        setTimeout(() => location.href = href, 240);
      });
    });
    window.addEventListener('pageshow', () => { document.body.style.opacity = '1'; });
  }

  /* ── Scroll reveal ── */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(i => io.observe(i));
  }

  /* ── Nav active state ── */
  function initNavActive() {
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link').forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href === path || (path === '' && href === 'index.html'))) {
        a.classList.add('active');
      } else a.classList.remove('active');
    });
  }

  /* ── Counter animation ── */
  function initCounters() {
    const els = $$('.counter-card .num, .stat-num');
    if (!els.length) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target || el.textContent) || 0;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 50));
        const id = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + (el.dataset.suffix || '+');
          if (current >= target) clearInterval(id);
        }, 16);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });
    els.forEach(n => io.observe(n));
  }

  /* ── Skill bars ── */
  function initSkillBars() {
    const fills = $$('.skill-fill');
    if (!fills.length) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.width = (e.target.dataset.value || 0) + '%';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    fills.forEach(f => io.observe(f));
  }

  /* ── 3D tilt cards ── */
  function initTilt() {
    const cards = $$('.project-card');
    if (!cards.length || isReduced) return;
    cards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${py * -8}deg) rotateY(${px * 8}deg) translateY(-8px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
  window.__initTilt = initTilt;

  /* ── Parallax ── */
  function initParallax() {
    const par = $('[data-parallax]');
    if (!par || isReduced) return;
    document.addEventListener('mousemove', e => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 12;
      const dy = (e.clientY / window.innerHeight - 0.5) * 8;
      par.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
  }

  /* ── Hero Canvas ── */
  function initHeroCanvas() {
    const canvas = $('#heroCanvas');
    if (!canvas || isReduced) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    function resize() {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const nodes = [];
    const count = 40;
    const colors = ['#6c3fcf','#9b59b6','#00d4ff','#0077ff','#b388ff'];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        r: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - d/120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      // Draw nodes
      nodes.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.pulse += 0.04;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        const r = p.r + Math.sin(p.pulse) * 1;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
        g.addColorStop(0, p.color + 'cc');
        g.addColorStop(0.4, p.color + '33');
        g.addColorStop(1, p.color + '00');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Global particles ── */
  function initGlobalParticles() {
    const canvas = $('#globalParticles');
    if (!canvas || isReduced) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.clientWidth;
    let h = canvas.height = canvas.clientHeight;

    function resize() { w = canvas.width = canvas.clientWidth; h = canvas.height = canvas.clientHeight; }
    const debounce = (fn, t) => { let id; return () => { clearTimeout(id); id = setTimeout(fn, t); }; };
    window.addEventListener('resize', debounce(resize, 200));

    const particles = [];
    const count = Math.min(60, Math.floor(w * h / 30000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.5 + Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        hue: [265, 195, 160][Math.floor(Math.random() * 3)]
      });
    }

    let paused = false;
    document.addEventListener('visibilitychange', () => { paused = document.hidden; });

    function draw() {
      if (!paused) {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},70%,65%,0.6)`;
          ctx.fill();
        });
        // connections
        const maxD = 100;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i+1; j < particles.length; j++) {
            const a = particles[i], b = particles[j];
            const dx = a.x-b.x, dy = a.y-b.y;
            const d2 = dx*dx+dy*dy;
            if (d2 < maxD*maxD) {
              ctx.strokeStyle = `rgba(108,63,207,${0.12*(1-d2/(maxD*maxD))})`;
              ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
            }
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Cursor trail ── */
  function initCursorTrail() {
    const canvas = $('#cursorTrail');
    if (!canvas || isReduced) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

    const pts = [];
    document.addEventListener('mousemove', e => {
      for (let i = 0; i < 2; i++) {
        pts.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random()-0.5)*1.2, vy: (Math.random()-0.5)*1.2,
          life: 40, r: 1.5+Math.random()*2,
          h: [265, 280, 195, 210][Math.floor(Math.random()*4)]
        });
      }
    });

    function draw() {
      ctx.clearRect(0,0,w,h);
      for (let i = pts.length-1; i >= 0; i--) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) { pts.splice(i,1); continue; }
        const a = p.life / 40;
        const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
        g.addColorStop(0, `hsla(${p.h},90%,70%,${a})`);
        g.addColorStop(1, `hsla(${p.h},90%,70%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Device mockup animation ── */
  function initMockup() {
    const screen = $('#mockupScreen');
    if (!screen) return;
    let t = 0;
    const colors = ['#6366f1','#06b6d4','#10b981'];
    function draw() {
      t++;
      const c = colors[Math.floor(t/120) % colors.length];
      screen.style.background = `radial-gradient(ellipse at ${50+Math.sin(t/80)*30}% ${50+Math.cos(t/60)*20}%, ${c}22 0%, #0a0a1e 70%)`;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Timeline toggles ── */
  function initTimelineToggles() {
    $$('.toggle-more').forEach(btn => {
      const bullets = btn.closest('[data-open]')?.querySelector('.timeline-bullets') || btn.previousElementSibling;
      if (!bullets) return;
      if (window.innerWidth < 720) { bullets.style.display = 'none'; btn.textContent = 'Show more'; }
      btn.addEventListener('click', () => {
        const open = bullets.style.display !== 'none';
        bullets.style.display = open ? 'none' : '';
        btn.textContent = open ? 'Show more' : 'Show less';
      });
    });
  }

  /* ── Contact copy ── */
  function initContact() {
    const copyBtn = $('#copyContact');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText('gowrishankars27@outlook.com');
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => copyBtn.textContent = 'Copy email', 2000);
        } catch { copyBtn.textContent = 'Failed'; }
      });
    }

    const form = $('#contactForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Sending…';
        setTimeout(() => {
          btn.disabled = false; btn.textContent = 'Send Message';
          form.reset();
          alert('Message received! I\'ll reply within 48 hours.');
        }, 1000);
      });
    }
  }

  /* ── Resume modal ── */
  function initResumeModal() {
    const openBtn = $('#openResumeBtn');
    const modal = $('#resumeModal');
    const content = $('#resumeModalContent');
    if (!openBtn || !modal || !content) return;
    const close = modal.querySelector('.modal-close');

    openBtn.addEventListener('click', async () => {
      if (content.dataset.loaded === 'true') { openModal(); return; }
      openBtn.disabled = true; openBtn.textContent = 'Loading…';
      try {
        const res = await fetch('resume.html', {cache:'no-store'});
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const main = doc.getElementById('resume-main') || doc.querySelector('main');
        content.innerHTML = main ? main.innerHTML : html;
        content.dataset.loaded = 'true';
      } catch {
        content.innerHTML = '<p class="muted">Unable to load resume.</p>';
      } finally {
        openBtn.disabled = false; openBtn.textContent = 'View Resume';
        openModal();
      }
    });

    function openModal() { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
    function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

    close?.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  }

  /* ── Init ── */
  function init() {
    initTheme();
    initMobileMenu();
    initTransitions();
    initNavActive();
    initReveal();
    initCounters();
    initSkillBars();
    initTilt();
    initParallax();
    initHeroCanvas();
    initGlobalParticles();
    initCursorTrail();
    initMockup();
    initTimelineToggles();
    initContact();
    initResumeModal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();