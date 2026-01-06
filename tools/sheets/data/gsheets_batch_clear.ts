import { google } from "googleapis";
import { GSheetsBatchClearInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_batch_clear",
  description: "Clear data from multiple ranges in a Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      ranges: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of A1 notation ranges to clear (e.g., ['Sheet1!A1:B10', 'Sheet2!C5:D20'])",
      },
    },
    required: ["spreadsheetId", "ranges"],
  },
} as const;

export async function batchClear(
  args: GSheetsBatchClearInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const response = await sheets.spreadsheets.values.batchClear({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        ranges: args.ranges,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully cleared ${args.ranges.length} range(s): ${args.ranges.join(", ")}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error clearing ranges: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
