import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import uploadbg from "../background/uploadbg.png";
import sticker from "../cats/calendarcat.png";
import { auth } from "../firebase";
import {
    getGoogleAccessToken,
    hasCalendarAccess,
    requestCalendarAccess,
    saveGoogleAccessToken,
    saveCalendarSyncToBackend,
    syncScheduleToGoogle,
} from "../utils/googleCalendar";
import "./HomePage.css";

function normalizeSchedule(schedulePayload) {
    if (!schedulePayload || schedulePayload.error) return [];
    const items = schedulePayload.schedule || [];
    return items
        .map((item) => ({
            topic: item.topic || item.quiz || "Study milestone",
            type: item.type || "study",
            deadline: item.deadline?.slice(0, 10) || "",
            notes: item.notes || "",
            reminder_days_before: item.reminder_days_before ?? 1,
        }))
        .filter((item) => item.deadline)
        .sort((a, b) => a.deadline.localeCompare(b.deadline));
}

const typeStyles = {
    study: "bg-sky-100 text-sky-800",
    quiz: "bg-yellow-100 text-yellow-800",
    exam: "bg-red-100 text-red-800",
};

function hasPastDates(schedule) {
    const today = new Date().toISOString().slice(0, 10);
    return schedule.some((item) => item.deadline < today);
}

