import { google } from "googleapis";
import { GSheetsBatchUpdateInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_batch_update",
  description: "Update multiple cell ranges in a Google Spreadsheet in a single batch operation",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      updates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "The A1 notation range (e.g., 'Sheet1!A1:B2')",
            },
            values: {
              type: "array",
              items: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              description: "2D array of values",
            },
          },
          required: ["range", "values"],
        },
        description: "Array of range-value pairs to update",
      },
      valueInputOption: {
        type: "string",
        enum: ["RAW", "USER_ENTERED"],
        description: "How input data should be interpreted (RAW or USER_ENTERED). Default: RAW",
      },
    },
    required: ["spreadsheetId", "updates"],
  },
} as const;


export async function batchUpdate(
  args: GSheetsBatchUpdateInput,
): Promise<InternalToolResponse> {
  const sheets = google.sheets("v4");
  try {
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        valueInputOption: args.valueInputOption || "RAW",
        data: args.updates.map((update) => ({
          range: update.range,
          values: update.values,
        })),
      },
    });

    const totalRows = response.data.totalUpdatedRows || 0;
    const totalCells = response.data.totalUpdatedCells || 0;

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated ${args.updates.length} range(s): ${totalRows} row(s), ${totalCells} cell(s) modified`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error batch updating: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
