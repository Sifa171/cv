# CV-Webseite sifa-web.com – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zweisprachige CV-Webseite unter `sifa-web.com` mit durchgehendem Partikelsystem (Wolke → Cluster → Commit-Graph → Signal → Punkt), automatisch erzeugtem PDF-Lebenslauf und Deployment auf Cloudflare Workers.

**Architecture:** Astro erzeugt statisches HTML aus YAML-Inhalten (jeder Text `{de, en}`, per Zod geprüft). Ein Three.js-Skript legt nach dem ersten Rendern eine einzige Partikelwolke hinter den Inhalt und blendet scrollgesteuert zwischen vorberechneten Zielformen über. Ein Cloudflare Worker macht nur Sprach- und www-Weiterleitung und reicht alles andere an die Static Assets weiter.

**Tech Stack:** Node 26, npm, Astro 7.4, TypeScript, Three.js 0.186, Vitest, Playwright, @lhci/cli, Wrangler 4, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-23-cv-website-design.md` – vor jeder Aufgabe den betroffenen Abschnitt lesen.

## Global Constraints

- Node 26 (`.nvmrc`), Paketmanager npm, Abhängigkeiten mit exakten Versionen (`save-exact=true` in `.npmrc`).
- Sprachen `de` und `en`; jeder übersetzbare Text ist `{ de, en }`, fehlt einer → Build bricht ab.
- Abschnitts-IDs in beiden Sprachen gleich: `start`, `profile`, `career`, `projects`, `offduty`, `contact`.
- Farben: Hintergrund `#06070A`; Text `#ECEDF2`, Nebentext `#A4A8B5`, Labels `#7D8190`, Linien `#2A2D36`; Verlauf Cyan `#4FE3C1` → Indigo `#7B8CFF` → Violett `#C77DFF` nur im Akzentwort und in den Partikeln.
- Schriften Geist (300/400), Instrument Serif kursiv, Geist Mono – selbst gehostet über `@fontsource/*`; keine Anfrage an fremde Hosts (CSP nur `'self'`).
- Partikel: 40 000 Desktop, 12 000 Mobil (`(pointer: coarse)` oder Breite < 768 px); fps-Regler halbiert bei < 50 fps über 2 s, höchstens zweimal.
- Ohne WebGL oder bei `prefers-reduced-motion: reduce`: kein WebGL, Standbilder.
- PDF höchstens 2 Seiten A4, hell, ohne Partikel.
- Lighthouse Mobil: Performance ≥ 90, Barrierefreiheit/Best Practices/SEO ≥ 95.
- Kein Tracking, keine Cookies.
- Texte: nichts erfinden; Unbekanntes als `TODO(sebastian): <Frage>` markieren. Keine internen Red-Hat-Informationen (Kunden ohne öffentliche Referenz, Deal-Größen) – das Repo ist öffentlich.
- Impressum-Platzhalter als `PLATZHALTER(impressum-…)`; Deploy bricht ab, solange `TODO(sebastian)` oder `PLATZHALTER(` vorkommt.
- Cloudflare-Änderungen nur nach Bestätigung des Nutzers im Chat und mit Eintrag im Änderungsprotokoll von `~/development/it-env/cloudflare.md`. Geheimnisse nie ausgeben oder als Argument übergeben.
- Commits enden mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Schmale Bildschirme (375 px):** Commit-Graph, Diffs und lange Überschriften erzeugen keinen horizontalen Scroll – Test in Task 4 und Task 5.
2. **Sprachwechsel mit Anker:** Von `/de/#career` auf EN landet man auf `/en/#career`, nicht oben auf der Seite – Test in Task 3.
3. **Verschobene Anker:** Nach Fenstergröße-Änderung oder spätem Laden der Schriften liegen die Graph-Knoten weiter hinter den Commits – Test in Task 10.
4. **Ungewöhnliche `Accept-Language`-Header:** `*`, `DE-at`, kaputte `q`-Werte, leerer Header → keine Ausnahme, sinnvolle Sprache – Test in Task 12.
5. **Unvollständige Datensätze:** Station ohne Ort, ohne Diff-Zeilen oder ohne Ende; Projekt ohne Link → kein „undefined“, keine leeren Klammern – Test in Task 2 (Render-Helfer) und Task 5.

## Ablauf und Abhängigkeiten

Tasks 1–7 bauen die Seite ohne Partikel (vollständig nutzbar). Tasks 8–11 legen das Partikelsystem darüber. Tasks 12–13 bereiten Auslieferung und CI vor. Task 14 richtet Cloudflare ein (Bestätigung nötig), Task 15 ist der Livegang (blockiert durch Impressum und Textfreigabe).

---

### Task 1: Projekt-Grundgerüst

**Files:**
- Create: `package.json`, `.nvmrc`, `.npmrc`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Base.astro`, `src/pages/[lang]/index.astro`, `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: npm-Skripte `dev`, `build` (nur `astro build`, Nachbearbeitung kommt in Task 6/11), `preview`, `check` (`astro check && tsc --noEmit`), `test` (Vitest), `test:e2e` (Playwright gegen `astro preview` auf Port 4321). `Base.astro` mit Props `{ lang: 'de'|'en'; title: string; description: string }` und `<slot/>`. CSS-Variablen in `tokens.css`: `--bg`, `--text`, `--text-2`, `--label`, `--line`, `--cyan`, `--indigo`, `--violet`, `--font-sans`, `--font-serif`, `--font-mono`.

