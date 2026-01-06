/**
 * Google Calendar Helper Functions
 *
 * Utilities for Google Calendar API operations including:
 * - Event formatting and display
 * - Date/time parsing and formatting
 * - Calendar URL generation
 * - Free/busy data formatting
 * - Attendee and recurrence handling
 */

import { calendar_v3 } from "googleapis";

/**
 * Format a single calendar event for display
 */
export function formatEvent(
  event: calendar_v3.Schema$Event,
  calendarId: string = "primary",
): string {
  const lines: string[] = [];

  // Event ID and status
  lines.push(`Event ID: ${event.id}`);
  if (event.status) {
    lines.push(`Status: ${event.status}`);
  }

  // Summary (title)
  if (event.summary) {
    lines.push(`Title: ${event.summary}`);
  }

  // Date and time
  const { startFormatted, endFormatted } = formatDateTime(event);
  lines.push(`Start: ${startFormatted}`);
  lines.push(`End: ${endFormatted}`);

  // Location
  if (event.location) {
    lines.push(`Location: ${event.location}`);
  }

  // Description
  if (event.description) {
    const desc = event.description.length > 200
      ? event.description.substring(0, 200) + "..."
      : event.description;
    lines.push(`Description: ${desc}`);
  }

  // Attendees
  if (event.attendees && event.attendees.length > 0) {
    lines.push(`Attendees (${event.attendees.length}):`);
    event.attendees.forEach((attendee) => {
      const status = attendee.responseStatus || "needsAction";
      const organizer = attendee.organizer ? " (organizer)" : "";
      lines.push(`  - ${attendee.email} [${status}]${organizer}`);
    });
  }

  // Recurrence
  if (event.recurrence && event.recurrence.length > 0) {
    lines.push(`Recurrence: ${event.recurrence.join(", ")}`);
  }

  // Web link
  if (event.htmlLink) {
    lines.push(`Link: ${event.htmlLink}`);
  }

  // Conference data (Google Meet, Zoom, etc.)
  if (event.conferenceData?.entryPoints) {
    const meetLink = event.conferenceData.entryPoints.find(
      (ep) => ep.entryPointType === "video",
    );
    if (meetLink?.uri) {
      lines.push(`Meeting Link: ${meetLink.uri}`);
    }
  }

  return lines.join("\n");
}

/**
 * Format a list of calendar events
 */
export function formatEventList(
  events: calendar_v3.Schema$Event[],
  calendarId: string = "primary",
): string {
  if (!events || events.length === 0) {
    return "No events found.";
  }

  const lines: string[] = [];
  lines.push(`Found ${events.length} event(s):\n`);

  events.forEach((event, index) => {
    lines.push(`[${index + 1}] ${event.summary || "(No title)"}`);

    const { startFormatted } = formatDateTime(event);
    lines.push(`    Time: ${startFormatted}`);

    if (event.location) {
      lines.push(`    Location: ${event.location}`);
    }

    if (event.attendees) {
      lines.push(`    Attendees: ${event.attendees.length}`);
    }

    lines.push(`    ID: ${event.id}`);
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Format event date/time for display
 */
export function formatDateTime(event: calendar_v3.Schema$Event): {
  startFormatted: string;
  endFormatted: string;
  isAllDay: boolean;
} {
  let startFormatted = "Unknown";
  let endFormatted = "Unknown";
  let isAllDay = false;

  // Check if all-day event
  if (event.start?.date) {
    startFormatted = event.start.date;
    endFormatted = event.end?.date || event.start.date;
    isAllDay = true;
  } else if (event.start?.dateTime) {
    const startDate = new Date(event.start.dateTime);
    const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : startDate;

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    };

    startFormatted = startDate.toLocaleString("en-US", options);
    endFormatted = endDate.toLocaleString("en-US", options);
  }

  return { startFormatted, endFormatted, isAllDay };
}

/**
 * Generate Google Calendar web URL for an event
 */
export function generateCalendarWebUrl(
  eventId: string,
  calendarId: string = "primary",
): string {
  const encodedCalendarId = encodeURIComponent(calendarId);
  const encodedEventId = encodeURIComponent(eventId);
  return `https://calendar.google.com/calendar/u/0/r/eventedit/${encodedEventId}?calendarId=${encodedCalendarId}`;
}

/**
 * Format free/busy query response
 */
export function formatFreeBusyResponse(
  response: calendar_v3.Schema$FreeBusyResponse,
): string {
  const lines: string[] = [];

  if (!response.calendars) {
    return "No calendar data available.";
  }

  Object.entries(response.calendars).forEach(([calendarId, calendarData]) => {
    lines.push(`\nCalendar: ${calendarId}`);

    if (calendarData.errors && calendarData.errors.length > 0) {
      lines.push("  Errors:");
      calendarData.errors.forEach((error) => {
        lines.push(`    - ${error.reason}: ${error.domain}`);
      });
    }

    if (calendarData.busy && calendarData.busy.length > 0) {
      lines.push(`  Busy periods (${calendarData.busy.length}):`);
      calendarData.busy.forEach((period, index) => {
        const start = period.start ? new Date(period.start).toLocaleString() : "Unknown";
        const end = period.end ? new Date(period.end).toLocaleString() : "Unknown";
        lines.push(`    ${index + 1}. ${start} - ${end}`);
      });
    } else {
      lines.push("  No busy periods - calendar is free!");
    }
  });

  return lines.join("\n");
}

/**
 * Parse ISO 8601 datetime or date string to appropriate format for Calendar API
 */
export function parseDateTime(dateTimeStr: string): {
  dateTime?: string;
  date?: string;
} {
  // Check if it's a date-only string (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTimeStr)) {
    return { date: dateTimeStr };
  }

  // Otherwise, treat as datetime
  return { dateTime: dateTimeStr };
}

/**
 * Format attendee list for API request
 */
export function formatAttendees(emails: string[]): calendar_v3.Schema$EventAttendee[] {
  return emails.map((email) => ({
    email: email.trim(),
  }));
}

/**
 * Validate event time range
 */
export function validateTimeRange(startTime: string, endTime: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime())) {
      return { valid: false, error: "Invalid start time format" };
    }

    if (isNaN(end.getTime())) {
      return { valid: false, error: "Invalid end time format" };
    }

    if (end <= start) {
      return { valid: false, error: "End time must be after start time" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Error parsing time range" };
  }
}
