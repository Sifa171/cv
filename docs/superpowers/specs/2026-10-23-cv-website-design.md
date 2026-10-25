# CV-Webseite sifa-web.com – Design

- **Datum:** 2026-10-23
- **Status:** Entwurf zur Freigabe
- **Repo:** `Sifa171/cv` (öffentlich, noch anzulegen), lokal `~/development/cv`

## 1. Ziel und Rahmen

Eine persönliche Webseite unter `sifa-web.com`, die zwei Zwecke erfüllt:

1. **Digitale Visitenkarte:** Wer ist Sebastian Dehn, was macht er, wo findet man ihn.
2. **Vollständiger Lebenslauf**, auch für Bewerbungen, inklusive PDF-Download.

**Zielgruppe:** Recruiter und künftige Arbeitgeber, Kunden und Partner, berufliches Netzwerk.

**Kernaussage:** Der seltene Weg vom Entwickler über Consultant und Solution Architect in den Vertrieb – ein Techniker, der Technik verkauft, die er versteht.

**Erfolgskriterien:**

- Inhalt vollständig in Deutsch und Englisch, aus einer Quelle gepflegt.
- Die Seite wirkt technisch und futuristisch, bleibt aber für Recruiter ohne Umweg lesbar (auch ohne JavaScript).
- PDF-Lebenslauf (DE/EN) entsteht automatisch aus denselben Daten.
- Lighthouse (Mobil): Performance ≥ 90; Barrierefreiheit, Best Practices, SEO ≥ 95.
- Kein Tracking, keine Cookies, kein Cookie-Banner.

**Entscheidungen des Nutzers (Brainstorming 2026-10-23):**

| Thema | Entscheidung |
|---|---|
| Zweck | Visitenkarte und vollständiger CV |
| Sprache | Deutsch und Englisch mit Umschalter |
| Persönliches | Eigene Projekte, Sport/Triathlon, Musik/Bühne |
| Kontakt | Nur Links zu LinkedIn und GitHub; keine E-Mail, kein Telefon, kein Formular |
| PDF | Ja, automatisch beim Build erzeugt |
| Stil | Angelehnt an kounex.com, mit eigenen Tech-Elementen; Kombination aus Partikel-Cluster, Commit-Graph und Signal-Linie |
| Technik | Astro + Three.js, Inhalt als Daten, Cloudflare Workers (Static Assets) |
| Impressum | Variante b: Impressum mit c/o-Adresse über einen Impressum-Dienst (Dienst wählt der Nutzer) |
| Repo | Öffentlich |

**Außerhalb des Umfangs:** Blog, CMS, Kontaktformular, Analytics-Skript, Kommentarfunktion.

## 2. Inhalt und Aufbau

### 2.1 Seiten

| Pfad | Inhalt |
|---|---|
| `/` | Weiterleitung (302) nach `/de/` bei `Accept-Language` mit Deutsch als bevorzugter Sprache, sonst `/en/` |
| `/de/`, `/en/` | Onepage mit sechs Abschnitten (2.2) |
| `/de/cv/`, `/en/cv/` | Helle, schlichte Druckfassung des Lebenslaufs; Quelle für das PDF |
| `/de/impressum/`, `/en/imprint/` | Impressum mit c/o-Adresse |
| `/de/datenschutz/`, `/en/privacy/` | Datenschutzerklärung (Cloudflare als Hoster, Server-Logs, keine Cookies, keine Drittanbieter) |
| `/cv/sebastian-dehn-cv-de.pdf`, `…-en.pdf` | PDF-Lebenslauf |
| 404 | Eigene Seite; Partikel zerfallen zu `404 Not Found` |

Jede Seite verlinkt ihre Gegenstücke in der anderen Sprache (`hreflang`, Sprachumschalter oben rechts).

### 2.2 Abschnitte der Onepage

| # | Abschnitt | Partikelszene | Inhalt |
|---|---|---|---|
| 00 | Start | Wolke | Name, Rolle (Account Executive, Red Hat), eine Kernaussage mit Akzentwort, Buttons „Lebenslauf ↓“ (PDF), LinkedIn, GitHub |
| 01 | Profil | Cluster | Kurzprofil (3–4 Sätze), Kennzahlen im Befehlszeilen-Stil (z. B. `uptime: 15y`), Skills als beschriftete Cluster-Knoten, optional Porträt |
| 02 | Laufbahn | Commit-Graph | 8 Stationen als Commits; Klick öffnet einen „Diff“ mit Aufgaben, Ergebnissen, Technologien |
| 03 | Projekte | Signal: Datenstrom | Katria (katria.app), Homelab, diese Seite (Link aufs Repo) |
| 04 | Off-Duty | Signal: Puls → Spektrum | Triathlon; Musik und Auftritt bei Red Hat One 2026 (MGM Grand Garden Arena) |
| 05 | Kontakt | Signal endet in einem Punkt | „Dein Zug“: LinkedIn, GitHub, PDF |

