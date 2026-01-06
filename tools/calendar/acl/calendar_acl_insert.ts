import { google } from "googleapis";
import { CalendarAclInsertInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_acl_insert",
  description:
    "Add a new access control rule to share a calendar with a user, group, or domain. Specify the access level (owner, writer, reader, freeBusyReader) and the scope (who gets access). Use this to grant calendar permissions to others. The system can optionally send notification emails to inform users about the new sharing.",
  inputSchema: {
    type: "object",
    properties: {
      calendarId: {
        type: "string",
        description: "Calendar identifier. Use 'primary' for the user's primary calendar.",
      },
      role: {
        type: "string",
        description: "Access level: 'owner', 'writer', 'reader', 'freeBusyReader', or 'none'",
      },
      scopeType: {
        type: "string",
        description: "Scope type: 'user' (individual), 'group' (Google group), 'domain' (entire domain), or 'default' (public)",
      },
      scopeValue: {
        type: "string",
        description: "Email address (for user/group) or domain name (for domain). Omit for 'default' scope type.",
      },
      sendNotifications: {
        type: "boolean",
        description: "Whether to send email notifications about the sharing change (default: true)",
      },
    },
    required: ["calendarId", "role", "scopeType"],
  },
} as const;

export async function insertAcl(
  args: CalendarAclInsertInput,
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      calendarId,
      role,
      scopeType,
      scopeValue,
      sendNotifications = true,
    } = args;

    // Validate scope
    if ((scopeType === "user" || scopeType === "group" || scopeType === "domain") && !scopeValue) {
      return ResponseFormatter.error(
        new Error(`scopeValue is required for scopeType '${scopeType}'. Provide an email address or domain name.`),
      );
    }

    if (scopeType === "default" && scopeValue) {
      return ResponseFormatter.error(
        new Error("scopeValue should not be provided for scopeType 'default' (public access)."),
      );
    }

    const response = await calendar.acl.insert({
      calendarId,
      sendNotifications,
      requestBody: {
        role,
        scope: {
          type: scopeType,
          value: scopeValue,
        },
      },
    });

    const rule = response.data;

    let message = `✅ Access control rule added successfully\n\n`;
    message += `📅 Calendar: ${calendarId}\n`;
    message += `Role: ${rule.role?.toUpperCase()}\n`;
    message += `Scope: ${rule.scope?.type}`;

    if (rule.scope?.value) {
      message += ` (${rule.scope.value})`;
    }
    message += `\n`;

    message += `Rule ID: ${rule.id}\n`;

    if (sendNotifications && rule.scope?.value) {
      message += `\n📧 Notification email sent to ${rule.scope.value}`;
    }

    message += `\n\n💡 The specified user/group now has ${role} access to this calendar.`;

    return ResponseFormatter.success(
      {
        ruleId: rule.id,
        calendarId,
        role: rule.role,
        scopeType: rule.scope?.type,
        scopeValue: rule.scope?.value || null,
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
