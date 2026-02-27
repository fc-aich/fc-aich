# Google Drive Integration - Setup Anleitung

Diese Anleitung beschreibt, wie die Google Drive Integration für Bildergalerien und Datei-Downloads auf der FC Aich Website eingerichtet wird.

## Übersicht

Die Integration ermöglicht:
- **Bildergalerien** aus Google Drive Ordnern (mit GLightbox Lightbox)
- **Dateilisten** für PDFs und Dokumente (mit Vorschau und Download)
- Einfache Verwaltung durch Team-Mitglieder ohne Git-Kenntnisse

---

## 1. Google Cloud Console Setup

### 1.1 Bestehendes Projekt verwenden

Falls bereits ein Google Cloud Projekt für den Kalender existiert:

1. Öffne die [Google Cloud Console](https://console.cloud.google.com/)
2. Wähle das bestehende Projekt aus
3. Weiter zu Schritt 1.3

### 1.2 Neues Projekt erstellen (falls nötig)

1. Öffne die [Google Cloud Console](https://console.cloud.google.com/)
2. Klicke auf "Projekt erstellen"
3. Name: `fc-aich-website` (oder ähnlich)
4. Klicke auf "Erstellen"

### 1.3 Google Drive API aktivieren

1. Gehe zu **APIs & Dienste** → **Bibliothek**
2. Suche nach "Google Drive API"
3. Klicke auf "Google Drive API"
4. Klicke auf **"Aktivieren"**

### 1.4 API-Schlüssel erstellen/anpassen

Falls bereits ein API-Key existiert (z.B. für Kalender):

1. Gehe zu **APIs & Dienste** → **Anmeldedaten**
2. Klicke auf den bestehenden API-Key
3. Unter **API-Einschränkungen**:
   - Wähle "Schlüssel einschränken"
   - Füge "Google Drive API" zur Liste hinzu
4. Speichern

Falls kein API-Key existiert:

1. Gehe zu **APIs & Dienste** → **Anmeldedaten**
2. Klicke auf **"+ Anmeldedaten erstellen"** → **"API-Schlüssel"**
3. Kopiere den Schlüssel (wird nur einmal angezeigt!)
4. Klicke auf "Schlüssel bearbeiten":
   - **Name**: `FC Aich Website Key`
   - **Anwendungseinschränkungen**: "HTTP-Verweis-URLs"
   - **Website-Einschränkungen** hinzufügen:
     - `https://fc-aich.de/*`
     - `https://www.fc-aich.de/*`
     - `http://localhost:1313/*` (für lokale Entwicklung)
   - **API-Einschränkungen**: "Schlüssel einschränken"
     - Google Calendar API (falls verwendet)
     - Google Drive API
5. Speichern

---

## 2. Google Drive Ordner einrichten

### 2.1 Ordnerstruktur erstellen

Empfohlene Struktur im Google Drive:

```
FC Aich Website/
├── Galerien/
│   ├── Aufstieg-2024/
│   ├── Meisterfeier-2024/
│   └── Saisonabschluss-2023/
├── Downloads/
│   ├── Mitgliedsantrag.pdf
│   ├── Satzung.pdf
│   └── Hallenplan-2024.pdf
└── Sponsoren-Logos/
    ├── sponsor1.png
    └── sponsor2.png
```

### 2.2 Ordner öffentlich freigeben

**Wichtig**: Jeder Ordner, der auf der Website angezeigt werden soll, muss öffentlich freigegeben sein!

1. Rechtsklick auf den Ordner → "Freigeben"
2. Klicke auf "Allgemeiner Zugriff ändern"
3. Wähle: **"Jeder, der über den Link verfügt"**
4. Rolle: **"Betrachter"** (nur lesen)
5. Klicke auf "Fertig"

### 2.3 Ordner-ID ermitteln

Die Ordner-ID findet man in der URL:

```
https://drive.google.com/drive/folders/1ABC123xyz456...
                                       └─────────────┘
                                         Ordner-ID
```

---

## 3. Umgebungsvariablen konfigurieren

### 3.1 Lokal (Entwicklung)

Erstelle eine `.env` Datei im Projektverzeichnis:

```bash
# .env (NICHT in Git committen!)
HUGO_PARAMS_DRIVE_API_KEY=AIzaSy...dein-api-key...
```

Starte Hugo mit den Umgebungsvariablen:

```bash
# Linux/Mac
export $(cat .env | xargs) && hugo server -w

# Oder direkt:
HUGO_PARAMS_DRIVE_API_KEY="AIzaSy..." hugo server -w
```

### 3.2 GitHub Actions (Produktion)

1. Gehe zu **Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Klicke auf "New repository secret"
3. Name: `HUGO_PARAMS_DRIVE_API_KEY`
4. Value: Dein API-Schlüssel
5. Klicke auf "Add secret"

In der GitHub Actions Workflow-Datei (`.github/workflows/hugo.yml`):

```yaml
- name: Build with Hugo
  env:
    HUGO_PARAMS_DRIVE_API_KEY: ${{ secrets.HUGO_PARAMS_DRIVE_API_KEY }}
    HUGO_PARAMS_CALENDAR_GOOGLE_API_KEY: ${{ secrets.HUGO_PARAMS_CALENDAR_GOOGLE_API_KEY }}
    HUGO_PARAMS_CALENDAR_CALENDAR_ID: ${{ secrets.HUGO_PARAMS_CALENDAR_CALENDAR_ID }}
  run: hugo --minify
```

---

## 4. Shortcodes verwenden

### 4.1 Bildergalerie

```markdown
{{< google-drive-gallery "ORDNER_ID" >}}
```

**Beispiel:**
```markdown
## Aufstiegsfeier 2024

Hier sind die Bilder von unserer Aufstiegsfeier!

{{< google-drive-gallery "1ABC123xyz456" >}}
```

**Für Logos (ohne Zuschneiden):**
```markdown
{{< google-drive-gallery "1XYZ789abc" logos >}}
```

### 4.2 Dateiliste

```markdown
{{< google-drive-files "ORDNER_ID" >}}
```

**Beispiel:**
```markdown
## Downloads

Hier finden Sie wichtige Dokumente zum Download:

{{< google-drive-files "1DEF456ghi789" >}}
```

---

## 5. Migration bestehender Inhalte

### 5.1 Sponsoren-Seite

**Vorher** (`content/verein/sponsoren/_index.md`):
```markdown
{{< wp-gallery "sponsoren" logos >}}
```

**Nachher:**
```markdown
{{< google-drive-gallery "SPONSOREN_ORDNER_ID" logos >}}
```

### 5.2 Downloads-Seite

**Vorher** (statische Links):
```markdown
- [Mitgliedsantrag](/downloads/mitgliedsantrag.pdf)
- [Satzung](/downloads/satzung.pdf)
```

**Nachher:**
```markdown
{{< google-drive-files "DOWNLOADS_ORDNER_ID" >}}
```

### 5.3 Spielbericht-Galerien

Für neue Spielberichte kann das `gallery` Front-Matter-Feld durch einen Drive-Ordner ersetzt werden:

```yaml
---
title: Topspiel gegen Landsberied
date: 2025-01-15
score: 3:1
drive_gallery: "1ABC123spielbericht"
---
```

(Benötigt Anpassung des Spielbericht-Templates)

---

## 6. Fehlerbehebung

### Problem: "Bilder werden nicht geladen"

**Mögliche Ursachen:**

1. **Ordner nicht öffentlich freigegeben**
   - Prüfe die Freigabe-Einstellungen (siehe 2.2)

2. **API-Key nicht konfiguriert**
   - Prüfe die Umgebungsvariable `HUGO_PARAMS_DRIVE_API_KEY`
   - Öffne Browser-Konsole (F12) → Suche nach Fehlermeldungen

3. **API-Key Einschränkungen**
   - Prüfe in Google Cloud Console, ob die Domain erlaubt ist
   - Für localhost: `http://localhost:1313/*` hinzufügen

4. **Drive API nicht aktiviert**
   - Prüfe in Google Cloud Console → APIs & Dienste

### Problem: "403 Forbidden" Fehler

- Der API-Key hat keine Berechtigung für Google Drive API
- Lösung: API-Einschränkungen in Cloud Console anpassen

### Problem: "404 Not Found" Fehler

- Ordner-ID ist falsch
- Ordner wurde gelöscht oder verschoben
- Lösung: Ordner-ID in Drive URL prüfen

### Debugging

Öffne die Browser-Konsole (F12) und suche nach:
- `FC Drive:` Meldungen
- Netzwerk-Tab → Anfragen an `googleapis.com`

---

## 7. Sicherheitshinweise

### API-Key Schutz

- **Niemals** den API-Key in Git committen
- Immer Umgebungsvariablen oder GitHub Secrets verwenden
- API-Key auf bestimmte Domains beschränken
- API-Key auf benötigte APIs beschränken

### Ordner-Berechtigungen

- Nur die nötigsten Ordner öffentlich freigeben
- Keine sensiblen Dokumente in öffentliche Ordner
- Regelmäßig Freigaben prüfen

### DSGVO

- Bei Personenfotos: Einwilligung einholen
- Keine persönlichen Daten in öffentlichen Dokumenten
- Impressum/Datenschutz auf Website aktuell halten

---

## 8. Dateien der Integration

| Datei | Beschreibung |
|-------|--------------|
| `static/js/fc-drive.js` | JavaScript für API-Kommunikation |
| `layouts/shortcodes/google-drive-gallery.html` | Galerie-Shortcode |
| `layouts/shortcodes/google-drive-files.html` | Dateilisten-Shortcode |
| `assets/ananke/css/custom.css` | CSS-Styles (ab Zeile ~1445) |
| `layouts/partials/site-scripts.html` | Script-Einbindung |

---

## 9. Weiterführende Links

- [Google Drive API Dokumentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Hugo Shortcodes Dokumentation](https://gohugo.io/content-management/shortcodes/)
- [GLightbox](https://biati-digital.github.io/glightbox/)
