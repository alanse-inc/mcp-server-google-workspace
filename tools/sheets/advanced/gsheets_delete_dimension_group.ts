import { google } from 'googleapis';
import type { InternalToolResponse, GSheetsDeleteDimensionGroupInput } from '../../types.js';

export const schema = {
  name: "gsheets_delete_dimension_group",
  description: "Delete a dimension group (row or column group) from a Google Sheet.",
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
        description: "The dimension of the group to delete (ROWS or COLUMNS)"
      },
      startIndex: {
        type: "number",
        description: "The start index of the dimension group to delete (inclusive)"
      },
      endIndex: {
        type: "number",
        description: "The end index of the dimension group to delete (exclusive)"
      }
    },
    required: ["spreadsheetId", "sheetId", "dimension", "startIndex", "endIndex"]
  }
} as const;

export async function deleteDimensionGroup(
  args: GSheetsDeleteDimensionGroupInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimensionGroup: {
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
          text: `Successfully deleted ${args.dimension.toLowerCase()} group from index ${args.startIndex} to ${args.endIndex} on sheet ${args.sheetId}.`,
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
          text: `Error deleting dimension group: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
