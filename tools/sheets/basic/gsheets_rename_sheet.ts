import { google } from "googleapis";
import { GSheetsRenameSheetInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_rename_sheet",
  description: "Rename a sheet in a Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      sheetId: {
        type: "number",
        description: "The ID of the sheet to rename",
      },
      newTitle: {
        type: "string",
        description: "The new title for the sheet",
      },
    },
    required: ["spreadsheetId", "sheetId", "newTitle"],
  },
} as const;

export async function renameSheet(
  args: GSheetsRenameSheetInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: args.sheetId,
                title: args.newTitle,
              },
              fields: "title",
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully renamed sheet ${args.sheetId} to "${args.newTitle}"`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error renaming sheet: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
