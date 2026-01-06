import { google } from "googleapis";
import { CalendarListEventsInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatEventList } from "../../../lib/calendar-helpers.js";

export const schema = {
  name: "calendar_list_events",
  description:
    "List events from a Google Calendar. Returns upcoming events with details including title, time, location, attendees, and meeting links. Supports filtering by time range, search query, and pagination.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier (default: 'primary' for user's main calendar)",
      },
      timeMin: {
        type: "string",
        description: "Lower bound (inclusive) for event start time (ISO 8601 format, e.g., '2024-01-01T00:00:00Z')",
      },
      timeMax: {
        type: "string",
        description: "Upper bound (exclusive) for event end time (ISO 8601 format)",
      },
      q: {
        type: "string",
        description: "Free text search terms to find events matching title, description, location, attendee emails, etc.",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of events to return (default: 10, max: 250)",
      },
      pageToken: {
        type: "string",
        description: "Token for pagination to get the next page of results",
      },
      singleEvents: {
        type: "boolean",
        description: "Whether to expand recurring events into instances (default: true)",
      },
      orderBy: {
        type: "string",
        description: "Order of events: 'startTime' (chronological) or 'updated' (modification time). Requires singleEvents=true for 'startTime'",
      },
    },
    required: [],
  },
} as const;

export async function listEvents(
  args: CalendarListEventsInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId = "primary",
      timeMin,
      timeMax,
      q,
      maxResults = 10,
      pageToken,
      singleEvents = true,
      orderBy = "startTime",
    } = args;

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      q,
      maxResults: Math.min(maxResults, 250),
      pageToken,
      singleEvents,
      orderBy: singleEvents ? orderBy : undefined,
    });

    const events = response.data.items || [];
    const nextPageToken = response.data.nextPageToken;

    if (events.length === 0) {
      return ResponseFormatter.success(
        {
          count: 0,
          events: [],
          calendarId,
        },
        `No events found in calendar: ${calendarId}`,
      );
    }

    const formattedOutput = formatEventList(events, calendarId);

    return ResponseFormatter.success(
      {
        count: events.length,
        calendarId,
        events: events.map((e) => ({
          id: e.id,
          summary: e.summary,
          start: e.start,
          end: e.end,
          htmlLink: e.htmlLink,
        })),
        nextPageToken,
      },
      `Events from ${calendarId}:\n\n${formattedOutput}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
