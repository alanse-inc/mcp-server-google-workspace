import { google } from "googleapis";
import { GDriveCreateFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatFileMetadata,
  generateDriveWebUrl,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_create_file",
  description:
    "Create an empty file or Google Workspace document in Google Drive. Creates a file with metadata only (no content). Use drive_upload_file if you need to include content.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "File name",
      },
      mimeType: {
        type: "string",
        description:
          "MIME type of the file (e.g., 'application/vnd.google-apps.document' for Google Docs, 'application/vnd.google-apps.spreadsheet' for Sheets)",
      },
      parents: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Parent folder ID(s) where the file should be created",
        optional: true,
      },
      description: {
        type: "string",
        description: "File description",
        optional: true,
      },
    },
    required: ["name", "mimeType"],
  },
} as const;

export async function createFile(
  args: GDriveCreateFileInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { name, mimeType, parents, description } = args;

    // Create file metadata
    const fileMetadata: any = {
      name,
      mimeType,
    };

    if (parents && parents.length > 0) {
      fileMetadata.parents = parents;
    }

    if (description) {
      fileMetadata.description = description;
    }

    // Create empty file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name, mimeType, size, modifiedTime, webViewLink, parents",
    });

    const file = response.data;
    const fileId = file.id || "";

    let output = `✅ File created successfully!\n\n`;
    output += formatFileMetadata(file, true);
    output += `\n📎 Web URL: ${generateDriveWebUrl(fileId)}\n`;

    return ResponseFormatter.success(
      {
        fileId,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        webViewLink: file.webViewLink,
        parents: file.parents,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
