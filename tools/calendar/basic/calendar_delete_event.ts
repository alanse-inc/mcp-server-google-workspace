import { google } from "googleapis";
import { CalendarDeleteEventInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_delete_event",
  description:
    "Delete a calendar event permanently. This action cannot be undone. Optionally send notifications to attendees about the event cancellation.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier (default: 'primary' for user's main calendar)",
      },
      eventId: {
        type: "string",
        description: "Event identifier to delete",
      },
      sendUpdates: {
        type: "string",
        description: "Whether to send event cancellation notifications: 'all', 'externalOnly', 'none'. Default: 'all'",
      },
    },
    required: ["eventId"],
  },
} as const;

export async function deleteEvent(
  args: CalendarDeleteEventInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId = "primary",
      eventId,
      sendUpdates = "all",
    } = args;

    // Get event details before deletion for confirmation message
    const eventResponse = await calendar.events.get({
      calendarId,
      eventId,
    });

    const event = eventResponse.data;
    const eventTitle = event.summary || "(No title)";

    // Delete the event
    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates,
    });

    return ResponseFormatter.success(
      {
        deleted: true,
        eventId,
        calendarId,
        summary: eventTitle,
      },
      `Event "${eventTitle}" (ID: ${eventId}) has been deleted successfully.`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
