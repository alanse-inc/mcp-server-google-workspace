import { google } from "googleapis";
import { GSheetsFreezeRowsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_freeze_rows",
  description: "Freeze rows at the top of a sheet",
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
        description: "Number of rows to freeze (0 to unfreeze all)",
      },
    },
    required: ["spreadsheetId", "sheetId", "count"],
  },
} as const;

export async function freezeRows(
  args: GSheetsFreezeRowsInput,
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
                  frozenRowCount: args.count,
                },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
        ],
      },
    });

    const action = args.count === 0 ? "Unfroze all rows" : `Froze ${args.count} row(s)`;
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
          text: `Error freezing rows: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
