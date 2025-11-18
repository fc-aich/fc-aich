# FC Aich e.V. – Offizielle Website

Die moderne, Hugo-basierte Website des **FC Aich e.V.**, einem Fußballverein im Landkreis Fürstenfeldbruck.

🌐 **Live-Website:** [https://fc-aich.de](https://fc-aich.de) (produktiv)

---

## 📋 Inhaltsverzeichnis

- [Projektübersicht](#projektübersicht)
- [Technologie-Stack](#technologie-stack)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Content Management mit Sveltia CMS](#content-management-mit-sveltia-cms)
- [Deployment & GitHub Actions](#deployment--github-actions)
- [Projektstruktur](#projektstruktur)
- [Custom Features](#custom-features)
- [Migration von WordPress](#migration-von-wordpress)

---

## 🎯 Projektübersicht

Dieses Projekt ist die Neuauflage der FC Aich Website, die von **WordPress auf Hugo migriert** wurde. Die alte WordPress-Site war nicht mehr auf dem aktuellsten Stand der Technik und musste abgeschaltet werden.

### Ziele der Migration:
- ✅ Sicherheit durch statische Website (keine Datenbank, kein PHP)
- ✅ Schnelle Ladezeiten
- ✅ Moderne, responsive Darstellung
- ✅ Angepasste Darstellung auf dem Handy
- ✅ Einfache Content-Verwaltung über Sveltia CMS
- ✅ Kostenfreies Hosting via GitHub Pages
- ✅ Automatisches Deployment via GitHub Actions

---

## 🛠 Technologie-Stack

### Core
- **[Hugo](https://gohugo.io/)** v0.152.2+extended – Statischer Site Generator
- **[Ananke Theme](https://github.com/theNewDynamic/gohugo-theme-ananke)** – Basis-Theme mit Custom-Anpassungen
- **Tachyons CSS** – Utility-First CSS Framework (durch Ananke)
- **Custom CSS** – Eigene Styles in `assets/ananke/css/custom.css`

### Content Management
- **[Sveltia CMS](https://github.com/sveltia/sveltia-cms)** – Moderne, Git-basierte CMS-Alternative zu Decap CMS (ehemals Netlify CMS)
- **[Sveltia CMS Auth](https://github.com/sveltia/sveltia-cms-auth)** – OAuth-Authentifizierung auf Cloudflare Workers

### Hosting & Deployment
- **GitHub Pages** – Kostenfreies Static Hosting
- **GitHub Actions** – CI/CD Pipeline für automatisches Deployment
- **Cloudflare Workers** – OAuth-Backend für CMS-Authentifizierung

---

## 💻 Lokale Entwicklung

### Voraussetzungen

- **Hugo Extended** v0.152.2 oder höher
  ```bash
  # Ubuntu/Debian via Snap
  sudo snap install hugo --channel=extended

  # macOS via Homebrew
  brew install hugo

  # Windows via Chocolatey
  choco install hugo-extended
  ```

### Installation

1. **Repository klonen:**
   ```bash
   git clone https://github.com/fc-aich/fc-aich.git
   cd fc-aich
   ```

2. **Development Server starten:**
   ```bash
   hugo server -w
   # oder mit Drafts:
   hugo server -w -D
   ```

   Die Website ist dann unter `http://localhost:1313` erreichbar.

### Build für Produktion

```bash
hugo --minify
```

Die fertige Website wird im Verzeichnis `public/` generiert.

---

## 📝 Content Management mit Sveltia CMS

### Was ist Sveltia CMS?

[Sveltia CMS](https://github.com/sveltia/sveltia-cms) ist eine moderne, schnelle Alternative zu Decap CMS (ehemals Netlify CMS). Es ermöglicht die Verwaltung von Inhalten über eine benutzerfreundliche Web-Oberfläche, während alle Daten weiterhin als Markdown-Dateien im Git-Repository gespeichert werden.

### CMS-Zugang

- **URL:** [https://fc-aich.engelmann.me/admin/](https://fc-aich.engelmann.me/admin/)
- **Authentifizierung:** GitHub OAuth via Cloudflare Workers
- **Berechtigungen:** Nur autorisierte GitHub-User mit Schreibzugriff auf das Repository

### Authentifizierung Setup

Die Authentifizierung läuft über einen **Cloudflare Worker**, der das OAuth-Token-Exchange mit GitHub abwickelt:

```yaml
# static/admin/config.yml
backend:
  name: github
  repo: fc-aich/fc-aich
  branch: main
  base_url: https://sveltia-cms-auth-fc-aich.engel-d67.workers.dev
```

**Cloudflare Worker Repository:** [sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)

Der Worker übernimmt folgende Aufgaben:
- OAuth-Callback von GitHub empfangen
- Access Token anfordern
- Token sicher an das CMS zurückgeben

### Content Collections

#### News-Artikel
- **Ordner:** `content/news/`
- **Dateiformat:** `YYYY-MM-DD-titel-des-artikels.md`
- **Felder:**
  - Titel
  - Datum
  - Kategorien (allgemein, 1.mannschaft, 2.mannschaft, damen, AH, jugend)
  - Teaserbild (optional)
  - Vorschautext (optional)
  - Markdown-Inhalt

**Beispiel Frontmatter:**
```yaml
---
title: "Vorbereitung hat begonnen"
date: "2025-11-17T19:33:28+00:00"
categories:
  - 1.mannschaft
  - 2.mannschaft
featured_image: /uploads/team-training.jpg
summary: "Endlich rollt die Kugel wieder..."
---

Hier kommt der Artikel-Inhalt...
```

### Workflow im CMS

1. Im CMS einloggen (GitHub OAuth)
2. Neue News oder Spielberichte erstellen
3. Inhalte bearbeiten, Bilder hochladen
4. "Publish" klicken
5. Sveltia CMS erstellt automatisch einen **Git Commit** und pusht zum Repository
6. GitHub Actions triggered automatisch das Deployment

---

## 🚀 Deployment & GitHub Actions

### Automatisches Deployment

Jeder Push auf den `main`-Branch triggert automatisch das Deployment via GitHub Actions.

**Workflow-Datei:** `.github/workflows/deploy.yml`

### Deployment-Pipeline

```
Push to main → GitHub Actions: Build → Hugo Build --minify → Upload Artifact → Deploy to GitHub Pages → Live auf fc-aich.de
```

### Jobs

1. **Build Job:**
   - Checkout des Repositories (inkl. Submodules)
   - Hugo v0.152.2 Extended installieren
   - Website mit `hugo --minify` bauen
   - Artifact hochladen

2. **Deploy Job:**
   - Artifact von GitHub Pages entgegennehmen
   - Auf GitHub Pages deployen
   - URL bereitstellen

### Manuelles Deployment

Das Deployment kann auch manuell über die GitHub Actions UI getriggert werden:
1. Gehe zu **Actions** → **Deploy Hugo site to Pages**
2. Klicke auf **Run workflow**

---

## 📁 Projektstruktur

```
fc-aich/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions Workflow
├── assets/
│   └── ananke/
│       └── css/
│           └── custom.css      # Custom CSS Styles
├── content/                    # Alle Inhalte
│   ├── _index.md              # Homepage
│   ├── news/                  # News-Artikel (484 Dateien)
│   ├── spielberichte/         # Spielberichte
│   ├── herren1/              # 1. Mannschaft
│   ├── herren2/              # 2. Mannschaft
│   ├── damen/                # Damenmannschaft
│   ├── ah/                   # Alte Herren
│   ├── jugend/               # Jugendabteilung
│   │   ├── a-jugend/
│   │   ├── c-jugend/
│   │   ├── e-jugend/
│   │   ├── f-jugend/
│   │   └── g-jugend/
│   ├── verein/               # Vereinsinformationen
│   │   ├── vorstand/
│   │   ├── sportgelaende/
│   │   └── sponsoren/
│   ├── downloads/
│   └── kontakt/
├── layouts/                   # Custom Hugo Layouts
│   ├── partials/
│   │   ├── site-header.html  # Hero Header mit Logo
│   │   ├── site-navigation.html  # Dropdown-Menü
│   │   ├── match-meta.html   # Spielbericht-Metadaten
│   │   └── gallery-from-params.html  # Galerie
│   ├── shortcodes/
│   │   └── gallery.html      # Gallery Shortcode
│   ├── spielberichte/
│   │   └── single.html       # Spielbericht-Layout
│   ├── herren1/
│   │   └── list.html         # Team-Seite mit News-Filter
│   ├── herren2/
│   ├── damen/
│   ├── ah/
│   └── jugend/
├── static/                    # Statische Assets
│   ├── admin/
│   │   ├── index.html        # Sveltia CMS Entry Point
│   │   └── config.yml        # CMS Konfiguration
│   ├── img/                  # Logos, Team-Fotos
│   ├── uploads/              # Vom CMS hochgeladene Bilder
│   └── downloads/            # PDFs, Dokumente
├── themes/
│   └── ananke/               # Ananke Theme (Submodule)
├── config.toml               # Hugo Hauptkonfiguration
├── CLAUDE.md                 # Dokumentation für AI-Assistenten
└── README.md                 # Diese Datei
```

---

## ✨ Custom Features

### 1. Dropdown-Navigation

Moderne Navigation mit verschachtelten Menüs:

- **Jugend** → A-Jugend, C-Jugend, E-Jugend, F-Jugend, G-Jugend
- **Verein** → Vorstand, Sportgelände, Sponsoren

**Desktop:** Hover-Dropdown mit Animation
**Mobile:** Stacked Layout mit Pfeil-Icon ▾

**CSS:** `assets/ananke/css/custom.css` (Zeile 85-157)
**Template:** `layouts/partials/site-navigation.html`

### 2. Category-basiertes News-Filtering

Team-Seiten zeigen automatisch relevante News basierend auf Kategorien:

```yaml
# News-Artikel mit category "1.mannschaft"
categories:
  - 1.mannschaft
```

→ Erscheint automatisch auf `/herren1/`

**Implementation:** `layouts/herren1/list.html` (und analog für andere Teams)

### 3. Hero Header mit Logo

- Schwarze Navigation-Bar oben
- Featured Image als Hintergrund
- Titel-Overlay mit Gradient
- **Nur Homepage:** SVG-Logo über dem Titel, überlappt den unteren Rand

**Template:** `layouts/partials/site-header.html`
**CSS:** `assets/ananke/css/custom.css` (Hero-Styles)

### 4. Spielberichte mit Metadaten

Spezielle Layouts für Spielberichte mit:
- Match-Card (Gegner, Ergebnis, Wettbewerb)
- Automatische Galerie-Darstellung
- Featured Image

**Layout:** `layouts/spielberichte/single.html`
**Partial:** `layouts/partials/match-meta.html`

### 5. BFV Widget Integration

Einbindung der Bayerischer Fußball-Verband (BFV) Widgets für:
- Spielpläne
- Tabellen
- Mannschaftsinfos

**Beispiel:** `content/herren1/_index.md`
**Konfiguration:** `unsafe = true` in `config.toml` (erlaubt raw HTML)

---

## 🔄 Migration von WordPress

Die Website wurde von WordPress migriert, wobei:

### Migrierte Inhalte:
- ✅ **484 News-Artikel** (2016-2025)
- ✅ Bilder und Medien (`static/wp-content/`)
- ✅ Seiten (Vorstand, Sportgelände, Sponsoren)
- ✅ Metadaten (Datum, Kategorien, Autor)

### Dateinamen-Konvention:

Alle News-Dateien folgen dem Schema:
```
YYYY-MM-DD-erste-fuenf-woerter-des-titels.md
```

**Beispiele:**
- `2016-07-17-vorbereitung-hat-begonnen.md`
- `2024-03-09-jahreshauptversammlung-2024.md`

**Transformation:**
- Umlaute: ä→ae, ö→oe, ü→ue, ß→ss
- Kleinbuchstaben
- Bindestriche statt Leerzeichen

### Warum Hugo statt WordPress?

| Kriterium | WordPress | Hugo |
|-----------|-----------|------|
| **Sicherheit** | Angriffsfläche (PHP, DB, Plugins) | Keine Angriffsfläche (statisch) |
| **Performance** | Datenbankabfragen bei jedem Request | Pre-generierte HTML-Files |
| **Hosting-Kosten** | ~5-20€/Monat | Kostenfrei (GitHub Pages) |
| **Wartung** | Updates, Plugins, DB-Backups | Minimal (nur Theme-Updates) |
| **Versionskontrolle** | Schwierig | Native Git-Integration |

---

## 🔧 Konfiguration

### Hugo Config (`config.toml`)

Wichtige Parameter:

```toml
baseURL = "https://fc-aich.de/"
title = "FC Aich"
theme = "ananke"
languageCode = "de-de"
timeZone = "Europe/Berlin"

[params]
  site_logo = "/img/fc-aich-logo.svg"
  custom_css = ["custom.css"]
  date_format = "02.01.2006"
  email = "info@fc-aich.de"

[markup.goldmark.renderer]
  unsafe = true  # Erlaubt raw HTML (für BFV Widgets)
```

### Sveltia CMS Config (`static/admin/config.yml`)

```yaml
backend:
  name: github
  repo: fc-aich/fc-aich
  branch: main
  base_url: https://sveltia-cms-auth-fc-aich.engel-d67.workers.dev

media_folder: "static/uploads"
public_folder: "/uploads"
```

---

## 🤝 Mitwirken

### Neue Inhalte erstellen

**Via CMS (empfohlen):**
1. [CMS öffnen](https://fc-aich.de/admin/)
2. Einloggen mit GitHub
3. "New News" klicken
4. Inhalt erstellen und publishen

**Via Git:**
1. Neue Markdown-Datei in `content/news/` erstellen
2. Frontmatter hinzufügen
3. Commit und push

### Code-Änderungen

1. Branch erstellen
2. Änderungen committen
3. Pull Request öffnen
4. Nach Review: Merge in `main` → Auto-Deploy

---

## 📚 Weitere Dokumentation

- **[CLAUDE.md](./CLAUDE.md)** – Technische Dokumentation für AI-Assistenten
- **[Hugo Dokumentation](https://gohugo.io/documentation/)**
- **[Ananke Theme](https://github.com/theNewDynamic/gohugo-theme-ananke)**
- **[Sveltia CMS Dokumentation](https://github.com/sveltia/sveltia-cms)**

---

## 📞 Kontakt

**FC Aich e.V.**
Der Fußballverein im Landkreis Fürstenfeldbruck

- 🌐 Website: [fc-aich.de](https://fc-aich.de)
- 📧 Email: info@fc-aich.de
- 💻 GitHub: [github.com/fc-aich](https://github.com/fc-aich)

---

## 📄 Lizenz

Dieses Projekt ist privat und nur für den internen Gebrauch des FC Aich e.V. bestimmt.

Das verwendete [Ananke Theme](https://github.com/theNewDynamic/gohugo-theme-ananke) steht unter der MIT-Lizenz.

---