Fußzeile auf allen Seiten: Sprachumschalter, Impressum, Datenschutz.

### 2.3 Stationen (aus LinkedIn, Stand 2026-10-23)

| Zeitraum | Rolle | Arbeitgeber | Ort |
|---|---|---|---|
| seit 10/2023 | Account Executive – Commercial Germany | Red Hat | Deutschland, remote |
| 01/2023 – 09/2023 | Solution Architect – Commercial Germany | Red Hat | München, remote |
| 12/2019 – 12/2022 | Solution Architect Partner Enablement | Red Hat | |
| 01/2018 – 11/2019 | Consultant | Red Hat | |
| 10/2015 – 12/2017 | Consultant | Viada GmbH & Co. KG | Ruhrgebiet |
| 01/2015 – 10/2015 | Software Developer | SPIE (SAG) | Dortmund |
| 08/2012 – 01/2015 | Auszubildender Softwareentwickler | SPIE (SAG) | |
| 08/2011 – 08/2012 | Werkstudent | SPIE (SAG) | Ruhrgebiet |

**Weitere Daten:** Wohnort Dortmund. Studium Informationstechnik, Westfälische Hochschule, 2011–2012, ohne Abschluss. Skills laut LinkedIn: OpenShift, Kubernetes, Docker, Red Hat Enterprise Linux, Ansible, Java, Shell-Scripting, DevOps. Sprachen: Deutsch (Muttersprache), Englisch (verhandlungssicher). Zertifikate (Red Hat Cloud Services: Seller, Red Hat OpenShift: Seller) sind seit 08/2025 abgelaufen und werden nicht gezeigt.

### 2.4 Texte

- LinkedIn enthält keine Stationsbeschreibungen und keinen Profiltext. Claude schreibt Entwürfe; unbekannte Fakten werden **nicht erfunden**, sondern im Entwurf als offene Frage markiert (`TODO(sebastian): …`) und vom Nutzer beantwortet.
- Die Achievements der aktuellen Rolle werden separat mit dem Nutzer erarbeitet; bis dahin zeigt der Diff dieser Station nur die Rolle.
- **Öffentliches Repo:** Keine internen Informationen (Kundennamen ohne öffentliche Referenz, Deal-Größen, Interna von Red Hat) in Inhalten, Entwürfen oder Commit-Historie. Öffentlich bekannte Referenzen (z. B. die Pressemitteilung zu ROSSMANN und Azure Red Hat OpenShift) sind erlaubt, wenn der Nutzer sie freigibt.
- Ein Build darf mit offenen `TODO(sebastian)` laufen, ein Deploy auf die Domain nicht (Prüfung im Deploy-Workflow).

## 3. Gestaltung

### 3.1 Visuelles System

Vorbild ist kounex.com: fast schwarzer Hintergrund, Partikelsystem, große dünne Typografie, ein kursives Serifen-Akzentwort mit Verlauf pro Überschrift, nummerierte Monospace-Labels, Abschnittszähler unten links, Punktnavigation rechts, Erzählung über das Scrollen.

| Element | Wert |
|---|---|
| Hintergrund | `#06070A` |
| Text | `#ECEDF2`, Nebentext `#A4A8B5`, Labels `#7D8190`, Linien `#2A2D36` |
| Signal-Verlauf | Cyan `#4FE3C1` → Indigo `#7B8CFF` → Violett `#C77DFF`; nur im Akzentwort und in den Partikeln |
| Schrift Text/Überschriften | Geist (300/400) |
| Schrift Akzentwort | Instrument Serif, kursiv |
| Schrift Labels/Tech | Geist Mono |
| Buttons | Umriss als Pille, 0,5 px, mit Pfeil |

Alle Schriften sind selbst gehostet (keine Anfragen an Dritte).

**Eigene Tech-Elemente:** blinkender Cursor `$ ready_` im Abschnittszähler; Kennzahlen als Befehlsausgaben; Laufbahn als `git log` mit Commit-Hashes; Diffs mit `+`/`−`-Zeilen; Logo `⟨sd⟩`.

