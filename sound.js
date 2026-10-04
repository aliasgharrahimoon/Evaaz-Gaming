/* Synthesized UI sound (no audio files). OFF by default; the nav button toggles it and starts a quiet ambient pad. */
(() => {
  let ctx, on = false, pad; const btn = document.getElementById('snd');
  const tone = (f, d = .07, type = 'triangle', v = .05) => {
    if (!on) return; const o = ctx.createOscillator(), g = ctx.createGain(), n = ctx.currentTime;
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(.0001, n + d);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(n + d);
  };
  function ambience(run) {
    if (run && !pad) {
      const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; g.gain.value = 0;
      [55, 82.4, 110.3].forEach((f, i) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = i * 6; o.connect(lp); o.start(); });
      lp.connect(g).connect(ctx.destination); pad = g;
    }
    if (pad) pad.gain.linearRampToValueAtTime(run ? .035 : 0, ctx.currentTime + 1.2);
  }
  btn.onclick = () => {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)(); ctx.resume();
    on = !on; btn.textContent = on ? 'Sound: On' : 'Sound: Off'; ambience(on); tone(440, .12);
  };
  let lastEl; const sel = 'a,.btn,.card';
  document.addEventListener('mouseover', e => { const el = e.target.closest(sel); if (el && el !== lastEl) tone(620, .05, 'sine', .035); lastEl = el; });
  document.addEventListener('click', e => { if (e.target.closest(sel)) { tone(180, .14, 'square', .03); setTimeout(() => tone(260, .1, 'square', .025), 60); } });
})();
