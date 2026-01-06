import { google } from "googleapis";
import { GDocsExportInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_export",
  description: "Export a Google Document to different formats (PDF, DOCX, Plain Text, HTML, EPUB).",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      mimeType: {
        type: "string",
        description: "Export format",
        enum: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "text/html",
          "application/epub+zip",
        ],
      },
    },
    required: ["documentId", "mimeType"],
  },
} as const;

export async function exportDocument(
  args: GDocsExportInput,
): Promise<InternalToolResponse> {
  try {
    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const drive = google.drive("v3");

    // Export the document
    const response = await drive.files.export(
      {
        fileId: documentId,
        mimeType: args.mimeType,
      },
      { responseType: "arraybuffer" },
    );

    // Get file size
    const fileSize = Buffer.byteLength(response.data as ArrayBuffer);

    // Map MIME type to file extension
    const extensionMap: Record<string, string> = {
      "application/pdf": "pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "text/plain": "txt",
      "text/html": "html",
      "application/epub+zip": "epub",
    };

    const extension = extensionMap[args.mimeType];

    return ResponseFormatter.success({
      documentId,
      mimeType: args.mimeType,
      extension,
      fileSize,
      note: "Document exported successfully. The exported file data is available in the API response but not shown here for brevity.",
    }, "Document exported successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