**Druckfassung (`/cv/`) und PDF:** hell, schwarz auf weiß, Geist und Geist Mono, Akzentfarbe Indigo, höchstens 2 Seiten A4, ohne Partikel.

### 3.2 Partikelsystem

- **Eine** Partikelwolke (Three.js, `THREE.Points` mit eigenem Shader) für die ganze Seite, fixiert hinter dem Inhalt.
- Für jede Szene liegt ein **Ziel-Positionspuffer** bereit. Ein Shader blendet zwischen dem Puffer der aktuellen und der nächsten Szene über; der Überblendungsgrad hängt direkt an der Scrollposition (rückwärts scrollen = rückwärts verwandeln).
- **Szenen:**
  1. `cloud` – lose Wolke, langsam rotierend
  2. `cluster` – Knoten (Skills) mit Kanten aus Partikeln; Knotennamen als HTML-Labels darüber
  3. `graph` – Commit-Graph; Knoten liegen exakt hinter den HTML-Commit-Einträgen (Positionen aus dem DOM, bei Größen- und Layoutänderung neu berechnet); erscheint per Überblendung als Ganzes (Wachstum beim Scrollen am 2026-10-25 vom Nutzer gestrichen)
  4. `signal` – horizontale Linie, die von Datenstrom über Puls zu Audiospektrum wechselt (Unterzustände per Scrollfortschritt)
  5. `point` – alle Partikel laufen in einem Punkt zusammen
  6. `notfound` – nur auf der 404-Seite: Partikel bilden `404`
- **Interaktion:** Cursor verdrängt Partikel sanft (nicht auf Touchgeräten).
- **Budget:** ca. 40 000 Partikel (Desktop), ca. 12 000 (Mobil). Ein fps-Regler halbiert die Anzahl, wenn über 2 s weniger als 50 fps erreicht werden (höchstens zweimal).
- **Rückfall:** Ohne WebGL oder bei `prefers-reduced-motion: reduce` wird kein WebGL gestartet; jede Szene zeigt ein beim Build vorgerendertes Standbild (WebP) als Hintergrund. Der Inhalt ist in jedem Fall normales HTML.
- Das Partikel-Skript lädt nach dem ersten Rendern und blockiert den Inhalt nie. Das Canvas ist `aria-hidden`.

## 4. Architektur

### 4.1 Struktur

```
cv/
├─ src/
│  ├─ content/
│  │  ├─ profile.yaml       Name, Kernaussage, Kurzprofil, Skills, Kennzahlen, Links
│  │  ├─ roles/*.yaml       eine Datei pro Station (Commit), inkl. Diff-Zeilen
│  │  ├─ projects/*.yaml    Katria, Homelab, diese Seite
│  │  └─ offduty.yaml       Triathlon, Musik
│  ├─ content.config.ts     Zod-Schemas der Collections
│  ├─ i18n/ui.ts            UI-Texte (Labels, Buttons) DE/EN
│  ├─ pages/[lang]/         index.astro, cv.astro, Impressum, Datenschutz
│  ├─ pages/404.astro
│  ├─ components/           ein Baustein pro Abschnitt (Hero, Profile, Timeline, Projects, OffDuty, Contact) und gemeinsame Teile
│  └─ scene/
│     ├─ engine.ts          Renderer, Render-Schleife, fps-Regler, Rückfall-Erkennung
│     ├─ shapes/*.ts        reine Funktionen: (anzahl, seed, rahmen[, anker]) → Float32Array
│     ├─ morph.vert/.frag   Shader für die Überblendung
│     └─ scroll.ts          Scrollposition → { szene, nächsteSzene, fortschritt }
├─ worker/index.ts          Sprachweiterleitung auf `/`, 301 www → Hauptdomain
├─ scripts/
│  ├─ build-pdf.ts          Playwright druckt /de/cv/ und /en/cv/ als PDF
│  └─ render-fallbacks.ts   Playwright rendert je Szene ein Standbild
├─ public/
│  ├─ fonts/
│  └─ _headers              Sicherheits- und Cache-Header
├─ tests/                   unit/ (Vitest), e2e/ (Playwright)
├─ wrangler.jsonc
└─ .github/workflows/       ci.yml (PR), deploy.yml (main)
```

### 4.2 Inhaltsmodell

Jeder übersetzbare Text ist ein Paar `{ de: string, en: string }`. Die Zod-Schemas erzwingen beide Sprachen; fehlt eine, bricht der Build ab.

