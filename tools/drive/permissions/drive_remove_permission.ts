import { google } from "googleapis";
import { GDriveRemovePermissionInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { getTypeLabel } from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_remove_permission",
  description:
    "Remove a permission from a Google Drive file, revoking access for a user, group, domain, or link. Must specify the permission ID returned from list_permissions.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to remove permission from",
      },
      permissionId: {
        type: "string",
        description:
          "ID of the permission to remove (get from drive_list_permissions)",
      },
    },
    required: ["fileId", "permissionId"],
  },
} as const;

export async function removePermission(
  args: GDriveRemovePermissionInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, permissionId } = args;

    // Get file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const fileName = fileResponse.data.name || "Unknown";

    // Get permission details before removing (for display purposes)
    const permissionResponse = await drive.permissions.get({
      fileId,
      permissionId,
      fields: "id, type, role, emailAddress, displayName, domain",
    });

    const permission = permissionResponse.data;
    const permissionType = permission.type || "unknown";
    const recipientInfo = permission.emailAddress ||
      permission.domain ||
      permission.displayName ||
      "Unknown";

    // Delete permission
    await drive.permissions.delete({
      fileId,
      permissionId,
    });

    let output = `✅ Permission removed successfully!\n\n`;
    output += `📄 File Details:\n`;
    output += `  Name: ${fileName}\n`;
    output += `  ID: ${fileId}\n\n`;
    output += `🔓 Removed Permission:\n`;
    output += `  Permission ID: ${permissionId}\n`;
    output += `  Type: ${getTypeLabel(permissionType)}\n`;
    output += `  Recipient: ${recipientInfo}\n`;
    output += `  Role: ${permission.role || "unknown"}\n`;
    output += `\nAccess has been revoked.`;

    return ResponseFormatter.success(
      {
        fileId,
        fileName,
        permissionId,
        removedPermissionType: permissionType,
        recipient: recipientInfo,
        role: permission.role,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
