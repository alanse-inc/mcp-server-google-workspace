import { google } from "googleapis";
import { GDriveMoveFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatFileMetadata,
  generateDriveWebUrl,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_move_file",
  description:
    "Move a file to a different folder in Google Drive. Updates the file's parent folder(s). Can optionally remove from existing parent folders. Requires file ID and new parent folder ID(s).",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to move",
      },
      newParents: {
        type: "array",
        items: {
          type: "string",
        },
        description: "New parent folder ID(s) to move the file to",
      },
      removeParents: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "Parent folder ID(s) to remove the file from (optional, if not specified, removes from all current parents)",
        optional: true,
      },
    },
    required: ["fileId", "newParents"],
  },
} as const;

export async function moveFile(
  args: GDriveMoveFileInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, newParents, removeParents } = args;

    // Get current file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, parents",
    });

    const fileName = fileResponse.data.name || "Unknown";
    const currentParents = fileResponse.data.parents || [];

    // Determine which parents to remove
    let parentsToRemove: string[];
    if (removeParents && removeParents.length > 0) {
      parentsToRemove = removeParents;
    } else {
      // Remove from all current parents if not specified
      parentsToRemove = currentParents;
    }

    // Move the file
    const response = await drive.files.update({
      fileId,
      addParents: newParents.join(","),
      removeParents: parentsToRemove.join(","),
      fields: "id, name, mimeType, size, modifiedTime, webViewLink, parents",
    });

    const movedFile = response.data;

    let output = `✅ File moved successfully!\n\n`;
    output += `📄 File: ${fileName}\n`;
    output += `  From: ${currentParents.join(", ") || "Root"}\n`;
    output += `  To: ${newParents.join(", ")}\n\n`;
    output += formatFileMetadata(movedFile, true);
    output += `\n📎 Web URL: ${generateDriveWebUrl(fileId)}\n`;

    return ResponseFormatter.success(
      {
        fileId,
        name: movedFile.name,
        previousParents: currentParents,
        newParents: movedFile.parents,
        mimeType: movedFile.mimeType,
        webViewLink: movedFile.webViewLink,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