`roles/*.yaml` (Beispielschema):

```yaml
id: redhat-ae             # zugleich Basis für den angezeigten Commit-Hash
company: Red Hat
title: { de: Account Executive – Commercial Germany, en: Account Executive – Commercial Germany }
start: 2023-10
end: null                 # null = aktuell (HEAD)
location: { de: Deutschland, remote, en: Germany, remote }
branch: redhat            # Spur im Commit-Graph: sag | viada | redhat
summary: { de: …, en: … }
diff:                     # Zeilen im Diff
  - { type: add, de: …, en: … }
  - { type: remove, de: …, en: … }
tech: [OpenShift, Ansible]
```

Der Commit-Hash ist deterministisch aus der `id` abgeleitet (erste 4 Hex-Zeichen von SHA-1).

### 4.3 Sprachweiterleitung (Worker)

Der Worker läuft vor jeder Anfrage und bearbeitet nur zwei Fälle; alles andere reicht er unverändert an die Static Assets weiter (`env.ASSETS.fetch(request)`):

- Host `www.sifa-web.com` → 301 auf `https://sifa-web.com` + Pfad + Query.
- Pfad `/` → 302 auf `/de/`, wenn im `Accept-Language`-Header Deutsch höher gewichtet ist als Englisch (oder nur Deutsch vorkommt), sonst `/en/`; `Vary: Accept-Language`.

`wrangler.jsonc`: `assets.directory = ./dist`, `assets.binding = "ASSETS"`, `assets.not_found_handling = "404-page"`, `assets.run_worker_first = true`, `workers_dev = false`, **keine** `routes` (die Custom Domains werden einmalig per API angehängt, siehe 5.2). Kosten: Jede Anfrage startet den Worker; das Freikontingent (100 000 Anfragen/Tag) reicht bei Weitem.

### 4.4 Header (`public/_headers`)

