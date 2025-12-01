# Google Calendar Setup - Anleitung für FC Aich Termine

Diese Anleitung erklärt Schritt für Schritt, wie Sie den Google Calendar für die Termine-Seite einrichten.

## Voraussetzungen

- Google Account (z.B. info@fc-aich.de)
- Zugriff auf die config.toml Datei des FC Aich Projekts

## Schritt 1: Google Cloud Projekt erstellen

1. Öffnen Sie https://console.cloud.google.com
2. Klicken Sie oben links auf den Projektnamen oder "Projekt auswählen"
3. Klicken Sie auf "**NEUES PROJEKT**"
4. Projektdetails eingeben:
   - **Projektname**: FC Aich Website
   - **Organisation**: (Optional, kann leer bleiben)
5. Klicken Sie auf "**ERSTELLEN**"
6. Warten Sie, bis das Projekt erstellt wurde (ca. 30 Sekunden)

## Schritt 2: Google Calendar API aktivieren

1. Stellen Sie sicher, dass das richtige Projekt ausgewählt ist (oben links)
2. Klicken Sie im Menü auf "**APIs & Dienste**" → "**Bibliothek**"
3. Suchen Sie nach "**Google Calendar API**"
4. Klicken Sie auf "**Google Calendar API**"
5. Klicken Sie auf "**AKTIVIEREN**"
6. Warten Sie, bis die API aktiviert wurde

## Schritt 3: API Key erstellen

1. Klicken Sie im Menü auf "**APIs & Dienste**" → "**Anmeldedaten**"
2. Klicken Sie oben auf "**+ ANMELDEDATEN ERSTELLEN**"
3. Wählen Sie "**API-Schlüssel**"
4. Ein API-Schlüssel wird generiert → **KOPIEREN SIE DEN SCHLÜSSEL** (z.B. `AIzaSy...`)
5. Klicken Sie auf "**SCHLÜSSEL EINSCHRÄNKEN**"

### API Key konfigurieren (wichtig für Sicherheit!)

6. **Name**: FC Aich Website Calendar
7. **Anwendungseinschränkungen**:
   - Wählen Sie "**HTTP-Referrer (Websites)**"
   - Klicken Sie auf "**+ ELEMENT HINZUFÜGEN**"
   - Fügen Sie folgende Referrer hinzu:
     ```
     https://fc-aich.de/*
     https://www.fc-aich.de/*
     http://localhost:1313/*
     ```
8. **API-Einschränkungen**:
   - Wählen Sie "**Schlüssel einschränken**"
   - Wählen Sie "**Google Calendar API**" aus der Liste
9. Klicken Sie auf "**SPEICHERN**"

**⚠️ WICHTIG**: Notieren Sie sich den API Key! Sie benötigen ihn später.

## Schritt 4: Google Calendar erstellen

1. Öffnen Sie https://calendar.google.com
2. Melden Sie sich mit Ihrem Google Account an
3. Links unter "**Weitere Kalender**" klicken Sie auf das **+** Symbol
4. Wählen Sie "**Neuen Kalender erstellen**"

### Kalenderdetails

5. **Name**: FC Aich Termine
6. **Beschreibung**: Offizielle Termine des FC Aich e.V. - Spiele, Training, Veranstaltungen
7. **Zeitzone**: (GMT+01:00) Amsterdam, Berlin, Bern, Rom, Stockholm, Wien
8. Klicken Sie auf "**Kalender erstellen**"

## Schritt 5: Kalender öffentlich machen

1. Finden Sie Ihren neuen Kalender in der linken Seitenleiste unter "Meine Kalender"
2. Bewegen Sie die Maus über den Kalender und klicken Sie auf die **drei Punkte** (⋮)
3. Wählen Sie "**Einstellungen und Freigabe**"

### Kalender freigeben

4. Scrollen Sie zu "**Zugriffsberechtigungen für Termine**"
5. ✓ Aktivieren Sie "**Öffentlich verfügbar machen**"
6. **Warnung akzeptieren**: "Dieser Kalender und alle zugehörigen Termine werden öffentlich"

### Kalender-ID kopieren

7. Scrollen Sie weiter nach unten zu "**Kalender in andere Anwendungen integrieren**"
8. Finden Sie die **Kalender-ID** (Format: `xxxxxxxxxxxxxx@group.calendar.google.com`)
9. **KOPIEREN SIE DIE KALENDER-ID** - Sie benötigen sie im nächsten Schritt

**Beispiel-ID**: `c_abc123def456@group.calendar.google.com`

## Schritt 6: Konfiguration in Hugo eintragen

1. Öffnen Sie die Datei `/home/engel/Repos/github/fc-aich/fc-aich/config.toml`
2. Suchen Sie die Sektion `[params.calendar]` (ca. Zeile 25-28)
3. Fügen Sie Ihre Daten ein:

```toml
[params.calendar]
  google_api_key = "AIzaSy..."  # Ihr API Key aus Schritt 3
  calendar_id = "c_abc123def456@group.calendar.google.com"  # Kalender-ID aus Schritt 5
```

4. **Speichern Sie die Datei**

## Schritt 7: Termine erstellen (Beispiele)

Jetzt können Sie Termine in Ihrem Google Calendar erstellen:

### Beispiel 1: Spiel Herren 1

