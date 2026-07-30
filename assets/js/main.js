/* OBSIDIAN Auto Atelier — interactions */
(function(){
  "use strict";

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth <= 860;

  if (!window.gsap || !window.ScrollTrigger){
    document.documentElement.classList.add('no-motion');
  }

  /* ---------------- Preloader ---------------- */
  const preloader = document.getElementById('preloader');
  const preFill = document.getElementById('preloaderFill');
  const prePct = document.getElementById('preloaderPct');

  function finishPreload(){
    document.body.classList.remove('no-scroll');
    if (window.gsap){
      gsap.to(preloader, {
        opacity: 0, duration: 0.7, ease: 'power2.inOut',
        onComplete: () => { preloader.style.display = 'none'; playHeroIntro(); }
      });
    } else {
      preloader.style.display = 'none';
      playHeroIntro();
    }
  }

  (function preloadSequence(){
    document.body.classList.add('no-scroll');
    let progress = 0;
    const start = Date.now();
    const duration = 1100;
    function tick(){
      const t = Math.min(1, (Date.now() - start) / duration);
      progress = Math.round(t * 100);
      if (preFill) preFill.style.width = progress + '%';
      if (prePct) prePct.textContent = progress;
      if (t < 1){ requestAnimationFrame(tick); } else { setTimeout(finishPreload, 180); }
    }
    requestAnimationFrame(tick);
  })();

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis){
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.1,
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger){
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  if (window.gsap && window.ScrollTrigger){ gsap.registerPlugin(ScrollTrigger); }

  /* ---------------- Custom cursor ---------------- */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  if (!isTouch && cursorDot && cursorRing){
    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      const spot = document.getElementById('heroSpotlight');
      if (spot){
        spot.style.setProperty('--mx', mx + 'px');
        spot.style.setProperty('--my', my + 'px');
      }
    });
    function ringLoop(){
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();
    document.querySelectorAll('[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (!isTouch){
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width/2;
        const relY = e.clientY - r.top - r.height/2;
        btn.style.transform = `translate(${relX*0.28}px, ${relY*0.45}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------------- Nav scroll state ---------------- */
  const siteNav = document.getElementById('siteNav');
  let lastY = window.scrollY;
  function onScrollNav(){
    const y = window.scrollY;
    siteNav.classList.toggle('scrolled', y > 40);
    if (y > lastY && y > 140){ siteNav.classList.add('nav-hidden'); }
    else { siteNav.classList.remove('nav-hidden'); }
    lastY = y;

    const rail = document.getElementById('scrollFill');
    if (rail){
      const h = document.documentElement.scrollHeight - window.innerHeight;
      rail.style.width = (h > 0 ? (y/h*100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScrollNav, { passive:true });
  onScrollNav();

  /* ---------------- Mobile menu ---------------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger){
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }));
  }

  /* ---------------- Hero intro timeline ---------------- */
  function playHeroIntro(){
    if (!window.gsap){ animateCounters(); return; }

    gsap.set('.hero-eyebrow span, .hero-sub span', { yPercent: 100 });
    gsap.set('.hero-title .line', { yPercent: 100 });
    gsap.set('.hero-actions', { opacity: 0, y: 20 });
    gsap.set('.hero-stats', { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-eyebrow span', { yPercent: 0, duration: 0.9 }, 0.05)
      .to('.hero-title .line', { yPercent: 0, duration: 1.1, ease: 'power4.out' }, 0.15)
      .to('.hero-sub span', { yPercent: 0, duration: 0.9 }, 0.45)
      .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, 0.6)
      .to('.hero-scroll', { opacity: 1, duration: 0.8 }, 0.9)
      .to('.hero-stats', { opacity: 1, duration: 0.8 }, 0.9, '<');

    animateCounters();
  }

  /* ---------------- Stat counters ---------------- */
  function animateCounters(){
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      if (window.gsap){
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.6, delay: 0.4, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val); }
        });
      } else {
        el.textContent = target;
      }
    });
  }

  /* ---------------- Generic reveal-on-scroll ---------------- */
  function initReveals(){
    // hero text is handled separately by playHeroIntro()
    const items = document.querySelectorAll('.reveal-up');
    if (!items.length || !window.gsap || !window.ScrollTrigger) return;

    items.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 36 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ---------------- Service row stagger ---------------- */
  function initServiceReveals(){
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.utils.toArray('.service-row').forEach((row, i) => {
      gsap.from(row, {
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 92%' }
      });
    });
  }

  /* ---------------- Process pinned steps ---------------- */
  function initProcess(){
    const pin = document.querySelector('.process-pin');
    const steps = document.querySelectorAll('.process-step');
    const dots = document.querySelectorAll('.pp-dot');
    if (!pin || !steps.length) return;

    if (isTouch || !window.gsap || !window.ScrollTrigger){
      steps.forEach(s => s.classList.add('is-active'));
      return;
    }

    steps[0].classList.add('is-active');
    dots[0] && dots[0].classList.add('is-active');

    ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => '+=' + (steps.length * 700),
      pin: true,
      scrub: false,
      onUpdate: (self) => {
        const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
      }
    });
  }

  /* ---------------- Testimonial carousel ---------------- */
  function initTestimonials(){
    const quotes = document.querySelectorAll('.quote');
    const dots = document.querySelectorAll('.quote-dots button');
    if (!quotes.length) return;
    let idx = 0, timer = null;

    function show(i){
      quotes.forEach(q => q.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      quotes[i].classList.add('active');
      dots[i] && dots[i].classList.add('active');
      idx = i;
    }
    function next(){ show((idx + 1) % quotes.length); }
    function restart(){ clearInterval(timer); timer = setInterval(next, 5200); }

    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); restart(); }));
    restart();
  }

  /* ---------------- Hero parallax on scroll ---------------- */
  function initHeroParallax(){
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.to('.hero-video', {
      yPercent: 14, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-content', {
      yPercent: 30, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------------- Testimonials / CTA bg parallax ---------------- */
  function initBgParallax(){
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    ['.testimonials-bg', '.cta-bg'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      gsap.fromTo(el, { scale: 1.12, yPercent: -6 }, {
        scale: 1.0, yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- init ---------------- */
  window.addEventListener('load', () => {
    initReveals();
    initServiceReveals();
    initProcess();
    initTestimonials();
    initHeroParallax();
    initBgParallax();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

})();
