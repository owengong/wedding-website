(() => {
  const rows = document.getElementById('guestRows');
  const tpl = document.getElementById('guestRowTpl');
  const add = document.getElementById('addGuestRow');
  if (rows && tpl && add) {
    add.addEventListener('click', () => {
      rows.appendChild(tpl.content.cloneNode(true));
      rows.lastElementChild.querySelector('input[name="guest_first"]').focus();
    });
    rows.addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove-row]');
      if (b === null) return;
      const row = b.closest('.guest-row');
      if (rows.children.length > 1) row.remove();
      else row.querySelectorAll('input.input').forEach((i) => { i.value = ''; });
    });
  }

  const file = document.getElementById('csvFile');
  const text = document.getElementById('csvText');
  if (file && text) {
    file.addEventListener('change', () => {
      const f = file.files && file.files[0];
      if (f) f.text().then((t) => { text.value = t; });
    });
  }
})();