export default function Calendar() {
    const location = useLocation();
    const { courseName: routeCourse } = location.state || {};
    const persisted = localStorage.getItem("selectedCourse");
    const activeCourse = routeCourse || persisted;

    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [syncStatus, setSyncStatus] = useState("");
    const [syncing, setSyncing] = useState(false);
    const [calendarConnected, setCalendarConnected] = useState(hasCalendarAccess());
    const [existingEventIds, setExistingEventIds] = useState([]);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);

    useEffect(() => {
        if (activeCourse) {
            localStorage.setItem("selectedCourse", activeCourse);
        }
    }, [activeCourse]);

    useEffect(() => {
        getRedirectResult(auth).then((result) => {
            if (result) {
                saveGoogleAccessToken(result);
                setCalendarConnected(hasCalendarAccess());
            }
        });
    }, []);

    useEffect(() => {
        if (!activeCourse) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setError("Please log in to view your study calendar.");
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                const response = await fetch("http://127.0.0.1:5000/getsubjects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                });

                if (!response.ok) throw new Error("Failed to load course data.");

                const result = await response.json();
                const courseObj = result.subjects?.find(
                    (s) => Object.keys(s)[0] === activeCourse
                );

                if (!courseObj) {
                    setError(`Course "${activeCourse}" not found.`);
                    setSchedule([]);
                    return;
                }

                const courseData = courseObj[activeCourse];
                const parsed = normalizeSchedule(courseData?.quiz_calendar);

                if (!parsed.length) {
                    setError(
                        "No study schedule yet. Upload notes and exam dates from the course page first."
                    );
                    setSchedule([]);
                    return;
                }

                setSchedule(parsed);
                setExistingEventIds(courseData.calendar_event_ids || []);
                setLastSyncedAt(courseData.calendar_synced_at || null);
                setError("");
            } catch (e) {
                console.error(e);
                setError("Error loading calendar. Make sure the backend is running.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [activeCourse]);

    const handleConnectCalendar = async () => {
        setSyncStatus("Redirecting to Google for calendar access...");
        await requestCalendarAccess();
    };

    const handleSync = async () => {
        const accessToken = getGoogleAccessToken();
        if (!accessToken) {
            setSyncStatus("Connect Google Calendar first.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            setSyncStatus("Please log in again.");
            return;
        }

        setSyncing(true);
        setSyncStatus("Creating calendar events with reminders...");

        try {
            const { createdIds, itemCount } = await syncScheduleToGoogle(
                accessToken,
                activeCourse,
                schedule,
                existingEventIds
            );

            const firebaseToken = await user.getIdToken();
            await saveCalendarSyncToBackend(firebaseToken, activeCourse, createdIds);

            setExistingEventIds(createdIds);
            setLastSyncedAt(Date.now() / 1000);
            setSyncStatus(
                `Synced ${itemCount} events to Google Calendar with email & popup reminders.`
            );
        } catch (e) {
            console.error(e);
            if (e.message?.includes("401") || e.message?.includes("invalid")) {
                setCalendarConnected(false);
                sessionStorage.removeItem("googleCalendarAccessToken");
                setSyncStatus("Calendar access expired. Click Connect Google Calendar again.");
            } else {
                setSyncStatus(e.message || "Failed to sync calendar.");
            }
        } finally {
            setSyncing(false);
        }
    };

    if (!activeCourse) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg">No course selected.</p>
                <Link to="/landing" className="ml-4 text-blue-600 underline">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex flex-col"
            style={{ backgroundImage: `url(${uploadbg})` }}
        >
            <nav className="flex justify-between items-center px-8 py-4 bg-black/40 text-white">
                <Link to="/" className="text-2xl silly-font">
                    BugME!
                </Link>
                <Link to="/landing" className="hover:text-green-300 transition">
                    Home
                </Link>
            </nav>

            <div className="flex flex-1 items-center justify-center bg-black/30 p-6 relative">
                <img
                    src={sticker}
                    alt="calendar cat"
                    className="w-48 h-48 absolute bottom-8 right-8 levitate hidden sm:block"
                />

                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
                        Study Calendar – {activeCourse}
                    </h1>
                    <p className="text-center text-gray-600 mb-6 text-sm">
                        AI-generated topic schedule with Google Calendar reminders
                    </p>

                    {loading ? (
                        <p className="text-center text-gray-600">Loading schedule...</p>
                    ) : error ? (
                        <p className="text-center text-red-600 mb-4">{error}</p>
                    ) : (
                        <div className="space-y-3 mb-6">
                            {schedule.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="border border-gray-200 rounded-xl p-4 bg-white/80"
                                >
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span
                                            className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${
                                                typeStyles[item.type] || typeStyles.study
                                            }`}
                                        >
                                            {item.type}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500">
                                            {item.deadline}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Reminder {item.reminder_days_before} day(s) before
                                        </span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{item.topic}</p>
                                    {item.notes ? (
                                        <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && schedule.length > 0 && (
                        <div className="border-t border-gray-200 pt-4 space-y-3">
                            {hasPastDates(schedule) ? (
                                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                                    Some dates are in the past. Re-upload notes with current exam
                                    dates to generate a fresh schedule.
                                </p>
                            ) : null}

                            <p className="text-sm text-gray-700 text-center font-medium">
                                {calendarConnected
                                    ? "Step 2: Sync events to Google Calendar"
                                    : "Step 1: Connect Google Calendar to enable reminders"}
                            </p>

                            {lastSyncedAt ? (
                                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                                    Last synced:{" "}
                                    {new Date(lastSyncedAt * 1000).toLocaleString()}
                                </p>
                            ) : null}

                            {!calendarConnected ? (
                                <button
                                    type="button"
                                    onClick={handleConnectCalendar}
                                    className="calendar-connect-btn w-full py-3 font-semibold rounded-xl transition"
                                >
                                    Connect Google Calendar
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSync}
                                    disabled={syncing}
                                    className="calendar-sync-btn w-full py-3 font-semibold rounded-xl transition"
                                >
                                    {syncing
                                        ? "Syncing..."
                                        : "Sync to Google Calendar (with reminders)"}
                                </button>
                            )}

                            {syncStatus ? (
                                <p
                                    className={`text-sm text-center rounded-lg p-2 ${
                                        syncStatus.includes("Synced")
                                            ? "text-green-800 bg-green-50 border border-green-200"
                                            : "text-gray-700 bg-gray-50 border border-gray-200"
                                    }`}
                                >
                                    {syncStatus}
                                </p>
                            ) : null}

                            <p className="text-xs text-center text-gray-500">
                                After syncing, open{" "}
                                <a
                                    href="https://calendar.google.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    calendar.google.com
                                </a>{" "}
                                and look for events starting with &quot;BugME – {activeCourse}&quot;.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-between">
                        <Link
                            to="/coursepage"
                            state={{ courseName: activeCourse }}
                            className="text-blue-600 underline"
                        >
                            ← Back to Course
                        </Link>
                        <Link
                            to="/upload"
                            state={{ courseName: activeCourse }}
                            className="text-blue-600 underline"
                        >
                            Upload Notes
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
