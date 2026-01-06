import { google } from "googleapis";
import { GSheetsDeleteColumnsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_delete_columns",
  description: "Delete columns from a Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      sheetId: {
        type: "number",
        description: "The ID of the sheet",
      },
      startIndex: {
        type: "number",
        description: "The starting column index (0-based) to delete",
      },
      count: {
        type: "number",
        description: "The number of columns to delete",
      },
    },
    required: ["spreadsheetId", "sheetId", "startIndex", "count"],
  },
} as const;

export async function deleteColumns(
  args: GSheetsDeleteColumnsInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: args.sheetId,
                dimension: "COLUMNS",
                startIndex: args.startIndex,
                endIndex: args.startIndex + args.count,
              },
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted ${args.count} column(s) starting at index ${args.startIndex}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting columns: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
