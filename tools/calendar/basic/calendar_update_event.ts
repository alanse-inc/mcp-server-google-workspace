import { google } from "googleapis";
import { CalendarUpdateEventInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatEvent, parseDateTime, formatAttendees, validateTimeRange } from "../../../lib/calendar-helpers.js";

export const schema = {
  name: "calendar_update_event",
  description:
    "Update an existing calendar event. Can modify title, time, location, description, attendees, and other event properties. Only specified fields will be updated; unspecified fields remain unchanged.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier (default: 'primary' for user's main calendar)",
      },
      eventId: {
        type: "string",
        description: "Event identifier to update",
      },
      summary: {
        type: "string",
        description: "New event title/summary",
      },
      startTime: {
        type: "string",
        description: "New event start time (ISO 8601 format: '2024-01-15T10:00:00Z' or date only: '2024-01-15' for all-day)",
      },
      endTime: {
        type: "string",
        description: "New event end time (ISO 8601 format: '2024-01-15T11:00:00Z' or date only: '2024-01-16' for all-day)",
      },
      location: {
        type: "string",
        description: "New event location",
      },
      description: {
        type: "string",
        description: "New event description",
      },
      attendees: {
        type: "array",
        items: {
          type: "string",
        },
        description: "New list of attendee email addresses (replaces existing attendees)",
      },
      sendUpdates: {
        type: "string",
        description: "Whether to send event notifications: 'all', 'externalOnly', 'none'. Default: 'all'",
      },
    },
    required: ["eventId"],
  },
} as const;

export async function updateEvent(
  args: CalendarUpdateEventInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId = "primary",
      eventId,
      summary,
      startTime,
      endTime,
      location,
      description,
      attendees,
      sendUpdates = "all",
    } = args;

    // First, get the existing event
    const existingResponse = await calendar.events.get({
      calendarId,
      eventId,
    });

    const existingEvent = existingResponse.data;

    if (!existingEvent) {
      return ResponseFormatter.error(
        new Error(`Event not found: ${eventId}`),
      );
    }

    // Build update resource with only specified fields
    const eventResource: any = {
      ...existingEvent,
    };

    if (summary !== undefined) {
      eventResource.summary = summary;
    }

    if (startTime !== undefined && endTime !== undefined) {
      // Validate time range if both are provided
      const validation = validateTimeRange(startTime, endTime);
      if (!validation.valid) {
        return ResponseFormatter.error(new Error(validation.error));
      }

      eventResource.start = parseDateTime(startTime);
      eventResource.end = parseDateTime(endTime);
    } else if (startTime !== undefined || endTime !== undefined) {
      return ResponseFormatter.error(
        new Error("Both startTime and endTime must be provided together"),
      );
    }

    if (location !== undefined) {
      eventResource.location = location;
    }

    if (description !== undefined) {
      eventResource.description = description;
    }

    if (attendees !== undefined) {
      eventResource.attendees = formatAttendees(attendees);
    }

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventResource,
      sendUpdates,
    });

    const event = response.data;

    if (!event) {
      return ResponseFormatter.error(
        new Error("Failed to update event"),
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
      },
      `Event updated successfully:\n\n${formattedOutput}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
