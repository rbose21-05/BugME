import datetime
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

def create_google_calendar_events(study_plan_text, event_title="AI-Generated Study Plan"):
    """
    Creates events in Google Calendar from a text-based study plan.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens.
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    try:
        service = build("calendar", "v3", credentials=creds)

        # Assuming the AI output is a list of deadlines, one per line.
        for line in study_plan_text.split('\n'):
            if "Deadline" in line:
                try:
                    # Basic parsing of a line like "Deadline for Quiz 1: October 20, 2025"
                    parts = line.split(":")
                    task = parts[0].strip()
                    date_str = parts[1].strip()
                    
                    # Convert the string date to a datetime object
                    event_date = datetime.datetime.strptime(date_str, "%B %d, %Y").date()
                    
                    event = {
                        'summary': f'{event_title}: {task}',
                        'start': {
                            'date': event_date.isoformat(),
                            'timeZone': 'America/New_York', # Update with your timezone
                        },
                        'end': {
                            'date': event_date.isoformat(),
                            'timeZone': 'America/New_York',
                        },
                        'reminders': {
                            'useDefault': False,
                            'overrides': [
                                {'method': 'popup', 'minutes': 60},
                                {'method': 'email', 'minutes': 24 * 60},
                            ],
                        },
                    }

                    created_event = service.events().insert(calendarId='primary', body=event).execute()
                    print(f"Event created: {created_event.get('htmlLink')}")
                except Exception as e:
                    print(f"Error parsing line '{line}': {e}")

    except HttpError as error:
        print(f"An API error occurred: {error}")