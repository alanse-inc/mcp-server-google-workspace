import { google } from "googleapis";
import { CalendarCalendarsUpdateInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_calendars_update",
  description:
    "Update metadata for an existing calendar. You can modify the calendar's title, description, location, and timezone. All fields are optional - only provide the fields you want to update. Use 'primary' to update the user's primary calendar.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier. Use 'primary' for the user's primary calendar.",
      },
      summary: {
        type: "string",
        description: "New title for the calendar",
      },
      description: {
        type: "string",
        description: "New description for the calendar",
      },
      location: {
        type: "string",
        description: "New geographic location as free-form text",
      },
      timeZone: {
        type: "string",
        description: "New IANA Time Zone Database name (e.g., 'America/New_York')",
      },
    },
    required: ["calendarId"],
  },
} as const;

export async function updateCalendar(
  args: CalendarCalendarsUpdateInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId,
      summary,
      description,
      location,
      timeZone,
    } = args;

    // Get current calendar data
    const currentCalendar = await calendar.calendars.get({
      calendarId,
    });

    if (!currentCalendar.data) {
      return ResponseFormatter.error(
        new Error(`Calendar with ID '${calendarId}' not found.`),
      );
    }

    // Prepare update payload with only provided fields
    const updatePayload: any = {};
    if (summary !== undefined) updatePayload.summary = summary;
    if (description !== undefined) updatePayload.description = description;
    if (location !== undefined) updatePayload.location = location;
    if (timeZone !== undefined) updatePayload.timeZone = timeZone;

    if (Object.keys(updatePayload).length === 0) {
      return ResponseFormatter.error(
        new Error("No fields provided to update. Specify at least one field: summary, description, location, or timeZone."),
      );
    }

    const response = await calendar.calendars.update({
      calendarId,
      requestBody: updatePayload,
    });

    const cal = response.data;

    let message = `✅ Calendar updated successfully\n\n`;
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
