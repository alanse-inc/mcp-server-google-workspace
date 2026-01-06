import { google } from "googleapis";
import { GDriveUpdatePermissionInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatPermission, getRoleLabel } from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_update_permission",
  description:
    "Update an existing permission on a Google Drive file. Allows changing the role (access level) for a user, group, domain, or link. Must specify the permission ID returned from list_permissions.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file whose permission to update",
      },
      permissionId: {
        type: "string",
        description:
          "ID of the permission to update (get from drive_list_permissions)",
      },
      role: {
        type: "string",
        enum: ["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"],
        description:
          "New permission role: owner (full control), writer (editor), commenter (comment only), reader (viewer)",
      },
    },
    required: ["fileId", "permissionId", "role"],
  },
} as const;

export async function updatePermission(
  args: GDriveUpdatePermissionInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, permissionId, role } = args;

    // Get file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const fileName = fileResponse.data.name || "Unknown";

    // Get current permission to show what changed
    const currentPermissionResponse = await drive.permissions.get({
      fileId,
      permissionId,
      fields: "id, type, role, emailAddress, displayName, domain",
    });

    const currentPermission = currentPermissionResponse.data;
    const oldRole = currentPermission.role || "";

    // Update permission
    const updateResponse = await drive.permissions.update({
      fileId,
      permissionId,
      requestBody: {
        role,
      },
      fields: "id, role, type, emailAddress, displayName, domain, permissionDetails",
    });

    const updatedPermission = updateResponse.data;

    let output = `✅ Permission updated successfully!\n\n`;
    output += `📄 File Details:\n`;
    output += `  Name: ${fileName}\n`;
    output += `  ID: ${fileId}\n\n`;
    output += `🔄 Changes Made:\n`;
    output += `  Permission ID: ${permissionId}\n`;
    output += `  Previous Role: ${getRoleLabel(oldRole)}\n`;
    output += `  New Role: ${getRoleLabel(role)}\n\n`;
    output += `📋 Updated Permission Details:\n`;
    output += formatPermission(updatedPermission);

    return ResponseFormatter.success(
      {
        fileId,
        fileName,
        permissionId,
        previousRole: oldRole,
        newRole: role,
        recipientType: currentPermission.type,
        recipientEmail: currentPermission.emailAddress,
        recipientDomain: currentPermission.domain,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
