import { google } from "googleapis";
import { GSheetsAppendDataInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_append_data",
  description: "Append data to the end of a sheet in a Google Spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      range: {
        type: "string",
        description: "The A1 notation range to append to (e.g., 'Sheet1!A:B')",
      },
      values: {
        type: "array",
        items: {
          type: "array",
          items: {
            type: "string",
          },
        },
        description: "2D array of values to append",
      },
      valueInputOption: {
        type: "string",
        enum: ["RAW", "USER_ENTERED"],
        description: "How input data should be interpreted (RAW or USER_ENTERED). Default: RAW",
      },
    },
    required: ["spreadsheetId", "range", "values"],
  },
} as const;

export async function appendData(
  args: GSheetsAppendDataInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: args.spreadsheetId,
      range: args.range,
      valueInputOption: args.valueInputOption || "RAW",
      requestBody: {
        values: args.values,
      },
    });

    const updates = response.data.updates;
    return {
      content: [
        {
          type: "text",
          text: `Successfully appended ${updates?.updatedRows || 0} row(s) and ${updates?.updatedColumns || 0} column(s) to range ${updates?.updatedRange}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error appending data: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
