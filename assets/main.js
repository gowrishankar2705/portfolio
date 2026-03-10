/* Main interactions: particles, tilt, projects injection, modals, theme, menu */
(() => {
  // Utilities
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme toggle */
  function initTheme() {
    const btns = $$('.icon-btn');
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    if (stored) document.body.className = stored;
    btns.forEach(b => b.addEventListener('click', () => {
      const next = document.body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
      document.body.className = next;
      localStorage.setItem('theme', next);
    }));
  }

  /* Mobile menu */
  function initMobileMenu() {
    const menuBtn = $('#menuBtn');
    const mobileMenu = $('#mobileMenu');
    if (!menuBtn) return;
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.hasAttribute('hidden');
      if (open) {
        mobileMenu.hidden = false;
        menuBtn.setAttribute('aria-expanded', 'true');
      } else {
        mobileMenu.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Page transition for internal links */
  function initTransitions() {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('#')) return;
      a.addEventListener('click', e => {
        if (a.target === '_blank') return;
        e.preventDefault();
        document.body.style.transition = 'opacity .28s ease';
        document.body.style.opacity = 0;
        setTimeout(() => location.href = href, 260);
      });
    });
    window.addEventListener('pageshow', () => { document.body.style.opacity = 1; });
  }

  /* Hero particles canvas */
  function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || isReduced) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.clientWidth;
    let h = canvas.height = canvas.clientHeight;
    const particles = [];
    const count = Math.max(18, Math.floor(w / 60));
    for (let i=0;i<count;i++){
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: 1 + Math.random()*3,
        vx: (Math.random()-0.5)*0.6,
        vy: (Math.random()-0.5)*0.6,
        hue: 40 + Math.random()*30
      });
    }
    function resize(){ w = canvas.width = canvas.clientWidth; h = canvas.height = canvas.clientHeight; }
    window.addEventListener('resize', resize);
    function draw(){
      ctx.clearRect(0,0,w,h);
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w+10;
        if (p.x > w+10) p.x = -10;
        if (p.y < -10) p.y = h+10;
        if (p.y > h+10) p.y = -10;
        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*8);
        g.addColorStop(0, `hsla(${p.hue},80%,60%,0.95)`);
        g.addColorStop(0.4, `hsla(${p.hue},70%,50%,0.25)`);
        g.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = g;
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* 3D tilt for project cards */
  function initTilt() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length || isReduced) return;
    cards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (py - 0.5) * 10;
        const ry = (px - 0.5) * -10;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* Projects injection and modal */
  function initProjects() {
    const grid = document.getElementById('projectsGrid');
    const data = window.__PROJECTS_DATA__ || [];
    if (!grid) return;
    grid.innerHTML = '';
    data.forEach(p => {
      const el = document.createElement('article');
      el.className = 'project-card';
      el.tabIndex = 0;
      el.innerHTML = `
        <div class="project-media">${p.title}</div>
        <div class="project-body">
          <h4>${p.title}</h4>
          <p class="muted">${p.desc}</p>
        </div>
      `;
      el.addEventListener('click', () => openModal(p));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal(p); });
      grid.appendChild(el);
    });

    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalCode = document.getElementById('modalCode');
    const modalDemo = document.getElementById('modalDemo');
    const modalRepo = document.getElementById('modalRepo');
    const closeBtn = modal?.querySelector('.modal-close');

    function openModal(p) {
      modalTitle.textContent = p.title;
      modalDesc.textContent = p.desc;
      modalCode.textContent = p.code || '';
      modalDemo.href = p.demo || '#';
      modalRepo.href = p.repo || '#';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    }
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  }

  /* Contact form demo */
  function initContact() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Send message';
        alert('Message simulated. Hook the form to your backend to receive messages.');
        form.reset();
      }, 900);
    });

    const copyBtn = document.getElementById('copyContact');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText('gowrishankars27@outlook.com');
          copyBtn.textContent = 'Copied';
          setTimeout(()=> copyBtn.textContent = 'Copy contact', 1500);
        } catch {
          copyBtn.textContent = 'Copy failed';
        }
      });
    }
  }

  /* Init sequence */
  function init() {
    initTheme();
    initMobileMenu();
    initTransitions();
    initParticles();
    initProjects();
    initTilt();
    initContact();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
// Resume modal loader (add to assets/main.js or inline in index.html)
(function(){
  const openBtn = document.getElementById('openResumeBtn');
  const modal = document.getElementById('resumeModal');
  const modalContent = document.getElementById('resumeModalContent');
  const closeBtn = modal?.querySelector('.modal-close');

  if (!openBtn || !modal || !modalContent) return;

  async function loadResume() {
    // If already loaded, just open
    if (modalContent.dataset.loaded === 'true') {
      openModal();
      return;
    }
    try {
      openBtn.disabled = true;
      openBtn.textContent = 'Loading…';
      const res = await fetch('resume.html', {cache: 'no-store'});
      if (!res.ok) throw new Error('Failed to fetch resume');
      const html = await res.text();
      // Extract the main resume content from resume.html to avoid duplicating header/footer
      // We look for the element with id="resume-main" and inject its innerHTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const resumeMain = doc.getElementById('resume-main') || doc.querySelector('main');
      if (resumeMain) {
        modalContent.innerHTML = resumeMain.innerHTML;
        modalContent.dataset.loaded = 'true';
      } else {
        modalContent.innerHTML = html;
      }
      openModal();
    } catch (err) {
      modalContent.innerHTML = '<p class="muted">Unable to load resume. You can open the full resume page instead.</p>';
      openModal();
    } finally {
      openBtn.disabled = false;
      openBtn.textContent = 'View Full Resume';
    }
  }

  function openModal(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', loadResume);
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=> { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e)=> { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
})();
/* Interactive behaviors: counters, reveal on scroll, parallax mockup, nav active sync */
(function(){
  // COUNTERS: animate numbers when visible
  function animateCounters() {
    const nums = document.querySelectorAll('.stats .num');
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.target || parseInt(el.textContent.replace(/\D/g,'')) || 0;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 60));
        const id = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target + (target >= 10 ? '+' : '');
            clearInterval(id);
          } else {
            el.textContent = current;
          }
        }, 14);
        obs.unobserve(el);
      });
    }, {threshold:0.3});
    nums.forEach(n => io.observe(n));
  }

  // REVEAL ON SCROLL
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, {threshold:0.18});
    items.forEach(i => io.observe(i));
  }

  // PARALLAX MOCKUP: subtle movement based on mouse
  function initParallax() {
    const par = document.querySelector('[data-parallax]');
    if (!par) return;
    document.addEventListener('mousemove', (e) => {
      const rect = par.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      par.style.transform = `translate3d(${dx * 8}px, ${dy * 6}px, 0) rotateX(${dy * 2}deg) rotateY(${dx * 2}deg)`;
    });
    document.addEventListener('mouseleave', ()=> par.style.transform = '');
  }

  // HERO PARTICLES (lightweight)
  function initHeroParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.clientWidth;
    let h = canvas.height = canvas.clientHeight;
    const particles = [];
    const count = Math.max(12, Math.floor(w / 80));
    for (let i=0;i<count;i++){
      particles.push({x:Math.random()*w, y:Math.random()*h, r:1+Math.random()*3, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4, hue:40+Math.random()*30});
    }
    function resize(){ w = canvas.width = canvas.clientWidth; h = canvas.height = canvas.clientHeight; }
    window.addEventListener('resize', resize);
    function draw(){
      ctx.clearRect(0,0,w,h);
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w+10;
        if (p.x > w+10) p.x = -10;
        if (p.y < -10) p.y = h+10;
        if (p.y > h+10) p.y = -10;
        const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*8);
        g.addColorStop(0, `hsla(${p.hue},80%,60%,0.95)`);
        g.addColorStop(0.4, `hsla(${p.hue},70%,50%,0.18)`);
        g.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // NAV: set active class and underline on load
  function initNavActive() {
    const links = document.querySelectorAll('.nav-link');
    const path = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href === path || (path === '' && href === 'index.html'))) {
        a.classList.add('active');
      } else a.classList.remove('active');
    });
    // call underline updater from index inline script if present
    if (typeof updateNavUnderline === 'function') updateNavUnderline();
  }

  // MOBILE MENU keyboard accessible
  function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!menuBtn) return;
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.hasAttribute('hidden');
      if (open) {
        mobileMenu.hidden = false;
        menuBtn.setAttribute('aria-expanded','true');
        mobileMenu.querySelector('a')?.focus();
      } else {
        mobileMenu.hidden = true;
        menuBtn.setAttribute('aria-expanded','false');
        menuBtn.focus();
      }
    });
    // close on escape
    window.addEventListener('keydown', (e)=> { if (e.key === 'Escape') { mobileMenu.hidden = true; menuBtn.setAttribute('aria-expanded','false'); }});
  }

  // INIT
  function initHomeInteractions() {
    animateCounters();
    initReveal();
    initParallax();
    initHeroParticles();
    initNavActive();
    initMobileMenu();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHomeInteractions);
  else initHomeInteractions();
})();
/* Global particles overlay (append to assets/main.js) */
(function(){
  const canvas = document.getElementById('globalParticles');
  if (!canvas) return;

  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let w = canvas.width = canvas.clientWidth;
  let h = canvas.height = canvas.clientHeight;
  let rafId = null;
  let lastTime = 0;
  let particles = [];
  let paused = false;

  // Particle settings (tweak for density/size)
  function particleCountForSize() {
    const area = w * h;
    // ~1 particle per 35k px, clamp between 12 and 120
    return Math.max(12, Math.min(120, Math.floor(area / 35000)));
  }

  function createParticles() {
    particles = [];
    const count = particleCountForSize();
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 3.2,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        hue: 38 + Math.random() * 30,
        life: 40 + Math.random() * 120
      });
    }
  }

  function resize() {
    w = canvas.width = canvas.clientWidth;
    h = canvas.height = canvas.clientHeight;
    createParticles();
  }
  window.addEventListener('resize', debounce(resize, 220));

  // Simple debounce
  function debounce(fn, t){ let id; return ()=>{ clearTimeout(id); id = setTimeout(fn, t); }; }

  // Draw loop with frame rate throttle (60 -> ~45fps on heavy devices)
  function draw(now) {
    if (paused) return;
    const dt = Math.min(40, now - lastTime);
    lastTime = now;

    ctx.clearRect(0,0,w,h);

    // subtle background vignette (optional)
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, 'rgba(0,0,0,0.02)');
    g.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    for (let p of particles) {
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.life -= dt / 16;

      // wrap
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      // draw radial glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      grad.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${0.95 * Math.max(0.2, p.life/120)})`);
      grad.addColorStop(0.4, `hsla(${p.hue}, 70%, 50%, ${0.22 * Math.max(0.2, p.life/120)})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // optional: connect nearby particles with faint lines for a network effect
    const maxLinkDist = Math.min(140, Math.max(80, Math.sqrt(w*h)/12));
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < maxLinkDist * maxLinkDist) {
          const alpha = 0.12 * (1 - d2 / (maxLinkDist * maxLinkDist));
          ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // throttle frame rate adaptively for mobile
    rafId = window.requestAnimationFrame(draw);
  }

  // Pause/resume when page hidden to save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      paused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      paused = false;
      lastTime = performance.now();
      rafId = requestAnimationFrame(draw);
    }
  });

  // Start
  resize();
  lastTime = performance.now();
  rafId = requestAnimationFrame(draw);

  // Expose control hooks (optional)
  window.__globalParticles = {
    pause: () => { paused = true; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } },
    resume: () => { if (!paused) return; paused = false; lastTime = performance.now(); rafId = requestAnimationFrame(draw); },
    regenerate: () => createParticles()
  };
})();
/* Gold dust cursor trail */
(function(){
  const canvas = document.getElementById('cursorTrail');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const particles = [];

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        life: 60,
        r: 2 + Math.random() * 3,
        hue: 45 + Math.random() * 20 // gold hues
      });
    }
  });

  function draw(){
    ctx.clearRect(0,0,w,h);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.life <= 0) {
        particles.splice(i,1);
        continue;
      }

      const alpha = p.life / 60;
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      g.addColorStop(0, `hsla(${p.hue}, 90%, 55%, ${alpha})`);
      g.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();