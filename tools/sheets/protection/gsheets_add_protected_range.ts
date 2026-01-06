import { google } from "googleapis";
import { GSheetsAddProtectedRangeInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_protected_range",
  description: "Add protection to a range to restrict editing",
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
      description: {
        type: "string",
        description: "Description of the protected range (optional)",
      },
      warningOnly: {
        type: "boolean",
        description: "If true, show a warning instead of preventing edits (default: false)",
      },
      editors: {
        type: "object",
        properties: {
          users: {
            type: "array",
            items: { type: "string" },
            description: "Email addresses of users who can edit",
          },
          groups: {
            type: "array",
            items: { type: "string" },
            description: "Email addresses of groups who can edit",
          },
          domainUsersCanEdit: {
            type: "boolean",
            description: "Whether all users in the domain can edit",
          },
        },
        description: "Who can edit the protected range",
      },
    },
    required: ["spreadsheetId", "sheetId", "startRow", "endRow", "startColumn", "endColumn"],
  },
} as const;

export async function addProtectedRange(
  args: GSheetsAddProtectedRangeInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const protectedRange: any = {
      range: {
        sheetId: args.sheetId,
        startRowIndex: args.startRow,
        endRowIndex: args.endRow,
        startColumnIndex: args.startColumn,
        endColumnIndex: args.endColumn,
      },
      warningOnly: args.warningOnly || false,
    };

    if (args.description) {
      protectedRange.description = args.description;
    }

    if (args.editors) {
      protectedRange.editors = {};
      if (args.editors.users && args.editors.users.length > 0) {
        protectedRange.editors.users = args.editors.users;
      }
      if (args.editors.groups && args.editors.groups.length > 0) {
        protectedRange.editors.groups = args.editors.groups;
      }
      if (args.editors.domainUsersCanEdit !== undefined) {
        protectedRange.editors.domainUsersCanEdit = args.editors.domainUsersCanEdit;
      }
    }

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            addProtectedRange: {
              protectedRange,
            },
          },
        ],
      },
    });

    const addedProtection = response.data.replies?.[0]?.addProtectedRange?.protectedRange;
    const rangeStr = `R${args.startRow}C${args.startColumn}:R${args.endRow - 1}C${args.endColumn - 1}`;

    return {
      content: [
        {
          type: "text",
          text: `Successfully added protection to range ${rangeStr}. Protection ID: ${addedProtection?.protectedRangeId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error adding protected range: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
