import { google } from "googleapis";
import { GDriveCopyFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatFileMetadata,
  generateDriveWebUrl,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_copy_file",
  description:
    "Copy a file in Google Drive. Creates a duplicate of the file with optional new name and parent folder(s). Requires file ID.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to copy",
      },
      name: {
        type: "string",
        description:
          "Name for the copied file (optional, defaults to 'Copy of [original name]')",
        optional: true,
      },
      parents: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "Parent folder ID(s) for the copied file (optional, defaults to same location as original)",
        optional: true,
      },
    },
    required: ["fileId"],
  },
} as const;

export async function copyFile(
  args: GDriveCopyFileInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, name, parents } = args;

    // Get original file metadata
    const originalFile = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const originalName = originalFile.data.name || "Unknown";

    // Create copy metadata
    const copyMetadata: any = {};

    if (name) {
      copyMetadata.name = name;
    } else {
      copyMetadata.name = `Copy of ${originalName}`;
    }

    if (parents && parents.length > 0) {
      copyMetadata.parents = parents;
    }

    // Copy the file
    const response = await drive.files.copy({
      fileId,
      requestBody: copyMetadata,
      fields: "id, name, mimeType, size, modifiedTime, webViewLink, parents",
    });

    const copiedFile = response.data;
    const copiedFileId = copiedFile.id || "";

    let output = `✅ File copied successfully!\n\n`;
    output += `📄 Original: ${originalName} (${fileId})\n`;
    output += `📄 Copy: ${copiedFile.name} (${copiedFileId})\n\n`;
    output += formatFileMetadata(copiedFile, true);
    output += `\n📎 Web URL: ${generateDriveWebUrl(copiedFileId)}\n`;

    return ResponseFormatter.success(
      {
        originalFileId: fileId,
        originalName,
        copiedFileId,
        copiedName: copiedFile.name,
        mimeType: copiedFile.mimeType,
        size: copiedFile.size,
        webViewLink: copiedFile.webViewLink,
        parents: copiedFile.parents,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