- [ ] **Step 1:** `npm create astro@latest` (leere Vorlage, TypeScript strict) im bestehenden Repo; dazu `three`, `@fontsource/geist`, `@fontsource/geist-mono`, `@fontsource/instrument-serif`, dev: `vitest`, `@playwright/test`, `wrangler`, `@lhci/cli`, `yaml`, `tsx`, `pdfjs-dist`, `sharp`. `astro.config.mjs`: `site: 'https://sifa-web.com'`, `trailingSlash: 'always'`, `i18n: { locales: ['de','en'], defaultLocale: 'de', routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false } }`.
- [ ] **Step 2: Failing test** `tests/e2e/smoke.spec.ts`: für `de` und `en` liefert `/{lang}/` Status 200, `<html lang>` gleich der Sprache, `body` hat berechnete Hintergrundfarbe `rgb(6, 7, 10)`, keine Netzwerkanfrage an einen anderen Host als `localhost`.
- [ ] **Step 3:** `npm run build && npm run test:e2e` → FAIL.
- [ ] **Step 4:** `tokens.css`/`base.css` mit den Werten aus Global Constraints, Schriften über `@fontsource`-Imports in `Base.astro`; `[lang]/index.astro` mit `getStaticPaths` für beide Sprachen und Platzhaltertext.
- [ ] **Step 5:** `npm run check && npm run build && npm run test:e2e` → PASS.
- [ ] **Step 6: Commit** `chore: Astro-Grundgerüst mit Tokens, Schriften und Tests`.

### Task 2: Inhaltsmodell und Inhaltsentwürfe

**Files:**
- Create: `src/lib/i18n.ts`, `src/lib/commit.ts`, `src/lib/headline.ts`, `src/lib/stats.ts`, `src/content.config.ts`, `src/content/profile.yaml`, `src/content/sections.yaml`, `src/content/roles/*.yaml` (8 Dateien), `src/content/projects/{katria,homelab,this-site}.yaml`, `src/content/offduty.yaml`
- Test: `tests/unit/i18n.test.ts`, `tests/unit/commit.test.ts`, `tests/unit/headline.test.ts`, `tests/unit/stats.test.ts`, `tests/unit/schema.test.ts`

**Interfaces:**
- Produces:
  - `type Lang = 'de' | 'en'`; `const LANGS: readonly Lang[]`; `const localized` (Zod: `{ de: string.min(1), en: string.min(1) }`); `t(v: { de: string; en: string }, lang: Lang): string`.
  - `commitHash(id: string): string` – erste 4 Hex-Zeichen von SHA-1(id).
  - `renderHeadline(text: string): string` – HTML-escaped; `*…*` → `<em class="accent">…</em>`, `` `…` `` → `<code>…</code>`.
  - `computeStats(roles: { start: string; company: string }[], today: Date): { uptimeYears: number; redhatYears: number; roleCount: number }` – volle Jahre, abgerundet.
  - Collections: `profile` (eine Datei: `name`, `title: localized`, `location: localized`, `summary: localized`, `skills: string[]`, `links: { linkedin: url, github: url }`, `portrait?: string`), `sections` (je Abschnitts-ID: `label: localized`, `headline: localized`, `intro?: localized`), `roles` (Schema aus Spec 4.2; `start`/`end` als `"YYYY-MM"`-String, `end: null` = aktuell, `location` optional, `diff` darf leer sein), `projects` (`id`, `name`, `summary: localized`, `url?`, `repo?`, `tags: string[]`), `offduty` (Liste: `id`, `label` (Monospace, nicht übersetzt), `title: localized`, `text: localized`).

- [ ] **Step 1: Failing tests:**
  - `t({de:'a',en:'b'},'en') === 'b'`.
  - `commitHash('redhat-ae')` ist 4 Zeichen `[0-9a-f]`, zweimal gleich, für `'viada-consultant'` anders.
  - `renderHeadline('Von `git init` zu *Enterprise-Deals.*')` === `'Von <code>git init</code> zu <em class="accent">Enterprise-Deals.</em>'`; `renderHeadline('<b>*x*')` enthält `&lt;b&gt;` und `<em class="accent">x</em>`; Text ohne Markup bleibt unverändert.
  - `computeStats(<die 8 Stationen aus Spec 2.3>, new Date('2026-10-23'))` → `{ uptimeYears: 15, redhatYears: 8, roleCount: 8 }`.
  - Schema: `localized.safeParse({ de: 'x' }).success === false`; Rollen-Schema akzeptiert eine Station ohne `location` und mit `diff: []`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Helfer und `content.config.ts` implementieren.
