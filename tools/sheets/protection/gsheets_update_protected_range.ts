import { google } from "googleapis";
import { GSheetsUpdateProtectedRangeInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_update_protected_range",
  description: "Update protection settings for a protected range",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      protectedRangeId: {
        type: "number",
        description: "The ID of the protected range to update",
      },
      description: {
        type: "string",
        description: "New description for the protected range",
      },
      warningOnly: {
        type: "boolean",
        description: "If true, show a warning instead of preventing edits",
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
    required: ["spreadsheetId", "protectedRangeId"],
  },
} as const;

export async function updateProtectedRange(
  args: GSheetsUpdateProtectedRangeInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const protectedRange: any = {
      protectedRangeId: args.protectedRangeId,
    };

    const fields: string[] = [];

    if (args.description !== undefined) {
      protectedRange.description = args.description;
      fields.push("description");
    }

    if (args.warningOnly !== undefined) {
      protectedRange.warningOnly = args.warningOnly;
      fields.push("warningOnly");
    }

    if (args.editors) {
      protectedRange.editors = {};
      if (args.editors.users !== undefined) {
        protectedRange.editors.users = args.editors.users;
      }
      if (args.editors.groups !== undefined) {
        protectedRange.editors.groups = args.editors.groups;
      }
      if (args.editors.domainUsersCanEdit !== undefined) {
        protectedRange.editors.domainUsersCanEdit = args.editors.domainUsersCanEdit;
      }
      fields.push("editors");
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateProtectedRange: {
              protectedRange,
              fields: fields.join(","),
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated protected range ${args.protectedRangeId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating protected range: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
