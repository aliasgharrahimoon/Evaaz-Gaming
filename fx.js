/* Loader. Hides after a fixed delay so it can never get stuck (e.g. if fonts fail to load). */
setTimeout(() => document.getElementById('loader')?.classList.add('done'), 1300);
