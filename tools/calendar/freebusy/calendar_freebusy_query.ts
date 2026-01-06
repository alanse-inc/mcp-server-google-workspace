import { google } from "googleapis";
import { CalendarFreeBusyQueryInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatFreeBusyResponse } from "../../../lib/calendar-helpers.js";

export const schema = {
  name: "calendar_freebusy_query",
  description:
    "Query free/busy information for one or more calendars within a specified time range. Returns busy time periods to help schedule meetings or check availability. Useful for finding meeting slots that work for multiple attendees.",
  inputSchema: {
    type: "object",
    properties: {
      timeMin: {
        type: "string",
        description: "Start of the time range to query (ISO 8601 format, e.g., '2024-01-01T00:00:00Z')",
      },
      timeMax: {
        type: "string",
        description: "End of the time range to query (ISO 8601 format)",
      },
      calendars: {
        type: "array",
        items: {
          type: "string",
        },
        description: "List of calendar IDs to query (default: ['primary'])",
      },
      timeZone: {
        type: "string",
        description: "Time zone for the query (e.g., 'America/New_York', 'UTC'). Default: UTC",
      },
    },
    required: ["timeMin", "timeMax"],
  },
} as const;

export async function queryFreeBusy(
  args: CalendarFreeBusyQueryInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      timeMin,
      timeMax,
      calendars = ["primary"],
      timeZone = "UTC",
    } = args;

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone,
        items: calendars.map((id) => ({ id })),
      },
    });

    const freeBusyData = response.data;

    if (!freeBusyData) {
      return ResponseFormatter.error(
        new Error("Failed to query free/busy information"),
      );
    }

    const formattedOutput = formatFreeBusyResponse(freeBusyData);

    // Calculate total busy periods across all calendars
    let totalBusyPeriods = 0;
    if (freeBusyData.calendars) {
      Object.values(freeBusyData.calendars).forEach((cal) => {
        if (cal.busy) {
          totalBusyPeriods += cal.busy.length;
        }
      });
    }

    return ResponseFormatter.success(
      {
        timeMin: freeBusyData.timeMin,
        timeMax: freeBusyData.timeMax,
        calendars: freeBusyData.calendars,
        totalBusyPeriods,
      },
      `Free/Busy query results:\n\n${formattedOutput}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
