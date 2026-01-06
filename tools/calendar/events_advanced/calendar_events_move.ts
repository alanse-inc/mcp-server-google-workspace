import { google } from "googleapis";
import { CalendarEventsMoveInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatEvent } from "../../../lib/calendar-helpers.js";

export const schema = {
  name: "calendar_events_move",
  description:
    "Move an event from one calendar to another. This changes the event's organizer to the destination calendar owner. Only works with default events (not recurring event instances). The event is removed from the source calendar and appears in the destination calendar.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Source calendar identifier where the event currently exists",
      },
      eventId: {
        type: "string",
        description: "Event identifier to move",
      },
      destination: {
        type: "string",
        description: "Destination calendar identifier where the event will be moved to",
      },
      sendUpdates: {
        type: "string",
        description: "Whether to send event notifications: 'all', 'externalOnly', 'none'. Default: 'none'",
      },
    },
    required: ["calendarId", "eventId", "destination"],
  },
} as const;

export async function moveEvent(
  args: CalendarEventsMoveInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId,
      eventId,
      destination,
      sendUpdates = "none",
    } = args;

    // Get event details before moving
    const originalEvent = await calendar.events.get({
      calendarId,
      eventId,
    });

    const response = await calendar.events.move({
      calendarId,
      eventId,
      destination,
      sendUpdates,
    });

    const event = response.data;

    let message = `✅ Event moved successfully\n\n`;
    message += `From Calendar: ${calendarId}\n`;
    message += `To Calendar: ${destination}\n\n`;
    message += formatEvent(event, destination);

    return ResponseFormatter.success(
      {
        eventId: event.id,
        sourceCalendar: calendarId,
        destinationCalendar: destination,
        summary: event.summary,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink,
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
