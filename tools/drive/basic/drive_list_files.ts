import { google } from "googleapis";
import { GDriveListFilesInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatFileList } from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_list_files",
  description:
    "List files in Google Drive. Supports filtering by query, folder, pagination, and sorting. Returns file IDs, names, types, and sizes.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Search query using Google Drive query syntax (e.g., \"name contains 'report'\")",
        optional: true,
      },
      folderId: {
        type: "string",
        description: "Folder ID to list files from (limits search to specific folder)",
        optional: true,
      },
      pageSize: {
        type: "number",
        description: "Number of files to return per page (max 1000, default 100)",
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
    required: [],
  },
} as const;

export async function listFiles(
  args: GDriveListFilesInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { query, folderId, pageSize = 100, pageToken, orderBy } = args;

    // Build query
    let q = "trashed = false";

    if (query) {
      q += ` and (${query})`;
    }

    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }

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

    const output = formatFileList(files, nextPageToken);

    return ResponseFormatter.success(
      {
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
