import { google } from "googleapis";
import { GSheetsSortRangeInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_sort_range",
  description: "Sort a range of data in a Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
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
      sortSpecs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            dimensionIndex: {
              type: "number",
              description: "Column index to sort by (0-based)",
            },
            sortOrder: {
              type: "string",
              enum: ["ASCENDING", "DESCENDING"],
              description: "Sort order",
            },
          },
          required: ["dimensionIndex", "sortOrder"],
        },
        description: "Sort specifications (multiple for multi-level sorting)",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn", "sortSpecs"],
  },
} as const;

export async function sortRange(
  args: GSheetsSortRangeInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            sortRange: {
              range: {
                sheetId: args.sheetId,
                startRowIndex: args.startRow,
                endRowIndex: args.endRow,
                startColumnIndex: args.startColumn,
                endColumnIndex: args.endColumn,
              },
              sortSpecs: args.sortSpecs,
            },
          },
        ],
      },
    });

    const rangeStr = `R${args.startRow}C${args.startColumn}:R${args.endRow - 1}C${args.endColumn - 1}`;
    const sortDesc = args.sortSpecs
      .map((spec) => `column ${spec.dimensionIndex} (${spec.sortOrder})`)
      .join(", ");

    return {
      content: [
        {
          type: "text",
          text: `Successfully sorted range ${rangeStr} by ${sortDesc}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error sorting range: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
