import { google } from "googleapis";
import { GSheetsCopyToInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_copy_to",
  description: "Copy data from one range to another range using cut/paste",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      sourceSheetId: {
        type: "number",
        description: "The ID of the source sheet",
      },
      sourceStartRow: {
        type: "number",
        description: "Source starting row index (0-based)",
      },
      sourceStartColumn: {
        type: "number",
        description: "Source starting column index (0-based)",
      },
      sourceEndRow: {
        type: "number",
        description: "Source ending row index (exclusive, 0-based)",
      },
      sourceEndColumn: {
        type: "number",
        description: "Source ending column index (exclusive, 0-based)",
      },
      destinationSheetId: {
        type: "number",
        description: "The ID of the destination sheet",
      },
      destinationStartRow: {
        type: "number",
        description: "Destination starting row index (0-based)",
      },
      destinationStartColumn: {
        type: "number",
        description: "Destination starting column index (0-based)",
      },
      pasteType: {
        type: "string",
        enum: ["NORMAL", "VALUES", "FORMAT", "FORMULA"],
        description: "What to paste (default: NORMAL - all data)",
      },
    },
    required: [
      "spreadsheetId",
      "sourceSheetId",
      "sourceStartRow",
      "sourceStartColumn",
      "sourceEndRow",
      "sourceEndColumn",
      "destinationSheetId",
      "destinationStartRow",
      "destinationStartColumn",
    ],
  },
} as const;


export async function copyTo(
  args: GSheetsCopyToInput,
): Promise<InternalToolResponse> {
  const sheets = google.sheets("v4");
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            copyPaste: {
              source: {
                sheetId: args.sourceSheetId,
                startRowIndex: args.sourceStartRow,
                endRowIndex: args.sourceEndRow,
                startColumnIndex: args.sourceStartColumn,
                endColumnIndex: args.sourceEndColumn,
              },
              destination: {
                sheetId: args.destinationSheetId,
                startRowIndex: args.destinationStartRow,
                startColumnIndex: args.destinationStartColumn,
              },
              pasteType: args.pasteType || "NORMAL",
            },
          },
        ],
      },
    });

    const sourceRange = `R${args.sourceStartRow}C${args.sourceStartColumn}:R${args.sourceEndRow - 1}C${args.sourceEndColumn - 1}`;
    const destRange = `R${args.destinationStartRow}C${args.destinationStartColumn}`;

    return {
      content: [
        {
          type: "text",
          text: `Successfully copied data from sheet ${args.sourceSheetId} (${sourceRange}) to sheet ${args.destinationSheetId} (${destRange})`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error copying data: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
