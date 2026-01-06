import { google } from "googleapis";
import { GDriveExportFileInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  convertMimeType,
  isGoogleWorkspaceDocument,
  formatFileMetadata,
} from "../../../lib/drive-helpers.js";

export const schema = {
  name: "drive_export_file",
  description:
    "Export a Google Workspace document (Docs, Sheets, Slides, Drawing) to a different format. Only works with Google Workspace files.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: {
        type: "string",
        description: "ID of the file to export",
      },
      mimeType: {
        type: "string",
        description:
          "Target MIME type for export. Optional - uses default if not specified. Examples: application/pdf, text/csv, text/plain, etc.",
        optional: true,
      },
      format: {
        type: "string",
        description:
          "Export format name (shorthand). For Docs: pdf, docx, html, txt, odt, rtf, epub, markdown. For Sheets: csv, xlsx, ods, tsv, html. For Slides: pdf, pptx, odp, txt. For Drawing: png, jpeg, svg, pdf.",
        optional: true,
      },
    },
    required: ["fileId"],
  },
} as const;

export async function exportFile(
  args: GDriveExportFileInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");
    const { fileId, mimeType: customMimeType, format } = args;

    // Get file metadata to check type
    const fileResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, size",
    });

    const file = fileResponse.data;
    const sourceMimeType = file.mimeType || "";

    // Check if it's a Google Workspace document
    if (!isGoogleWorkspaceDocument(sourceMimeType)) {
      return ResponseFormatter.error(
        `File is not a Google Workspace document. MIME type: ${sourceMimeType}. Only Google Docs, Sheets, Slides, and Drawings can be exported.`,
      );
    }

    // Determine target MIME type
    let targetMimeType: string;
    if (customMimeType) {
      targetMimeType = customMimeType;
    } else if (format) {
      try {
        targetMimeType = convertMimeType(sourceMimeType, format);
      } catch (error: any) {
        return ResponseFormatter.error(error.message);
      }
    } else {
      // Use default format
      try {
        targetMimeType = convertMimeType(sourceMimeType);
      } catch (error: any) {
        return ResponseFormatter.error(error.message);
      }
    }

    // Get export MIME type label
    const formatLabel = getFormatLabel(targetMimeType);

    // Export the file
    const exportResponse = await drive.files.export(
      {
        fileId,
        mimeType: targetMimeType,
      },
      { responseType: "arraybuffer" },
    );

    const fileBuffer = Buffer.from(exportResponse.data as ArrayBuffer);
    const base64Content = fileBuffer.toString("base64");
    const fileName = `${file.name || "export"}.${getFileExtension(targetMimeType)}`;

    let output = `✅ File exported successfully!\n\n`;
    output += `📄 File Name: ${file.name}\n`;
    output += `📊 Source Format: ${getDocumentTypeLabel(sourceMimeType)}\n`;
    output += `📥 Exported Format: ${formatLabel}\n`;
    output += `💾 File Size: ${(fileBuffer.length / 1024).toFixed(2)} KB\n`;
    output += `📁 Export File Name: ${fileName}\n`;

    return ResponseFormatter.success(
      {
        fileId,
        fileName: file.name,
        exportFileName: fileName,
        sourceFormat: sourceMimeType,
        targetFormat: targetMimeType,
        fileSizeBytes: fileBuffer.length,
        fileSizeKB: (fileBuffer.length / 1024).toFixed(2),
        content: base64Content,
        contentEncoding: "base64",
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}

/**
 * Get file extension based on MIME type
 */
function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "text/html": "html",
    "text/plain": "txt",
    "application/vnd.oasis.opendocument.text": "odt",
    "application/rtf": "rtf",
    "application/epub+zip": "epub",
    "text/markdown": "md",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "xlsx",
    "text/csv": "csv",
    "application/vnd.oasis.opendocument.spreadsheet": "ods",
    "text/tab-separated-values": "tsv",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "application/vnd.oasis.opendocument.presentation": "odp",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
  };

  return extensions[mimeType] || "bin";
}

/**
 * Get format label for display
 */
function getFormatLabel(mimeType: string): string {
  const labels: { [key: string]: string } = {
    "application/pdf": "PDF Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Microsoft Word",
    "text/html": "HTML",
    "text/plain": "Plain Text",
    "application/vnd.oasis.opendocument.text": "OpenDocument Text",
    "application/rtf": "Rich Text Format",
    "application/epub+zip": "EPUB eBook",
    "text/markdown": "Markdown",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Microsoft Excel",
    "text/csv": "CSV (Comma Separated Values)",
    "application/vnd.oasis.opendocument.spreadsheet": "OpenDocument Spreadsheet",
    "text/tab-separated-values": "TSV (Tab Separated Values)",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "Microsoft PowerPoint",
    "application/vnd.oasis.opendocument.presentation":
      "OpenDocument Presentation",
    "image/png": "PNG Image",
    "image/jpeg": "JPEG Image",
    "image/svg+xml": "SVG Image",
  };

  return labels[mimeType] || mimeType;
}

/**
 * Get document type label
 */
function getDocumentTypeLabel(mimeType: string): string {
  const labels: { [key: string]: string } = {
    "application/vnd.google-apps.document": "Google Docs",
    "application/vnd.google-apps.spreadsheet": "Google Sheets",
    "application/vnd.google-apps.presentation": "Google Slides",
    "application/vnd.google-apps.drawing": "Google Drawing",
  };

  return labels[mimeType] || "Google Workspace Document";
}
