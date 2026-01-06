import { google } from "googleapis";
import { CalendarCalendarsGetInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_calendars_get",
  description:
    "Get metadata for a specific calendar. Returns calendar information including title, description, location, and timezone. Use 'primary' to access the currently logged-in user's main calendar, or provide a specific calendar ID.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier. Use 'primary' for the user's primary calendar.",
      },
    },
    required: ["calendarId"],
  },
} as const;

export async function getCalendar(
  args: CalendarCalendarsGetInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const { calendarId } = args;

    const response = await calendar.calendars.get({
      calendarId,
    });

    const cal = response.data;

    let message = `📅 Calendar: ${cal.summary}\n\n`;
    message += `ID: ${cal.id}\n`;

    if (cal.description) {
      message += `Description: ${cal.description}\n`;
    }

    if (cal.location) {
      message += `Location: ${cal.location}\n`;
    }

    if (cal.timeZone) {
      message += `Time Zone: ${cal.timeZone}\n`;
    }

    if (cal.conferenceProperties) {
      message += `\n📞 Conference Properties:\n`;
      message += `  Allowed Conference Solution Types: ${cal.conferenceProperties.allowedConferenceSolutionTypes?.join(", ") || "None"}\n`;
    }

    return ResponseFormatter.success(
      {
        calendarId: cal.id,
        summary: cal.summary,
        description: cal.description || null,
        location: cal.location || null,
        timeZone: cal.timeZone || null,
        etag: cal.etag,
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
