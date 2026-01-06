import { google } from "googleapis";
import { GDocsGetMetadataInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_get_metadata",
  description: "Get metadata for a Google Document including title, revision ID, and document style. Accepts either a document ID or a full Google Docs URL.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL (e.g., https://docs.google.com/document/d/DOCUMENT_ID/edit)",
      },
    },
    required: ["documentId"],
  },
} as const;

export async function getMetadata(
  args: GDocsGetMetadataInput,
): Promise<InternalToolResponse> {
  try {
    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    const response = await docs.documents.get({
      documentId,
    });

    const doc = response.data;

    const metadata = {
      documentId: doc.documentId,
      title: doc.title,
      revisionId: doc.revisionId,
      suggestionsViewMode: doc.suggestionsViewMode,
      documentStyle: doc.documentStyle,
      namedStyles: doc.namedStyles,
      headers: Object.keys(doc.headers || {}).length,
      footers: Object.keys(doc.footers || {}).length,
      inlineObjects: Object.keys(doc.inlineObjects || {}).length,
      lists: Object.keys(doc.lists || {}).length,
    };

    return ResponseFormatter.success(metadata, "Document metadata retrieved successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
