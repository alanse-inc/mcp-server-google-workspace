import { google } from "googleapis";
import { GSheetsClearDataInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_clear_data",
  description: "Clear data from specified ranges in a Google Spreadsheet",
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
        description: "Array of A1 notation ranges to clear (e.g., ['Sheet1!A1:B10', 'Sheet2!C1:D5'])",
      },
    },
    required: ["spreadsheetId", "ranges"],
  },
} as const;


export async function clearData(
  args: GSheetsClearDataInput,
): Promise<InternalToolResponse> {
  const sheets = google.sheets("v4");
  try {
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
          text: `Error clearing data: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
