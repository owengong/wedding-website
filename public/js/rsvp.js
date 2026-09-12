(() => {
  const form = document.getElementById('rsvpForm');
  if (form === null) return;

  const syncMeal = (scope) => {
    const block = scope.querySelector('[data-meal-block]');
    if (block === null) return;
    const checked = [...scope.querySelectorAll('input[type="radio"][data-meal-event="1"]:checked')];
    const attending = checked.some((r) => r.value === 'yes');
    block.hidden = attending === false;
  };
  form.querySelectorAll('fieldset[data-guest], fieldset[data-plusone]').forEach((scope) => {
    syncMeal(scope);
    scope.addEventListener('change', () => syncMeal(scope));
  });

  form.querySelectorAll('fieldset[data-plusone]').forEach((fs) => {
    const name = fs.querySelector('[data-plusone-name]');
    const detail = fs.querySelector('[data-plusone-detail]');
    if (name === null || detail === null) return;
    const sync = () => { detail.hidden = name.value.trim() === ''; };
    sync();
    name.addEventListener('input', sync);
  });
})();
