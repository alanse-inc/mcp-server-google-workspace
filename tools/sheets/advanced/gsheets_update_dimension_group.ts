import { google } from 'googleapis';
import type { InternalToolResponse, GSheetsUpdateDimensionGroupInput } from '../../types.js';

export const schema = {
  name: "gsheets_update_dimension_group",
  description: "Update properties of a dimension group (row or column group) such as collapse state or depth.",
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
        description: "The dimension of the group (ROWS or COLUMNS)"
      },
      startIndex: {
        type: "number",
        description: "The start index of the dimension group (inclusive)"
      },
      endIndex: {
        type: "number",
        description: "The end index of the dimension group (exclusive)"
      },
      collapsed: {
        type: "boolean",
        description: "Whether the group should be collapsed"
      }
    },
    required: ["spreadsheetId", "sheetId", "dimension", "startIndex", "endIndex", "collapsed"]
  }
} as const;

export async function updateDimensionGroup(
  args: GSheetsUpdateDimensionGroupInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateDimensionGroup: {
              dimensionGroup: {
                range: {
                  sheetId: args.sheetId,
                  dimension: args.dimension,
                  startIndex: args.startIndex,
                  endIndex: args.endIndex,
                },
                collapsed: args.collapsed,
              },
              fields: "collapsed",
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated ${args.dimension.toLowerCase()} group from index ${args.startIndex} to ${args.endIndex} on sheet ${args.sheetId}. Collapsed: ${args.collapsed}.`,
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
          text: `Error updating dimension group: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
