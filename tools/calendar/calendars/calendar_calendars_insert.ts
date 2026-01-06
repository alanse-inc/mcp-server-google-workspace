import { google } from "googleapis";
import { CalendarCalendarsInsertInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_calendars_insert",
  description:
    "Create a new secondary calendar. The authenticated user becomes the owner of the new calendar. You can specify the calendar's title, description, location, and timezone. This is different from the primary calendar which is created automatically with the user account.",
  inputSchema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "Title of the calendar (required)",
      },
      description: {
        type: "string",
        description: "Description of the calendar",
      },
      location: {
        type: "string",
        description: "Geographic location as free-form text",
      },
      timeZone: {
        type: "string",
        description: "IANA Time Zone Database name (e.g., 'America/New_York', 'Europe/London')",
      },
    },
    required: ["summary"],
  },
} as const;

export async function insertCalendar(
  args: CalendarCalendarsInsertInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      summary,
      description,
      location,
      timeZone,
    } = args;

    const response = await calendar.calendars.insert({
      requestBody: {
        summary,
        description,
        location,
        timeZone,
      },
    });

    const cal = response.data;

    let message = `✅ Calendar created successfully\n\n`;
    message += `📅 ${cal.summary}\n`;
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

    message += `\n💡 You are now the owner of this calendar.`;

    return ResponseFormatter.success(
      {
        calendarId: cal.id,
        summary: cal.summary,
        description: cal.description || null,
        location: cal.location || null,
        timeZone: cal.timeZone || null,
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
