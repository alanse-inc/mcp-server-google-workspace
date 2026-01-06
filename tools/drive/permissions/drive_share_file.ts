import { google } from "googleapis";
import { GDriveShareFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatPermission } from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_share_file",
  description:
    "Share a file on Google Drive by adding permissions. Supports sharing with users, groups, domains, or anyone with the link. Can optionally send notification emails.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to share",
      },
      role: {
        type: "string",
        enum: ["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"],
        description:
          "Permission role: owner (full control), writer (editor), commenter (comment only), reader (viewer)",
      },
      type: {
        type: "string",
        enum: ["user", "group", "domain", "anyone"],
        description:
          "Type of recipient: user (email), group (group email), domain (entire domain), anyone (anyone with link)",
      },
      emailAddress: {
        type: "string",
        description: "Email address (required for type=user or type=group)",
        optional: true,
      },
      domain: {
        type: "string",
        description: "Domain name (required for type=domain, e.g., 'example.com')",
        optional: true,
      },
      sendNotificationEmail: {
        type: "boolean",
        description: "Send notification email to the recipient(s). Default: true",
        optional: true,
      },
      emailMessage: {
        type: "string",
        description: "Custom message to include in notification email",
        optional: true,
      },
    },
    required: ["fileId", "role", "type"],
  },
} as const;

export async function shareFile(args: GDriveShareFileInput): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const {
      fileId,
      role,
      type,
      emailAddress,
      domain,
      sendNotificationEmail = true,
      emailMessage,
    } = args;

    // Validate required fields based on type
    if (type === "user" || type === "group") {
      if (!emailAddress) {
        return ResponseFormatter.error(
          `emailAddress is required for type='${type}'`,
        );
      }
    }

    if (type === "domain") {
      if (!domain) {
        return ResponseFormatter.error("domain is required for type='domain'");
      }
    }

    // Get file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const fileName = fileResponse.data.name || "Unknown";

    // Create permission object
    const permissionBody: any = {
      role,
      type,
    };

    if (emailAddress) {
      permissionBody.emailAddress = emailAddress;
    }

    if (domain) {
      permissionBody.domain = domain;
    }

    // Add permission
    const permissionResponse = await drive.permissions.create({
      fileId,
      requestBody: permissionBody,
      fields: "id, role, type, emailAddress, displayName, domain, permissionDetails",
      sendNotificationEmail,
      emailMessage: emailMessage || undefined,
    });

    const permission = permissionResponse.data;
    const permissionId = permission.id || "";

    let output = `✅ File shared successfully!\n\n`;
    output += `📄 File Details:\n`;
    output += `  Name: ${fileName}\n`;
    output += `  ID: ${fileId}\n\n`;
    output += `🔗 Permission Details:\n`;
    output += formatPermission(permission);

    if (sendNotificationEmail) {
      output += `\n📧 Notification email sent`;
      if (emailMessage) {
        output += ` with custom message`;
      }
    }

    return ResponseFormatter.success(
      {
        fileId,
        fileName,
        permissionId,
        role,
        type,
        emailAddress: emailAddress || undefined,
        domain: domain || undefined,
        notificationSent: sendNotificationEmail,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
