(() => {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    });
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const cd = document.getElementById('countdown');
  if (cd) {
    const target = new Date(cd.dataset.date).getTime();
    const el = (u) => cd.querySelector(`[data-unit="${u}"]`);
    const tick = () => {
      const diff = target - Date.now();
      if (Number.isNaN(diff) || diff <= 0) { cd.hidden = true; return; }
      el('days').textContent = Math.floor(diff / 864e5);
      el('hours').textContent = Math.floor((diff % 864e5) / 36e5);
      el('minutes').textContent = Math.floor((diff % 36e5) / 6e4);
      cd.hidden = false;
    };
    tick();
    setInterval(tick, 30000);
  }

  document.querySelectorAll('.hero .reveal').forEach((el, i) => { el.style.transitionDelay = `${i * 90}ms`; });
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }
})();
