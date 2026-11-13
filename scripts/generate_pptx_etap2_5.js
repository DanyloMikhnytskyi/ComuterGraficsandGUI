/**
 * Generator prezentacji PowerPoint (.pptx) — Etap 2–5
 * "Symulator Drona 3D — Sterowanie 6-DOF, Model 3D, Kamery TPS/FPV oraz Środowisko"
 * Treść odpowiada presentation_etap2_5.html (18 slajdów).
 * Uruchomienie: node scripts/generate_pptx_etap2_5.js
 */
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const C = {
  bg: '0B0D17', card: '161B2E', border: '2A3454', cyan: '00D2FF', blue: '3A7BD5',
  green: '2ECC71', orange: 'F39C12', red: 'E74C3C', text: 'F0F4F8', muted: '94A3B8',
  body: 'CBD5E1', math: '0F172A',
};
const FONT = 'Arial';
const MONO = 'Consolas';
const MATH = 'Cambria Math';

const pres = new pptxgen();
pres.defineLayout({ name: 'L', width: 13.333, height: 7.5 });
pres.layout = 'L';
pres.title = 'Symulator Drona 3D — Etap 2–5';

let slideNo = 0;
function newSlide(tag, title) {
  const s = pres.addSlide();
  slideNo++;
  s.background = { color: C.bg };
  if (tag) {
    s.addText(tag.toUpperCase(), { x: 0.7, y: 0.3, w: 11.9, h: 0.3, fontSize: 10, fontFace: FONT, color: C.cyan, bold: true, charSpacing: 2 });
    s.addText(title, { x: 0.7, y: 0.6, w: 11.9, h: 0.6, fontSize: 24, fontFace: FONT, color: C.text, bold: true });
    s.addShape(pres.ShapeType.line, { x: 0.7, y: 1.3, w: 11.93, h: 0, line: { color: C.border, width: 1 } });
  }
  s.addText(`${slideNo}`, { x: 12.2, y: 7.05, w: 0.6, h: 0.3, fontSize: 10, fontFace: FONT, color: C.muted, align: 'right' });
  return s;
}

/** Karta z tytułem; zwraca obszar treści */
function card(s, x, y, w, h, title, accent) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: C.card }, line: { color: C.border, width: 1 } });
  if (accent) s.addShape(pres.ShapeType.rect, { x, y: y + 0.12, w: 0.06, h: h - 0.24, fill: { color: accent }, line: { color: accent, width: 0 } });
  if (title) s.addText(title, { x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.4, fontSize: 14, fontFace: FONT, color: C.cyan, bold: true });
  return { x: x + 0.2, y: y + (title ? 0.55 : 0.15), w: w - 0.4, h: h - (title ? 0.65 : 0.3) };
}

/** Lista wypunktowana; items: string | {t, b} (b = pogrubiony początek) */
function bullets(s, items, a, size = 12) {
  const runs = [];
  items.forEach((it) => {
    const parts = typeof it === 'string' ? [{ text: it }] : it;
    parts.forEach((p, i) => {
      runs.push({
        text: p.text + (i === parts.length - 1 ? '' : ''),
        options: {
          bold: !!p.b, color: p.b ? C.text : C.body, fontFace: p.mono ? MONO : FONT, fontSize: size,
          bullet: i === 0 ? { code: '25B9', indent: 14 } : undefined,
          breakLine: i === parts.length - 1, paraSpaceAfter: 5,
        },
      });
    });
  });
  s.addText(runs, { x: a.x, y: a.y, w: a.w, h: a.h, valign: 'top', margin: 0 });
}

function para(s, text, a, size = 12, color = C.body, opts = {}) {
  s.addText(text, Object.assign({ x: a.x, y: a.y, w: a.w, h: a.h, fontSize: size, fontFace: FONT, color, valign: 'top', margin: 0 }, opts));
}

function formula(s, lines, x, y, w, size = 14) {
  const h = 0.12 + lines.length * (size / 72 * 1.75);
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: C.math }, line: { color: C.math, width: 0 } });
  s.addShape(pres.ShapeType.rect, { x, y, w: 0.05, h, fill: { color: C.cyan }, line: { color: C.cyan, width: 0 } });
  s.addText(lines.map((l) => ({ text: l, options: { breakLine: true } })), {
    x: x + 0.15, y, w: w - 0.25, h, fontSize: size, fontFace: MATH, color: C.text, valign: 'middle', margin: 0,
  });
  return y + h + 0.08;
}

function table(s, rows, x, y, colW, size = 11, mono0 = false) {
  const data = rows.map((r, ri) => r.map((c, ci) => ({
    text: c,
    options: {
      bold: ri === 0, color: ri === 0 ? C.cyan : (mono0 && ci === 0 ? C.cyan : C.body),
      fontFace: mono0 && ci === 0 && ri > 0 ? MONO : FONT, fontSize: ri === 0 ? size - 1 : size,
      fill: { color: C.card }, border: [{ type: 'none' }, { type: 'none' }, { type: 'solid', color: C.border, pt: 0.75 }, { type: 'none' }],
      margin: [0.04, 0.08, 0.04, 0.08], valign: 'middle',
    },
  })));
  s.addTable(data, { x, y, w: colW.reduce((a, b) => a + b, 0), colW });
}

