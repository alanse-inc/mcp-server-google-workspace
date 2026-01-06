import { google } from "googleapis";
import { CalendarEventsQuickAddInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatEvent } from "../../../lib/calendar-helpers.js";

export const schema = {
  name: "calendar_events_quickadd",
  description:
    "Create a calendar event from a simple text description using natural language processing. Examples: 'Meeting with John tomorrow at 2pm', 'Lunch at noon on Friday', 'Conference call next Monday 10-11am'. The system automatically parses the text to extract event details.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier (default: 'primary' for user's main calendar)",
      },
      text: {
        type: "string",
        description: "Natural language text describing the event (e.g., 'Dinner with Sarah tomorrow at 7pm')",
      },
      sendUpdates: {
        type: "string",
        description: "Whether to send event notifications: 'all', 'externalOnly', 'none'. Default: 'none'",
      },
    },
    required: ["text"],
  },
} as const;

export async function quickAddEvent(
  args: CalendarEventsQuickAddInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId = "primary",
      text,
      sendUpdates = "none",
    } = args;

    const response = await calendar.events.quickAdd({
      calendarId,
      text,
      sendUpdates,
    });

    const event = response.data;

    let message = `✅ Event created via QuickAdd\n\n`;
    message += `Input Text: "${text}"\n\n`;
    message += formatEvent(event, calendarId);

    return ResponseFormatter.success(
      {
        eventId: event.id,
        calendarId,
        summary: event.summary,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink,
        inputText: text,
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
