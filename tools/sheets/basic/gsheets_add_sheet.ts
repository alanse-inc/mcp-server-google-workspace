import { google } from "googleapis";
import { GSheetsAddSheetInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_sheet",
  description: "Add a new sheet (tab) to a Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      title: {
        type: "string",
        description: "The name of the new sheet",
      },
      index: {
        type: "number",
        description: "Optional position index (0-based) where the sheet should be inserted",
      },
    },
    required: ["spreadsheetId", "title"],
  },
} as const;

export async function addSheet(
  args: GSheetsAddSheetInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");
    const request: any = {
      addSheet: {
        properties: {
          title: args.title,
        },
      },
    };

    if (args.index !== undefined) {
      request.addSheet.properties.index = args.index;
    }

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [request],
      },
    });

    const addedSheet = response.data.replies?.[0]?.addSheet?.properties;

    return {
      content: [
        {
          type: "text",
          text: `Successfully added sheet "${addedSheet?.title}" (ID: ${addedSheet?.sheetId}, Index: ${addedSheet?.index})`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error adding sheet: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