- [ ] **Step 4:** Inhalte anlegen. Stationen exakt nach Spec 2.3 (`branch`: `sag` für SPIE/SAG, `viada`, `redhat`). Überschriften in `sections.yaml`:

  | ID | de | en |
  |---|---|---|
  | start | `Jede Lösung beginnt mit einer einzigen *Zeile Code.*` | `Every solution begins with a single *line of code.*` |
  | profile | `Ich verkaufe Technik, die ich selbst *gebaut habe.*` | `I sell technology I have *built myself.*` |
  | career | ``Von `git init` zu *Enterprise-Deals.*`` | ``From `git init` to *enterprise deals.*`` |
  | projects | `Gebaut nach *Feierabend.*` | `Built *after hours.*` |
  | offduty | `Ausdauer im Wettkampf. Auftritt auf der *großen Bühne.*` | `Endurance on the course. Performing on the *big stage.*` |
  | contact | `Dein *Zug.*` | `Your *move.*` |

  Kurzprofil, Stations-Zusammenfassungen und Diff-Zeilen als Entwürfe in beiden Sprachen; jede nicht belegte Tatsache als `TODO(sebastian): …`. Station `redhat-ae` bekommt nur Rolle und `TODO(sebastian): Achievements – eigene Sitzung`. Off-Duty: Triathlon (Details `TODO(sebastian)`), Red Hat One 2026, MGM Grand Garden Arena, über 7 000 Teilnehmende (aus dem LinkedIn-Post).
- [ ] **Step 5:** `npm test && npm run build` → PASS (Build läuft auch mit TODOs).
- [ ] **Step 6: Commit** `feat: Inhaltsmodell, Helfer und Inhaltsentwürfe DE/EN`.

### Task 3: Seitenrahmen – Navigation, Sprachumschalter, Zähler, Fußzeile

**Files:**
- Create: `src/scene/types.ts`, `src/i18n/ui.ts`, `src/components/Nav.astro`, `src/components/SectionCounter.astro`, `src/components/DotNav.astro`, `src/components/Footer.astro`, `src/components/Section.astro`, `src/scripts/chrome.ts`
- Modify: `src/layouts/Base.astro`
- Test: `tests/e2e/chrome.spec.ts`

**Interfaces:**
- Consumes: `Lang`, `t`, `renderHeadline`, Collection `sections`.
- Produces: `ui(lang: Lang, key: UiKey): string`; `altPath(path: string, from: Lang, to: Lang): string` (bildet auch `impressum` ↔ `imprint`, `datenschutz` ↔ `privacy` ab); `Section.astro` Props `{ id: SectionId; index: number; scene: SceneId; lang: Lang }` rendert `<section id data-scene data-index>` mit Label `—— 0N · LABEL`, Überschrift (via `renderHeadline`) und `<slot/>`. `type SectionId = 'start'|'profile'|'career'|'projects'|'offduty'|'contact'`. In `src/scene/types.ts`: `type SceneId = 'cloud'|'cluster'|'graph'|'stream'|'pulse'|'point'|'notfound'` und `SCENE_OF: Record<SectionId, SceneId>` = `start→cloud`, `profile→cluster`, `career→graph`, `projects→stream`, `offduty→pulse`, `contact→point` (die Spec-Szene „signal“ ist damit in `stream` und `pulse` geteilt, damit zwischen Projekte und Off-Duty überblendet wird; `pulse` geht innerhalb des Abschnitts über `local` in das Spektrum über).

- [ ] **Step 1: Failing tests (beide Sprachen):** `<link rel="alternate" hreflang="de|en|x-default">` vorhanden und absolut; Sprachumschalter auf `/de/` zeigt auf `/en/`; nach Klick auf den Umschalter bei `/de/#career` ist die URL `/en/#career` (Review Focus 2); Nav enthält `⟨sd⟩`, Link „Lebenslauf ↓“/„Résumé ↓“ auf `/cv/sebastian-dehn-cv-{lang}.pdf`, LinkedIn- und GitHub-Links mit `rel="me noopener"`; Fußzeile verlinkt Impressum und Datenschutz der jeweiligen Sprache.
- [ ] **Step 2:** `npm run build && npm run test:e2e -- chrome` → FAIL.
- [ ] **Step 3:** Komponenten umsetzen. `chrome.ts` (kleines Skript): aktualisiert Abschnittszähler (`0N ——— LABEL` und `$ ready_` mit blinkendem Cursor per CSS) und Punktnavigation per `IntersectionObserver`; hängt beim Sprachwechsel den aktuellen Hash an. Ohne JavaScript funktionieren alle Links trotzdem.
- [ ] **Step 4:** Test → PASS.
- [ ] **Step 5: Commit** `feat: Seitenrahmen mit Sprachumschalter, Zähler und Punktnavigation`.

### Task 4: Abschnitte Start, Profil, Projekte, Off-Duty, Kontakt

**Files:**
- Create: `src/components/sections/{Hero,Profile,Projects,OffDuty,Contact}.astro`
- Modify: `src/pages/[lang]/index.astro`
- Test: `tests/e2e/sections.spec.ts`

**Interfaces:**
- Consumes: Collections, `computeStats`, `Section.astro`, `ui`.
- Produces: Porträt nur, wenn `profile.portrait` gesetzt ist (Astro `<Image>`, WebP, `alt` mit Name); im Profil je Skill ein Element `<li class="skill" data-skill="<Name>">` (Task 10 positioniert diese als Cluster-Labels; ohne Partikel normale Liste); Kennzahlen als `<dl>` im Befehlsstil (`uptime: 15y`, `red_hat: 8y`, `roles: 8`).