/* ═════ 1. Tytułowy ═════ */
{
  const s = newSlide();
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 0.6, w: 11.93, h: 6.3, rectRadius: 0.2, fill: { color: C.card }, line: { color: C.border, width: 1.5 } });
  s.addText('GRAFIKA KOMPUTEROWA I KOMUNIKACJA CZŁOWIEK-KOMPUTER • ETAPY 2–5', { x: 1, y: 0.95, w: 11.3, h: 0.35, fontSize: 11, fontFace: FONT, color: C.cyan, bold: true, align: 'center', charSpacing: 2 });
  s.addText('Symulator Drona 3D', { x: 1, y: 1.4, w: 11.3, h: 0.9, fontSize: 40, fontFace: FONT, color: C.text, bold: true, align: 'center' });
  s.addText('Etap 2–5: Sterowanie 6-DOF, Model 3D, Kamery TPS/FPV oraz Środowisko', { x: 1, y: 2.3, w: 11.3, h: 0.5, fontSize: 18, fontFace: FONT, color: C.blue, bold: true, align: 'center' });
  [[1.5, 'Danylo Mikhnytskyi (284125)', C.cyan, 'Fizyka 6-DOF, model 3D, środowisko,\nrenderery Scene.tsx / Scene.web.tsx'],
   [6.9, 'Maksym Mahaz (284115)', C.orange, 'Joysticki 2D, HUD, store (Zustand),\nsystem kamer TPS / FPV']].forEach(([x, n, col, d]) => {
    s.addShape(pres.ShapeType.roundRect, { x, y: 3.2, w: 4.9, h: 1.7, rectRadius: 0.12, fill: { color: '1A2238' }, line: { color: col, width: 1.5 } });
    s.addText([{ text: n + '\n', options: { fontSize: 17, bold: true, color: C.text } }, { text: d, options: { fontSize: 12, color: C.body } }],
      { x: x + 0.2, y: 3.3, w: 4.5, h: 1.5, fontFace: FONT, align: 'center', valign: 'middle' });
  });
  s.addText('Stos: Expo ~58.0.0 • React Native 0.88.0 • React 19.3.0 • Three.js ~0.175.0 • expo-gl ~58.0.3 • Zustand ~5.0.0 • react-native-web ^0.21.4 • TypeScript ~5.8.0',
    { x: 1, y: 5.3, w: 11.3, h: 0.6, fontSize: 11, fontFace: FONT, color: C.muted, align: 'center' });
  s.addText('Czysty Three.js + Zustand (bez React Three Fiber) • po Etapie 1 (commit ec26f09)', { x: 1, y: 6.2, w: 11.3, h: 0.4, fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: 'center' });
}

/* ═════ 2. Co się zmieniło ═════ */
{
  const s = newSlide('Przegląd zmian', 'Co się zmieniło względem Etapu 1');
  table(s, [
    ['Obszar', 'Etap 1', 'Etapy 2–5'],
    ['Dynamika', '1D: wysokość + prędkość pionowa', '6-DOF: pozycja 3D, pochylenie, przechylenie, odchylenie'],
    ['Sterowanie', 'Przyciski −10 %, +10 %, Hover, Cut Off', 'Dwa wirtualne joysticki (Mode 2) + Hover Lock'],
    ['Kod sceny', 'Scene.tsx (226 l.) i Scene.web.tsx (233 l.) z powielonym kodem', 'Wspólne src/core/; Scene.tsx 147 l., Scene.web.tsx 95 l.'],
    ['Model drona', 'DroneCube.tsx (kostka)', 'Proceduralny quadkopter z wirującymi śmigłami'],
    ['Kamera', 'Lerp wysokości, stała pozycja X/Z', 'TPS (za dronem, wg odchylenia) i FPV'],
    ['Zależności', 'R3F: @react-three/fiber', 'Usunięto R3F, CameraController, CrossCanvas*, DroneCube'],
    ['Orientacja (app.json)', 'portrait', 'landscape'],
  ], 0.7, 1.5, [2.4, 4.4, 5.13], 12);
  [[0.7, 'Diff vs ec26f09', '12 plików: +259 / −752 linii\n(package-lock.json: +3 / −170)', C.cyan],
   [4.75, 'Nowe pliki', '8 plików (7 w src/core/ +\nVirtualJoystick.tsx): +1201 linii', C.green],
   [8.8, 'Usunięte', '4 pliki: CameraController, CrossCanvas,\nCrossCanvas.web, DroneCube', C.red]].forEach(([x, t, d, col]) => {
    const a = card(s, x, 5.3, 3.83, 1.5, t, col);
    para(s, d, a, 12);
  });
  s.addText('Zmiany niezacommitowane — porównanie drzewa roboczego z ec26f09.', { x: 0.7, y: 6.85, w: 10, h: 0.25, fontSize: 9, fontFace: FONT, color: C.muted });
}