- Alle Seiten: `Content-Security-Policy` (nur `'self'`; keine externen Quellen), `Strict-Transport-Security: max-age=31536000`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` (Kamera, Mikrofon, Standort aus).
- HTML: `Cache-Control: no-cache`.
- Dateien mit Hash im Namen (`/_astro/*`) und Schriften: `Cache-Control: public, max-age=31536000, immutable`.
- PDFs: `Cache-Control: public, max-age=3600`.

### 4.5 Build

1. `astro build` → `dist/`
2. `render-fallbacks` → `dist/fallback/<szene>.webp`
3. `build-pdf` (gegen `astro preview`) → `dist/cv/sebastian-dehn-cv-de.pdf`, `…-en.pdf`
4. `wrangler deploy` (nur im Deploy-Workflow)

## 5. Betrieb

### 5.1 GitHub

- Repo `Sifa171/cv`, öffentlich, Standard-Branch `main`.
- `ci.yml` bei Pull Requests: Installation, Lint/Typecheck, Vitest, Build (inkl. PDF und Standbilder), Playwright-E2E, Lighthouse CI.
- `deploy.yml` bei Push auf `main`: wie CI, zusätzlich Prüfung auf offene `TODO(sebastian)` und Platzhalter im Impressum (bricht ab, wenn welche vorhanden sind), dann `wrangler deploy`, danach Rauchprobe (5.4).
- Secrets: `CLOUDFLARE_ACCOUNT_ID` (`af72cf9af657a4840e3638c074c43946`), `CLOUDFLARE_API_TOKEN`.

### 5.2 Cloudflare

Account `af72cf9af657a4840e3638c074c43946`, Zone `sifa-web.com` (`896e50968ff4e4031ef1df843b9ed3c9`). Alle Schritte nur nach Bestätigung des Nutzers, jede Änderung mit Eintrag im Änderungsprotokoll von `~/development/it-env/cloudflare.md`.

1. **Deploy-Token `cv_deploy`** (kontogebunden): einziges Recht „Workers Scripts: Edit“ auf den Account. Wird per stdin direkt in `gh secret set CLOUDFLARE_API_TOKEN` geschrieben, nicht ausgegeben, nicht im Schlüsselbund abgelegt. Erneuerung bei Bedarf auf demselben Weg.
2. **Worker `cv`:** Der erste Deploy erfolgt lokal mit dem Agent-Token (`cf deploy`) und legt das Skript an. Danach hängt Claude einmalig per API (Agent-Token) die Custom Domains `sifa-web.com` und `www.sifa-web.com` an den Worker (`PUT /accounts/{id}/workers/domains`; DNS-Einträge legt Cloudflare an). Spätere Deploys aus GitHub ändern nur das Skript und die Assets, nicht die Domains. Keine workers.dev-Subdomain. Bestehende Einträge (MX, SPF, DKIM, `status`) bleiben unverändert; vor dem Anhängen wird geprüft, dass es für `sifa-web.com` und `www` keine A/AAAA/CNAME-Einträge gibt (Stand 2026-10-23: keine).
3. **Cache-Regel** in der Phase `http_request_cache_settings` (Ruleset `5315dddc18374835b86b852938ab2645`, derzeit leer): `(http.host eq "sifa-web.com")` → Browser-TTL „respect origin“. Grund: Die Zonen-Einstellung „Browser Cache TTL“ (14 400 s) überschreibt sonst das `no-cache` der HTML-Seiten (bekannt von triapp, 2026-10-13/14).
4. „Always Use HTTPS“ ist bereits an; keine Änderung.

### 5.3 Livegang

1. Lokal: `astro dev` und `wrangler dev`; Abnahme des Aussehens per Screenshots (Desktop und Mobil).
2. Repo und Workflows auf GitHub; CI grün.
3. Der Worker darf vorher schon existieren: Ohne Custom Domain und ohne workers.dev ist er nicht erreichbar. **Das Anhängen der Custom Domains ist der Livegang.**
4. Livegang auf `sifa-web.com` erst, wenn (a) das Impressum mit der c/o-Adresse vollständig ist und (b) der Nutzer alle Texte freigegeben hat (keine offenen `TODO(sebastian)`).

### 5.4 Rauchprobe nach jedem Deploy

- `https://sifa-web.com/` → 302 auf `/de/` bzw. `/en/` je nach `Accept-Language`.
- `https://sifa-web.com/de/` und `/en/` → 200, CSP und HSTS vorhanden, `cache-control: no-cache`.
- `http://sifa-web.com/` → 301 auf HTTPS; `https://www.sifa-web.com/x` → 301 auf `https://sifa-web.com/x`.
- Beide PDFs → 200, `content-type: application/pdf`.
- `https://status.sifa-web.com/` weiterhin 302 auf Access.

## 6. Qualität und Tests

**Unit (Vitest):**

- Jede Form liefert genau die angeforderte Punktzahl, alle Punkte innerhalb des Rahmens, gleiche Ausgabe bei gleichem Seed.
- `graph` platziert Knoten an den übergebenen Ankern.
- `scroll.ts`: richtige Szene und richtiger Fortschritt an Abschnittsgrenzen, bei 0 % und 100 %, rückwärts.
- Worker: Weiterleitung für `de`, `de-DE`, `en`, `fr`, fehlenden Header und gewichtete Listen (`en;q=0.9, de;q=0.8` → `/en/`); www-Umleitung erhält Pfad und Query.
- Inhalts-Schemas: fehlende Übersetzung schlägt fehl.

**E2E (Playwright, DE und EN):**

- Alle sechs Abschnitte und alle 8 Stationen sichtbar; Diffs per Maus und Tastatur aufklappbar.
- Mit deaktiviertem JavaScript: aller Inhalt vorhanden.
- Mit `prefers-reduced-motion: reduce`: kein WebGL-Canvas, Standbilder sichtbar.
- Sprachumschalter führt auf die Gegenseite; `hreflang` korrekt.
- PDFs existieren, enthalten Name und alle Stationen, höchstens 2 Seiten.
- Keine kaputten internen Links; unbekannter Pfad liefert die 404-Seite mit Status 404.

**Lighthouse CI (Mobil), in jedem PR:** Performance ≥ 90, Barrierefreiheit ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

**Manuell:** Claude prüft Aussehen und Animation im Browser auf Desktop- und Mobilgröße und zeigt dem Nutzer Screenshots vor jedem Livegang.

## 7. Offene Punkte

- Impressum-Dienst für die c/o-Adresse: wählt der Nutzer; bis dahin Platzhalter (blockiert den Livegang).
- Fotos: Porträt (optional, Abschnitt Profil) und ggf. Bilder zu Triathlon und Bühne – liefert der Nutzer, sonst ohne Fotos.
- Achievements der aktuellen Rolle: eigene Sitzung mit dem Nutzer.
- Inhalte zu Triathlon (z. B. Distanzen, Rennen) und Musik: Angaben vom Nutzer.