- [ ] **Step 1: Failing tests (beide Sprachen):** die sechs Abschnitte in der Reihenfolge `start…contact` vorhanden (Laufbahn zunächst leerer Platzhalter aus Task 5); Hero enthält Name und Titel; Profil enthält alle Skills aus `profile.yaml` und die Kennzahlen; Projekte enthalten Katria, Homelab, „diese Seite“ mit Repo-Link `https://github.com/Sifa171/cv`; Projekt ohne `url` rendert keinen leeren Link; **mit `javaScriptEnabled: false`** sind alle Texte sichtbar; bei Viewport 375×812 ist `document.documentElement.scrollWidth <= 375` (Review Focus 1); kein Text „undefined“ im Dokument.
- [ ] **Step 2:** → FAIL.
- [ ] **Step 3:** Abschnitte nach Spec 2.2 und Gestaltung 3.1 umsetzen (große dünne Überschriften, Monospace-Labels, Umriss-Pillen mit Pfeil).
- [ ] **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat: Abschnitte Start, Profil, Projekte, Off-Duty und Kontakt`.

### Task 5: Laufbahn als Commit-Graph mit Diffs

**Files:**
- Create: `src/components/sections/Career.astro`, `src/components/CommitGraph.astro`
- Modify: `src/pages/[lang]/index.astro`
- Test: `tests/e2e/career.spec.ts`

**Interfaces:**
- Consumes: Collection `roles`, `commitHash`, `t`.
- Produces: je Station `<li class="commit" data-commit="<hash>" data-branch="sag|viada|redhat">` mit einem Knoten-Element `.commit-node`; Task 10 nutzt die Mittelpunkte der `.commit-node`-Elemente als Anker. Reihenfolge: neueste oben, aktuelle Station mit `HEAD →`.

- [ ] **Step 1: Failing tests (beide Sprachen):** genau 8 `.commit`; oberste enthält `HEAD →` und „Account Executive“; jede Zeile zeigt Hash, Typ (`init`/`feat`/`merge` – `init` für die älteste, `merge` für den ersten Eintrag eines neuen Arbeitgebers, sonst `feat`), Titel, Jahr; Diff ist ein `<details>`, öffnet per Klick und per Tastatur (Tab bis `summary`, Enter); `+`-Zeilen haben Klasse `add`, `−`-Zeilen `remove`; Station mit `diff: []` zeigt keinen leeren Diff-Kasten; bei 375 px kein horizontaler Scroll, auch mit geöffnetem längsten Diff.
- [ ] **Step 2:** → FAIL.
- [ ] **Step 3:** Liste umsetzen; die Spuren (Branches) zeichnet ein schmales SVG neben der Liste mit festen Spalten je `branch`. Ohne Partikel ist das SVG die sichtbare Darstellung; Task 10 blendet es bei laufendem WebGL aus (`html.webgl .commit-graph-svg { opacity: 0 }`).
- [ ] **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat: Laufbahn als Commit-Graph mit aufklappbaren Diffs`.

### Task 6: Druckfassung, PDF und Release-Sperre

**Files:**
- Create: `src/pages/[lang]/cv.astro`, `src/styles/print.css`, `scripts/lib/preview.ts`, `scripts/build-pdf.ts`, `scripts/check-release.ts`
- Modify: `package.json` (Skripte `postbuild:pdf`, `release:check`; `build` = `astro build && tsx scripts/build-pdf.ts`)
- Test: `tests/unit/check-release.test.ts`, `tests/e2e/pdf.spec.ts`

**Interfaces:**
- Produces: `withPreview<T>(fn: (baseUrl: string) => Promise<T>): Promise<T>` – startet `astro preview` auf freiem Port, wartet auf 200, beendet danach (auch bei Fehler). `findBlockers(files: { path: string; text: string }[]): { path: string; line: number; text: string }[]` – findet `TODO(sebastian)` und `PLATZHALTER(`. PDFs unter `dist/cv/sebastian-dehn-cv-{de,en}.pdf`.

- [ ] **Step 1: Failing tests:**
  - Unit: `findBlockers` findet beide Muster mit richtiger Zeilennummer, ignoriert `TODO` ohne `(sebastian)`, liefert `[]` für sauberen Text.
  - E2E: beide PDFs existieren; per `pdfjs-dist` gelesen: ≤ 2 Seiten, enthalten „Sebastian Dehn“ und die Titel aller 8 Stationen; `/de/cv/` hat weißen Hintergrund und kein `<canvas>`.
- [ ] **Step 2:** → FAIL.
- [ ] **Step 3:** `cv.astro` nach Spec 3.1 (Druckfassung): hell, A4, Akzent Indigo, `@page { size: A4; margin: 16mm }`; Diffs immer ausgeklappt, ohne Spuren-SVG. `build-pdf.ts` nutzt `withPreview` + Playwright `page.pdf({ format: 'A4', printBackground: true })`. `check-release.ts` liest `src/content/**` und `src/pages/**`, gibt Treffer aus, Exit-Code 1 bei Treffern.
- [ ] **Step 4:** `npm run build && npm test && npm run test:e2e -- pdf` → PASS; `npm run release:check` → FAIL mit Liste der offenen TODOs (erwartet).
- [ ] **Step 5: Commit** `feat: Druckfassung, PDF-Erzeugung und Release-Sperre`.

### Task 7: Impressum, Datenschutz, 404