/* ═════ 3. Architektura ═════ */
{
  const s = newSlide('Architektura', 'Struktura końcowa (na podstawie rzeczywistych importów)');
  const box = (x, y, w, h, t, sub, col, dash) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1, fill: { color: C.card }, line: { color: col, width: 1.5, dashType: dash ? 'dash' : 'solid' } });
    s.addText([{ text: t + '\n', options: { bold: true, fontSize: 12, color: C.text } }, { text: sub, options: { fontSize: 9.5, color: C.muted } }],
      { x, y, w, h, fontFace: FONT, align: 'center', valign: 'middle', margin: 0.03 });
  };
  const arrow = (x1, y1, x2, y2, col) => s.addShape(pres.ShapeType.line, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipH: x2 < x1, flipV: y2 < y1, line: { color: col, width: 1.5, endArrowType: 'triangle' },
  });
  box(4.7, 1.5, 3.9, 0.7, 'App.tsx', 'montuje <Scene/> + <HUD/>', C.blue);
  box(0.7, 2.7, 5.2, 0.95, 'Scene.tsx (expo-gl)  |  Scene.web.tsx', 'tylko renderer + pętla requestAnimationFrame • Danylo', C.cyan);
  box(7.4, 2.7, 5.2, 0.95, 'HUD.tsx  →  VirtualJoystick.tsx', 'telemetria, przyciski, 2 joysticki • Maksym', C.orange);
  box(0.7, 4.15, 5.2, 0.8, 'core/simulation.ts (createSimulation)', 'scena + step(dt): fizyka, model, kamera, telemetria', C.green);
  box(0.7, 5.5, 1.9, 0.9, 'physics.ts', 'stepPhysics • Danylo', C.border);
  box(2.75, 5.5, 1.9, 0.9, 'droneModel.ts', 'model + śmigła • Danylo', C.border);
  box(4.8, 5.5, 1.9, 0.9, 'environment.ts', 'niebo, teren, tor • Danylo', C.border);
  box(6.85, 5.5, 1.9, 0.9, 'cameraRig.ts', 'TPS / FPV • Maksym', C.orange);
  box(0.7, 6.55, 8.05, 0.45, 'core/constants.ts — wspólne stałe (wszystkie moduły core)', '', C.border, true);
  box(7.4, 4.15, 5.2, 1.1, 'store/useDroneStore.ts (Zustand)', 'wejścia: throttle, yawInput, pitchInput, rollInput\ntryby: hoverLock, cameraMode, resetNonce • telemetria', C.orange);
  arrow(5.5, 2.2, 3.3, 2.7, C.cyan); arrow(7.8, 2.2, 10, 2.7, C.orange);
  arrow(3.3, 3.65, 3.3, 4.15, C.cyan);
  arrow(10, 3.65, 10, 4.15, C.orange);
  arrow(1.7, 4.95, 1.65, 5.5, C.green); arrow(2.8, 4.95, 3.7, 5.5, C.green); arrow(4.0, 4.95, 5.75, 5.5, C.green); arrow(5.0, 4.95, 7.8, 5.5, C.green);
  arrow(5.9, 4.5, 7.4, 4.5, C.green);
  s.addText('getState() co klatkę', { x: 5.7, y: 4.15, w: 1.8, h: 0.3, fontSize: 9, fontFace: FONT, color: C.muted, align: 'center' });
  s.addText('akcje setLeftStick / setRightStick', { x: 10.1, y: 3.68, w: 2.6, h: 0.3, fontSize: 9, fontFace: FONT, color: C.muted });
  s.addText('updateTelemetry() — 15 Hz → HUD (useShallow)', { x: 9.0, y: 5.3, w: 3.6, h: 0.5, fontSize: 9.5, fontFace: FONT, color: C.muted });
}

/* ═════ 4. Podział pracy ═════ */
{
  const s = newSlide('Organizacja zespołu', 'Podział pracy (50/50) — wg nagłówków plików');
  let a = card(s, 0.7, 1.5, 5.85, 2.9, 'Danylo Mikhnytskyi (284125) — 6 plików, 912 l.', C.cyan);
  bullets(s, [
    'core/physics.ts — model lotu 6-DOF (151 l.)',
    'core/droneModel.ts — model 3D i śmigła (159 l.)', 'core/environment.ts — środowisko (326 l.)', 'core/disposeScene.ts (34 l.)', 'Scene.tsx (147 l.), Scene.web.tsx (95 l.)',
  ], a, 12);
  a = card(s, 6.78, 1.5, 5.85, 2.9, 'Maksym Mahaz (284115) — 4 pliki, 583 l.', C.orange);
  bullets(s, ['VirtualJoystick.tsx — dwa joysticki (274 l.)', 'HUD.tsx — telemetria i przyciski (139 l.)', 'store/useDroneStore.ts — Zustand (98 l.)', 'core/cameraRig.ts — TPS/FPV (72 l.)'], a, 12);
  a = card(s, 0.7, 4.6, 11.93, 1.7, 'Pliki wspólne (oba nazwiska w nagłówku)', C.green);
  bullets(s, ['core/constants.ts (71 l.) — wszystkie parametry symulacji w jednym miejscu',
    'core/simulation.ts (114 l.) — wspólna konfiguracja sceny i aktualizacja klatki, łączy moduły obu autorów',
    'App.tsx (63 l.) — punkt wejścia (nagłówek opisuje podział ról)'], a, 12);
  para(s, 'Podział „50/50" dotyczy zakresu odpowiedzialności (silnik/fizyka/świat vs. interakcja/stan/kamera), nie liczby linii. Atrybucja pochodzi z komentarzy w plikach — historia git zawiera tylko jeden commit (Etap 1).',
    { x: 0.7, y: 6.45, w: 11.9, h: 0.5 }, 10, C.muted);
}

