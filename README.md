# sifa-web.com

Persönliche Webseite und Lebenslauf von Sebastian Dehn – zweisprachig (DE/EN), mit einem Partikelsystem,
das sich beim Scrollen von einer Wolke über einen Cluster und einen Commit-Graphen zu einer Signal-Linie
verwandelt. Aus denselben Daten entsteht beim Build ein PDF-Lebenslauf.

- Design: [`docs/superpowers/specs/2026-10-23-cv-website-design.md`](docs/superpowers/specs/2026-10-23-cv-website-design.md)
- Umsetzungsplan: [`docs/superpowers/plans/2026-10-23-cv-website.md`](docs/superpowers/plans/2026-10-23-cv-website.md)

## Technik

Astro (statisches HTML), Three.js (Partikel, nach dem ersten Rendern geladen), Cloudflare Workers mit Static Assets.
Ohne WebGL oder bei „Bewegung reduzieren“ zeigt die Seite vorgerenderte Standbilder.

## Inhalte pflegen

Alle Texte stehen in `src/content/` als YAML, jeder übersetzbare Text als `{ de: …, en: … }`:

| Datei | Inhalt |
|---|---|
| `profile.yaml` | Name, Titel, Kurzprofil, Skills, Sprachen, Ausbildung, Links |
| `sections.yaml` | Label, Überschrift (`*Akzent*`, `` `Code` ``) und Intro je Abschnitt |
| `roles/*.yaml` | eine Station je Datei, mit Diff-Zeilen (`add`/`remove`) und Technologien |
| `projects/*.yaml` | Projekte |
| `offduty.yaml` | Sport und Musik |

Fehlt eine Übersetzung, bricht der Build ab. Offene Fragen stehen als `TODO(sebastian): …` in den Dateien;
solange es welche gibt (oder Platzhalter `PLATZHALTER(…)` im Impressum), verweigert `npm run release:check` den Deploy.

## Befehle

```bash
npm run dev            # Entwicklungsserver
npm run build          # Seite, Standbilder und PDFs nach dist/
npm run preview        # dist/ lokal ausliefern
npx wrangler dev       # dist/ mit Worker und Headern wie in Produktion
npm run check          # Typen
npm test               # Unit-Tests (Vitest)
npx playwright test    # E2E-Tests
npx lhci autorun       # Lighthouse
npm run release:check  # offene Punkte vor dem Deploy
scripts/smoke.sh <url> [--prod]  # Rauchprobe nach dem Deploy
```

## Deploy

Pull Requests laufen durch `ci.yml` (Typen, Tests, Build, E2E, Lighthouse). Ein Push auf `main` startet
`deploy.yml`: dieselben Prüfungen, `release:check`, dann `wrangler deploy` auf den Worker `cv` und – sobald die
Repo-Variable `LIVE=true` gesetzt ist – die Rauchprobe gegen `https://sifa-web.com`.
