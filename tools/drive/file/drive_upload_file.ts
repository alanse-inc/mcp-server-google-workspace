import { google } from "googleapis";
import { GDriveUploadFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatFileMetadata,
  generateDriveWebUrl,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_upload_file",
  description:
    "Upload a file to Google Drive with content. Creates a new file with the specified name, MIME type, and content. Optionally specify parent folder(s) and description.",
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
          "MIME type of the file (e.g., 'text/plain', 'application/json', 'image/png')",
      },
      content: {
        type: "string",
        description:
          "File content (base64 encoded for binary files, plain text for text files)",
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
    required: ["name", "mimeType", "content"],
  },
} as const;

export async function uploadFile(
  args: GDriveUploadFileInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { name, mimeType, content, parents, description } = args;

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

    // Upload file with content
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: content,
      },
      fields: "id, name, mimeType, size, modifiedTime, webViewLink, parents",
    });

    const file = response.data;
    const fileId = file.id || "";

    let output = `✅ File uploaded successfully!\n\n`;
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
