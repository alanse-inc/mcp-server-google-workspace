import { google } from "googleapis";
import { CalendarListGetInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_calendarlist_get",
  description:
    "Get detailed information about a specific calendar from the user's calendar list. Returns calendar metadata including access role, notifications, and display settings.",
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

export async function getCalendarListEntry(
  args: CalendarListGetInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const { calendarId } = args;

    const response = await calendar.calendarList.get({
      calendarId,
    });

    const cal = response.data;

    let message = `📅 Calendar: ${cal.summary}\n\n`;
    message += `ID: ${cal.id}\n`;
    message += `Access Role: ${cal.accessRole}\n`;
    message += `Time Zone: ${cal.timeZone}\n`;

    if (cal.description) {
      message += `Description: ${cal.description}\n`;
    }

    if (cal.location) {
      message += `Location: ${cal.location}\n`;
    }

    if (cal.primary) {
      message += `Primary Calendar: Yes\n`;
    }

    if (cal.backgroundColor) {
      message += `\n🎨 Display Colors:\n`;
      message += `  Background: ${cal.backgroundColor}\n`;
      message += `  Foreground: ${cal.foregroundColor}\n`;
    }

    if (cal.defaultReminders && cal.defaultReminders.length > 0) {
      message += `\n⏰ Default Reminders:\n`;
      cal.defaultReminders.forEach((reminder) => {
        message += `  - ${reminder.method}: ${reminder.minutes} minutes before\n`;
      });
    }

    if (cal.notificationSettings) {
      message += `\n🔔 Notification Settings:\n`;
      cal.notificationSettings.notifications?.forEach((notif) => {
        message += `  - ${notif.type}: ${notif.method}\n`;
      });
    }

    return ResponseFormatter.success(
      {
        calendar: {
          id: cal.id,
          summary: cal.summary,
          description: cal.description || null,
          location: cal.location || null,
          timeZone: cal.timeZone,
          accessRole: cal.accessRole,
          primary: cal.primary || false,
          backgroundColor: cal.backgroundColor,
          foregroundColor: cal.foregroundColor,
          defaultReminders: cal.defaultReminders || [],
        },
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
