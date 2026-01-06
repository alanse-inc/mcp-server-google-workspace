import { google } from "googleapis";
import { CalendarEventsInstancesInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatEventList } from "../../../lib/calendar-helpers.js";

export const schema = {
  name: "calendar_events_instances",
  description:
    "Get all instances of a recurring event within a specified time range. Returns individual occurrences of repeating events, allowing you to see each instance's specific date and time. Useful for viewing or managing individual occurrences of a recurring meeting or appointment.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier (default: 'primary' for user's main calendar)",
      },
      eventId: {
        type: "string",
        description: "Recurring event identifier",
      },
      timeMin: {
        type: "string",
        description: "Lower bound (inclusive) for instances (RFC3339 format, e.g., '2024-01-15T00:00:00Z')",
      },
      timeMax: {
        type: "string",
        description: "Upper bound (exclusive) for instances (RFC3339 format, e.g., '2024-01-31T23:59:59Z')",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of instances to return (default: 250, max: 2500)",
      },
      pageToken: {
        type: "string",
        description: "Token for accessing subsequent result pages",
      },
      showDeleted: {
        type: "boolean",
        description: "Include cancelled instances (default: false)",
      },
    },
    required: ["eventId"],
  },
} as const;

export async function listEventInstances(
  args: CalendarEventsInstancesInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId = "primary",
      eventId,
      timeMin,
      timeMax,
      maxResults,
      pageToken,
      showDeleted,
    } = args;

    const response = await calendar.events.instances({
      calendarId,
      eventId,
      timeMin,
      timeMax,
      maxResults,
      pageToken,
      showDeleted,
    });

    const instances = response.data.items || [];
    const totalInstances = instances.length;

    if (totalInstances === 0) {
      return ResponseFormatter.success(
        { instances: [], count: 0 },
        "No instances found for this recurring event in the specified time range.",
      );
    }

    const message = formatEventList(instances, calendarId);

    let resultMessage = `🔁 Recurring Event Instances (${totalInstances} instance${totalInstances > 1 ? "s" : ""})\n\n`;
    resultMessage += message;

    if (response.data.nextPageToken) {
      resultMessage += `\n\n📄 Next Page Token: ${response.data.nextPageToken}`;
    }

    return ResponseFormatter.success(
      {
        instances: instances.map((inst) => ({
          id: inst.id,
          summary: inst.summary,
          start: inst.start,
          end: inst.end,
          status: inst.status,
        })),
        count: totalInstances,
        nextPageToken: response.data.nextPageToken || null,
      },
      resultMessage,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
