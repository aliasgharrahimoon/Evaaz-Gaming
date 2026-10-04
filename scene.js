/* 3D scene: low-poly hero character that walks, turns and travels as you scroll.
   Built only from primitives (flat-shaded), so no model files needed. Requires three.js (loaded from CDN in index.html). */
(() => {
  if (!window.THREE) return;                       // offline / CDN blocked: site still works without 3D
  const T = THREE, cv = document.getElementById('stage');
  const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  R.setPixelRatio(Math.min(devicePixelRatio, 2));
  const S = new T.Scene(); S.fog = new T.Fog(0x14151a, 9, 24);
  const cam = new T.PerspectiveCamera(38, 1, .1,60); cam.position.set(0, 1.8, 9);
  S.add(new T.HemisphereLight(0xe4e8ee, 0x2b241a, .85));
  const sun = new T.DirectionalLight(0xffc790, 1.7); sun.position.set(4, 7, 5); S.add(sun);
  const rim = new T.DirectionalLight(0x6c9ca8, .9); rim.position.set(-6, 3, -4); S.add(rim);

  const mat = (c, m = .2) => new T.MeshStandardMaterial({ color: c, flatShading: true, roughness: .7, metalness: m });
  const C = { armor: mat(0x56616d, .55), trim: mat(0xcf8b3e, .6), dark: mat(0x23262d, .3), skin: mat(0xd9cfc1, 0), rock: mat(0x3a3d46, .1), glow: new T.MeshStandardMaterial({ color: 0xe8b46a, emissive: 0xb86f1e, emissiveIntensity: .8, flatShading: true }) };
  const M = (g, m, x = 0, y = 0, z = 0) => { const o = new T.Mesh(g, m); o.position.set(x, y, z); return o; };

  // ---- Character ----
  const hero = new T.Group(), body = new T.Group(); hero.add(body);
  body.add(M(new T.BoxGeometry(1, 1.15, .62), C.armor, 0, 1.75, 0));        // torso
  body.add(M(new T.BoxGeometry(1.08, .22, .68), C.trim, 0, 1.2, 0));         // belt
  body.add(M(new T.OctahedronGeometry(.2), C.glow, 0, 1.8, .34));            // chest core
  const head = new T.Group(); head.position.y = 2.8; body.add(head);
  head.add(M(new T.IcosahedronGeometry(.43, 0), C.armor));
  head.add(M(new T.BoxGeometry(.6, .14, .2), C.glow, 0, .04, .36));          // visor
  head.add(M(new T.ConeGeometry(.12, .5, 4), C.trim, 0, .5, -.05));          // crest
  const limb = (x, y, len, w, m, tip) => {                                   // pivoting limb
    const g = new T.Group(); g.position.set(x, y, 0);
    g.add(M(new T.CylinderGeometry(w, w * .8, len, 5), m, 0, -len / 2, 0));
    if (tip) g.add(M(new T.IcosahedronGeometry(w * 1.5, 0), tip)); return g;
  };
  const armL = limb(-.75, 2.2, .95, .16, C.armor, C.trim), armR = limb(.75, 2.2, .95, .16, C.armor, C.trim);
  const legL = limb(-.27, 1.1, 1.1, .2, C.dark), legR = limb(.27, 1.1, 1.1, .2, C.dark);
  [armL, armR, legL, legR].forEach(l => body.add(l));
  legL.add(M(new T.BoxGeometry(.38, .2, .6), C.armor, 0, -1.1, .1)); legR.add(M(new T.BoxGeometry(.38, .2, .6), C.armor, 0, -1.1, .1));
  armR.add(M(new T.BoxGeometry(.1, 1.5, .24), C.glow, 0, -1.2, .1));         // energy blade
  S.add(hero);

  // ---- World: faceted ground + floating shards ----
  const gg = new T.PlaneGeometry(60, 60, 16, 16); gg.rotateX(-Math.PI / 2);
  for (let i = 0; i < gg.attributes.position.count; i++) gg.attributes.position.setY(i, (Math.random() - .5) * 1.1);
  const ground = M(gg, mat(0x2a2d35, 0), 0, -.3, 0); S.add(ground);
  const shards = []; for (let i = 0; i < 16; i++) {
    const s = M(new T.IcosahedronGeometry(.25 + Math.random() * .6, 0), i % 4 ? C.rock : C.trim, (Math.random() - .5) * 22, 1 + Math.random() * 6, -4 - Math.random() * 10);
    s.userData = { sp: .2 + Math.random() * .5, ph: Math.random() * 6 }; shards.push(s); S.add(s);
  }

  // ---- Scroll choreography: [x, y, scale, baseRotationY] per page section ----
  const stops = [[2.4, 0, 1, -.5], [-4.6, -.2, .8, .7], [4.6, -.1, .9, -.8], [0, 0, 1.05, 0]];
  const cur = { x: 2.4, y: 0, s: 1, r: 0 }; let P = 0, last = 0, walk = 0, mx = 0, my = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  function resize() { R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
  resize(); addEventListener('resize', resize);
  const ease = f => f * f * (3 - 2 * f), lerp = (a, b, f) => a + (b - a) * f;

  R.setAnimationLoop(t => {
    t /= 1000;
    const max = document.documentElement.scrollHeight - innerHeight; P = max > 0 ? scrollY / max : 0;
    const k = P * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(k)), f = ease(k - i), a = stops[i], b = stops[i + 1];
    const narrow = innerWidth < 800 ? .3 : 1;
    const tx = lerp(a[0], b[0], f) * narrow, ty = lerp(a[1], b[1], f), ts = lerp(a[2], b[2], f), tr = lerp(a[3], b[3], f) + P * Math.PI * 2;
    cur.x += (tx - cur.x) * .08; cur.y += (ty - cur.y) * .08; cur.s += (ts - cur.s) * .08; cur.r += (tr - cur.r) * .08;
    hero.position.set(cur.x, cur.y + Math.sin(t * 1.6) * .05, 0); hero.scale.setScalar(cur.s); hero.rotation.y = cur.r;
    // walking intensity follows scroll speed
    const v = Math.abs(P - last) * 90; last = P; walk += (Math.min(1, v) - walk) * .12;
    const sw = Math.sin(t * 9) * walk * .9, idle = Math.sin(t * 1.6) * (1 - walk);
    legL.rotation.x = sw; legR.rotation.x = -sw; armL.rotation.x = -sw * .8 + idle * .05; armR.rotation.x = sw * .8 - .25 + idle * .05;
    body.position.y = Math.abs(Math.sin(t * 9)) * walk * .12; head.rotation.y = mx * .6; head.rotation.x = my * .3;
    shards.forEach(s => { s.position.y += Math.sin(t * s.userData.sp + s.userData.ph) * .003; s.rotation.x += .002; s.rotation.y += .003; });
    cam.position.x += (mx * 1.2 - cam.position.x) * .04; cam.position.y += (1.8 - my * .8 - cam.position.y) * .04; cam.lookAt(0, 1.6, 0);
    R.render(S, cam);
  });
})();
