import { google } from "googleapis";
import { CalendarGetEventInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatEvent } from "../../../lib/calendar-helpers.js";

export const schema = {
  name: "calendar_get_event",
  description:
    "Get detailed information about a specific calendar event by its ID. Returns comprehensive event details including title, time, location, description, attendees, recurrence rules, and conference data (Google Meet links).",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier (default: 'primary' for user's main calendar)",
      },
      eventId: {
        type: "string",
        description: "Event identifier to retrieve",
      },
    },
    required: ["eventId"],
  },
} as const;

export async function getEvent(
  args: CalendarGetEventInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const { calendarId = "primary", eventId } = args;

    const response = await calendar.events.get({
      calendarId,
      eventId,
    });

    const event = response.data;

    if (!event) {
      return ResponseFormatter.error(
        new Error(`Event not found: ${eventId}`),
      );
    }

    const formattedOutput = formatEvent(event, calendarId);

    return ResponseFormatter.success(
      {
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        location: event.location,
        description: event.description,
        attendees: event.attendees,
        htmlLink: event.htmlLink,
        conferenceData: event.conferenceData,
        recurrence: event.recurrence,
        status: event.status,
      },
      `Event details:\n\n${formattedOutput}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
