import { google } from "googleapis";
import { GDriveMoveToFolderInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatFileMetadata,
  generateDriveWebUrl,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_move_to_folder",
  description:
    "Move a file to a specified folder in Google Drive. Removes the file from its current parent folder and adds it to the new folder. Requires file ID and folder ID.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to move",
      },
      folderId: {
        type: "string",
        description: "ID of the destination folder",
      },
    },
    required: ["fileId", "folderId"],
  },
} as const;

export async function moveToFolder(
  args: GDriveMoveToFolderInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, folderId } = args;

    // Get current file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, parents",
    });

    const fileName = fileResponse.data.name || "Unknown";
    const currentParents = fileResponse.data.parents || [];

    // Move the file to the new folder
    const response = await drive.files.update({
      fileId,
      addParents: folderId,
      removeParents: currentParents.join(","),
      fields: "id, name, mimeType, size, modifiedTime, webViewLink, parents",
    });

    const movedFile = response.data;

    let output = `✅ File moved successfully!\n\n`;
    output += `📄 File: ${fileName}\n`;
    output += `  From: ${currentParents.join(", ") || "Root"}\n`;
    output += `  To: ${folderId}\n\n`;
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
