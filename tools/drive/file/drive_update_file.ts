import { google } from "googleapis";
import { GDriveUpdateFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatFileMetadata,
  generateDriveWebUrl,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_update_file",
  description:
    "Update a file's metadata and/or content in Google Drive. Can update name, description, MIME type, and content. All update fields are optional - only provide the fields you want to update.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to update",
      },
      name: {
        type: "string",
        description: "New file name (optional)",
        optional: true,
      },
      description: {
        type: "string",
        description: "New file description (optional)",
        optional: true,
      },
      mimeType: {
        type: "string",
        description: "New MIME type (optional)",
        optional: true,
      },
      content: {
        type: "string",
        description:
          "New file content (base64 encoded for binary files, plain text for text files) (optional)",
        optional: true,
      },
    },
    required: ["fileId"],
  },
} as const;

export async function updateFile(
  args: GDriveUpdateFileInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, name, description, mimeType, content } = args;

    // Get current file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, description, mimeType",
    });

    const oldName = fileResponse.data.name || "Unknown";
    const oldDescription = fileResponse.data.description || "";
    const oldMimeType = fileResponse.data.mimeType || "unknown";

    // Build update metadata
    const updateMetadata: any = {};
    const changes: string[] = [];

    if (name !== undefined) {
      updateMetadata.name = name;
      changes.push(`Name: ${oldName} → ${name}`);
    }

    if (description !== undefined) {
      updateMetadata.description = description;
      changes.push(`Description: ${oldDescription || "(empty)"} → ${description}`);
    }

    if (mimeType !== undefined) {
      updateMetadata.mimeType = mimeType;
      changes.push(`MIME Type: ${oldMimeType} → ${mimeType}`);
    }

    // Update the file
    const updateParams: any = {
      fileId,
      fields: "id, name, description, mimeType, size, modifiedTime, webViewLink, parents",
    };

    if (Object.keys(updateMetadata).length > 0) {
      updateParams.requestBody = updateMetadata;
    }

    if (content !== undefined) {
      updateParams.media = {
        mimeType: mimeType || oldMimeType,
        body: content,
      };
      changes.push("Content: Updated");
    }

    const response = await drive.files.update(updateParams);

    const updatedFile = response.data;

    let output = `✅ File updated successfully!\n\n`;
    if (changes.length > 0) {
      output += `📝 Changes:\n`;
      changes.forEach((change) => {
        output += `  • ${change}\n`;
      });
      output += `\n`;
    }
    output += formatFileMetadata(updatedFile, true);
    output += `\n📎 Web URL: ${generateDriveWebUrl(fileId)}\n`;

    return ResponseFormatter.success(
      {
        fileId,
        name: updatedFile.name,
        description: updatedFile.description,
        mimeType: updatedFile.mimeType,
        size: updatedFile.size,
        modifiedTime: updatedFile.modifiedTime,
        webViewLink: updatedFile.webViewLink,
        changes,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