**Files:**
- Create: `src/pages/de/impressum.astro`, `src/pages/en/imprint.astro`, `src/pages/de/datenschutz.astro`, `src/pages/en/privacy.astro`, `src/pages/404.astro`
- Test: `tests/e2e/legal.spec.ts`

**Interfaces:**
- Consumes: `Base.astro`, `altPath`.
- Produces: `404.astro` enthält `<section data-scene="notfound">` (Task 10 belegt es mit Partikeln) und sichtbaren Text `404 Not Found` plus Links zu `/de/` und `/en/`.

- [ ] **Step 1: Failing tests:** alle vier Seiten 200 und gegenseitig per Sprachumschalter verbunden; Impressum enthält Name und den Platzhalter `PLATZHALTER(impressum-anschrift)`; Datenschutz nennt Cloudflare als Hoster, Server-Logs, „keine Cookies“; `/gibt-es-nicht/` unter `astro preview` zeigt die 404-Seite.
- [ ] **Step 2:** → FAIL.
- [ ] **Step 3:** Seiten umsetzen. Datenschutztext sachlich und kurz; bei rechtlichen Formulierungen `TODO(sebastian): bitte prüfen` setzen, wo eine Entscheidung des Nutzers nötig ist.
- [ ] **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat: Impressum, Datenschutz und 404-Seite`.

### Task 8: Scroll-Zuordnung

**Files:**
- Create: `src/scene/scroll.ts`
- Modify: `src/scene/types.ts`
- Test: `tests/unit/scroll.test.ts`

**Interfaces:**
- Produces:
  - `SceneId` aus Task 3
  - `interface SectionBox { scene: SceneId; top: number; height: number }`
  - `interface SceneState { current: SceneId; next: SceneId; morph: number; local: number }` – `morph` 0…1 Überblendung zur nächsten Szene, `local` 0…1 Position innerhalb des aktuellen Abschnitts.
  - `sceneAt(boxes: SectionBox[], scrollY: number, viewportH: number): SceneState`
  - Regel: Referenzlinie `scrollY + viewportH / 2`. `local` = Anteil der Linie im Abschnitt. `morph` = 0 bis `local` 0,7, dann linear auf 1 bei `local` 1. Letzter Abschnitt: `next === current`, `morph` 0.

- [ ] **Step 1: Failing tests** mit drei Boxen (`cloud` 0–1000, `cluster` 1000–2000, `graph` 2000–3000), `viewportH` 800: `scrollY` 0 → `cloud`, `morph` 0; Linie bei 850 → `local` 0,85, `morph` 0,5; Linie genau bei 1000 → `cluster`, `morph` 0; `scrollY` −200 (Overscroll) → `cloud`, `local` 0; Linie hinter dem Ende → `graph`, `local` 1, `morph` 0; gleiche Eingabe vorwärts und rückwärts → gleiches Ergebnis; leere Liste wirft einen sprechenden Fehler.
- [ ] **Step 2:** → FAIL. **Step 3:** umsetzen. **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat(scene): Zuordnung von Scrollposition zu Szene`.

### Task 9: Partikelformen

**Files:**
- Create: `src/scene/rng.ts`, `src/scene/shapes/{cloud,cluster,graph,signal,point,mask}.ts`, `src/scene/shapes/index.ts`
- Test: `tests/unit/shapes.test.ts`

**Interfaces:**
- Consumes: `types.ts`.
- Produces:
  - `mulberry32(seed: number): () => number`
  - `interface Bounds { width: number; height: number }` (Weltkoordinaten, Ursprung Mitte); `interface Anchor { x: number; y: number }`
  - Alle Formen: `(count: number, seed: number, bounds: Bounds, …) => Float32Array` mit Länge `count * 3`; x ∈ [−w/2, w/2], y ∈ [−h/2, h/2], z ∈ [−d, d] mit `d = min(w, h) / 4`.
  - `cloud(count, seed, bounds)`; `clusterNodes(n: number, seed: number, bounds: Bounds): Anchor[]` und `cluster(count, seed, bounds, nodes: Anchor[], edges: [number, number][])` – ca. 50 % der Punkte um Knoten, 30 % auf Kanten, 20 % Streuung; `graph(count, seed, bounds, anchors: Anchor[], lanes: number[])` – Knoten an den Ankern, Kanten entlang der Spuren; `signalStream`, `signalPulse`, `signalSpectrum` `(count, seed, bounds)` – Linie über die volle Breite mit der jeweiligen Kurve (Puls: EKG-Zacke alle ~1/6 Breite; Spektrum: Balkenhüllkurve); `point(count, seed, bounds)` – alle Punkte im Radius `min(w,h)/200` um (0,0); `fromMask(count, seed, bounds, mask: { width: number; height: number; alpha: Uint8ClampedArray })` – Punkte nur auf Pixeln mit Alpha > 128.
  - `SHAPES` in `index.ts`: Zuordnung `SceneId` → Fabrikfunktion; `stream` → `signalStream`; `pulse` liefert zwei Puffer (`signalPulse`, `signalSpectrum`), zwischen denen die Engine über `local` überblendet; `notfound` → `fromMask`.

