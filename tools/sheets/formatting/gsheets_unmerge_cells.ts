import { google } from "googleapis";
import { GSheetsUnmergeCellsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_unmerge_cells",
  description: "Unmerge previously merged cells in a Google Spreadsheet",
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
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn"],
  },
} as const;

export async function unmergeCells(
  args: GSheetsUnmergeCellsInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            unmergeCells: {
              range: {
                sheetId: args.sheetId,
                startRowIndex: args.startRow,
                endRowIndex: args.endRow,
                startColumnIndex: args.startColumn,
                endColumnIndex: args.endColumn,
              },
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
          text: `Successfully unmerged cells in range ${rangeStr}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error unmerging cells: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
