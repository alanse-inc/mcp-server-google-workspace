import { google } from "googleapis";
import { CalendarAclListInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_acl_list",
  description:
    "List all access control rules (sharing settings) for a calendar. Shows who has access to the calendar and their permission levels (owner, writer, reader, freeBusyReader). Use this to view current sharing configuration before adding or removing permissions.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier. Use 'primary' for the user's primary calendar.",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of ACL entries to return per page (default: 100, max: 250)",
      },
      pageToken: {
        type: "string",
        description: "Token for accessing subsequent result pages",
      },
      showDeleted: {
        type: "boolean",
        description: "Include deleted ACL entries (default: false)",
      },
    },
    required: ["calendarId"],
  },
} as const;

export async function listAcl(
  args: CalendarAclListInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId,
      maxResults,
      pageToken,
      showDeleted,
    } = args;

    const response = await calendar.acl.list({
      calendarId,
      maxResults,
      pageToken,
      showDeleted,
    });

    const rules = response.data.items || [];
    const totalRules = rules.length;

    if (totalRules === 0) {
      return ResponseFormatter.success(
        { rules: [], count: 0 },
        "No access control rules found for this calendar.",
      );
    }

    let message = `🔐 Calendar Access Control List (${totalRules} rule${totalRules > 1 ? "s" : ""})\n\n`;

    rules.forEach((rule, index) => {
      message += `${index + 1}. ${rule.role?.toUpperCase()}\n`;
      message += `   Scope: ${rule.scope?.type}`;

      if (rule.scope?.value) {
        message += ` (${rule.scope.value})`;
      }
      message += `\n`;

      message += `   Rule ID: ${rule.id}\n`;

      if (rule.scope?.type === "user" || rule.scope?.type === "group") {
        message += `   Email: ${rule.scope.value}\n`;
      } else if (rule.scope?.type === "domain") {
        message += `   Domain: ${rule.scope.value}\n`;
      } else if (rule.scope?.type === "default") {
        message += `   Public Access\n`;
      }

      message += `\n`;
    });

    if (response.data.nextPageToken) {
      message += `📄 Next Page Token: ${response.data.nextPageToken}\n`;
    }

    message += `\n💡 Role levels: owner > writer > reader > freeBusyReader`;

    return ResponseFormatter.success(
      {
        rules: rules.map((rule) => ({
          id: rule.id,
          role: rule.role,
          scopeType: rule.scope?.type,
          scopeValue: rule.scope?.value || null,
        })),
        count: totalRules,
        nextPageToken: response.data.nextPageToken || null,
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
