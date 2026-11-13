/**
 * Generator prezentacji PowerPoint (.pptx) dla projektu:
 * "Symulator Drona 3D — Etap 1: Prototyp, Fizyka Ciągu i Interfejs HUD"
 * 
 * Układ: 8 slajdów (każdy zrzut ekranu na osobnym slajdzie)
 * Autorzy:
 * Danylo Mikhnytskyi (284125)
 * Maksym Mahaz (284115)
 */

const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createPresentation() {
  const pres = new pptxgen();

  // Układ 16:9 widescreen (13.333 x 7.5 cali)
  pres.defineLayout({ name: 'CUSTOM_16_9', width: 13.333, height: 7.5 });
  pres.layout = 'CUSTOM_16_9';

  // Kolory motywu
  const C_BG = '0B0D17';         // Ciemny granat tła
  const C_CARD = '161B2E';       // Tło kart
  const C_CARD_BORDER = '2A3454';// Ramka kart
  const C_CYAN = '00D2FF';       // Akcent cyan
  const C_BLUE = '3A7BD5';       // Akcent niebieski
  const C_GREEN = '2ECC71';      // Akcent zielony
  const C_RED = 'E74C3C';        // Akcent czerwony/pomarańczowy
  const C_TEXT = 'F0F4F8';       // Główny tekst biały
  const C_MUTED = '94A3B8';      // Wyciszony szary

  // Ścieżki do zrzutów ekranu
  const img1 = path.resolve(__dirname, '../screenshots/zrzut1_start.png');
  const img2 = path.resolve(__dirname, '../screenshots/zrzut2_wznoszenie.png');
  const img3 = path.resolve(__dirname, '../screenshots/zrzut3_opadanie.png');

  // Funkcja pomocnicza: nagłówek slajdu
  function addSlideHeader(slide, tag, title) {
    slide.background = { color: C_BG };

    // Górny tag
    slide.addText(tag.toUpperCase(), {
      x: 0.8,
      y: 0.45,
      w: 11.7,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
      letterSpacing: 2,
    });

    // Główny tytuł
    slide.addText(title, {
      x: 0.8,
      y: 0.75,
      w: 11.7,
      h: 0.6,
      fontSize: 22,
      fontFace: 'Arial',
      color: C_TEXT,
      bold: true,
    });

    // Linia oddzielająca
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 1.45,
      w: 11.733,
      h: 0,
      line: { color: C_CARD_BORDER, width: 1 },
    });
  }

  // ==========================================
  // SLAJD 1: Tytułowy
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C_BG };

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 0.8,
      w: 11.733,
      h: 5.9,
      rectRadius: 0.2,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.5 },
    });

    slide.addText('GRAFIKA KOMPUTEROWA I KOMUNIKACJA CZŁOWIEK-KOMPUTER', {
      x: 1.2,
      y: 1.2,
      w: 10.933,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
      align: 'center',
      letterSpacing: 3,
    });

    slide.addText('Symulator Drona 3D', {
      x: 1.2,
      y: 1.65,
      w: 10.933,
      h: 1.0,
      fontSize: 38,
      fontFace: 'Arial',
      color: C_TEXT,
      bold: true,
      align: 'center',
    });

    slide.addText('Etap 1: Prototyp, Fizyka Ciągu i Interfejs HUD', {
      x: 1.2,
      y: 2.7,
      w: 10.933,
      h: 0.5,
      fontSize: 18,
      fontFace: 'Arial',
      color: C_BLUE,
      bold: true,
      align: 'center',
    });

    slide.addShape(pres.ShapeType.line, {
      x: 3.0,
      y: 3.4,
      w: 7.333,
      h: 0,
      line: { color: C_CARD_BORDER, width: 1 },
    });

    // Karta: Danylo Mikhnytskyi
    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.8,
      y: 3.7,
      w: 4.6,
      h: 2.1,
      rectRadius: 0.15,
      fill: { color: '1A2238' },
      line: { color: C_CYAN, width: 1.5 },
    });
    slide.addText([
      { text: 'Danylo Mikhnytskyi\n', options: { fontSize: 18, bold: true, color: C_TEXT } },
      { text: 'Nr albumu: 284125\n\n', options: { fontSize: 13, color: C_MUTED } },
      { text: 'Rola w projekcie:\n', options: { fontSize: 11, bold: true, color: C_CYAN } },
      { text: 'Scena 3D WebGL, Oświetlenie,\nModel Fizyki Lotu i Kolizje', options: { fontSize: 12, color: C_TEXT } },
    ], {
      x: 2.0,
      y: 3.85,
      w: 4.2,
      h: 1.8,
      align: 'center',
      valign: 'middle',
    });

    // Karta: Maksym Mahaz
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.933,
      y: 3.7,
      w: 4.6,
      h: 2.1,
      rectRadius: 0.15,
      fill: { color: '1A2238' },
      line: { color: C_BLUE, width: 1.5 },
    });
    slide.addText([
      { text: 'Maksym Mahaz\n', options: { fontSize: 18, bold: true, color: C_TEXT } },
      { text: 'Nr albumu: 284115\n\n', options: { fontSize: 13, color: C_MUTED } },
      { text: 'Rola w projekcie:\n', options: { fontSize: 11, bold: true, color: C_BLUE } },
      { text: 'Interfejs HUD, Zustand Store,\nSterowanie Ciągiem i Kamera LERP', options: { fontSize: 12, color: C_TEXT } },
    ], {
      x: 7.133,
      y: 3.85,
      w: 4.2,
      h: 1.8,
      align: 'center',
      valign: 'middle',
    });

    slide.addText('Politechnika • Semestr letni 2025/2026 • Expo, React Native & Three.js', {
      x: 1.2,
      y: 6.1,
      w: 10.933,
      h: 0.35,
      fontSize: 10,
      fontFace: 'Arial',
      color: C_MUTED,
      align: 'center',
    });
  }

  // ==========================================
  // SLAJD 2: Stos Technologiczny i Architektura
  // ==========================================
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, 'Architektura Systemu', 'Stos Technologiczny i Przepływ Danych (Data Flow)');

    // Lewa karta: Technologie
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 5.7,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.2 },
    });
    slide.addText('🛠️  Wybór Technologii', {
      x: 1.1,
      y: 1.9,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
    });
    slide.addText([
      { text: 'Expo SDK 58 & React Native\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Wieloplatformowy szkielet (Web, iOS, Android). Jeden kod źródłowy dla przeglądarek i telefonów bez konieczności rekonfiguracji natywnych projektów.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Three.js & expo-gl (GLView)\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Bezpośredni rendering 3D WebGL / WebGL2. Gwarantuje stałe 60 FPS, brak narzutów React Reconciler i stabilną pętlę animacji requestAnimationFrame.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Zustand State Manager\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Ultralekki, zatomizowany magazyn stanu. Umożliwia natychmiastową komunikację między pętlą fizyki 3D a interfejsem 2D bez zbędnych re-renderów.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'TypeScript\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Pełne bezpieczeństwo typów dla wektorów pozycji, prędkości, telemetrii oraz parametrów symulacji numerycznej.', options: { color: C_MUTED, fontSize: 11.5 } },
    ], {
      x: 1.1,
      y: 2.4,
      w: 5.1,
      h: 4.3,
    });

    // Prawa karta: Architektura
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.833,
      y: 1.7,
      w: 5.7,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.2 },
    });
    slide.addText('⚡  Architektura i Wydajność', {
      x: 7.133,
      y: 1.9,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_BLUE,
      bold: true,
    });
    slide.addText([
      { text: 'Separacja warstw prezentacji:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Scena 3D (tło WebGL o pełnym rozmiarze ekranu) oraz warstwa interfejsu użytkownika HUD (nakładka dotykowa w React Native StyleSheet.absoluteFillObject).\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Zero-overhead Physics Loop:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Obliczenia całkowe fizyki lotu (Euler) wykonywane są bezpośrednio w pętli renderera na obiektach Three.js, nie obciążając drzewa komponentów Reacta.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Reaktywna telemetria w czasie rzeczywistym:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Atomowe selektory Zustand informują komponenty HUD wyłącznie o zmianach parametrów lotu (wysokość, prędkość, ciąg), zapewniając płynność 60 FPS.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Wsparcie Cross-Platform (Web & Mobile):\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Dedykowana implementacja Scene.web.tsx (Three.js WebGLRenderer) oraz Scene.tsx (expo-gl GLView z polyfillem dla Hermes i Three.js r163+).', options: { color: C_MUTED, fontSize: 11.5 } },
    ], {
      x: 7.133,
      y: 2.4,
      w: 5.1,
      h: 4.3,
    });
  }

  // ==========================================
  // SLAJD 3: Wkład — Danylo Mikhnytskyi (284125)
  // ==========================================
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, 'Grafika Komputerowa & Fizyka Lotu', 'Wkład własny: Danylo Mikhnytskyi (284125)');

    // Lewa karta: Scena 3D
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 5.7,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CYAN, width: 1.5 },
    });
    slide.addText('🎮  Scena 3D i Środowisko Graficzne', {
      x: 1.1,
      y: 1.9,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
    });
    slide.addText([
      { text: 'Model obiektu drona:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Konstrukcja prostopadłościenna o wymiarach 0.6 × 0.3 × 0.6 m z cieniowaniem MeshStandardMaterial (ciemnoszary korpus, metaliczność 0.8, gładkość 0.2).\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Oświetlenie i atmosfera:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Zbalansowany zestaw oświetlenia: AmbientLight (natężenie 0.8) dla miękkich cieni oraz DirectionalLight (1.2) z pozycji [5, 12, 7] symulujący światło słoneczne.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Siatka pomocnicza i lądowisko:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Siatka przestrzenna GridHelper o wymiarach 1000 × 1000 m (1000 podziałów) z centralnym oznaczeniem lądowiska (helipad) o wymiarach 4 × 4 m.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Zarządzanie kamerą w skali makro:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Konfiguracja perspektywiczna (FOV 60°) z daleką płaszczyzną odcinania far = 2500 m, zapobiegająca ucinaniu horyzontu przy locie na 500 m.', options: { color: C_MUTED, fontSize: 11.5 } },
    ], {
      x: 1.1,
      y: 2.4,
      w: 5.1,
      h: 4.3,
    });

    // Prawa karta: Model Fizyki
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.833,
      y: 1.7,
      w: 5.7,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.2 },
    });
    slide.addText('📐  Model Matematyczny i Fizyka Lotu', {
      x: 7.133,
      y: 1.9,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_GREEN,
      bold: true,
    });
    slide.addText([
      { text: 'Równanie dynamiki w osi pionowej (Y):\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'a_y = T · T_max - g\n', options: { bold: true, color: C_CYAN, fontSize: 13 } },
      { text: 'gdzie g = 9.81 m/s², ciąg T ∈ [0, 1], maksymalny ciąg T_max = 2 · g = 19.62 m/s² (zapewnia stosunek ciągu do masy 2:1).\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Całkowanie numeryczne metodą Eulera:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'v_y(t + Δt) = v_y(t) + a_y · Δt\ny(t + Δt) = y(t) + v_y · Δt\n', options: { bold: true, color: C_CYAN, fontSize: 12 } },
      { text: 'Całkowanie z dynamicznym krokiem czasowym delta (clamp do maks. 0.1 s zapobiega tunelowaniu przy spadkach FPS).\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Realistyczne ograniczenia aerodynamiczne:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: '• Prędkość wznoszenia: ściśle limitowana do maks. 15.0 m/s.\n• Opadanie: brak ograniczenia prędkości – naturalny, realistyczny spadek grawitacyjny.\n• Siła reakcji podłoża: dron opiera się o ziemię na y = 0.15 m (v_y = 0).\n• Pułap maksymalny: ogranicznik wysokości na 500.0 m.', options: { color: C_MUTED, fontSize: 11 } },
    ], {
      x: 7.133,
      y: 2.4,
      w: 5.1,
      h: 4.3,
    });
  }

  // ==========================================
  // SLAJD 4: Wkład — Maksym Mahaz (284115)
  // ==========================================
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, 'Komunikacja Człowiek-Komputer & GUI', 'Wkład własny: Maksym Mahaz (284115)');

    // Lewa karta: Interfejs HUD
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 5.7,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_BLUE, width: 1.5 },
    });
    slide.addText('📱  Interfejs Telemetryczny HUD', {
      x: 1.1,
      y: 1.9,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_BLUE,
      bold: true,
    });
    slide.addText([
      { text: 'Architektura Store (useDroneStore.ts):\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Zaprojektowanie centralnego magazynu stanu w Zustand z atomowymi akcjami: setThrottle, setFlightData i resetDrone.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Wskaźniki telemetryczne w czasie rzeczywistym:\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: '• ALTITUDE: dokładna wysokość drona nad gruntem w metrach [m].\n• VERTICAL SPEED: aktualna prędkość wznoszenia/opadania [m/s].\n• THROTTLE: aktualnie zadana moc silników w procentach [0% – 100%].\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Ergonomia i sterowanie dotykowe (HUD.tsx):\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: '• Przyciski inkrementacji: skokowa zmiana ciągu o ±10%.\n• Przyciski bezpośrednie: natychmiastowe odcięcie (0%) oraz pełna moc (100%).\n• Dynamiczne podświetlenie: ciąg 50% wyróżniony kolorem cyan sygnalizującym tryb zawisu.', options: { color: C_MUTED, fontSize: 11.5 } },
    ], {
      x: 1.1,
      y: 2.4,
      w: 5.1,
      h: 4.3,
    });

    // Prawa karta: Kamera i Zawis
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.833,
      y: 1.7,
      w: 5.7,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.2 },
    });
    slide.addText('🎥  Algorytm Zawisu i Śledzenie Kamerą', {
      x: 7.133,
      y: 1.9,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
    });
    slide.addText([
      { text: 'Aktywny tryb zawisu (Hover Mode - 50% Ciągu):\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Gdy przepustnica wynosi 50%, siła ciągu idealnie równoważy grawitację (a_y = 0). Dodatkowo zaimplementowano aktywne tłumienie prędkości pionowej:\n', options: { color: C_MUTED, fontSize: 11.5 } },
      { text: 'v_y = lerp(v_y, 0, min(1, 10 · Δt))\n', options: { bold: true, color: C_CYAN, fontSize: 12 } },
      { text: 'Dron po puszczeniu sterów natychmiast wyhamowuje ruch pionowy i stabilnie utrzymuje aktualną wysokość w powietrzu.\n\n', options: { color: C_MUTED, fontSize: 11.5 } },

      { text: 'Algorytm płynnego podążania kamery (LERP):\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Kamera trzecioosobowa podąża za obiektem przy użyciu liniowej interpolacji pozycji:\n', options: { color: C_MUTED, fontSize: 11.5 } },
      { text: 'P_target = P_dron + [0, 3, 6]\nP_kamera = lerp(P_kamera, P_target, 5 · Δt)\n', options: { bold: true, color: C_CYAN, fontSize: 12 } },
      { text: 'Eliminuje szarpnięcia, zachowując płynny kadr przy gwałtownych przyspieszeniach.', options: { color: C_MUTED, fontSize: 11.5 } },
    ], {
      x: 7.133,
      y: 2.4,
      w: 5.1,
      h: 4.3,
    });
  }

  // ==========================================
  // SLAJD 5: Zrzut 1 — Stan Początkowy
  // ==========================================
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, 'Wyniki Działania — Faza 1: Stan Spoczynku', 'Zrzut 1: Stan Początkowy (Dron na Ziemi)');

    // Kontener na obraz po lewej stronie
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 7.3,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CYAN, width: 1.5 },
    });
    if (fs.existsSync(img1)) {
      slide.addImage({
        path: img1,
        x: 1.0,
        y: 1.9,
        w: 6.9,
        h: 4.6,
      });
    }

    // Karta analityczna po prawej stronie
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.4,
      y: 1.7,
      w: 4.133,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.2 },
    });

    slide.addText('📊  Parametry Telemetrii', {
      x: 8.65,
      y: 1.9,
      w: 3.633,
      h: 0.35,
      fontSize: 15,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
    });

    slide.addText([
      { text: 'THROTTLE: 0%\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Silniki wyłączone, brak ciągu pionowego.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'ALTITUDE: 0.15 m\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Wysokość środka geometrycznego bryły (0.3m wysokości). Wskaźnik HUD pokazuje idealne 0.00 m nad gruntem.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'VERTICAL SPEED: 0.00 m/s\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Pełen spoczynek układu w układzie odniesienia.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Fizyka podłoża (Normal Force):\n', options: { bold: true, color: C_GREEN, fontSize: 12.5 } },
      { text: 'Siła grawitacji F_g = m · g jest równoważona przez normalną reakcję podłoża N. Model nie zapada się pod siatkę terenu i zachowuje stabilność numeryczną.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Scena 3D:\n', options: { bold: true, color: C_BLUE, fontSize: 12 } },
      { text: 'Dron wycentrowany na pasie startowym (helipad 4×4m) z widoczną siatką przestrzenną.', options: { color: C_MUTED, fontSize: 11 } },
    ], {
      x: 8.65,
      y: 2.35,
      w: 3.633,
      h: 4.4,
    });
  }

  // ==========================================
  // SLAJD 6: Zrzut 2 — Dynamiczne Wznoszenie i Zawis
  // ==========================================
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, 'Wyniki Działania — Faza 2: Wznoszenie i Zawis', 'Zrzut 2: Wznoszenie Ciągiem > 50% i Aktywny Zawis');

    // Kontener na obraz po lewej stronie
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 7.3,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_GREEN, width: 1.5 },
    });
    if (fs.existsSync(img2)) {
      slide.addImage({
        path: img2,
        x: 1.0,
        y: 1.9,
        w: 6.9,
        h: 4.6,
      });
    }

    // Karta analityczna po prawej stronie
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.4,
      y: 1.7,
      w: 4.133,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.2 },
    });

    slide.addText('🚀  Parametry Dynamiczne', {
      x: 8.65,
      y: 1.9,
      w: 3.633,
      h: 0.35,
      fontSize: 15,
      fontFace: 'Arial',
      color: C_GREEN,
      bold: true,
    });

    slide.addText([
      { text: 'THROTTLE: 80% (lub 50% zawis)\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Wysoki ciąg silników generujący przyspieszenie dodatnie a_y = 5.89 m/s².\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'ALTITUDE: 12.62 m\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Szybki przyrost wysokości lotu z poziomu zerowego.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'VERTICAL SPEED: +12.07 m/s\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Prędkość pionowa dynamicznie ograniczona do bezpiecznego maksimum 15.0 m/s.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Aktywny zawis (Hover 50%):\n', options: { bold: true, color: C_CYAN, fontSize: 12.5 } },
      { text: 'Gdy użytkownik ustawi 50%, kontroler natychmiast wyhamowuje ruch (v_y → 0) i blokuje dron na aktualnej wysokości.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Kamera LERP:\n', options: { bold: true, color: C_BLUE, fontSize: 12 } },
      { text: 'Płynnie podąża w górę za dronem, utrzymując perspektywę trzecioosobową bez szarpnięć.', options: { color: C_MUTED, fontSize: 11 } },
    ], {
      x: 8.65,
      y: 2.35,
      w: 3.633,
      h: 4.4,
    });
  }

  // ==========================================
  // SLAJD 7: Zrzut 3 — Opadanie pod Wpływem Grawitacji
  // ==========================================
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, 'Wyniki Działania — Faza 3: Zniżanie i Lądowanie', 'Zrzut 3: Opadanie pod Wpływem Grawitacji');

    // Kontener na obraz po lewej stronie
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 7.3,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_RED, width: 1.5 },
    });
    if (fs.existsSync(img3)) {
      slide.addImage({
        path: img3,
        x: 1.0,
        y: 1.9,
        w: 6.9,
        h: 4.6,
      });
    }

    // Karta analityczna po prawej stronie
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.4,
      y: 1.7,
      w: 4.133,
      h: 5.3,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.2 },
    });

    slide.addText('📉  Fizyka Zniżania', {
      x: 8.65,
      y: 1.9,
      w: 3.633,
      h: 0.35,
      fontSize: 15,
      fontFace: 'Arial',
      color: C_RED,
      bold: true,
    });

    slide.addText([
      { text: 'THROTTLE: 0%\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Odcięcie ciągu silników – zniżanie pod wpływem wyłącznie siły grawitacji.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'ALTITUDE: 6.84 m\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Płynny powrót w kierunku siatki startowej.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'VERTICAL SPEED: -9.81 m/s\n', options: { bold: true, color: C_TEXT, fontSize: 13 } },
      { text: 'Ujemna prędkość pionowa odpowiadająca przyspieszeniu ziemskiemu a_y = -9.81 m/s².\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Brak sztucznego limitu opadania:\n', options: { bold: true, color: C_GREEN, fontSize: 12.5 } },
      { text: 'Realistyczny spadek swobodny – prędkość w dół nie jest sztucznie tłumiona, co oddaje realne zachowanie drona przy utracie zasilania.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Miękkie lądowanie:\n', options: { bold: true, color: C_CYAN, fontSize: 12 } },
      { text: 'Gdy wysokość osiąga 0.15 m, następuje natychmiastowe wygaszenie prędkości do 0.00 m/s.', options: { color: C_MUTED, fontSize: 11 } },
    ], {
      x: 8.65,
      y: 2.35,
      w: 3.633,
      h: 4.4,
    });
  }

  // ==========================================
  // SLAJD 8: Podsumowanie i Plany na Etap 2
  // ==========================================
  {
    const slide = pres.addSlide();
    addSlideHeader(slide, 'Podsumowanie & Dalszy Rozwój', 'Podsumowanie Etapu 1 i Plany na Etap 2');

    // Karta lewa: Sukcesy Etapu 1
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.7,
      w: 5.7,
      h: 3.8,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CARD_BORDER, width: 1.2 },
    });
    slide.addText('✅  Osiągnięcia Etapu 1', {
      x: 1.1,
      y: 1.9,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_GREEN,
      bold: true,
    });
    slide.addText([
      { text: 'Stabilny rendering 60 FPS:\n', options: { bold: true, color: C_TEXT, fontSize: 12.5 } },
      { text: 'Pełna synchronizacja pętli WebGL z telemetrią HUD bez spadków płynności animacji.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Matematyczny model lotu z aktywnym zawisem:\n', options: { bold: true, color: C_TEXT, fontSize: 12.5 } },
      { text: 'Poprawna fizyka przyspieszenia pionowego, hamowanie do 0 m/s na 50% ciągu oraz miękkie lądowanie.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Pełna wieloplatformowość:\n', options: { bold: true, color: C_TEXT, fontSize: 12.5 } },
      { text: 'Działanie w przeglądarce i na telefonach mobilnych z Expo Go z dedykowanymi zabezpieczeniami WebGL.', options: { color: C_MUTED, fontSize: 11 } },
    ], {
      x: 1.1,
      y: 2.35,
      w: 5.1,
      h: 3.0,
    });

    // Karta prawa: Plany na Etap 2
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.833,
      y: 1.7,
      w: 5.7,
      h: 3.8,
      rectRadius: 0.15,
      fill: { color: C_CARD },
      line: { color: C_CYAN, width: 1.2 },
    });
    slide.addText('🎯  Plan na Etap 2 (Kolejne zajęcia)', {
      x: 7.133,
      y: 1.9,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C_CYAN,
      bold: true,
    });
    slide.addText([
      { text: 'Wirtualne joysticki dotykowe 2D:\n', options: { bold: true, color: C_TEXT, fontSize: 12.5 } },
      { text: 'Zastąpienie przycisków ekranowymi gałkami analogowymi do precyzyjnego sterowania ciągiem i kursem.\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Fizyka obrotowa 6-DOF (Degrees of Freedom):\n', options: { bold: true, color: C_TEXT, fontSize: 12.5 } },
      { text: 'Wprowadzenie pełnej dynamiki kątowej quadcoptera — kąty pochylenia (Pitch), przechylenia (Roll) i obrotu (Yaw).\n\n', options: { color: C_MUTED, fontSize: 11 } },

      { text: 'Import modelu 3D drona (.gltf / .glb):\n', options: { bold: true, color: C_TEXT, fontSize: 12.5 } },
      { text: 'Zastąpienie bryły prostopadłościanu fotorealistyczną siatką 3D drona z niezależnie animowanymi śmigłami.', options: { color: C_MUTED, fontSize: 11 } },
    ], {
      x: 7.133,
      y: 2.35,
      w: 5.1,
      h: 3.0,
    });

    // Dolny baner: Podziękowanie
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 5.7,
      w: 11.733,
      h: 1.3,
      rectRadius: 0.15,
      fill: { color: '161B2E' },
      line: { color: C_CYAN, width: 1 },
    });
    slide.addText('Dziękujemy za uwagę!', {
      x: 1.0,
      y: 5.85,
      w: 11.333,
      h: 0.45,
      fontSize: 20,
      fontFace: 'Arial',
      color: C_TEXT,
      bold: true,
      align: 'center',
    });
    slide.addText('Danylo Mikhnytskyi (284125)  •  Maksym Mahaz (284115)  •  Grafika Komputerowa i GUI', {
      x: 1.0,
      y: 6.35,
      w: 11.333,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      color: C_MUTED,
      align: 'center',
    });
  }

  // Zapisz plik
  const outputPath = path.resolve(__dirname, '../presentation.pptx');
  await pres.writeFile({ fileName: outputPath });
  console.log('✅ Prezentacja PPTX (8 slajdów) zapisana pomyślnie:', outputPath);
}

createPresentation().catch((err) => {
  console.error('❌ Błąd podczas generowania prezentacji:', err);
  process.exit(1);
});
