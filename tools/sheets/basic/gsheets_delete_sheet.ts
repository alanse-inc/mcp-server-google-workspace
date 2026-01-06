import { google } from "googleapis";
import { GSheetsDeleteSheetInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_delete_sheet",
  description: "Delete a sheet (tab) from a Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      sheetId: {
        type: "number",
        description: "The ID of the sheet to delete",
      },
    },
    required: ["spreadsheetId", "sheetId"],
  },
} as const;


export async function deleteSheet(
  args: GSheetsDeleteSheetInput,
): Promise<InternalToolResponse> {
  const sheets = google.sheets("v4");
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteSheet: {
              sheetId: args.sheetId,
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted sheet with ID ${args.sheetId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting sheet: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
