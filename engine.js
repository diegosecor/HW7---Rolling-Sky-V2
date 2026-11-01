/* Pure gameplay rules, shared by the renderer and the tests. Coordinates are world pixels. */
(function (root) {
  'use strict';
  const TRACK = { left: 90, right: 510, laneWidth: 84, radius: 16 };
  const LEVELS = [
    { name: 'Azure ascent', length: 10500, speed: 315, acceleration: 140, spacing: 330, hue: 190 },
    { name: 'Violet velocity', length: 12500, speed: 380, acceleration: 155, spacing: 350, hue: 258 }
  ];
  const laneX = lane => TRACK.left + (lane + 0.5) * TRACK.laneWidth;
  // Zero slope at both ends prevents abrupt lighting or road movement.
  function envelope(progress, start, end) {
    if (progress <= start || progress >= end) return 0;
    return Math.sin(Math.PI * (progress - start) / (end - start)) ** 2;
  }
  function darkness(s) {
    const p = s.distance / LEVELS[s.index].length;
    const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
    // Fade in 25–30%, hold deep night to 45%, recover by 50%.
    return 0.97 * smooth((p - 0.25) / 0.05) * smooth((0.50 - p) / 0.05);
  }
  function roadOffset(s) {
    const p = s.distance / LEVELS[s.index].length;
    if (p <= 0.55 || p >= 0.65) return 0;
    return 68 * envelope(p, 0.55, 0.65) * Math.sin(2 * Math.PI * (p - 0.55) / 0.1);
  }
  function layout(index) {
    const level = LEVELS[index], objects = [];
    for (let row = 0, d = 900; d < level.length - 500; row++, d += level.spacing * (1 - 0.12 * d / level.length)) {
      const safe = (row * 3 + index) % 5;
      if (row % 6 === 3) {
        // A full-width gap is shorter than the minimum jump travel distance.
        objects.push({ type: 'gap', x: 300, d, w: 420, h: 65 });
        objects.push({ type: 'diamond', x: laneX(safe), d: d - 155, w: 20, h: 20 });
      } else {
        const lane = (safe + 2) % 5;
        objects.push({ type: row > 4 && row % 4 === 1 ? 'moving' : 'block', x: laneX(lane), d, w: 56, h: 62, skin: ['tree', 'rock', 'mountain'][row % 3], phase: row });
        if (row % 3 === 2) objects.push({ type: 'gap', x: laneX((safe + 1) % 5), d, w: 80, h: 100 });
        if (index && row % 2 === 0) objects.push({ type: 'block', x: laneX((safe + 4) % 5), d, w: 56, h: 62, skin: 'rock' });
        objects.push({ type: 'diamond', x: laneX(safe), d, w: 20, h: 20 });
      }
    }
    return objects;
  }
  function create(index = 0) { return { index, distance: 0, x: 300, vx: 0, time: 0, jump: 0, diamonds: 0, status: 'playing', reason: '', deathType: null, objects: layout(index) }; }
  function objectX(o, time) { return o.type === 'moving' ? 300 + Math.sin(time * 1.6 + o.phase) * 120 : o.x; }
  function jump(s) { if (s.status === 'playing' && s.jump === 0) s.jump = 0.82; }
  function height(s) { return s.jump > 0 ? Math.sin((1 - s.jump / 0.82) * Math.PI) * 65 : 0; }
  function score(s) { return Math.floor(s.distance / 10) + s.diamonds * 100; }
  function step(s, dt, direction, collect = () => {}) {
    if (s.status !== 'playing') return;
    const level = LEVELS[s.index];
    s.time += dt;
    // Exponential easing is frame-rate independent: quick acceleration, firmer release.
    const target = direction * 550;
    const response = direction === 0 ? 22 : 14;
    const decay = Math.exp(-response * dt);
    s.x += target * dt + (s.vx - target) * (1 - decay) / response;
    s.vx = target + (s.vx - target) * decay;
    if (Math.abs(s.vx) < 0.1) s.vx = 0;
    s.distance += (level.speed + level.acceleration * s.distance / level.length) * dt;
    const offset = roadOffset(s);
    // Losing ground support at either edge triggers the same fall as a gap.
    if (s.x < TRACK.left + offset || s.x > TRACK.right + offset) {
      s.status = 'lost'; s.deathType = 'fall'; s.reason = 'You rolled off the edge of the sky.';
      return;
    }
    s.jump = Math.max(0, s.jump - dt);
    for (const o of s.objects) {
      if (o.collected) continue;
      const dx = Math.abs(s.x - (objectX(o, s.time) + offset)), dy = Math.abs(s.distance - o.d);
      if (o.type === 'diamond' && dx < 28 && dy < 30) { o.collected = true; s.diamonds++; collect(); }
      // Blocks are tall: jumping never bypasses them. Gaps require airborne clearance.
      if ((o.type === 'block' || o.type === 'moving') && dx < o.w / 2 + 12 && dy < o.h / 2 + 12) { s.status = 'lost'; s.deathType = 'crash'; s.reason = o.type === 'moving' ? 'A wandering duck crossed your path.' : 'A ' + (o.skin || 'rock') + ' stopped your roll.'; break; }
      if (o.type === 'gap' && dx < o.w / 2 && dy < o.h / 2 && height(s) < 10) { s.status = 'lost'; s.deathType = 'fall'; s.reason = 'You slipped through a gap.'; break; }
    }
    if (s.status === 'playing' && s.distance >= level.length) { s.distance = level.length; s.status = 'won'; }
  }
  const api = { TRACK, LEVELS, laneX, envelope, darkness, roadOffset, layout, create, objectX, jump, height, score, step };
  if (typeof module !== 'undefined') module.exports = api;
  root.SkyEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