- [ ] **Step 1: Failing tests** (für jede Form mit `count` 1000, `seed` 7, Bounds 16×9): Länge 3000; alle Koordinaten im Rahmen; zwei Aufrufe gleich; anderer Seed anders; `graph`: zu jedem Anker liegen ≥ 20 Punkte im Radius 0,2; `cluster`: Anzahl Knoten von `clusterNodes(8, …)` ist 8, alle im Rahmen, Mindestabstand zueinander ≥ 10 % der Breite; `fromMask` mit 4×4-Maske, nur Pixel (1,1) gesetzt → alle Punkte in dessen Zelle; `count` 0 → leeres Array.
- [ ] **Step 2:** → FAIL. **Step 3:** umsetzen. **Step 4:** → PASS.
- [ ] **Step 5: Commit** `feat(scene): Partikelformen als reine Funktionen`.

### Task 10: Partikel-Engine, Shader und Einbindung

**Files:**
- Create: `src/scene/governor.ts`, `src/scene/capability.ts`, `src/scene/morph.vert.glsl`, `src/scene/morph.frag.glsl`, `src/scene/engine.ts`, `src/scene/anchors.ts`, `src/scene/main.ts`, `src/components/SceneCanvas.astro`
- Modify: `src/layouts/Base.astro`, `src/components/sections/Profile.astro` (Labels positionierbar)
- Test: `tests/unit/governor.test.ts`, `tests/unit/capability.test.ts`, `tests/e2e/scene.spec.ts`

**Interfaces:**
- Consumes: `sceneAt`, `SHAPES`, `clusterNodes`, `.commit-node` (Task 5), `.skill` (Task 4), `section[data-scene]` (Task 3/7).
- Produces:
  - `interface GovernorState { count: number; halvings: number; lowSince: number | null }`; `govern(state: GovernorState, fps: number, nowMs: number): GovernorState`.
  - `shouldRunWebGL(env: { hasWebGL: boolean; reducedMotion: boolean }): boolean`; `initialCount(env: { coarsePointer: boolean; width: number }): 40000 | 12000`.
  - `measureAnchors(selector: string, toWorld: (x: number, y: number) => Anchor): Anchor[]`.
  - `mountScene(root: HTMLElement): () => void` in `main.ts` (gibt Aufräumfunktion zurück); setzt `html.webgl`, wenn es läuft, sonst `html.no-webgl`.
  - Testhaken: `window.__cvScene = { anchorsVersion: number; count: number }` nur wenn `import.meta.env.MODE !== 'production'` oder URL-Parameter `?debug=1`.
  - URL-Parameter `?scene=<SceneId>&still=1`: rendert genau ein Standbild dieser Szene ohne Animation (für Task 11).

- [ ] **Step 1: Failing unit tests:**
  - `govern`: fps 60 → unverändert; fps 40 ab t=0, Aufruf bei t=1999 → unverändert, bei t=2000 → `count` halbiert, `halvings` 1, `lowSince` zurückgesetzt; nach zwei Halbierungen keine dritte; fps zwischendurch ≥ 50 setzt `lowSince` auf `null`.
  - `shouldRunWebGL`: nur `{true,false}` → true. `initialCount`: `coarsePointer` oder `width` < 768 → 12000, sonst 40000.
- [ ] **Step 2:** → FAIL. **Step 3:** `governor.ts`, `capability.ts` umsetzen. **Step 4:** → PASS.
- [ ] **Step 5: Failing e2e tests:** normaler Aufruf → genau ein `<canvas aria-hidden="true">`, `html.webgl`; mit `reducedMotion: 'reduce'` → kein Canvas, `html.no-webgl`; Viewport von 1280 auf 800 Breite ändern → `__cvScene.anchorsVersion` steigt (Review Focus 3); nach `document.fonts.ready` wurde mindestens einmal neu gemessen; Konsole ohne Fehler; Profil-Skills bleiben als Text lesbar und klickbar.
- [ ] **Step 6:** → FAIL.
- [ ] **Step 7:** Engine umsetzen: `THREE.Points` mit `BufferGeometry`-Attributen `aFrom`, `aTo` (je Szene ein Puffer, beim Szenenwechsel getauscht), Uniforms `uMorph`, `uTime`, `uPointer`, `uPointerStrength` (0 bei `(pointer: coarse)`), Farbe pro Partikel aus dem Verlauf Cyan → Indigo → Violett; additive Mischung. Szene `graph`: Anker aus `measureAnchors('.commit-node', …)`, Wachstum über `local`; Szene `pulse`: Überblendung Puls → Spektrum über `local` (ab 0,5). Szene `notfound`: Maske aus einem Offscreen-Canvas mit dem Text `404` in Geist Mono erzeugen und an `fromMask` geben. Cluster-Labels: `.skill`-Elemente werden bei laufendem WebGL absolut über den `clusterNodes`-Positionen platziert. Neu messen bei `resize` (entprellt 150 ms) und nach `document.fonts.ready`. `main.ts` wird in `Base.astro` per `<script>` mit dynamischem Import nach `requestIdleCallback` geladen. Pausiert bei `visibilitychange` (hidden).
- [ ] **Step 8:** → PASS; zusätzlich manuell im Browser (Desktop 1440×900 und Mobil 375×812) durchscrollen, Screenshots jeder Szene ablegen unter `docs/screenshots/` und dem Nutzer zeigen.
- [ ] **Step 9: Commit** `feat(scene): Partikel-Engine mit Morph-Shader, fps-Regler und Ankern`.

### Task 11: Standbilder als Rückfall

