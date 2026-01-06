import { google } from "googleapis";
import { GSheetsFormatCellsInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_format_cells",
  description: "Format cells in a Google Spreadsheet (font, colors, alignment, etc.)",
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
      format: {
        type: "object",
        properties: {
          bold: { type: "boolean", description: "Make text bold" },
          italic: { type: "boolean", description: "Make text italic" },
          fontSize: { type: "number", description: "Font size in points" },
          fontFamily: { type: "string", description: "Font family name" },
          textColor: {
            type: "object",
            properties: {
              red: { type: "number", minimum: 0, maximum: 1 },
              green: { type: "number", minimum: 0, maximum: 1 },
              blue: { type: "number", minimum: 0, maximum: 1 },
            },
            description: "Text color (RGB values 0-1)",
          },
          backgroundColor: {
            type: "object",
            properties: {
              red: { type: "number", minimum: 0, maximum: 1 },
              green: { type: "number", minimum: 0, maximum: 1 },
              blue: { type: "number", minimum: 0, maximum: 1 },
            },
            description: "Background color (RGB values 0-1)",
          },
          horizontalAlignment: {
            type: "string",
            enum: ["LEFT", "CENTER", "RIGHT"],
            description: "Horizontal text alignment",
          },
          verticalAlignment: {
            type: "string",
            enum: ["TOP", "MIDDLE", "BOTTOM"],
            description: "Vertical text alignment",
          },
        },
        description: "Format options to apply",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn", "format"],
  },
} as const;

export async function formatCells(
  args: GSheetsFormatCellsInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const cellFormat: any = {};
    const fields: string[] = [];

    if (args.format.bold !== undefined || args.format.italic !== undefined ||
        args.format.fontSize !== undefined || args.format.fontFamily !== undefined ||
        args.format.textColor !== undefined) {
      cellFormat.textFormat = {};

      if (args.format.bold !== undefined) {
        cellFormat.textFormat.bold = args.format.bold;
        fields.push("userEnteredFormat.textFormat.bold");
      }
      if (args.format.italic !== undefined) {
        cellFormat.textFormat.italic = args.format.italic;
        fields.push("userEnteredFormat.textFormat.italic");
      }
      if (args.format.fontSize !== undefined) {
        cellFormat.textFormat.fontSize = args.format.fontSize;
        fields.push("userEnteredFormat.textFormat.fontSize");
      }
      if (args.format.fontFamily !== undefined) {
        cellFormat.textFormat.fontFamily = args.format.fontFamily;
        fields.push("userEnteredFormat.textFormat.fontFamily");
      }
      if (args.format.textColor !== undefined) {
        cellFormat.textFormat.foregroundColor = args.format.textColor;
        fields.push("userEnteredFormat.textFormat.foregroundColor");
      }
    }

    if (args.format.backgroundColor !== undefined) {
      cellFormat.backgroundColor = args.format.backgroundColor;
      fields.push("userEnteredFormat.backgroundColor");
    }

    if (args.format.horizontalAlignment !== undefined) {
      cellFormat.horizontalAlignment = args.format.horizontalAlignment;
      fields.push("userEnteredFormat.horizontalAlignment");
    }

    if (args.format.verticalAlignment !== undefined) {
      cellFormat.verticalAlignment = args.format.verticalAlignment;
      fields.push("userEnteredFormat.verticalAlignment");
    }

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
                userEnteredFormat: cellFormat,
              },
              fields: fields.join(","),
            },
          },
        ],
      },
    });

    const rangeStr = `R${args.startRow}C${args.startColumn}:R${args.endRow - 1}C${args.endColumn - 1}`;
    const appliedFormats = Object.keys(args.format).join(", ");

    return {
      content: [
        {
          type: "text",
          text: `Successfully formatted cells in range ${rangeStr}. Applied formats: ${appliedFormats}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error formatting cells: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
