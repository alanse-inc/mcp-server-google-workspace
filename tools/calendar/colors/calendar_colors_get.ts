import { google } from "googleapis";
import { InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_colors_get",
  description:
    "Get the color definitions available for calendars and events. Returns a palette of colors with their IDs and hex values that can be used when creating or updating calendars and events. Useful for UI display and color selection.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
} as const;

export async function getColors(): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");

    const response = await calendar.colors.get();

    const data = response.data;
    const calendarColors = data.calendar || {};
    const eventColors = data.event || {};

    let message = `🎨 Google Calendar Color Palette\n\n`;

    // Calendar Colors
    message += `📅 Calendar Colors:\n`;
    Object.entries(calendarColors).forEach(([id, colorData]: [string, any]) => {
      message += `  ${id}: Background ${colorData.background}, Foreground ${colorData.foreground}\n`;
    });

    message += `\n📌 Event Colors:\n`;
    Object.entries(eventColors).forEach(([id, colorData]: [string, any]) => {
      message += `  ${id}: Background ${colorData.background}, Foreground ${colorData.foreground}\n`;
    });

    message += `\n💡 Usage: Use these color IDs when creating or updating calendars and events.`;

    return ResponseFormatter.success(
      {
        calendarColors: Object.entries(calendarColors).map(([id, data]: [string, any]) => ({
          id,
          background: data.background,
          foreground: data.foreground,
        })),
        eventColors: Object.entries(eventColors).map(([id, data]: [string, any]) => ({
          id,
          background: data.background,
          foreground: data.foreground,
        })),
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
