import { google } from "googleapis";
import { CalendarCreateEventInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatEvent, parseDateTime, formatAttendees, validateTimeRange } from "../../../lib/calendar-helpers.js";

export const schema = {
  name: "calendar_create_event",
  description:
    "Create a new event in Google Calendar with specified details. Supports setting title, time, location, description, attendees, and conference data (Google Meet). Can create all-day events or timed events with specific start/end times.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier (default: 'primary' for user's main calendar)",
      },
      summary: {
        type: "string",
        description: "Event title/summary",
      },
      startTime: {
        type: "string",
        description: "Event start time (ISO 8601 format: '2024-01-15T10:00:00Z' or date only: '2024-01-15' for all-day)",
      },
      endTime: {
        type: "string",
        description: "Event end time (ISO 8601 format: '2024-01-15T11:00:00Z' or date only: '2024-01-16' for all-day)",
      },
      location: {
        type: "string",
        description: "Event location (address or place name)",
      },
      description: {
        type: "string",
        description: "Event description (supports plain text and HTML)",
      },
      attendees: {
        type: "array",
        items: {
          type: "string",
        },
        description: "List of attendee email addresses",
      },
      sendUpdates: {
        type: "string",
        description: "Whether to send event notifications: 'all' (send to all attendees), 'externalOnly' (external only), 'none' (no notifications). Default: 'none'",
      },
      conferenceData: {
        type: "boolean",
        description: "Whether to create a Google Meet conference link (default: false)",
      },
    },
    required: ["summary", "startTime", "endTime"],
  },
} as const;

export async function createEvent(
  args: CalendarCreateEventInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId = "primary",
      summary,
      startTime,
      endTime,
      location,
      description,
      attendees,
      sendUpdates = "none",
      conferenceData = false,
    } = args;

    // Validate time range
    const validation = validateTimeRange(startTime, endTime);
    if (!validation.valid) {
      return ResponseFormatter.error(new Error(validation.error));
    }

    // Parse start and end times
    const start = parseDateTime(startTime);
    const end = parseDateTime(endTime);

    // Build event resource
    const eventResource: any = {
      summary,
      start,
      end,
    };

    if (location) {
      eventResource.location = location;
    }

    if (description) {
      eventResource.description = description;
    }

    if (attendees && attendees.length > 0) {
      eventResource.attendees = formatAttendees(attendees);
    }

    if (conferenceData) {
      eventResource.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      };
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventResource,
      sendUpdates,
      conferenceDataVersion: conferenceData ? 1 : undefined,
    });

    const event = response.data;

    if (!event) {
      return ResponseFormatter.error(
        new Error("Failed to create event"),
      );
    }

    const formattedOutput = formatEvent(event, calendarId);

    return ResponseFormatter.success(
      {
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink,
        conferenceData: event.conferenceData,
      },
      `Event created successfully:\n\n${formattedOutput}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
