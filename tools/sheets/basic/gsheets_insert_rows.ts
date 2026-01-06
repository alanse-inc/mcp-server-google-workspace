import { google } from "googleapis";
import { GSheetsInsertRowsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_insert_rows",
  description: "Insert empty rows into a Google Spreadsheet",
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
        description: "The starting row index (0-based) where rows will be inserted",
      },
      count: {
        type: "number",
        description: "The number of rows to insert",
      },
    },
    required: ["spreadsheetId", "sheetId", "startIndex", "count"],
  },
} as const;


export async function insertRows(
  args: GSheetsInsertRowsInput,
): Promise<InternalToolResponse> {
  const sheets = google.sheets("v4");
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
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
          text: `Successfully inserted ${args.count} row(s) starting at index ${args.startIndex}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error inserting rows: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
