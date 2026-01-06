import { google } from "googleapis";
import { GSheetsDeleteRowsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_delete_rows",
  description: "Delete rows from a Google Spreadsheet",
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
        description: "The starting row index (0-based) to delete",
      },
      count: {
        type: "number",
        description: "The number of rows to delete",
      },
    },
    required: ["spreadsheetId", "sheetId", "startIndex", "count"],
  },
} as const;


export async function deleteRows(
  args: GSheetsDeleteRowsInput,
): Promise<InternalToolResponse> {
  const sheets = google.sheets("v4");
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: args.sheetId,
                dimension: "ROWS",
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
          text: `Successfully deleted ${args.count} row(s) starting at index ${args.startIndex}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting rows: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
