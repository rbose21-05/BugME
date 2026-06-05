import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { auth } from "../firebase";

const TOKEN_KEY = "googleCalendarAccessToken";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export function getGoogleProvider() {
    const provider = new GoogleAuthProvider();
    provider.addScope(CALENDAR_SCOPE);
    return provider;
}

export function saveGoogleAccessToken(result) {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
        sessionStorage.setItem(TOKEN_KEY, credential.accessToken);
    }
}

export function getGoogleAccessToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

export function hasCalendarAccess() {
    return !!getGoogleAccessToken();
}

export async function requestCalendarAccess() {
    await signInWithRedirect(auth, getGoogleProvider());
}

function normalizeScheduleItem(item) {
    const deadline = item.deadline?.slice(0, 10);
    if (!deadline) return null;

    return {
        topic: item.topic || item.quiz || "Study milestone",
        type: item.type || "study",
        deadline,
        notes: item.notes || "",
        reminderDaysBefore: Number(item.reminder_days_before ?? 1) || 1,
    };
}

function reminderMinutes(daysBefore) {
    return Math.max(1, daysBefore) * 24 * 60;
}

async function calendarRequest(accessToken, path, options = {}) {
    const response = await fetch(`${CALENDAR_API}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
            err?.error?.message || `Google Calendar request failed (${response.status})`
        );
    }

    if (response.status === 204) return null;
    return response.json();
}

async function createCalendarEvent(accessToken, courseName, item) {
    const reminderMinutesBefore = reminderMinutes(item.reminderDaysBefore);

    return calendarRequest(accessToken, "", {
        method: "POST",
        body: JSON.stringify({
            summary: `BugME – ${courseName}: ${item.topic}`,
            description: [
                `Course: ${courseName}`,
                `Type: ${item.type}`,
                item.notes,
                "",
                "Created by BugME Study Buddy",
            ]
                .filter(Boolean)
                .join("\n"),
            start: { date: item.deadline },
            end: { date: item.deadline },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "popup", minutes: reminderMinutesBefore },
                    { method: "email", minutes: reminderMinutesBefore },
                ],
            },
        }),
    });
}

async function deleteCalendarEvent(accessToken, eventId) {
    try {
        await calendarRequest(accessToken, `/${eventId}`, { method: "DELETE" });
    } catch (error) {
        console.warn(`Could not delete event ${eventId}:`, error.message);
    }
}

export async function syncScheduleToGoogle(accessToken, courseName, schedule, existingEventIds = []) {
    const items = (schedule || [])
        .map(normalizeScheduleItem)
        .filter(Boolean)
        .sort((a, b) => a.deadline.localeCompare(b.deadline));

    if (!items.length) {
        throw new Error("No valid schedule items to sync.");
    }

    for (const eventId of existingEventIds) {
        await deleteCalendarEvent(accessToken, eventId);
    }

    const createdIds = [];
    for (const item of items) {
        const event = await createCalendarEvent(accessToken, courseName, item);
        if (event?.id) createdIds.push(event.id);
    }

    return { createdIds, itemCount: items.length };
}

export async function saveCalendarSyncToBackend(firebaseToken, courseName, eventIds) {
    const response = await fetch("http://127.0.0.1:5000/save-calendar-sync", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: firebaseToken,
        },
        body: JSON.stringify({ courseName, eventIds }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to save calendar sync");
    }
    return data;
}
