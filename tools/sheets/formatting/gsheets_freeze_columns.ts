import { google } from "googleapis";
import { GSheetsFreezeColumnsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_freeze_columns",
  description: "Freeze columns at the left of a sheet",
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
      count: {
        type: "number",
        description: "Number of columns to freeze (0 to unfreeze all)",
      },
    },
    required: ["spreadsheetId", "sheetId", "count"],
  },
} as const;

export async function freezeColumns(
  args: GSheetsFreezeColumnsInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: args.sheetId,
                gridProperties: {
                  frozenColumnCount: args.count,
                },
              },
              fields: "gridProperties.frozenColumnCount",
            },
          },
        ],
      },
    });

    const action = args.count === 0 ? "Unfroze all columns" : `Froze ${args.count} column(s)`;
    return {
      content: [
        {
          type: "text",
          text: `${action} on sheet ${args.sheetId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error freezing columns: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
