import { google } from "googleapis";
import { GSheetsSetDataValidationInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_set_data_validation",
  description: "Set data validation rules for cells (dropdowns, number ranges, etc.)",
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
      validation: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["ONE_OF_LIST", "ONE_OF_RANGE", "NUMBER_GREATER", "NUMBER_LESS", "NUMBER_BETWEEN", "DATE_AFTER", "DATE_BEFORE", "CUSTOM_FORMULA"],
            description: "The type of data validation",
          },
          values: {
            type: "array",
            items: { type: "string" },
            description: "List of valid values (for ONE_OF_LIST)",
          },
          minValue: {
            type: "string",
            description: "Minimum value (for NUMBER_BETWEEN, NUMBER_GREATER)",
          },
          maxValue: {
            type: "string",
            description: "Maximum value (for NUMBER_BETWEEN, NUMBER_LESS)",
          },
          formula: {
            type: "string",
            description: "Custom formula (for CUSTOM_FORMULA)",
          },
          strict: {
            type: "boolean",
            description: "Whether to reject input when validation fails (default: true)",
          },
          showCustomUi: {
            type: "boolean",
            description: "Show dropdown for list validation (default: true)",
          },
        },
        required: ["type"],
        description: "Data validation settings",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn", "validation"],
  },
} as const;

export async function setDataValidation(
  args: GSheetsSetDataValidationInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const condition: any = {};

    switch (args.validation.type) {
      case "ONE_OF_LIST":
        if (!args.validation.values || args.validation.values.length === 0) {
          throw new Error("values array is required for ONE_OF_LIST validation");
        }
        condition.type = "ONE_OF_LIST";
        condition.values = args.validation.values.map(v => ({ userEnteredValue: v }));
        break;

      case "NUMBER_GREATER":
        condition.type = "NUMBER_GREATER";
        condition.values = [{ userEnteredValue: args.validation.minValue }];
        break;

      case "NUMBER_LESS":
        condition.type = "NUMBER_LESS";
        condition.values = [{ userEnteredValue: args.validation.maxValue }];
        break;

      case "NUMBER_BETWEEN":
        condition.type = "NUMBER_BETWEEN";
        condition.values = [
          { userEnteredValue: args.validation.minValue },
          { userEnteredValue: args.validation.maxValue },
        ];
        break;

      case "CUSTOM_FORMULA":
        condition.type = "CUSTOM_FORMULA";
        condition.values = [{ userEnteredValue: args.validation.formula }];
        break;

      default:
        condition.type = args.validation.type;
    }

    const rule: any = {
      condition,
      strict: args.validation.strict !== false,
      showCustomUi: args.validation.showCustomUi !== false,
    };

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            setDataValidation: {
              range: {
                sheetId: args.sheetId,
                startRowIndex: args.startRow,
                endRowIndex: args.endRow,
                startColumnIndex: args.startColumn,
                endColumnIndex: args.endColumn,
              },
              rule,
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
          text: `Successfully set data validation (${args.validation.type}) for range ${rangeStr}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error setting data validation: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
