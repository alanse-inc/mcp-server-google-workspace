/**
 * Google Drive Helper Functions
 *
 * Utilities for Google Drive API operations including:
 * - File metadata formatting
 * - Permission formatting
 * - MIME type conversion
 * - URL generation
 * - File upload handling
 */

import { drive_v3 } from "googleapis";

/**
 * Format file metadata for display
 */
export function formatFileMetadata(
  file: drive_v3.Schema$File,
  detailed = false,
): string {
  const id = file.id || "";
  const name = file.name || "Unnamed";
  const mimeType = file.mimeType || "unknown";
  const size = file.size ? formatFileSize(parseInt(file.size)) : "N/A";
  const modifiedTime = file.modifiedTime
    ? new Date(file.modifiedTime).toLocaleString()
    : "Unknown";
  const webViewLink = file.webViewLink || "";

  if (!detailed) {
    return `${name} (${id}) - ${mimeType}`;
  }

  let output = `📄 ${name}\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `ID: ${id}\n`;
  output += `MIME Type: ${mimeType}\n`;
  output += `Size: ${size}\n`;
  output += `Modified: ${modifiedTime}\n`;
  if (webViewLink) {
    output += `Web Link: ${webViewLink}\n`;
  }
  if (file.parents && file.parents.length > 0) {
    output += `Parent Folder(s): ${file.parents.join(", ")}\n`;
  }
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  return output;
}

/**
 * Format file list for display
 */
export function formatFileList(
  files: drive_v3.Schema$File[],
  nextPageToken?: string | null,
): string {
  if (files.length === 0) {
    return "No files found.";
  }

  let output = `Found ${files.length} file(s):\n\n`;

  files.forEach((file, index) => {
    const name = file.name || "Unnamed";
    const id = file.id || "";
    const mimeType = file.mimeType || "unknown";
    const size = file.size ? formatFileSize(parseInt(file.size)) : "N/A";

    output += `${index + 1}. ${name}\n`;
    output += `   ID: ${id}\n`;
    output += `   Type: ${mimeType}\n`;
    output += `   Size: ${size}\n`;
    if (file.webViewLink) {
      output += `   Link: ${file.webViewLink}\n`;
    }
    output += `\n`;
  });

  if (nextPageToken) {
    output += `\nMore results available. Use pageToken: ${nextPageToken}`;
  }

  return output;
}

/**
 * Format permission for display
 */
export function formatPermission(permission: drive_v3.Schema$Permission): string {
  const role = permission.role || "unknown";
  const type = permission.type || "unknown";
  const emailAddress = permission.emailAddress || "";
  const displayName = permission.displayName || "";
  const id = permission.id || "";

  let output = `Permission ID: ${id}\n`;
  output += `  Role: ${role}\n`;
  output += `  Type: ${type}\n`;
  if (emailAddress) {
    output += `  Email: ${emailAddress}\n`;
  }
  if (displayName) {
    output += `  Name: ${displayName}\n`;
  }

  return output;
}

/**
 * Format permission list for display
 */
export function formatPermissionList(
  permissions: drive_v3.Schema$Permission[],
): string {
  if (permissions.length === 0) {
    return "No permissions found.";
  }

  let output = `Total permissions: ${permissions.length}\n\n`;

  permissions.forEach((permission, index) => {
    output += `${index + 1}. ${formatPermission(permission)}\n`;
  });

  return output;
}

/**
 * Format revision for display
 */
export function formatRevision(revision: drive_v3.Schema$Revision): string {
  const id = revision.id || "";
  const modifiedTime = revision.modifiedTime
    ? new Date(revision.modifiedTime).toLocaleString()
    : "Unknown";
  const lastModifyingUser = revision.lastModifyingUser?.displayName || "Unknown";
  const size = revision.size ? formatFileSize(parseInt(revision.size)) : "N/A";

  let output = `Revision ID: ${id}\n`;
  output += `  Modified: ${modifiedTime}\n`;
  output += `  Modified by: ${lastModifyingUser}\n`;
  output += `  Size: ${size}\n`;

  return output;
}

/**
 * Format revision list for display
 */
export function formatRevisionList(
  revisions: drive_v3.Schema$Revision[],
): string {
  if (revisions.length === 0) {
    return "No revisions found.";
  }

  let output = `Total revisions: ${revisions.length}\n\n`;

  revisions.forEach((revision, index) => {
    output += `${index + 1}. ${formatRevision(revision)}\n`;
  });

  return output;
}

/**
 * Convert MIME type for export
 */
export function convertMimeType(
  sourceMimeType: string,
  targetFormat?: string,
): string {
  // Google Workspace document types
  const googleMimeTypes: { [key: string]: { [key: string]: string } } = {
    "application/vnd.google-apps.document": {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      html: "text/html",
      txt: "text/plain",
      odt: "application/vnd.oasis.opendocument.text",
      rtf: "application/rtf",
      epub: "application/epub+zip",
      markdown: "text/markdown",
    },
    "application/vnd.google-apps.spreadsheet": {
      pdf: "application/pdf",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      csv: "text/csv",
      ods: "application/vnd.oasis.opendocument.spreadsheet",
      tsv: "text/tab-separated-values",
      html: "text/html",
    },
    "application/vnd.google-apps.presentation": {
      pdf: "application/pdf",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      odp: "application/vnd.oasis.opendocument.presentation",
      txt: "text/plain",
    },
    "application/vnd.google-apps.drawing": {
      pdf: "application/pdf",
      png: "image/png",
      jpeg: "image/jpeg",
      svg: "image/svg+xml",
    },
  };

  if (!targetFormat) {
    // Default export formats
    const defaults: { [key: string]: string } = {
      "application/vnd.google-apps.document": "application/pdf",
      "application/vnd.google-apps.spreadsheet": "text/csv",
      "application/vnd.google-apps.presentation": "application/pdf",
      "application/vnd.google-apps.drawing": "image/png",
    };
    return defaults[sourceMimeType] || "application/pdf";
  }

  const formats = googleMimeTypes[sourceMimeType];
  if (!formats) {
    throw new Error(`Unsupported source MIME type: ${sourceMimeType}`);
  }

  const targetMimeType = formats[targetFormat.toLowerCase()];
  if (!targetMimeType) {
    throw new Error(
      `Unsupported export format '${targetFormat}' for MIME type '${sourceMimeType}'`,
    );
  }

  return targetMimeType;
}

/**
 * Generate Google Drive web URL for a file or folder
 */
export function generateDriveWebUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Generate folder web URL
 */
export function generateFolderWebUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

/**
 * Format file size to human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get MIME type for folder
 */
export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

/**
 * Check if MIME type is a Google Workspace document
 */
export function isGoogleWorkspaceDocument(mimeType: string): boolean {
  return mimeType.startsWith("application/vnd.google-apps.");
}

/**
 * Get icon for MIME type
 */
export function getFileIcon(mimeType: string): string {
  const icons: { [key: string]: string } = {
    "application/vnd.google-apps.folder": "📁",
    "application/vnd.google-apps.document": "📝",
    "application/vnd.google-apps.spreadsheet": "📊",
    "application/vnd.google-apps.presentation": "📊",
    "application/vnd.google-apps.drawing": "🎨",
    "application/pdf": "📄",
    "image/png": "🖼️",
    "image/jpeg": "🖼️",
    "text/plain": "📃",
    "application/zip": "🗜️",
  };

  return icons[mimeType] || "📄";
}

/**
 * Format permission role for display
 */
export function getRoleLabel(role: string): string {
  const labels: { [key: string]: string } = {
    owner: "Owner",
    organizer: "Organizer",
    fileOrganizer: "File Organizer",
    writer: "Editor",
    commenter: "Commenter",
    reader: "Viewer",
  };

  return labels[role] || role;
}

/**
 * Format permission type for display
 */
export function getTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    user: "User",
    group: "Group",
    domain: "Domain",
    anyone: "Anyone with link",
  };

  return labels[type] || type;
}
