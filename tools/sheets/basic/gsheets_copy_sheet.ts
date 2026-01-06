import { google } from "googleapis";
import { GSheetsCopySheetInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_copy_sheet",
  description: "Copy a sheet to another spreadsheet or within the same spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      sourceSpreadsheetId: {
        type: "string",
        description: "The ID of the source spreadsheet",
      },
      sourceSheetId: {
        type: "number",
        description: "The ID of the sheet to copy",
      },
      destinationSpreadsheetId: {
        type: "string",
        description: "The ID of the destination spreadsheet",
      },
    },
    required: ["sourceSpreadsheetId", "sourceSheetId", "destinationSpreadsheetId"],
  },
} as const;


export async function copySheet(
  args: GSheetsCopySheetInput,
): Promise<InternalToolResponse> {
  const sheets = google.sheets("v4");
  try {
    const response = await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: args.sourceSpreadsheetId,
      sheetId: args.sourceSheetId,
      requestBody: {
        destinationSpreadsheetId: args.destinationSpreadsheetId,
      },
    });

    const copiedSheet = response.data;
    return {
      content: [
        {
          type: "text",
          text: `Successfully copied sheet to destination. New sheet ID: ${copiedSheet.sheetId}, Title: "${copiedSheet.title}"`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error copying sheet: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
