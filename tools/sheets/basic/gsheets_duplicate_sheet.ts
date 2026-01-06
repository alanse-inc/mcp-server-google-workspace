import { google } from "googleapis";
import { GSheetsDuplicateSheetInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_duplicate_sheet",
  description: "Duplicate a sheet within the same spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      sourceSheetId: {
        type: "number",
        description: "The ID of the sheet to duplicate",
      },
      newSheetName: {
        type: "string",
        description: "The name for the duplicated sheet (optional)",
      },
      insertSheetIndex: {
        type: "number",
        description: "The index where the new sheet should be inserted (optional)",
      },
    },
    required: ["spreadsheetId", "sourceSheetId"],
  },
} as const;

export async function duplicateSheet(
  args: GSheetsDuplicateSheetInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const duplicateRequest: any = {
      sourceSheetId: args.sourceSheetId,
    };

    if (args.insertSheetIndex !== undefined) {
      duplicateRequest.insertSheetIndex = args.insertSheetIndex;
    }

    if (args.newSheetName !== undefined) {
      duplicateRequest.newSheetName = args.newSheetName;
    }

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            duplicateSheet: duplicateRequest,
          },
        ],
      },
    });

    const duplicatedSheet = response.data.replies?.[0]?.duplicateSheet?.properties;

    return {
      content: [
        {
          type: "text",
          text: `Successfully duplicated sheet. New sheet ID: ${duplicatedSheet?.sheetId}, Title: ${duplicatedSheet?.title}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error duplicating sheet: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
