import { google } from "googleapis";
import { GSheetsUpdateBordersInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_update_borders",
  description: "Update cell borders in a Google Spreadsheet",
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
      top: {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["SOLID", "DOTTED", "DASHED", "DOUBLE", "SOLID_MEDIUM", "SOLID_THICK"],
          },
          width: { type: "number" },
          color: {
            type: "object",
            properties: {
              red: { type: "number" },
              green: { type: "number" },
              blue: { type: "number" },
            },
          },
        },
        description: "Top border style",
      },
      bottom: {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["SOLID", "DOTTED", "DASHED", "DOUBLE", "SOLID_MEDIUM", "SOLID_THICK"],
          },
          width: { type: "number" },
          color: {
            type: "object",
            properties: {
              red: { type: "number" },
              green: { type: "number" },
              blue: { type: "number" },
            },
          },
        },
        description: "Bottom border style",
      },
      left: {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["SOLID", "DOTTED", "DASHED", "DOUBLE", "SOLID_MEDIUM", "SOLID_THICK"],
          },
          width: { type: "number" },
          color: {
            type: "object",
            properties: {
              red: { type: "number" },
              green: { type: "number" },
              blue: { type: "number" },
            },
          },
        },
        description: "Left border style",
      },
      right: {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["SOLID", "DOTTED", "DASHED", "DOUBLE", "SOLID_MEDIUM", "SOLID_THICK"],
          },
          width: { type: "number" },
          color: {
            type: "object",
            properties: {
              red: { type: "number" },
              green: { type: "number" },
              blue: { type: "number" },
            },
          },
        },
        description: "Right border style",
      },
      innerHorizontal: {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["SOLID", "DOTTED", "DASHED", "DOUBLE", "SOLID_MEDIUM", "SOLID_THICK"],
          },
          width: { type: "number" },
          color: {
            type: "object",
            properties: {
              red: { type: "number" },
              green: { type: "number" },
              blue: { type: "number" },
            },
          },
        },
        description: "Inner horizontal border style",
      },
      innerVertical: {
        type: "object",
        properties: {
          style: {
            type: "string",
            enum: ["SOLID", "DOTTED", "DASHED", "DOUBLE", "SOLID_MEDIUM", "SOLID_THICK"],
          },
          width: { type: "number" },
          color: {
            type: "object",
            properties: {
              red: { type: "number" },
              green: { type: "number" },
              blue: { type: "number" },
            },
          },
        },
        description: "Inner vertical border style",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn"],
  },
} as const;

export async function updateBorders(
  args: GSheetsUpdateBordersInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateBorders: {
              range: {
                sheetId: args.sheetId,
                startRowIndex: args.startRow,
                endRowIndex: args.endRow,
                startColumnIndex: args.startColumn,
                endColumnIndex: args.endColumn,
              },
              top: args.top,
              bottom: args.bottom,
              left: args.left,
              right: args.right,
              innerHorizontal: args.innerHorizontal,
              innerVertical: args.innerVertical,
            },
          },
        ],
      },
    });

    const rangeStr = `R${args.startRow}C${args.startColumn}:R${args.endRow - 1}C${args.endColumn - 1}`;
    const bordersSet = [];
    if (args.top) bordersSet.push("top");
    if (args.bottom) bordersSet.push("bottom");
    if (args.left) bordersSet.push("left");
    if (args.right) bordersSet.push("right");
    if (args.innerHorizontal) bordersSet.push("innerHorizontal");
    if (args.innerVertical) bordersSet.push("innerVertical");

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated borders for range ${rangeStr}. Borders set: ${bordersSet.join(", ")}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating borders: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
