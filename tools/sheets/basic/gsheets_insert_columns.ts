import { google } from "googleapis";
import { GSheetsInsertColumnsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_insert_columns",
  description: "Insert empty columns into a Google Spreadsheet",
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
        description: "The starting column index (0-based) where columns will be inserted",
      },
      count: {
        type: "number",
        description: "The number of columns to insert",
      },
    },
    required: ["spreadsheetId", "sheetId", "startIndex", "count"],
  },
} as const;


export async function insertColumns(
  args: GSheetsInsertColumnsInput,
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
          text: `Successfully inserted ${args.count} column(s) starting at index ${args.startIndex}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error inserting columns: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
