import { google } from "googleapis";
import { GSheetsAddFilterViewInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_filter_view",
  description: "Create a filter view in a spreadsheet",
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
      title: {
        type: "string",
        description: "Title of the filter view",
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
    },
    required: ["spreadsheetId", "sheetId", "title", "startRow", "endRow", "startColumn", "endColumn"],
  },
} as const;

export async function addFilterView(
  args: GSheetsAddFilterViewInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            addFilterView: {
              filter: {
                title: args.title,
                range: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRow,
                  endRowIndex: args.endRow,
                  startColumnIndex: args.startColumn,
                  endColumnIndex: args.endColumn,
                },
              },
            },
          },
        ],
      },
    });

    const filterViewId = response.data.replies?.[0]?.addFilterView?.filter?.filterViewId;

    return {
      content: [
        {
          type: "text",
          text: `Successfully created filter view "${args.title}". Filter View ID: ${filterViewId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating filter view: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
