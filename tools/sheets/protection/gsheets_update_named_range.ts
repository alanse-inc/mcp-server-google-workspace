import { google } from "googleapis";
import { GSheetsUpdateNamedRangeInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_update_named_range",
  description: "Update a named range's properties",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      namedRangeId: {
        type: "string",
        description: "The ID of the named range to update",
      },
      name: {
        type: "string",
        description: "New name for the range (optional)",
      },
      sheetId: {
        type: "number",
        description: "The ID of the sheet (optional)",
      },
      startRow: {
        type: "number",
        description: "Starting row index (0-based, optional)",
      },
      endRow: {
        type: "number",
        description: "Ending row index (exclusive, 0-based, optional)",
      },
      startColumn: {
        type: "number",
        description: "Starting column index (0-based, optional)",
      },
      endColumn: {
        type: "number",
        description: "Ending column index (exclusive, 0-based, optional)",
      },
    },
    required: ["spreadsheetId", "namedRangeId"],
  },
} as const;

export async function updateNamedRange(
  args: GSheetsUpdateNamedRangeInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const namedRange: any = {
      namedRangeId: args.namedRangeId,
    };

    const fields: string[] = [];

    if (args.name !== undefined) {
      namedRange.name = args.name;
      fields.push("name");
    }

    if (
      args.sheetId !== undefined ||
      args.startRow !== undefined ||
      args.endRow !== undefined ||
      args.startColumn !== undefined ||
      args.endColumn !== undefined
    ) {
      namedRange.range = {};
      if (args.sheetId !== undefined) {
        namedRange.range.sheetId = args.sheetId;
      }
      if (args.startRow !== undefined) {
        namedRange.range.startRowIndex = args.startRow;
      }
      if (args.endRow !== undefined) {
        namedRange.range.endRowIndex = args.endRow;
      }
      if (args.startColumn !== undefined) {
        namedRange.range.startColumnIndex = args.startColumn;
      }
      if (args.endColumn !== undefined) {
        namedRange.range.endColumnIndex = args.endColumn;
      }
      fields.push("range");
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateNamedRange: {
              namedRange,
              fields: fields.join(","),
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated named range ${args.namedRangeId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating named range: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
