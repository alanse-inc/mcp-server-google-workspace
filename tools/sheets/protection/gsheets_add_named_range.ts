import { google } from "googleapis";
import { GSheetsAddNamedRangeInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_named_range",
  description: "Create a named range in a spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      name: {
        type: "string",
        description: "The name for the range",
      },
      sheetId: {
        type: "number",
        description: "The ID of the sheet",
      },
      startRow: {
        type: "number",
        description: "Starting row index (0-based)",
      },
      endRow: {
        type: "number",
        description: "Ending row index (exclusive, 0-based)",
      },
      startColumn: {
        type: "number",
        description: "Starting column index (0-based)",
      },
      endColumn: {
        type: "number",
        description: "Ending column index (exclusive, 0-based)",
      },
    },
    required: ["spreadsheetId", "name", "sheetId", "startRow", "endRow", "startColumn", "endColumn"],
  },
} as const;

export async function addNamedRange(
  args: GSheetsAddNamedRangeInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            addNamedRange: {
              namedRange: {
                name: args.name,
                range: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRow,
                  endRowIndex: args.endRow,
                  startColumnIndex: args.startColumn,
                  endColumnIndex: args.endColumn,
                },
              },
            },
          },
        ],
      },
    });

    const namedRangeId =
      response.data.replies?.[0]?.addNamedRange?.namedRange?.namedRangeId;

    const rangeStr = `R${args.startRow}C${args.startColumn}:R${args.endRow - 1}C${args.endColumn - 1}`;
    return {
      content: [
        {
          type: "text",
          text: `Successfully created named range "${args.name}" for ${rangeStr}. Named Range ID: ${namedRangeId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating named range: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
