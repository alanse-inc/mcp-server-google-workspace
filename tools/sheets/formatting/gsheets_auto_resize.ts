import { google } from "googleapis";
import { GSheetsAutoResizeInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_auto_resize",
  description: "Automatically resize rows or columns to fit content",
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
      dimension: {
        type: "string",
        enum: ["ROWS", "COLUMNS"],
        description: "Whether to resize rows or columns",
      },
      startIndex: {
        type: "number",
        description: "The starting index (0-based) of rows/columns to resize",
      },
      endIndex: {
        type: "number",
        description: "The ending index (exclusive, 0-based) of rows/columns to resize",
      },
    },
    required: ["spreadsheetId", "sheetId", "dimension", "startIndex", "endIndex"],
  },
} as const;

export async function autoResize(
  args: GSheetsAutoResizeInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: args.sheetId,
                dimension: args.dimension,
                startIndex: args.startIndex,
                endIndex: args.endIndex,
              },
            },
          },
        ],
      },
    });

    const count = args.endIndex - args.startIndex;
    return {
      content: [
        {
          type: "text",
          text: `Successfully auto-resized ${count} ${args.dimension.toLowerCase()} (indices ${args.startIndex}-${args.endIndex - 1})`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error auto-resizing: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
