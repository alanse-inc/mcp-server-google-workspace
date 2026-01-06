import { google } from "googleapis";
import { GSheetsFindReplaceInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_find_replace",
  description: "Find and replace text in a range or entire sheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      sheetId: {
        type: "number",
        description: "The ID of the sheet (optional, searches all sheets if omitted)",
      },
      find: {
        type: "string",
        description: "Text to find",
      },
      replacement: {
        type: "string",
        description: "Replacement text",
      },
      matchCase: {
        type: "boolean",
        description: "Case-sensitive matching (default: false)",
      },
      matchEntireCell: {
        type: "boolean",
        description: "Match entire cell content (default: false)",
      },
      searchByRegex: {
        type: "boolean",
        description: "Use regex pattern (default: false)",
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
    required: ["spreadsheetId", "find", "replacement"],
  },
} as const;

export async function findReplace(
  args: GSheetsFindReplaceInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const findReplaceSpec: any = {
      find: args.find,
      replacement: args.replacement,
      matchCase: args.matchCase || false,
      matchEntireCell: args.matchEntireCell || false,
      searchByRegex: args.searchByRegex || false,
    };

    // Add range if specified
    if (
      args.sheetId !== undefined ||
      args.startRow !== undefined ||
      args.endRow !== undefined ||
      args.startColumn !== undefined ||
      args.endColumn !== undefined
    ) {
      findReplaceSpec.range = {};

      if (args.sheetId !== undefined) {
        findReplaceSpec.range.sheetId = args.sheetId;
      }
      if (args.startRow !== undefined) {
        findReplaceSpec.range.startRowIndex = args.startRow;
      }
      if (args.endRow !== undefined) {
        findReplaceSpec.range.endRowIndex = args.endRow;
      }
      if (args.startColumn !== undefined) {
        findReplaceSpec.range.startColumnIndex = args.startColumn;
      }
      if (args.endColumn !== undefined) {
        findReplaceSpec.range.endColumnIndex = args.endColumn;
      }
    }

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            findReplace: findReplaceSpec,
          },
        ],
      },
    });

    const occurrencesChanged =
      response.data.replies?.[0]?.findReplace?.occurrencesChanged || 0;
    const rowsChanged =
      response.data.replies?.[0]?.findReplace?.rowsChanged || 0;
    const sheetsChanged =
      response.data.replies?.[0]?.findReplace?.sheetsChanged || 0;
    const valuesChanged =
      response.data.replies?.[0]?.findReplace?.valuesChanged || 0;

    return {
      content: [
        {
          type: "text",
          text: `Successfully replaced "${args.find}" with "${args.replacement}". Changed: ${occurrencesChanged} occurrences, ${rowsChanged} rows, ${sheetsChanged} sheets, ${valuesChanged} values.`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error finding and replacing: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