/* ═════ 5. Fizyka: postawa i pion ═════ */
{
  const s = newSlide('Część 1 — Danylo Mikhnytskyi (284125) • physics.ts', 'Fizyka 6-DOF: postawa i ruch pionowy');
  let a = card(s, 0.7, 1.5, 5.85, 5.3, 'Postawa (pochylenie θ, przechylenie φ, odchylenie ψ)');
  para(s, 'Wygładzanie wykładnicze do zadanej wartości (niezależne od liczby klatek):', a, 12);
  let y = formula(s, ['θ* = u_p · θ_max ,   φ* = u_r · θ_max', 'θ ← θ + (θ* − θ) · (1 − e^(−k·Δt))', 'ψ ← ψ − u_y · ω_ψ · Δt'], a.x, a.y + 0.55, a.w, 14);
  para(s, 'u_p, u_r, u_y ∈ [−1, 1] • θ_max = 30° • k = 6 s⁻¹ • ω_ψ = 120°/s.\nNa ziemi bez ciągu (restingOnGround) wszystko jest zerowane.', { x: a.x, y: y + 0.1, w: a.w, h: 1 }, 11, C.muted);
  a = card(s, 6.78, 1.5, 5.85, 5.3, 'Ruch pionowy');
  y = formula(s, ['a_y = T · T_max − g', 'v_y ← min(v_y + a_y·Δt , 15)'], a.x, a.y, a.w, 14);
  para(s, 'T ∈ [0, 1], T_max = 19,62, g = 9,81 m/s² → przy T = 0,5 zawis (a_y = 0).', { x: a.x, y, w: a.w, h: 0.5 }, 11.5);
  para(s, 'Hover Lock aktywny i drążek w środku (|T − 0,5| < 0,01): tłumienie prędkości pionowej', { x: a.x, y: y + 0.65, w: a.w, h: 0.5 }, 11.5);
  y = formula(s, ['v_y ← v_y + (0 − v_y) · (1 − e^(−10·Δt))'], a.x, y + 1.25, a.w, 14);
  para(s, 'Brak dolnego limitu prędkości opadania; krok czasu przycięty do Δt ≤ 0,05 s.', { x: a.x, y: y + 0.1, w: a.w, h: 0.5 }, 11, C.muted);
}

/* ═════ 6. Fizyka: poziom + stałe ═════ */
{
  const s = newSlide('Część 1 — Danylo Mikhnytskyi (284125) • physics.ts, constants.ts', 'Ciąg poziomy, opór powietrza i stałe');
  let a = card(s, 0.7, 1.5, 5.85, 5.3, 'Rzutowanie ciągu na wektory kierunku');
  let y = formula(s, ['a_f = G·g·tan θ ,   a_r = G·g·tan φ ,   G = 1,5', 'a_x = −sin ψ · a_f + cos ψ · a_r − c·v_x', 'a_z = −cos ψ · a_f − sin ψ · a_r − c·v_z'], a.x, a.y, a.w, 13);
  para(s, 'Przód = (−sin ψ, 0, −cos ψ), prawo = (cos ψ, 0, −sin ψ), opór liniowy c = 0,7 s⁻¹. Całkowanie jawne Eulera: v ← v + a·Δt, p ← p + v·Δt.', { x: a.x, y, w: a.w, h: 0.8 }, 11, C.muted);
  y = formula(s, ['‖v_h‖ > 15  ⇒  v_h ← v_h · 15 / ‖v_h‖'], a.x, y + 0.85, a.w, 13);
  bullets(s, [[{ text: 'Podłoże: ', b: true }, { text: 'y ≥ 0,2 m, v_y ≥ 0 przy kontakcie; pułap: y ≤ 500 m' }], 'Ciąg ≤ 0,5 przy ziemi → v = 0 (dron stoi)'], { x: a.x, y: y + 0.1, w: a.w, h: 1.2 }, 11.5);
  a = card(s, 6.78, 1.5, 5.85, 5.3, 'Stała → wartość → znaczenie');
  table(s, [
    ['Stała', 'Wartość', 'Znaczenie'],
    ['GRAVITY', '9,81 m/s²', 'grawitacja'], ['MAX_THRUST', '19,62 m/s²', 'ciąg przy T=1 (2·g)'],
    ['MAX_TILT', '30°', 'maks. pochylenie/przechylenie'], ['TILT_RESPONSE', '6 s⁻¹', 'szybkość śledzenia kąta'],
    ['YAW_RATE', '120°/s', 'prędkość odchylania'], ['HORIZONTAL_ACCEL_GAIN', '1,5', 'mnożnik g·tan(kąt)'],
    ['DRAG', '0,7 s⁻¹', 'opór powietrza'], ['MAX_HORIZONTAL_SPEED', '15 m/s', 'limit prędkości poziomej'],
    ['MAX_CLIMB_SPEED', '15 m/s', 'limit wznoszenia'], ['HOVER_DAMPING', '10 s⁻¹', 'tłumienie w Hover Lock'],
    ['GROUND_Y / MAX_ALTITUDE', '0,2 / 500 m', 'poziom gruntu / pułap'], ['MAX_DT', '0,05 s', 'maks. krok fizyki'],
  ], a.x, a.y - 0.05, [2.2, 1.1, 2.15], 9.5, true);
}

