import { google } from "googleapis";
import { GSheetsDeleteNamedRangeInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_delete_named_range",
  description: "Delete a named range from a spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      namedRangeId: {
        type: "string",
        description: "The ID of the named range to delete",
      },
    },
    required: ["spreadsheetId", "namedRangeId"],
  },
} as const;

export async function deleteNamedRange(
  args: GSheetsDeleteNamedRangeInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteNamedRange: {
              namedRangeId: args.namedRangeId,
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted named range ${args.namedRangeId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error deleting named range: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
