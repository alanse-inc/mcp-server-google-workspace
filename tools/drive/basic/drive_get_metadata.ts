import { google } from "googleapis";
import { GDriveGetMetadataInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatFileMetadata } from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_get_metadata",
  description:
    "Get detailed metadata for a specific file in Google Drive. Returns file ID, name, MIME type, size, created/modified times, sharing settings, and more.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to get metadata for",
      },
      fields: {
        type: "string",
        description:
          "Comma-separated list of fields to include (default: all common fields)",
        optional: true,
      },
    },
    required: ["fileId"],
  },
} as const;

export async function getMetadata(
  args: GDriveGetMetadataInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, fields } = args;

    const defaultFields =
      "id, name, mimeType, size, createdTime, modifiedTime, modifiedByMe, owners, lastModifyingUser, shared, sharingUser, permissions, parents, webViewLink, webContentLink, iconLink, thumbnailLink, description, starred, trashed, explicitlyTrashed, properties, appProperties, spaces, version, teamDriveId, driveId, hasAugmentedPermissions, hasVersions, headRevisionId, copyRequiresWriterPermission, writersCanShare, folderColorRgb, originalFilename, fullFileExtension, fileExtension, md5Checksum, sha1Checksum, sha256Checksum";

    const response = await drive.files.get({
      fileId,
      fields: fields || defaultFields,
      supportsAllDrives: true,
    });

    const file = response.data;
    const output = formatFileMetadata(file, true);

    return ResponseFormatter.success(
      {
        fileId: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        metadata: file,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
