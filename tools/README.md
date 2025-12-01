# FC Aich Tools

Hilfsprogramme für die Verwaltung und das Testing der FC Aich Website.

## test_calendar_api.py

Testet die Google Calendar API-Konfiguration.

### Voraussetzungen

```bash
pip install requests
```

### Verwendung

1. **Setze die Environment-Variablen:**

```bash
export HUGO_PARAMS_CALENDAR_GOOGLE_API_KEY="dein-api-key"
export HUGO_PARAMS_CALENDAR_CALENDAR_ID="dein-kalender-id"
```

2. **Führe das Script aus:**

```bash
python3 tools/test_calendar_api.py
```

### Was das Script testet

- ✅ Validiert, ob die Environment-Variablen gesetzt sind
- ✅ Prüft, ob der API Key gültig ist
- ✅ Prüft, ob die Calendar ID existiert und zugreifbar ist
- ✅ Zeigt Kalender-Informationen (Name, Beschreibung, Zeitzone)
- ✅ Listet kommende Events auf (falls vorhanden)

### Beispiel-Ausgabe

**Erfolgreicher Test:**
```
======================================================================
🔍 Google Calendar API Configuration Test
======================================================================

📋 Configuration:
   API Key: AIzaSyBxxx...Xy1Z (length: 39)
   Calendar ID: xxx@group.calendar.google.com

🌐 Making request to Google Calendar API...
   URL: https://www.googleapis.com/calendar/v3/calendars/...

✅ SUCCESS: API request successful!

📅 Calendar Information:
   Summary: FC Aich Termine
   Description: Öffentlicher Kalender für alle Termine
   Timezone: Europe/Berlin

📌 Found 3 upcoming events:

   1. Training Herren 1
      📅 05.12.2025 18:30
      📍 Sportgelände Aich

   2. Spiel Damen gegen FC Landsberied
      📅 07.12.2025 15:00
      📍 Sportgelände Aich

   3. Vorstandssitzung
      📅 10.12.2025 19:00

======================================================================
✅ Configuration is working correctly!
======================================================================
```

**Fehlgeschlagener Test (ungültiger API Key):**
```
❌ ERROR: Access Forbidden (403)
   Message: The API key is invalid

💡 Possible causes:
   - API Key is invalid or expired
   - Google Calendar API is not enabled in Google Cloud Console
   - API Key restrictions prevent access
   - Calendar is not publicly accessible
```

### Häufige Fehler

#### 403 Forbidden
- API Key ist ungültig oder abgelaufen
- Google Calendar API ist nicht aktiviert in der Google Cloud Console
- Kalender ist nicht öffentlich zugänglich

#### 404 Not Found
- Calendar ID ist falsch
- Kalender wurde gelöscht oder ist nicht mehr verfügbar
- Kalender ist nicht auf "Öffentlich" gesetzt

#### 400 Bad Request
- API Key Format ist ungültig
- Calendar ID Format ist ungültig

### Tipps

1. **API Key überprüfen:**
   - Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
   - Navigiere zu "APIs & Services" → "Credentials"
   - Stelle sicher, dass der API Key die Google Calendar API verwenden darf
   - **Wichtig:** Wenn du HTTP-Referrer-Einschränkungen verwendest, stelle sicher, dass `https://fc-aich.de` zu den erlaubten Referrern gehört
   - Das Test-Script sendet `https://fc-aich.de` als Referer-Header

2. **Calendar ID finden:**
   - Öffne [Google Calendar](https://calendar.google.com)
   - Klicke auf die drei Punkte neben dem Kalender → "Einstellungen und Freigabe"
   - Scrolle zu "Kalender in andere Anwendungen integrieren"
   - Kopiere die "Kalender-ID"

3. **Kalender öffentlich machen:**
   - Kalender-Einstellungen → "Zugriffsberechtigungen"
   - Aktiviere "Öffentlich verfügbar machen"
   - Wähle "Alle Termindetails anzeigen"

### Hinweis zum Referer-Header

Das Test-Script sendet automatisch `https://fc-aich.de` als Referer-Header, um mit API Keys zu funktionieren, die HTTP-Referrer-Einschränkungen haben. Dies simuliert, als würde die Anfrage von der FC Aich Website kommen.