/* ═════ 7. Model 3D ═════ */
{
  const s = newSlide('Część 1 — Danylo Mikhnytskyi (284125) • droneModel.ts', 'Model 3D: graf sceny quadkoptera');
  let a = card(s, 0.7, 1.5, 7.0, 5.3, 'Graf sceny (jedna grupa, 31 siatek)');
  const tree = [
    'Group "drone"',
    '├─ Mesh body        Box 0.2×0.09×0.42',
    '├─ Mesh canopy, battery',
    '├─ Mesh camHousing, lens   // z = −0.23 / −0.275 (przód = −Z)',
    '├─ ×4 narożniki (±0.3, ±0.3):',
    '│   ├─ Mesh arm     Box, obrót y = atan2(x, z)',
    '│   ├─ Mesh motor   Cylinder',
    '│   ├─ Mesh led     Sphere  // zielona z przodu, czerwona z tyłu',
    '│   └─ Group rotor  // userData.spinDir = ±1',
    '│       ├─ Mesh blade  Box 0.3×0.006×0.028',
    '│       └─ Mesh hub    Cylinder',
    '└─ skids ×2 + struts ×4   // płozy lądowania',
  ];
  s.addText(tree.map((l) => ({ text: l, options: { breakLine: true } })), { x: a.x, y: a.y, w: a.w, h: 3.8, fontFace: MONO, fontSize: 11, color: C.body, valign: 'top', margin: 0 });
  para(s, 'Hierarchia jest płaska: ramiona, silniki i LED-y to bezpośrednie dzieci grupy; zagnieżdżone są tylko łopaty w rotor.', { x: a.x, y: a.y + 4.1, w: a.w, h: 0.5 }, 10.5, C.muted);
  a = card(s, 7.9, 1.5, 4.73, 2.0, 'Obrót śmigieł');
  let y = formula(s, ['Δα_i = s_i · (ω₀ + T·ω₁) · Δt'], a.x, a.y, a.w, 14);
  para(s, 'ω₀ = 8, ω₁ = 60 rad/s; s_i = ±1 naprzemiennie (pary diagonalne wirują w tym samym kierunku).', { x: a.x, y, w: a.w, h: 0.7 }, 10.5, C.muted);
  a = card(s, 7.9, 3.7, 4.73, 3.1, 'Dlaczego proceduralnie?');
  bullets(s, ['Brak zewnętrznych assetów — ten sam kod na web i w expo-gl', 'Materiały wbudowane MeshStandardMaterial, bez własnych shaderów', 'Dostęp do wirników bez parsowania pliku (propellers[])', 'Zmiana względem planu z Etapu 1 (import .glb)'], a, 11.5);
}

/* ═════ 8. Środowisko ═════ */
{
  const s = newSlide('Część 1 — Danylo Mikhnytskyi (284125) • environment.ts', 'Środowisko: niebo, teren, tor i przeszkody');
  let a = card(s, 0.7, 1.5, 6.0, 5.3, 'Niebo, mgła i światło');
  bullets(s, ['Kopuła nieba (sfera r = 2000) z gradientem kolorów wierzchołków, podąża za kamerą', 'Mgła Fog: początek 250 m, koniec 1600 m; tarcza słońca',
    'HemisphereLight (1,3) + DirectionalLight (2,4), światło podąża za dronem', 'Podłoże 4000×4000 m: DataTexture 64×64, szachownica 5 m, linie co 10 m', 'Lądowisko: walec r = 3 m, żółty pierścień, znak „H"'], { x: a.x, y: a.y, w: a.w, h: 3.2 }, 11.5);
  para(s, 'web: cienie (PCFSoft, mapa 2048², zasięg ±40 m) i anizotropia tekstury\nnative: cienie wyłączone (ENABLE_SHADOWS_NATIVE = false)', { x: a.x, y: a.y + 3.4, w: a.w, h: 0.9 }, 11, C.green);
  a = card(s, 6.93, 1.5, 5.7, 5.3, 'Tor i przeszkody');
  bullets(s, [[{ text: '6 bramek ', b: true }, { text: '(torus r = 2,5 m; wys. 4–10 m), zamknięta pętla, każda zorientowana wzdłuż kierunku przelotu' }],
    [{ text: '6 budynków ', b: true }, { text: '(wys. 14–35 m) z płytą dachową' }],
    [{ text: '4 maszty ', b: true }, { text: '(15–24 m, 6 pasów biało-czerwonych) z sygnałem migającym 1 Hz' }]], { x: a.x, y: a.y, w: a.w, h: 1.9 }, 11.5);
  table(s, [['Bramka', 'x', 'z', 'y', 'Kolor'], ['1', '0', '−30', '4', 'czerwony'], ['2', '25', '−60', '7', 'pomarańczowy'], ['3', '60', '−55', '10', 'żółty'],
    ['4', '75', '−20', '6', 'zielony'], ['5', '50', '10', '9', 'niebieski'], ['6', '20', '15', '5', 'fioletowy']], a.x, a.y + 1.95, [1.0, 0.8, 0.8, 0.8, 1.7], 10.5);
}

