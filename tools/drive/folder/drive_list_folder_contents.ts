import { google } from "googleapis";
import { GDriveListFolderContentsInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatFileList } from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_list_folder_contents",
  description:
    "List all files and folders inside a specific folder in Google Drive. Supports pagination and sorting. Returns file IDs, names, types, and sizes.",
  inputSchema: {
    type: "object",
    properties: {
      folderId: {
        type: "string",
        description: "ID of the folder to list contents from",
      },
      pageSize: {
        type: "number",
        description: "Number of items to return per page (max 1000, default 100)",
        optional: true,
      },
      pageToken: {
        type: "string",
        description: "Page token for pagination",
        optional: true,
      },
      orderBy: {
        type: "string",
        description:
          "Sort order (e.g., 'name', 'modifiedTime desc', 'createdTime')",
        optional: true,
      },
    },
    required: ["folderId"],
  },
} as const;

export async function listFolderContents(
  args: GDriveListFolderContentsInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { folderId, pageSize = 100, pageToken, orderBy } = args;

    // Build query for folder contents
    const q = `'${folderId}' in parents and trashed = false`;

    const response = await drive.files.list({
      q,
      pageSize: Math.min(pageSize, 1000),
      pageToken,
      orderBy: orderBy || "modifiedTime desc",
      fields:
        "nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, webViewLink, parents, iconLink)",
    });

    const files = response.data.files || [];
    const nextPageToken = response.data.nextPageToken;

    let output = `📁 Folder Contents\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `Folder ID: ${folderId}\n\n`;
    output += formatFileList(files, nextPageToken);

    return ResponseFormatter.success(
      {
        folderId,
        count: files.length,
        files: files.map((f) => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          size: f.size,
          modifiedTime: f.modifiedTime,
        })),
        nextPageToken,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
