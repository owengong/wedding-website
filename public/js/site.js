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

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const below = [...document.querySelectorAll('.reveal')].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  if (reduceMotion === false && 'IntersectionObserver' in window && below.length) {
    below.forEach((el) => el.classList.add('reveal--pending'));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.remove('reveal--pending'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px 20% 0px', threshold: 0.01 });
    below.forEach((el) => io.observe(el));
  }
})();
