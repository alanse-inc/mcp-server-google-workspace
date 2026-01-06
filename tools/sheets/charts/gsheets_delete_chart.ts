import { google } from "googleapis";
import { GSheetsDeleteChartInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_delete_chart",
  description: "Delete a chart from a spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      chartId: {
        type: "number",
        description: "The ID of the chart to delete",
      },
    },
    required: ["spreadsheetId", "chartId"],
  },
} as const;

export async function deleteChart(
  args: GSheetsDeleteChartInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteEmbeddedObject: {
              objectId: args.chartId,
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted chart ${args.chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
