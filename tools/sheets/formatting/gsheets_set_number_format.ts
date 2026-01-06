import { google } from "googleapis";
import { GSheetsSetNumberFormatInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_set_number_format",
  description: "Set number format for cells (currency, percentage, date, etc.)",
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
      numberFormat: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["NUMBER", "CURRENCY", "PERCENT", "DATE", "TIME", "DATE_TIME", "SCIENTIFIC", "TEXT"],
            description: "The type of number format",
          },
          pattern: {
            type: "string",
            description: "Custom format pattern (optional, e.g., '$#,##0.00', '0.00%', 'yyyy-mm-dd')",
          },
        },
        required: ["type"],
        description: "Number format settings",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn", "numberFormat"],
  },
} as const;

export async function setNumberFormat(
  args: GSheetsSetNumberFormatInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    // Default patterns for common types
    const defaultPatterns: Record<string, string> = {
      NUMBER: "#,##0.00",
      CURRENCY: "$#,##0.00",
      PERCENT: "0.00%",
      DATE: "yyyy-mm-dd",
      TIME: "h:mm:ss",
      DATE_TIME: "yyyy-mm-dd h:mm:ss",
      SCIENTIFIC: "0.00E+00",
      TEXT: "@",
    };

    const pattern = args.numberFormat.pattern || defaultPatterns[args.numberFormat.type];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: args.sheetId,
                startRowIndex: args.startRow,
                endRowIndex: args.endRow,
                startColumnIndex: args.startColumn,
                endColumnIndex: args.endColumn,
              },
              cell: {
                userEnteredFormat: {
                  numberFormat: {
                    type: args.numberFormat.type,
                    pattern: pattern,
                  },
                },
              },
              fields: "userEnteredFormat.numberFormat",
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
          text: `Successfully set number format to ${args.numberFormat.type} (pattern: ${pattern}) for range ${rangeStr}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error setting number format: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
