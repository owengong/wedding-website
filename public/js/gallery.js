(() => {
  const gallery = document.getElementById('gallery');
  const lb = document.getElementById('lightbox');
  if (gallery === null || lb === null) return;
  const imgEl = lb.querySelector('img');
  const cap = lb.querySelector('figcaption');
  let idx = 0;

  const items = () => [...gallery.querySelectorAll('.gallery__item')].map((b) => {
    const img = b.querySelector('img');
    return img ? { src: img.getAttribute('src'), alt: img.alt } : null;
  });

  const show = (i, dir = 1) => {
    const list = items();
    if (list.some(Boolean) === false) return false;
    let n = ((i % list.length) + list.length) % list.length;
    for (let tries = 0; tries < list.length && list[n] === null; tries++) n = (n + dir + list.length) % list.length;
    if (list[n] === null) return false;
    idx = n;
    imgEl.src = list[n].src;
    imgEl.alt = list[n].alt;
    cap.textContent = list[n].alt;
    return true;
  };
  const open = (i) => {
    if (show(i) === false) return;
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    lb.querySelector('.lightbox__close').focus();
  };
  const close = () => { lb.hidden = true; document.body.classList.remove('no-scroll'); };

  gallery.addEventListener('click', (e) => {
    const b = e.target.closest('.gallery__item');
    if (b) open(Number(b.dataset.index));
  });
  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.querySelector('.lightbox__prev').addEventListener('click', () => show(idx - 1, -1));
  lb.querySelector('.lightbox__next').addEventListener('click', () => show(idx + 1, 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(idx + 1, 1);
    if (e.key === 'ArrowLeft') show(idx - 1, -1);
  });
})();
