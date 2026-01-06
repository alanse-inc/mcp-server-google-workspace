import { google } from "googleapis";
import { GDocsReadInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_read",
  description: "Read content from a Google Document. Accepts either a document ID or a full Google Docs URL.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL (e.g., https://docs.google.com/document/d/DOCUMENT_ID/edit)",
      },
      includeFormatting: {
        type: "boolean",
        description: "Whether to include text formatting information (default: false)",
      },
    },
    required: ["documentId"],
  },
} as const;

export async function readDocument(
  args: GDocsReadInput,
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

    // Extract plain text content
    let textContent = "";
    if (doc.body?.content) {
      for (const element of doc.body.content) {
        if (element.paragraph?.elements) {
          for (const textElement of element.paragraph.elements) {
            if (textElement.textRun?.content) {
              textContent += textElement.textRun.content;
            }
          }
        }
      }
    }

    const result: any = {
      documentId: doc.documentId,
      title: doc.title,
      revisionId: doc.revisionId,
      textContent,
    };

    // Include formatting if requested
    if (args.includeFormatting) {
      result.body = doc.body;
      result.documentStyle = doc.documentStyle;
      result.namedStyles = doc.namedStyles;
    }

    return ResponseFormatter.success(result, "Document read successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
