#!/usr/bin/env python3
"""
Google Calendar API Tester
Tests whether the Google Calendar API Key and Calendar ID are configured correctly.

Usage:
    export HUGO_PARAMS_CALENDAR_GOOGLE_API_KEY="your-api-key"
    export HUGO_PARAMS_CALENDAR_CALENDAR_ID="your-calendar-id"
    python3 tools/test_calendar_api.py

Requirements:
    pip install requests
"""

import os
import sys
from datetime import datetime, timezone
from typing import Optional

try:
    import requests
except ImportError:
    print("❌ Error: 'requests' module not found")
    print("   Install it with: pip install requests")
    sys.exit(1)


def get_env_var(name: str) -> Optional[str]:
    """Get environment variable and return None if empty."""
    value = os.getenv(name, "").strip()
    return value if value else None


def test_calendar_api(api_key: str, calendar_id: str) -> None:
    """
    Test Google Calendar API with the given credentials.

    Args:
        api_key: Google Calendar API Key
        calendar_id: Google Calendar ID
    """
    print("=" * 70)
    print("🔍 Google Calendar API Configuration Test")
    print("=" * 70)
    print()

    # Show configuration (partially masked for security)
    print("📋 Configuration:")
    print(f"   API Key: {api_key[:10]}...{api_key[-4:]} (length: {len(api_key)})")
    print(f"   Calendar ID: {calendar_id}")
    print()

    # Build API URL
    base_url = "https://www.googleapis.com/calendar/v3/calendars"
    calendar_url = f"{base_url}/{calendar_id}/events"

    # Parameters for the request
    params = {
        'key': api_key,
        'maxResults': 10,
        'orderBy': 'startTime',
        'singleEvents': 'true',
        'timeMin': datetime.now(timezone.utc).isoformat(),
    }

    print("🌐 Making request to Google Calendar API...")
    print(f"   URL: {calendar_url}")
    print()

    try:
        response = requests.get(calendar_url, params=params, timeout=10)

        # Check response status
        if response.status_code == 200:
            print("✅ SUCCESS: API request successful!")
            print()

            data = response.json()
            events = data.get('items', [])

            # Show calendar information
            print("📅 Calendar Information:")
            print(f"   Summary: {data.get('summary', 'N/A')}")
            print(f"   Description: {data.get('description', 'N/A')}")
            print(f"   Timezone: {data.get('timeZone', 'N/A')}")
            print()

            # Show events
            if events:
                print(f"📌 Found {len(events)} upcoming events:")
                print()
                for i, event in enumerate(events, 1):
                    title = event.get('summary', 'No Title')
                    start = event.get('start', {})

                    # Get start time (could be date or dateTime)
                    start_time = start.get('dateTime') or start.get('date', 'N/A')

                    # Parse and format the date
                    try:
                        if 'T' in start_time:  # DateTime format
                            dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                            formatted_time = dt.strftime('%d.%m.%Y %H:%M')
                        else:  # Date only format
                            dt = datetime.strptime(start_time, '%Y-%m-%d')
                            formatted_time = dt.strftime('%d.%m.%Y')
                    except Exception:
                        formatted_time = start_time

                    location = event.get('location', '')

                    print(f"   {i}. {title}")
                    print(f"      📅 {formatted_time}")
                    if location:
                        print(f"      📍 {location}")
                    print()
            else:
                print("ℹ️  No upcoming events found in calendar")
                print("   This is normal if your calendar is empty or all events are in the past.")
                print()

            print("=" * 70)
            print("✅ Configuration is working correctly!")
            print("=" * 70)

        elif response.status_code == 400:
            print("❌ ERROR: Bad Request (400)")
            try:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                print(f"   Message: {error_message}")
            except Exception:
                print(f"   Response: {response.text}")
            print()
            print("💡 Possible causes:")
            print("   - Invalid API Key format")
            print("   - API Key doesn't have the correct permissions")
            print("   - Calendar ID format is incorrect")

        elif response.status_code == 403:
            print("❌ ERROR: Access Forbidden (403)")
            try:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                print(f"   Message: {error_message}")
            except Exception:
                print(f"   Response: {response.text}")
            print()
            print("💡 Possible causes:")
            print("   - API Key is invalid or expired")
            print("   - Google Calendar API is not enabled in Google Cloud Console")
            print("   - API Key restrictions prevent access")
            print("   - Calendar is not publicly accessible")

        elif response.status_code == 404:
            print("❌ ERROR: Calendar Not Found (404)")
            print(f"   Calendar ID '{calendar_id}' does not exist or is not accessible")
            print()
            print("💡 Possible causes:")
            print("   - Calendar ID is incorrect")
            print("   - Calendar is not set to 'Make available to public'")
            print("   - Calendar was deleted or moved")

        else:
            print(f"❌ ERROR: Unexpected status code {response.status_code}")
            print(f"   Response: {response.text}")

    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out")
        print("   Could not reach Google Calendar API within 10 seconds")

    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Connection failed")
        print("   Could not connect to Google Calendar API")
        print("   Check your internet connection")

    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: Request failed")
        print(f"   {str(e)}")

    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")


def main():
    """Main function."""
    print()

    # Get environment variables
    api_key = get_env_var("HUGO_PARAMS_CALENDAR_GOOGLE_API_KEY")
    calendar_id = get_env_var("HUGO_PARAMS_CALENDAR_CALENDAR_ID")

    # Validate environment variables
    if not api_key:
        print("❌ Error: HUGO_PARAMS_CALENDAR_GOOGLE_API_KEY environment variable is not set")
        print()
        print("Please set it with:")
        print("   export HUGO_PARAMS_CALENDAR_GOOGLE_API_KEY='your-api-key'")
        print()
        sys.exit(1)

    if not calendar_id:
        print("❌ Error: HUGO_PARAMS_CALENDAR_CALENDAR_ID environment variable is not set")
        print()
        print("Please set it with:")
        print("   export HUGO_PARAMS_CALENDAR_CALENDAR_ID='your-calendar-id'")
        print()
        sys.exit(1)

    # Run the test
    test_calendar_api(api_key, calendar_id)
    print()


if __name__ == "__main__":
    main()