/* ═════ 9. Joysticki ═════ */
{
  const s = newSlide('Część 2 — Maksym Mahaz (284115) • VirtualJoystick.tsx', 'Wirtualne joysticki 2D: od dotyku do wektora sterowania');
  let a = card(s, 0.7, 1.5, 6.3, 5.3, 'Obliczenie wektora');
  let y = formula(s, ['d = b + (p − p₀);  gdy ‖d‖ > R:  d ← d · R / ‖d‖', 'n_x = d_x / R ,   n_y = −d_y / R   ∈ [−1, 1]', "n' = sgn(n) · (|n| − 0,05) / (1 − 0,05)  dla |n| ≥ 0,05, inaczej 0"], a.x, a.y, a.w, 12.5);
  para(s, 'p₀ — punkt początku dotyku, b — wychylenie gałki na starcie (dla drążka gazu bez Hover Lock), R = 60 px (promień podstawy), gałka 26 px. Wychylenie liczone względem punktu dotknięcia, nie środka podstawy. Martwa strefa 5 % jest odejmowana i przeskalowana z powrotem do ±1.', { x: a.x, y: y + 0.05, w: a.w, h: 1.9 }, 11, C.muted);
  a = card(s, 7.23, 1.5, 5.4, 5.3, 'Mapowanie Mode 2');
  table(s, [['Drążek', 'Oś', 'Wielkość'], ['Lewy', "pion (n'_y)", 'ciąg T = 0,5 + 0,5·n\'_y ∈ [0, 1]'], ['Lewy', "poziom (n'_x)", "odchylenie u_y = n'_x"],
    ['Prawy', "pion (n'_y)", "pochylenie u_p = n'_y (+ = przód)"], ['Prawy', "poziom (n'_x)", "przechylenie u_r = n'_x (+ = prawo)"]], a.x, a.y - 0.05, [0.9, 1.3, 2.6], 10.5);
  bullets(s, ['Puszczenie: sprężyna Animated.spring (friction 6, tension 120)', 'Odchylenie i prawy drążek zawsze wracają do zera'], { x: a.x, y: a.y + 2.5, w: a.w, h: 1.2 }, 11.5);
}

