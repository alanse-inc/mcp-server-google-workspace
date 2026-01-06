import { google } from "googleapis";
import { GDriveRenameFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatFileMetadata,
  generateDriveWebUrl,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_rename_file",
  description:
    "Rename a file in Google Drive. Updates the file's name while keeping all other properties unchanged. Requires file ID and new name.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to rename",
      },
      newName: {
        type: "string",
        description: "New name for the file",
      },
    },
    required: ["fileId", "newName"],
  },
} as const;

export async function renameFile(
  args: GDriveRenameFileInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, newName } = args;

    // Get current file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const oldName = fileResponse.data.name || "Unknown";

    // Rename the file
    const response = await drive.files.update({
      fileId,
      requestBody: {
        name: newName,
      },
      fields: "id, name, mimeType, size, modifiedTime, webViewLink, parents",
    });

    const renamedFile = response.data;

    let output = `✅ File renamed successfully!\n\n`;
    output += `📄 Old Name: ${oldName}\n`;
    output += `📄 New Name: ${newName}\n\n`;
    output += formatFileMetadata(renamedFile, true);
    output += `\n📎 Web URL: ${generateDriveWebUrl(fileId)}\n`;

    return ResponseFormatter.success(
      {
        fileId,
        oldName,
        newName: renamedFile.name,
        mimeType: renamedFile.mimeType,
        size: renamedFile.size,
        webViewLink: renamedFile.webViewLink,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
