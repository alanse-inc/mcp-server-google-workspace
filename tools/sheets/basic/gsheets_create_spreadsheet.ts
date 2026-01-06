import { google } from "googleapis";
import { GSheetsCreateSpreadsheetInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_create_spreadsheet",
  description: "Create a new Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "The title of the new spreadsheet",
      },
      sheets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Sheet title",
            },
            rowCount: {
              type: "number",
              description: "Number of rows (default: 1000)",
            },
            columnCount: {
              type: "number",
              description: "Number of columns (default: 26)",
            },
          },
          required: ["title"],
        },
        description: "Initial sheets to create (optional)",
      },
    },
    required: ["title"],
  },
} as const;

export async function createSpreadsheet(
  args: GSheetsCreateSpreadsheetInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const requestBody: any = {
      properties: {
        title: args.title,
      },
    };

    if (args.sheets && args.sheets.length > 0) {
      requestBody.sheets = args.sheets.map((sheet) => ({
        properties: {
          title: sheet.title,
          gridProperties: {
            rowCount: sheet.rowCount || 1000,
            columnCount: sheet.columnCount || 26,
          },
        },
      }));
    }

    const response = await sheets.spreadsheets.create({
      requestBody,
    });

    const spreadsheetId = response.data.spreadsheetId;
    const spreadsheetUrl = response.data.spreadsheetUrl;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            spreadsheetId,
            spreadsheetUrl,
            title: args.title,
            sheetsCount: response.data.sheets?.length || 0,
          }, null, 2),
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating spreadsheet: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
