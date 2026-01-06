import { google } from "googleapis";
import { GDriveEmptyTrashInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "drive_empty_trash",
  description:
    "Permanently delete all files in the trash for the authenticated user. This operation cannot be undone.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
} as const;

export async function emptyTrash(
  args: GDriveEmptyTrashInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");

    // First, count items in trash for confirmation message
    let trashedItemsCount = 0;
    let nextPageToken: string | undefined;

    try {
      // Get count of items in trash
      const countResponse = await drive.files.list({
        q: "trashed=true",
        pageSize: 1,
        fields: "nextPageToken",
      });

      // Try to get actual count by iterating through all pages
      let hasMore = true;
      nextPageToken = countResponse.data.nextPageToken || undefined;

      // Estimate count from first response
      if (countResponse.data.files && countResponse.data.files.length > 0) {
        trashedItemsCount = countResponse.data.files.length;
      }
    } catch {
      // If count fails, proceed with emptying trash anyway
      trashedItemsCount = 0;
    }

    // Empty the trash
    await drive.files.emptyTrash({});

    let output = `🗑️ Trash Emptied Successfully!\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `✅ All files in trash have been permanently deleted.\n`;
    output += `⚠️ This action cannot be undone.\n`;

    if (trashedItemsCount > 0) {
      output += `📊 Estimated items deleted: ${trashedItemsCount}+\n`;
    }

    return ResponseFormatter.success(
      {
        status: "success",
        message: "Trash emptied successfully",
        timestamp: new Date().toISOString(),
        warning: "This action cannot be undone. Deleted files are permanently removed.",
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