- **Titel**: Herren 1 vs. FC Landsberied
- **Datum**: 15.12.2024
- **Uhrzeit**: 15:00 - 17:00
- **Ort**: Sportgelände Aich, Kirchstraße 10, 82269 Geltendorf
- **Beschreibung**: A-Klasse Spiel
- **Farbe**: Blau (für Spiele)

### Beispiel 2: Training Damen

- **Titel**: Damen Training
- **Datum**: Wiederkehrend jeden Dienstag
- **Uhrzeit**: 19:00 - 20:30
- **Ort**: Sportgelände Aich
- **Beschreibung**: Reguläres Mannschaftstraining
- **Farbe**: Grau (für Training)

### Beispiel 3: Vorstandssitzung

- **Titel**: Vorstandssitzung
- **Datum**: 10.12.2024
- **Uhrzeit**: 19:00 - 21:00
- **Ort**: Vereinsheim
- **Beschreibung**: Monatliche Vorstandssitzung
- **Farbe**: Grün (für Vereins-Events)

### Farbcodierung-Empfehlung

- 🔵 **Blau**: Spiele
- ⚫ **Grau**: Training
- 🟢 **Grün**: Vereinsveranstaltungen
- 🔴 **Rot**: Wichtige Termine/Fristen
- 🟣 **Lila**: Jugend-Events

## Schritt 8: Testen

1. Starten Sie den Hugo Development Server:
   ```bash
   hugo server -w
   ```

2. Öffnen Sie im Browser: http://localhost:1313/verein/termine/

3. **Erwartetes Ergebnis**:
   - Der Kalender wird geladen
   - Sie sehen Ihre Events aus Google Calendar
   - Desktop: Kalender + Agenda Sidebar
   - Mobile: Nur Kalender (responsive)
   - Event-Click öffnet Modal mit Details

## Häufige Probleme und Lösungen

### Problem: "Kalender-Konfiguration fehlt"

**Lösung**:
- Prüfen Sie, ob API Key und Calendar ID korrekt in config.toml eingetragen sind
- Keine Anführungszeichen vergessen
- Keine Leerzeichen am Anfang/Ende

### Problem: "Termine konnten nicht geladen werden"

**Mögliche Ursachen**:
1. **API Key falsch**: Kopieren Sie den Key nochmal aus Google Cloud Console
2. **Kalender nicht öffentlich**: Prüfen Sie die Freigabe-Einstellungen
3. **API noch nicht aktiviert**: Warten Sie 1-2 Minuten nach Aktivierung
4. **Referrer-Einschränkung**: Stellen Sie sicher, dass `localhost:1313` in den Referrern ist

### Problem: Events werden nicht angezeigt

**Lösung**:
- Prüfen Sie, ob Events im richtigen Kalender erstellt wurden
- Kalender-ID nochmal kopieren und eintragen
- Browser-Cache leeren (Strg+Shift+R)

### Problem: API Quota überschritten

**Lösung**:
- Google Calendar API hat 1.000.000 Requests/Tag (kostenlos)
- Prüfen Sie in Google Cloud Console → APIs & Dienste → Dashboard
- Bei normalem Gebrauch sollte das Limit nie erreicht werden

## Sicherheitshinweise

⚠️ **WICHTIG für Production-Deployment**:

1. **API Key NIE in öffentliche Git-Repositories committen**
2. Für GitHub Actions/CI-CD: Nutzen Sie **GitHub Secrets**
3. Prüfen Sie regelmäßig die API-Nutzung in Google Cloud Console
4. API Key nur mit HTTP-Referrer-Einschränkungen verwenden
5. Bei Verdacht auf Missbrauch: Key sofort regenerieren

### GitHub Secrets einrichten (für CI/CD)

1. GitHub Repository → Settings → Secrets and variables → Actions
2. Neue Secrets erstellen:
   - `GOOGLE_CALENDAR_API_KEY`: Ihr API Key
   - `GOOGLE_CALENDAR_ID`: Ihre Calendar ID
3. In `.github/workflows/deploy.yml` verwenden:
   ```yaml
   env:
     HUGO_PARAMS_CALENDAR_GOOGLE_API_KEY: ${{ secrets.GOOGLE_CALENDAR_API_KEY }}
     HUGO_PARAMS_CALENDAR_CALENDAR_ID: ${{ secrets.GOOGLE_CALENDAR_ID }}
   ```

## Kalender abonnieren (für Besucher)

Ihre Website-Besucher können den Kalender auch in ihre eigenen Apps integrieren.

**iCal URL** (für Apple Calendar, Outlook, etc.):
```
https://calendar.google.com/calendar/ical/IHRE_KALENDER_ID/public/basic.ics
```

**Beispiel**:
```
https://calendar.google.com/calendar/ical/c_abc123def456@group.calendar.google.com/public/basic.ics
```

Diese URL können Sie auf der Termine-Seite bereitstellen.

## Zukünftige Erweiterungen

Mögliche Features für später:
- ✅ Event-Filter nach Mannschaft (Code bereits vorbereitet)
- ✅ Export einzelner Events
- ✅ Mehrere Kalender kombinieren (Jugend, Damen, Herren)
- ✅ Automatischer Import von BFV-Spielplänen
- ✅ Push-Benachrichtigungen für Abonnenten

## Support

Bei Fragen oder Problemen:
- E-Mail: info@fc-aich.de
- Google Calendar API Dokumentation: https://developers.google.com/calendar
- FullCalendar Dokumentation: https://fullcalendar.io/docs

---

**Viel Erfolg mit dem neuen Terminkalender! ⚽**
