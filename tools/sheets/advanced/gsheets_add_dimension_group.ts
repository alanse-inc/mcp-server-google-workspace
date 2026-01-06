import { google } from 'googleapis';
import type { InternalToolResponse, GSheetsAddDimensionGroupInput } from '../../types.js';

export const schema = {
  name: "gsheets_add_dimension_group",
  description: "Add a dimension group (row or column group) to a Google Sheet. Allows creating collapsible groups of rows or columns.",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet"
      },
      sheetId: {
        type: "number",
        description: "The ID of the sheet"
      },
      dimension: {
        type: "string",
        enum: ["ROWS", "COLUMNS"],
        description: "The dimension to group (ROWS or COLUMNS)"
      },
      startIndex: {
        type: "number",
        description: "The start index of the dimension group (inclusive)"
      },
      endIndex: {
        type: "number",
        description: "The end index of the dimension group (exclusive)"
      }
    },
    required: ["spreadsheetId", "sheetId", "dimension", "startIndex", "endIndex"]
  }
} as const;

export async function addDimensionGroup(
  args: GSheetsAddDimensionGroupInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            addDimensionGroup: {
              range: {
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

    return {
      content: [
        {
          type: "text",
          text: `Successfully added ${args.dimension.toLowerCase()} group from index ${args.startIndex} to ${args.endIndex} on sheet ${args.sheetId}.`,
        },
      ],
      isError: false,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error adding dimension group: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
