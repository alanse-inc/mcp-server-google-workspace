import { google } from "googleapis";
import { GSheetsListSheetsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_list_sheets",
  description: "List all sheets (tabs) within a Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
    },
    required: ["spreadsheetId"],
  },
} as const;

export async function listSheets(
  args: GSheetsListSheetsInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");
    const response = await sheets.spreadsheets.get({
      spreadsheetId: args.spreadsheetId,
      fields: "sheets.properties",
    });

    const sheetsList = response.data.sheets?.map((sheet) => ({
      sheetId: sheet.properties?.sheetId,
      title: sheet.properties?.title,
      index: sheet.properties?.index,
      gridProperties: {
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount,
      },
    })) || [];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ sheets: sheetsList }, null, 2),
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing sheets: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
