import { google } from "googleapis";
import { GDriveListRevisionsInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatRevisionList,
  formatFileMetadata,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_list_revisions",
  description:
    "List all revisions of a file in Google Drive. Shows revision history with timestamps and modification details. Supports pagination.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to list revisions for",
      },
      pageSize: {
        type: "number",
        description:
          "Maximum number of revisions to return per page (default: 10, max: 1000)",
        optional: true,
      },
      pageToken: {
        type: "string",
        description:
          "Token for pagination to get the next page of results",
        optional: true,
      },
    },
    required: ["fileId"],
  },
} as const;

export async function listRevisions(
  args: GDriveListRevisionsInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, pageSize = 10, pageToken } = args;

    // Get file metadata
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, size, modifiedTime, createdTime",
    });

    const file = fileResponse.data;

    // List revisions
    const revisionsResponse = await drive.revisions.list({
      fileId,
      pageSize: Math.min(pageSize, 1000), // Cap at 1000
      pageToken: pageToken || undefined,
      fields:
        "revisions(id, modifiedTime, lastModifyingUser, size, keepForever, originalFilename, mimeType), nextPageToken",
    });

    const revisions = revisionsResponse.data.revisions || [];
    const nextPageToken = revisionsResponse.data.nextPageToken;

    // Format output
    let output = `📄 Revision History for "${file.name}"\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `Total Revisions: ${revisions.length}\n`;

    if (nextPageToken) {
      output += `(More revisions available - use nextPageToken for pagination)\n`;
    }

    output += `\n${formatRevisionList(revisions)}\n`;

    // Format detailed output for each revision
    let detailedRevisions = revisions.map((revision, index) => ({
      index: index + 1,
      revisionId: revision.id || "",
      modifiedTime: revision.modifiedTime || "Unknown",
      modifiedBy: revision.lastModifyingUser?.displayName || "Unknown",
      modifiedByEmail: revision.lastModifyingUser?.emailAddress || "Unknown",
      size: revision.size ? parseInt(revision.size) : 0,
      mimeType: revision.mimeType || "Unknown",
      keepForever: revision.keepForever || false,
      originalFilename: revision.originalFilename || file.name,
    }));

    return ResponseFormatter.success(
      {
        fileId,
        fileName: file.name,
        totalRevisions: revisions.length,
        revisions: detailedRevisions,
        nextPageToken: nextPageToken || null,
        hasMoreResults: !!nextPageToken,
        pageSize,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
