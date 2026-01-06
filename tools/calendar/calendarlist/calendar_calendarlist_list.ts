import { google } from "googleapis";
import { CalendarListListInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_calendarlist_list",
  description:
    "List all calendars in the user's calendar list. Returns information about each calendar including ID, summary, description, and access role. Supports pagination and filtering by access level.",
  inputSchema: {
    type: "object",
    properties: {
      maxResults: {
        type: "number",
        description: "Maximum number of calendars to return per page (default: 100, max: 250)",
      },
      minAccessRole: {
        type: "string",
        description: "Minimum access role filter: 'freeBusyReader', 'owner', 'reader', or 'writer'",
      },
      pageToken: {
        type: "string",
        description: "Token for accessing subsequent result pages",
      },
      showDeleted: {
        type: "boolean",
        description: "Include deleted calendar entries (default: false)",
      },
      showHidden: {
        type: "boolean",
        description: "Include hidden entries (default: false)",
      },
    },
    required: [],
  },
} as const;

export async function listCalendarList(
  args: CalendarListListInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      maxResults,
      minAccessRole,
      pageToken,
      showDeleted,
      showHidden,
    } = args;

    const response = await calendar.calendarList.list({
      maxResults,
      minAccessRole,
      pageToken,
      showDeleted,
      showHidden,
    });

    const calendars = response.data.items || [];
    const totalCalendars = calendars.length;

    if (totalCalendars === 0) {
      return ResponseFormatter.success(
        { calendars: [], count: 0 },
        "No calendars found in the calendar list.",
      );
    }

    // Format calendar list
    const calendarList = calendars.map((cal) => ({
      id: cal.id,
      summary: cal.summary,
      description: cal.description || null,
      timeZone: cal.timeZone,
      accessRole: cal.accessRole,
      primary: cal.primary || false,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor,
    }));

    let message = `📅 Calendar List (${totalCalendars} calendar${totalCalendars > 1 ? "s" : ""})\n\n`;

    calendars.forEach((cal, index) => {
      const isPrimary = cal.primary ? " [PRIMARY]" : "";
      message += `${index + 1}. ${cal.summary}${isPrimary}\n`;
      message += `   ID: ${cal.id}\n`;
      message += `   Access Role: ${cal.accessRole}\n`;
      if (cal.description) {
        message += `   Description: ${cal.description}\n`;
      }
      message += `   Time Zone: ${cal.timeZone}\n`;
      if (cal.backgroundColor) {
        message += `   Colors: BG ${cal.backgroundColor}, FG ${cal.foregroundColor}\n`;
      }
      message += "\n";
    });

    if (response.data.nextPageToken) {
      message += `\n📄 Next Page Token: ${response.data.nextPageToken}`;
    }

    return ResponseFormatter.success(
      {
        calendars: calendarList,
        count: totalCalendars,
        nextPageToken: response.data.nextPageToken || null,
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