**Files:**
- Create: `scripts/render-fallbacks.ts`, `src/styles/fallback.css`
- Modify: `package.json` (`build` = `astro build && tsx scripts/render-fallbacks.ts && tsx scripts/build-pdf.ts`), `src/layouts/Base.astro`
- Test: `tests/e2e/fallback.spec.ts`

**Interfaces:**
- Consumes: `withPreview`, `?scene=<id>&still=1` (Task 10).
- Produces: `dist/fallback/{cloud,cluster,graph,stream,pulse,point,notfound}.webp` (1600×900, Qualität 80, per `sharp` aus Playwright-PNG); CSS hängt sie bei `html.no-webgl` und `@media (prefers-reduced-motion: reduce)` als Hintergrund an `section[data-scene=<id>]`.

- [ ] **Step 1: Failing test:** mit `reducedMotion: 'reduce'` hat `section[data-scene=cloud]` ein `background-image` mit `/fallback/cloud.webp`, die Datei liefert 200 und ist < 200 KB; Gleiches für `cluster`, `graph`, `stream`, `pulse`.
- [ ] **Step 2:** → FAIL. **Step 3:** umsetzen. **Step 4:** `npm run build && npm run test:e2e -- fallback` → PASS.
- [ ] **Step 5: Commit** `feat: vorgerenderte Standbilder für reduzierte Bewegung und ohne WebGL`.

### Task 12: Worker, Header und Wrangler-Konfiguration

**Files:**
- Create: `worker/index.ts`, `worker/lang.ts`, `public/_headers`, `wrangler.jsonc`, `scripts/smoke.sh`
- Test: `tests/unit/worker.test.ts`, `tests/unit/lang.test.ts`

**Interfaces:**
- Produces: `preferredLang(header: string | null): Lang`; Worker `export default { fetch(request: Request, env: { ASSETS: Fetcher }): Promise<Response> }`; `scripts/smoke.sh <base-url> [--prod]` mit Exit-Code ≠ 0 bei jedem Fehlschlag.

- [ ] **Step 1: Failing tests:**
  - `preferredLang`: `'de'` → de; `'de-DE,de;q=0.9,en;q=0.8'` → de; `'en;q=0.9, de;q=0.8'` → en; `'DE-at'` → de; `'fr'` → en; `null` und `''` → en; `'*'` → en; `'de;q=abc, en'` → en (kaputter q-Wert zählt als 0); `'en;q=0, de'` → de.
  - Worker: `GET https://sifa-web.com/` mit `de` → 302 `Location: /de/`, `Vary: Accept-Language`; `GET https://www.sifa-web.com/en/?a=1` → 301 `https://sifa-web.com/en/?a=1`; `GET https://sifa-web.com/de/` → Antwort von `env.ASSETS.fetch` unverändert durchgereicht (Mock).
- [ ] **Step 2:** → FAIL. **Step 3:** umsetzen; `wrangler.jsonc` exakt nach Spec 4.3 (`name: "cv"`, `main: "worker/index.ts"`, `compatibility_date` = Tag der Umsetzung, `assets` mit `directory: "./dist"`, `binding: "ASSETS"`, `not_found_handling: "404-page"`, `run_worker_first: true`, `workers_dev: false`, keine `routes`). `_headers` exakt nach Spec 4.4; CSP so eng, dass die Seite mit Three.js läuft (`script-src 'self'`; Astro-Inline-Skripte vermeiden oder per Hash erlauben – im Test prüfen, dass die Konsole keine CSP-Verstöße meldet). `smoke.sh` nach Spec 5.4 (`--prod` schaltet die Prüfungen von `http://`, `www` und `status.sifa-web.com` zu).
- [ ] **Step 4:** → PASS; zusätzlich `npm run build && npx wrangler dev` und `scripts/smoke.sh http://localhost:8787` → PASS; in Playwright gegen `wrangler dev` keine CSP-Fehler in der Konsole.
- [ ] **Step 5: Commit** `feat: Worker für Sprach- und www-Weiterleitung, Header, Wrangler-Konfiguration`.

### Task 13: GitHub-Repo und CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `lighthouserc.json`, `README.md`

**Interfaces:**
- Consumes: npm-Skripte aus Tasks 1–12, `scripts/smoke.sh`, `release:check`.

- [ ] **Step 1:** `lighthouserc.json`: `staticDistDir: "./dist"`, URLs `/de/` und `/en/`, mobiles Profil, Assertions nach Global Constraints (`categories:performance` ≥ 0.9, die drei anderen ≥ 0.95, jeweils `error`).
- [ ] **Step 2:** `ci.yml` (pull_request): Node aus `.nvmrc`, `npm ci`, `npx playwright install --with-deps chromium`, `npm run check`, `npm test`, `npm run build`, `npm run test:e2e`, `npx lhci autorun`.
- [ ] **Step 3:** `deploy.yml` (push auf `main`, `concurrency: deploy`): wie CI, dann `npm run release:check`, `npx wrangler deploy` mit `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` aus Secrets, danach `scripts/smoke.sh https://sifa-web.com --prod`. Solange keine Custom Domain hängt (vor Task 15), Rauchprobe überspringen: Schritt nur, wenn Repo-Variable `LIVE == 'true'`.
- [ ] **Step 4:** `README.md`: Zweck, lokale Befehle, wo Inhalte gepflegt werden, Ablauf des Deploys, Verweis auf Spec.
- [ ] **Step 5:** Lokal `act` ist nicht nötig; stattdessen alle Befehle aus `ci.yml` nacheinander lokal ausführen → alle grün (Lighthouse-Werte notieren).
- [ ] **Step 6: Commit** `ci: Workflows für Prüfung, Lighthouse und Deploy`.
- [ ] **Step 7:** Repo anlegen und pushen: `gh repo create Sifa171/cv --public --source . --push`; Branch-Schutz nicht nötig. Prüfen: `gh repo view Sifa171/cv --json visibility` → `PUBLIC`.
- [ ] **Step 8:** Einen Test-PR mit einer kleinen README-Änderung öffnen und prüfen, dass `ci.yml` grün läuft; danach mergen. (Der Deploy-Workflow schlägt bis Task 14 am fehlenden Secret fehl und am `release:check` – erwartet.)

