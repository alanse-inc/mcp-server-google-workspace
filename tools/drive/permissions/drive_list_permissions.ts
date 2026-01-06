import { google } from "googleapis";
import { GDriveListPermissionsInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatPermissionList,
  getRoleLabel,
  getTypeLabel,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_list_permissions",
  description:
    "List all permissions for a Google Drive file. Shows who has access and what level of access they have.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to get permissions for",
      },
    },
    required: ["fileId"],
  },
} as const;

export async function listPermissions(
  args: GDriveListPermissionsInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId } = args;

    // Get file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, webViewLink",
    });

    const fileName = fileResponse.data.name || "Unknown";
    const webViewLink = fileResponse.data.webViewLink || "";

    // List permissions
    const permissionsResponse = await drive.permissions.list({
      fileId,
      fields: "permissions(id, type, role, emailAddress, displayName, domain, permissionDetails)",
      pageSize: 100,
    });

    const permissions = permissionsResponse.data.permissions || [];

    // Group permissions by type
    const groupedPermissions = {
      users: permissions.filter((p) => p.type === "user"),
      groups: permissions.filter((p) => p.type === "group"),
      domains: permissions.filter((p) => p.type === "domain"),
      anyone: permissions.filter((p) => p.type === "anyone"),
    };

    let output = `📋 File Permissions\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    output += `📄 File: ${fileName}\n`;
    output += `ID: ${fileId}\n`;
    if (webViewLink) {
      output += `Link: ${webViewLink}\n`;
    }
    output += `\n`;

    // Display permissions by type
    if (groupedPermissions.users.length > 0) {
      output += `👤 Users (${groupedPermissions.users.length}):\n`;
      groupedPermissions.users.forEach((p, i) => {
        output += `  ${i + 1}. ${p.emailAddress || "Unknown"}\n`;
        output += `     Role: ${getRoleLabel(p.role || "")}\n`;
        output += `     Permission ID: ${p.id}\n\n`;
      });
    }

    if (groupedPermissions.groups.length > 0) {
      output += `👥 Groups (${groupedPermissions.groups.length}):\n`;
      groupedPermissions.groups.forEach((p, i) => {
        output += `  ${i + 1}. ${p.emailAddress || "Unknown"}\n`;
        output += `     Role: ${getRoleLabel(p.role || "")}\n`;
        output += `     Permission ID: ${p.id}\n\n`;
      });
    }

    if (groupedPermissions.domains.length > 0) {
      output += `🌐 Domains (${groupedPermissions.domains.length}):\n`;
      groupedPermissions.domains.forEach((p, i) => {
        output += `  ${i + 1}. ${p.domain || "Unknown"}\n`;
        output += `     Role: ${getRoleLabel(p.role || "")}\n`;
        output += `     Permission ID: ${p.id}\n\n`;
      });
    }

    if (groupedPermissions.anyone.length > 0) {
      output += `🌍 Anyone with Link (${groupedPermissions.anyone.length}):\n`;
      groupedPermissions.anyone.forEach((p) => {
        output += `  Role: ${getRoleLabel(p.role || "")}\n`;
        output += `  Permission ID: ${p.id}\n\n`;
      });
    }

    if (permissions.length === 0) {
      output += `No permissions found.`;
    } else {
      output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      output += `Total: ${permissions.length} permission(s)`;
    }

    return ResponseFormatter.success(
      {
        fileId,
        fileName,
        totalPermissions: permissions.length,
        permissions: permissions.map((p) => ({
          id: p.id,
          type: p.type,
          role: p.role,
          typeLabel: getTypeLabel(p.type || ""),
          roleLabel: getRoleLabel(p.role || ""),
          emailAddress: p.emailAddress,
          displayName: p.displayName,
          domain: p.domain,
        })),
        summary: {
          users: groupedPermissions.users.length,
          groups: groupedPermissions.groups.length,
          domains: groupedPermissions.domains.length,
          anyone: groupedPermissions.anyone.length,
        },
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
