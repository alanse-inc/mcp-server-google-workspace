import { google } from "googleapis";
import { GSheetsAddConditionalFormatInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_conditional_format",
  description: "Add conditional formatting rules to cells",
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
      rule: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["NUMBER_GREATER", "NUMBER_LESS", "NUMBER_BETWEEN", "TEXT_CONTAINS", "TEXT_NOT_CONTAINS", "CUSTOM_FORMULA"],
            description: "The condition type",
          },
          value: {
            type: "string",
            description: "Value for comparison (for single value conditions)",
          },
          minValue: {
            type: "string",
            description: "Minimum value (for BETWEEN conditions)",
          },
          maxValue: {
            type: "string",
            description: "Maximum value (for BETWEEN conditions)",
          },
          formula: {
            type: "string",
            description: "Custom formula (for CUSTOM_FORMULA)",
          },
          backgroundColor: {
            type: "object",
            properties: {
              red: { type: "number", minimum: 0, maximum: 1 },
              green: { type: "number", minimum: 0, maximum: 1 },
              blue: { type: "number", minimum: 0, maximum: 1 },
            },
            description: "Background color to apply when condition is true",
          },
          textColor: {
            type: "object",
            properties: {
              red: { type: "number", minimum: 0, maximum: 1 },
              green: { type: "number", minimum: 0, maximum: 1 },
              blue: { type: "number", minimum: 0, maximum: 1 },
            },
            description: "Text color to apply when condition is true",
          },
          bold: {
            type: "boolean",
            description: "Make text bold when condition is true",
          },
          italic: {
            type: "boolean",
            description: "Make text italic when condition is true",
          },
        },
        required: ["type"],
        description: "Conditional formatting rule",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn", "rule"],
  },
} as const;

export async function addConditionalFormat(
  args: GSheetsAddConditionalFormatInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const booleanCondition: any = {
      type: args.rule.type,
    };

    // Set condition values based on type
    if (args.rule.type === "NUMBER_BETWEEN") {
      booleanCondition.values = [
        { userEnteredValue: args.rule.minValue },
        { userEnteredValue: args.rule.maxValue },
      ];
    } else if (args.rule.type === "CUSTOM_FORMULA") {
      booleanCondition.values = [{ userEnteredValue: args.rule.formula }];
    } else if (args.rule.value) {
      booleanCondition.values = [{ userEnteredValue: args.rule.value }];
    }

    // Build format to apply
    const format: any = {};
    if (args.rule.backgroundColor) {
      format.backgroundColor = args.rule.backgroundColor;
    }
    if (args.rule.textColor || args.rule.bold || args.rule.italic) {
      format.textFormat = {};
      if (args.rule.textColor) {
        format.textFormat.foregroundColor = args.rule.textColor;
      }
      if (args.rule.bold !== undefined) {
        format.textFormat.bold = args.rule.bold;
      }
      if (args.rule.italic !== undefined) {
        format.textFormat.italic = args.rule.italic;
      }
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [
                  {
                    sheetId: args.sheetId,
                    startRowIndex: args.startRow,
                    endRowIndex: args.endRow,
                    startColumnIndex: args.startColumn,
                    endColumnIndex: args.endColumn,
                  },
                ],
                booleanRule: {
                  condition: booleanCondition,
                  format,
                },
              },
              index: 0,
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
          text: `Successfully added conditional formatting rule (${args.rule.type}) for range ${rangeStr}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error adding conditional format: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