### Task 14: Cloudflare-Einrichtung (je Schritt Bestätigung des Nutzers)

**Files:**
- Modify: `~/development/it-env/cloudflare.md` (Änderungsprotokoll, Ressourcen-Tabelle)

Konstanten: Account `af72cf9af657a4840e3638c074c43946`, Zone `896e50968ff4e4031ef1df843b9ed3c9`, Ruleset `5315dddc18374835b86b852938ab2645` (Phase `http_request_cache_settings`). Werkzeuge `cf`, `cf-api`. Vor jedem schreibenden Schritt dem Nutzer genau sagen, was passiert, und auf ein Ja warten.

- [ ] **Step 1 (lesend):** Permission-Group-ID für „Workers Scripts Write“ ermitteln (`cf-api GET /accounts/$A/tokens/permission_groups`); DNS der Zone prüfen: keine A/AAAA/CNAME für `sifa-web.com` und `www.sifa-web.com`.
- [ ] **Step 2 (Bestätigung):** Kontogebundenes Token `cv_deploy` anlegen (`POST /accounts/$A/tokens`, einzige Policy: Workers Scripts Write auf `com.cloudflare.api.account.$A`). Den Token-Wert aus der Antwort direkt per Pipe in `gh secret set CLOUDFLARE_API_TOKEN -R Sifa171/cv` geben, ohne Ausgabe und ohne Zwischendatei; `gh secret set CLOUDFLARE_ACCOUNT_ID` mit der Account-ID. Prüfen: `gh secret list -R Sifa171/cv` zeigt beide.
- [ ] **Step 3 (Bestätigung):** Erster Deploy lokal: `npm run build && CLOUDFLARE_ACCOUNT_ID=$A cf deploy`. Prüfen: `cf-api GET /accounts/$A/workers/scripts` enthält `cv`; keine Domain hängt (`/workers/domains` leer).
- [ ] **Step 4 (Bestätigung):** Cache-Regel in Ruleset `5315dddc…` anlegen: Ausdruck `(http.host eq "sifa-web.com")`, Aktion `set_cache_settings`, `browser_ttl: { mode: "respect_origin" }`, Beschreibung „CV-Seite: Cache-Header des Workers respektieren“. Stand des Rulesets vorher im Scratchpad sichern.
- [ ] **Step 5:** Deploy aus GitHub prüfen: Workflow `deploy.yml` manuell neu starten → bis `wrangler deploy` grün, sofern `release:check` grün ist; sonst nur bestätigen, dass der Abbruch am `release:check` liegt.
- [ ] **Step 6:** Einträge im Änderungsprotokoll von `it-env/cloudflare.md` (Datum, Anweisung des Nutzers, Token-ID ohne Wert, Worker `cv`, Regel-ID, Prüfergebnisse) und in der Ressourcen-Tabelle; in `it-env` committen.

### Task 15: Livegang (blockiert durch Impressum-Adresse und Textfreigabe)

**Voraussetzungen:** Nutzer hat den Impressum-Dienst gewählt und die c/o-Adresse geliefert; alle `TODO(sebastian)` sind beantwortet; `npm run release:check` ist grün; der Nutzer hat die Screenshots (Desktop, Mobil, DE, EN) gesehen und freigegeben.

- [ ] **Step 1:** Platzhalter ersetzen, `release:check` → grün, Commit `content: Freigegebene Texte und Impressum`, Push → `deploy.yml` grün.
- [ ] **Step 2 (Bestätigung):** Custom Domains anhängen: `PUT /accounts/$A/workers/domains` je für `sifa-web.com` und `www.sifa-web.com` mit `service: "cv"`, `zone_id`, `environment: "production"`. Warten, bis das Zertifikat aktiv ist.
- [ ] **Step 3:** `scripts/smoke.sh https://sifa-web.com --prod` → alles grün; Repo-Variable `LIVE=true` setzen (`gh variable set LIVE -b true -R Sifa171/cv`).
- [ ] **Step 4:** Abschließende Sichtprüfung auf der echten Domain (Desktop und Mobil, DE und EN), PDF-Download prüfen; Screenshots an den Nutzer.
- [ ] **Step 5:** Änderungsprotokoll in `it-env/cloudflare.md` (Custom Domains, angelegte DNS-Einträge, Prüfergebnisse) und Zonen-Zeile in der Ressourcen-Tabelle aktualisieren; committen.
