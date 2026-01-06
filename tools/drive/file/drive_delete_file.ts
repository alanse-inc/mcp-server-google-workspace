import { google } from "googleapis";
import { GDriveDeleteFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "drive_delete_file",
  description:
    "Delete a file from Google Drive. Moves the file to trash. To permanently delete, use drive_empty_trash. Requires file ID.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to delete",
      },
    },
    required: ["fileId"],
  },
} as const;

export async function deleteFile(
  args: GDriveDeleteFileInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId } = args;

    // Get file metadata before deleting
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const fileName = fileResponse.data.name || "Unknown";
    const mimeType = fileResponse.data.mimeType || "unknown";

    // Delete the file (moves to trash)
    await drive.files.delete({
      fileId,
    });

    let output = `✅ File deleted successfully!\n\n`;
    output += `📄 File Details:\n`;
    output += `  Name: ${fileName}\n`;
    output += `  ID: ${fileId}\n`;
    output += `  MIME Type: ${mimeType}\n`;
    output += `\nNote: File moved to trash. Use drive_empty_trash to permanently delete.`;

    return ResponseFormatter.success(
      {
        fileId,
        name: fileName,
        mimeType,
        deleted: true,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
