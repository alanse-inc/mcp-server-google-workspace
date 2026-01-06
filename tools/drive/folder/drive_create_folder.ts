import { google } from "googleapis";
import { GDriveCreateFolderInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  formatFileMetadata,
  generateFolderWebUrl,
  FOLDER_MIME_TYPE,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_create_folder",
  description:
    "Create a new folder in Google Drive. Can optionally place the folder inside a parent folder. Returns folder ID and metadata.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Folder name",
      },
      parents: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Parent folder ID(s) where the folder should be created (optional)",
        optional: true,
      },
      description: {
        type: "string",
        description: "Folder description",
        optional: true,
      },
    },
    required: ["name"],
  },
} as const;

export async function createFolder(
  args: GDriveCreateFolderInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { name, parents, description } = args;

    // Create folder metadata
    const folderMetadata: any = {
      name,
      mimeType: FOLDER_MIME_TYPE,
    };

    if (parents && parents.length > 0) {
      folderMetadata.parents = parents;
    }

    if (description) {
      folderMetadata.description = description;
    }

    // Create folder
    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id, name, mimeType, modifiedTime, webViewLink, parents",
    });

    const folder = response.data;
    const folderId = folder.id || "";

    let output = `✅ Folder created successfully!\n\n`;
    output += formatFileMetadata(folder, true);
    output += `\n📂 Web URL: ${generateFolderWebUrl(folderId)}\n`;

    return ResponseFormatter.success(
      {
        folderId,
        name: folder.name,
        mimeType: folder.mimeType,
        webViewLink: folder.webViewLink,
        parents: folder.parents,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
