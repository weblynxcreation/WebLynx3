import { translations } from './translations.js';

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'fr';
  const langButtons = document.querySelectorAll('.lang-btn, .lang-btn-mobile');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('progress');

  // ----- Lenis smooth scroll -----
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 0.95,
      gestureOrientation: 'vertical',
    });
    document.documentElement.classList.add('lenis','lenis-smooth');
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    // GSAP + Lenis sync
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      // Lenis drives RAF via requestAnimationFrame; no gsap.ticker needed
    }
    // intercept anchor clicks
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -86, duration: 1.05 });
            history.pushState(null, '', id);
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu();
          }
        }
      });
    });
  } else {
    // fallback smooth anchors
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 86;
            window.scrollTo({ top, behavior: 'smooth' });
            history.pushState(null, '', id);
          }
        }
      });
    });
  }

  function getNestedTranslation(obj, path) {
    return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
  }
  function updateLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = getNestedTranslation(translations[lang], key);
      if (t == null) return;
      const isHtml = el.hasAttribute('data-i18n-html') || t.includes('<');
      if (isHtml) el.innerHTML = t;
      else el.textContent = t;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const t = getNestedTranslation(translations[lang], key);
      if (t != null) el.placeholder = t;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const t = getNestedTranslation(translations[lang], key);
      if (t != null) el.setAttribute('aria-label', t);
    });
    langButtons.forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('text-bone', active);
      btn.classList.toggle('underline', active);
      btn.classList.toggle('decoration-bone', active);
      btn.classList.toggle('underline-offset-4', active);
      btn.classList.toggle('text-white/40', !active);
      btn.setAttribute('aria-pressed', String(active));
    });
    document.documentElement.lang = lang;
    const titles = { fr: 'WebLynx Création — Agence Web Québec | 514 266 2005', en: 'WebLynx Creation — Web Agency Quebec | 514 266 2005' };
    if (titles[lang]) document.title = titles[lang];
    if (window.lucide) try { lucide.createIcons(); } catch {}
    // refresh ScrollTrigger after lang switch (heights may change)
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.dataset.lang;
      updateLanguage(lang);
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu();
    });
  });
  updateLanguage('fr');

  function toggleMobileMenu() {
    if (!mobileMenu) return;
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden', !isHidden);
    mobileMenu.classList.toggle('flex', isHidden);
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', String(isHidden));
    document.body.style.overflow = isHidden ? 'hidden' : '';
    if (lenis) {
      if (isHidden) lenis.stop(); else lenis.start();
    }
  }
  mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (!mobileMenu.classList.contains('hidden')) toggleMobileMenu();
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu();
  });

  // progress + nav scrolled — driven by Lenis or scroll
  const onScrollFrame = () => {
    const y = lenis ? lenis.scroll : window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 8);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (y / h) * 100 : 0;
      progress.style.width = p + '%';
    }
  };
  if (lenis) lenis.on('scroll', onScrollFrame);
  else window.addEventListener('scroll', onScrollFrame, { passive: true });
  onScrollFrame();

  // contact form -> toast + tel:
  document.getElementById('contact-form')?.addEventListener('submit', function(e){
    e.preventDefault();
    if (!this.checkValidity()) { this.reportValidity(); return; }
    const toast = this.querySelector('[data-toast]');
    toast?.classList.remove('hidden');
    const btn = this.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
    setTimeout(()=>{ window.location.href='tel:+15142662005'; }, 700);
    setTimeout(()=> { toast?.classList.add('hidden'); if(btn){btn.disabled=false; btn.style.opacity='';} }, 3500);
  });


  // ----- Premium animated background -----
  (function initPremiumBackground(){
    const canvas = document.getElementById('bg-canvas');
    const spotlight = document.querySelector('.bg-spotlight');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Spotlight follow
    if (spotlight) {
      let rafSpot = 0, mx = 50, my = 50;
      window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth) * 100;
        my = (e.clientY / window.innerHeight) * 100;
        if (!rafSpot) rafSpot = requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--mx', mx + '%');
          document.documentElement.style.setProperty('--my', my + '%');
          document.body.classList.add('has-spotlight');
          rafSpot = 0;
        });
      }, { passive: true });
      window.addEventListener('mouseleave', () => document.body.classList.remove('has-spotlight'));
    }

    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w, h, dpr, raf = 0, t = 0, running = true;
    const stars = [];
    const N = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 22000));

    function resize(){
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars.length = 0;
      for (let i = 0; i < N; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (Math.random() * 1.1 + 0.3),
          a: Math.random() * 0.55 + 0.12,
          tw: Math.random() * 3 + 1.2,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          px: Math.random() * Math.PI * 2,
        });
      }
    }

    function frame(now){
      if (!running) return;
      t = now * 0.00035;
      ctx.clearRect(0, 0, w, h);

      // hairline grid — drifting
      const off = (now * 0.015) % 32;
      ctx.save();
      ctx.globalAlpha = 0.022;
      ctx.strokeStyle = 'rgba(242,240,235,1)';
      ctx.lineWidth = 0.5;
      for (let x = off; x < w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = off; y < h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();

      // stars + connections + pixel sparkles
      const scrollY = lenis ? lenis.scroll : window.scrollY;
      const parallax = scrollY * 0.04;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const tw = 0.68 + 0.32 * Math.sin(now * 0.001 * s.tw + s.px);
        // gentle drift
        s.x += s.vx; s.y += s.vy;
        if (s.x < -10) s.x = w + 10; if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10; if (s.y > h + 10) s.y = -10;
        const py = s.y - (parallax * (0.2 + s.r * 0.3)) % h;
        // star
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = 'rgba(242,240,235,1)';
        // occasional pixel square instead of dot
        if (i % 11 === 0) {
          const sz = s.r * 1.8;
          ctx.fillRect(s.x - sz/2, py - sz/2, Math.round(sz), Math.round(sz));
        } else {
          ctx.beginPath(); ctx.arc(s.x, py, s.r, 0, Math.PI * 2); ctx.fill();
        }
        // faint cross glint for brighter stars
        if (s.r > 0.95 && tw > 0.9) {
          ctx.globalAlpha = s.a * 0.12;
          ctx.fillRect(s.x - 3, py - 0.5, 6, 1);
          ctx.fillRect(s.x - 0.5, py - 3, 1, 6);
        }
      }
      // connections — very subtle
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = 'rgba(242,240,235,1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i], b = stars[j];
        const dx = a.x - b.x, dy = (a.y - b.y);
        const d2 = dx*dx + dy*dy;
        if (d2 < 110*110 && Math.random() < 0.12) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y - parallax*0.2); ctx.lineTo(b.x, b.y - parallax*0.2); ctx.stroke();
        }
      }
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver((entries)=>{
      const vis = entries[0]?.isIntersecting ?? true;
      if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
      if (!vis) { running = false; if (raf) cancelAnimationFrame(raf); }
    });
    io.observe(document.documentElement);

    let rto; window.addEventListener('resize', ()=>{ clearTimeout(rto); rto=setTimeout(resize, 120); }, { passive:true });
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden) { running=false; if(raf) cancelAnimationFrame(raf); }
      else if (!running) { running=true; raf=requestAnimationFrame(frame); }
    });

    resize();
    raf = requestAnimationFrame(frame);
  })();


    // GSAP reveals
  if (window.gsap && window.ScrollTrigger) {
    gsap.utils.toArray('.service-card').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: (i%3)*0.07, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%' } }
      );
    });
    gsap.utils.toArray('.demo-card').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 28, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, delay: i*0.08, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' } }
      );
    });
    // gentle parallax on hero preview
    const heroParallax = document.querySelector('[data-parallax]');
    if (heroParallax) {
      gsap.to(heroParallax, {
        y: -14, ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.7 }
      });
    }
    // section headers
    gsap.utils.toArray('#services > div > div:first-child, #portfolio > div > div:first-child, #about > div > div:first-child h2, #contact > div > div:first-child').forEach(el=>{
      gsap.fromTo(el, { y: 16, opacity: 0 }, { y:0, opacity:1, duration:.65, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 90%'}});
    });
  }

  document.querySelectorAll('.marquee-track').forEach(t => {
    t.addEventListener('mouseenter', () => t.style.animationPlayState = 'paused');
    t.addEventListener('mouseleave', () => t.style.animationPlayState = 'running');
  });
});
