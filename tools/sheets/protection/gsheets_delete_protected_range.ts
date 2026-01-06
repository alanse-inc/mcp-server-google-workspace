import { google } from "googleapis";
import { GSheetsDeleteProtectedRangeInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_delete_protected_range",
  description: "Remove protection from a protected range",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      protectedRangeId: {
        type: "number",
        description: "The ID of the protected range to delete",
      },
    },
    required: ["spreadsheetId", "protectedRangeId"],
  },
} as const;

export async function deleteProtectedRange(
  args: GSheetsDeleteProtectedRangeInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteProtectedRange: {
              protectedRangeId: args.protectedRangeId,
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted protected range ${args.protectedRangeId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting protected range: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
