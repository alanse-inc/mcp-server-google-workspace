import { google } from "googleapis";
import { GSheetsMergeCellsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_merge_cells",
  description: "Merge cells in a Google Spreadsheet",
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
      mergeType: {
        type: "string",
        enum: ["MERGE_ALL", "MERGE_COLUMNS", "MERGE_ROWS"],
        description: "How to merge cells: MERGE_ALL (all cells), MERGE_COLUMNS (merge columns), MERGE_ROWS (merge rows)",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn"],
  },
} as const;

export async function mergeCells(
  args: GSheetsMergeCellsInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            mergeCells: {
              range: {
                sheetId: args.sheetId,
                startRowIndex: args.startRow,
                endRowIndex: args.endRow,
                startColumnIndex: args.startColumn,
                endColumnIndex: args.endColumn,
              },
              mergeType: args.mergeType || "MERGE_ALL",
            },
          },
        ],
      },
    });

    const rangeStr = `R${args.startRow}C${args.startColumn}:R${args.endRow - 1}C${args.endColumn - 1}`;
    return {
      content: [
        {
          type: "text",
          text: `Successfully merged cells in range ${rangeStr} using ${args.mergeType || "MERGE_ALL"} mode`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error merging cells: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
