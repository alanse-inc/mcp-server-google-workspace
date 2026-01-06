import { google } from "googleapis";
import { GSheetsCreateFilterInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_create_filter",
  description: "Create a basic filter for a range in a Google Spreadsheet",
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
      startRow: {
        type: "number",
        description: "Starting row index (0-based)",
      },
      endRow: {
        type: "number",
        description: "Ending row index (exclusive, 0-based)",
      },
      startColumn: {
        type: "number",
        description: "Starting column index (0-based)",
      },
      endColumn: {
        type: "number",
        description: "Ending column index (exclusive, 0-based)",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn"],
  },
} as const;

export async function createFilter(
  args: GSheetsCreateFilterInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            setBasicFilter: {
              filter: {
                range: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRow,
                  endRowIndex: args.endRow,
                  startColumnIndex: args.startColumn,
                  endColumnIndex: args.endColumn,
                },
              },
            },
          },
        ],
      },
    });

    const rangeStr = `R${args.startRow}C${args.startColumn}:R${args.endRow - 1}C${args.endColumn - 1}`;
    return {
      content: [
        {
          type: "text",
          text: `Successfully created filter for range ${rangeStr}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating filter: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