/* ═════ 10. Hover Lock, multi-touch, store, HUD ═════ */
{
  const s = newSlide('Część 2 — Maksym Mahaz (284115) • HUD.tsx, useDroneStore.ts', 'Hover Lock, multi-touch, Zustand i układ HUD');
  let a = card(s, 0.7, 1.5, 7.0, 5.3, null);
  bullets(s, [
    [{ text: 'Hover Lock ON ', b: true }, { text: '(domyślnie): drążek gazu wraca do 0,5; fizyka tłumi v_y. OFF: gaz „lepki" — zostaje na ustawionej wartości' }],
    [{ text: 'Multi-touch: ', b: true }, { text: 'RN dopuszcza jednego respondera, więc jeden PanResponder nad dolnym paskiem kieruje każdy dotyk (wg identifier) do drążka po tej stronie ekranu, gdzie się zaczął (pageX < width/2)' }],
    [{ text: 'Do pętli: ', b: true }, { text: 'joysticki zapisują do store (setLeftStick, setRightStick, z clamp); pętla czyta getState() — bez subskrypcji' }],
    [{ text: 'Z pętli do HUD: ', b: true }, { text: 'updateTelemetry z częstotliwością 15 Hz; useShallow ogranicza re-rendery' }],
    [{ text: 'Reset: ', b: true }, { text: 'resetNonce zwiększany w store, pętla wykrywa zmianę' }],
  ], a, 12);
  a = card(s, 7.93, 1.5, 4.7, 5.3, 'Układ HUD (landscape)');
  s.addShape(pres.ShapeType.rect, { x: a.x, y: a.y, w: a.w, h: 3.8, fill: { color: '12304D' }, line: { color: C.border, width: 1 } });
  s.addText('ALT · H.SPD · V.SPD · THR\nPITCH · ROLL · X / Z', { x: a.x + 0.1, y: a.y + 0.1, w: 2.3, h: 0.6, fontFace: MONO, fontSize: 9, color: '33FF66', fill: { color: '000000', transparency: 40 } });
  [['Camera: TPS', '2980B9'], ['Hover Lock: ON', '27AE60'], ['Reset Drone', 'C0392B']].forEach(([t, col], i) =>
    s.addText(t, { x: a.x + a.w - 1.6, y: a.y + 0.1 + i * 0.38, w: 1.5, h: 0.32, fontFace: FONT, fontSize: 9, bold: true, color: 'FFFFFF', align: 'center', fill: { color: col } }));
  [[a.x + 0.2, 'THROTTLE (HOLD) · YAW'], [a.x + a.w - 1.5, 'PITCH · ROLL']].forEach(([x, t]) => {
    s.addShape(pres.ShapeType.ellipse, { x, y: a.y + 2.5, w: 1.1, h: 1.1, fill: { color: '000000', transparency: 60 }, line: { color: 'FFFFFF', width: 1.5, transparency: 40 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.33, y: a.y + 2.83, w: 0.44, h: 0.44, fill: { color: '1ABC9C' }, line: { color: 'FFFFFF', width: 1.5 } });
    s.addText(t, { x: x - 0.3, y: a.y + 3.55, w: 1.7, h: 0.22, fontFace: FONT, fontSize: 7, bold: true, color: 'DDDDDD', align: 'center' });
  });
}

/* ═════ 11. Kamera TPS ═════ */
{
  const s = newSlide('Część 2 — Maksym Mahaz (284115) • cameraRig.ts', 'System kamer (1/2): TPS — kamera podążająca');
  let a = card(s, 0.7, 1.5, 6.5, 5.3, 'Pozycja zadana i wygładzanie');
  let y = formula(s, ['o = R_y(ψ)·(0, 1,8, 4,5)ᵀ = (4,5·sin ψ,  1,8,  4,5·cos ψ)', 'c* = p + o', 'c ← c + (c* − c) · (1 − e^(−5·Δt))', 'lookAt(p_x,  p_y + 0,4,  p_z)'], a.x, a.y, a.w, 13);
  para(s, 'Przy 60 FPS współczynnik ≈ 0,08. Obrót tylko wokół osi Y — pochylenie i przechylenie nie bujają kamerą. Dodatkowo c*_y ≥ 0,7 m (nad ziemią).', { x: a.x, y: y + 0.05, w: a.w, h: 1 }, 11, C.muted);
  a = card(s, 7.43, 1.5, 5.2, 5.3, 'Parametry');
  bullets(s, ['Przesunięcie TPS_OFFSET = (0, 1,8, 4,5) m w układzie odchylenia', 'TPS_FOLLOW = 5 s⁻¹ — wygładzanie niezależne od FPS', 'FOV 60°, płaszczyzna bliska 0,1',
    'Po zmianie trybu kamera „przeskakuje" do pozycji zadanej (bez przejazdu przez drona)', 'Niebo podąża za pozycją kamery (env.update), niezależnie od trybu'], a, 11.5);
}

/* ═════ 12. Kamera FPV ═════ */
{
  const s = newSlide('Część 2 — Maksym Mahaz (284115) • cameraRig.ts', 'System kamer (2/2): FPV i porównanie z TPS');
  let a = card(s, 0.7, 1.5, 6.0, 5.3, 'Kamera przy dziobie drona');
  let y = formula(s, ['E = (−θ, ψ, −φ),  kolejność YXZ', 'c = p + R_E·(0, 0,03, −0,34)ᵀ,   rotation = E'], a.x, a.y, a.w, 13);
  para(s, 'Dlaczego YXZ: najpierw odchylenie wokół pionu świata, potem pochylenie wokół lokalnego X, na końcu przechylenie wokół osi „do przodu". Ta sama kolejność jest użyta dla modelu (simulation.ts), więc kamera dokładnie odtwarza postawę drona, a horyzont przechyla się poprawnie. Bez wygładzania, FOV 85°, near 0,05.', { x: a.x, y: y + 0.05, w: a.w, h: 2.6 }, 11, C.muted);
  a = card(s, 6.93, 1.5, 5.7, 5.3, 'TPS vs FPV');
  table(s, [['', 'TPS', 'FPV'], ['Pozycja', 'za i nad dronem, obrót wg ψ', 'nos drona (0, 0,03, −0,34)'], ['Orientacja', 'lookAt na dron (+0,4 m)', 'Euler (−θ, ψ, −φ), YXZ'],
    ['Wygładzanie', 'tak, 1 − e^(−5Δt)', 'brak'], ['FOV / near', '60° / 0,1', '85° / 0,05'], ['Przechylenie obrazu', 'nie', 'tak (horyzont się przechyla)']], a.x, a.y - 0.05, [1.4, 1.9, 1.8], 10.5);
}

/* ═════ 13–15. Zrzuty ═════ */
[
  ['Zrzut 1: Widok TPS na lądowisku', 'zrzut4_tps.png', 'Widok TPS — dron na lądowisku z nowym interfejsem dwóch joysticków.', C.cyan],
  ['Zrzut 2: Lot z przechyleniem przez bramki', 'zrzut5_lot.png', 'Lot z przechyleniem (Pitch/Roll) przez bramki kontrolne i animacja śmigieł.', C.green],
  ['Zrzut 3: Tryb FPV na torze przeszkód', 'zrzut6_fpv.png', 'Tryb FPV (widok z kamery drona) podczas przelotu przez tor przeszkód.', C.orange],
].forEach(([title, file, cap, col], i) => {
  const s = newSlide(`Weryfikacja doświadczalna — Zrzut ${i + 1}`, title);
  const p = path.resolve(__dirname, '../screenshots', file);
  const w = 8.2, h = w * 440 / 783;
  s.addShape(pres.ShapeType.rect, { x: 0.7, y: 1.6, w: w + 0.2, h: h + 0.2, fill: { color: '05070E' }, line: { color: col, width: 1.5 } });
  if (fs.existsSync(p)) s.addImage({ path: p, x: 0.8, y: 1.7, w, h });
  else s.addText('Miejsce na zrzut ekranu', { x: 0.8, y: 1.7, w, h, fontSize: 18, color: C.muted, align: 'center', valign: 'middle', fontFace: FONT });
  const a = card(s, 9.3, 1.6, 3.33, 2.4, 'Opis', col);
  para(s, cap, a, 12.5);
});

/* ═════ 16. Wyzwania ═════ */
{
  const s = newSlide('Wyzwania i rozwiązania', 'Najważniejsze problemy i ich rozwiązania');
  table(s, [['Problem', 'Rozwiązanie w kodzie'],
    ['Dwa renderery (web / expo-gl) z powielonym kodem', 'core/simulation.ts — wspólna scena i step(dt); Scene*.tsx tylko tworzą renderer i pętlę'],
    ['Ograniczenia expo-gl', 'Materiały wbudowane i DataTexture zamiast własnych shaderów; cienie wyłączone natywnie; łatki getShaderInfoLog; rozmiar z onLayout (bufor GL stały)'],
    ['Jeden responder w React Native', 'Jeden PanResponder i routing dotyków po identifier do lewego/prawego drążka'],
    ['Aktualizacje store co klatkę vs. re-rendery HUD', 'Pętla czyta getState(); telemetria 15 Hz; useShallow w HUD'],
    ['Kolejność obrotów w FPV i zależność od FPS', 'Euler YXZ z ujemnymi kątami (konwencja w physics.ts); wygładzanie 1−e^(−k·dt); dt ≤ 0,05']],
    0.7, 1.6, [3.9, 8.03], 12.5);
}

/* ═════ 17. Ograniczenia ═════ */
{
  const s = newSlide('Ograniczenia i dalszy rozwój', 'Co jeszcze nie działa i co dalej');
  let a = card(s, 0.7, 1.5, 6.0, 5.3, 'Ograniczenia (stan kodu)', C.red);
  bullets(s, ['Brak kolizji z bramkami, budynkami i masztami — fizyka zna tylko podłoże i pułap', 'Bramki nie są zaliczane (brak licznika, czasu okrążenia)',
    'Dynamika obrotowa uproszczona: kąty dążą do zadanych (bez momentów bezwładności)', 'Cienie wyłączone na urządzeniach natywnych', 'Model proceduralny zamiast importu .glb z planu Etapu 1',
    'Brak testów automatycznych (w repozytorium nie ma skryptu testów)'], a, 12);
  a = card(s, 6.93, 1.5, 5.7, 5.3, 'Pomysły na kolejne etapy', C.green);
  bullets(s, ['Wykrywanie kolizji (bryły ograniczające budynków, torusy bramek)', 'Zaliczanie bramek, stoper, tablica wyników', 'Wiatr i bezwładność obrotowa', 'Cienie natywnie (po profilowaniu)', 'Opcjonalny import modelu glTF'], a, 12);
}

/* ═════ 18. Podsumowanie ═════ */
{
  const s = newSlide('Podsumowanie', 'Wnioski z Etapów 2–5');
  let a = card(s, 0.7, 1.5, 6.0, 3.6, 'Osiągnięcia', C.green);
  bullets(s, ['Pełna fizyka 6-DOF z oporem i limitami prędkości', 'Proceduralny quadkopter z animowanymi śmigłami', 'Dwa joysticki Mode 2 z multi-touch i Hover Lock',
    'Kamery TPS / FPV; środowisko z 6 bramkami, 6 budynkami, 4 masztami', 'Jeden wspólny rdzeń src/core/ dla web i native'], a, 12);
  a = card(s, 6.93, 1.5, 5.7, 3.6, 'Podział pracy', C.cyan);
  s.addText([
    { text: 'Danylo Mikhnytskyi (284125): ', options: { bold: true, color: C.text } }, { text: 'fizyka, model 3D, środowisko, renderery.\n\n', options: { color: C.body } },
    { text: 'Maksym Mahaz (284115): ', options: { bold: true, color: C.text } }, { text: 'joysticki, HUD, store, kamery.\n\n', options: { color: C.body } },
    { text: 'Wspólnie: ', options: { bold: true, color: C.text } }, { text: 'stałe, simulation.ts, integracja.', options: { color: C.body } },
  ], { x: a.x, y: a.y, w: a.w, h: a.h, fontSize: 12.5, fontFace: FONT, valign: 'top', margin: 0 });
  s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 5.4, w: 11.93, h: 1.4, rectRadius: 0.12, fill: { color: '0F1A2B' }, line: { color: C.cyan, width: 1, dashType: 'dash' } });
  s.addText([{ text: 'Dziękujemy za uwagę!\n', options: { fontSize: 24, bold: true, color: C.text } },
    { text: 'Danylo Mikhnytskyi (284125) • Maksym Mahaz (284115) • Grafika Komputerowa i GUI', options: { fontSize: 12, color: C.muted } }],
    { x: 0.7, y: 5.4, w: 11.93, h: 1.4, fontFace: FONT, align: 'center', valign: 'middle' });
}

const out = path.resolve(__dirname, '../presentation_etap2_5.pptx');
pres.writeFile({ fileName: out }).then(() => console.log('Zapisano:', out));
