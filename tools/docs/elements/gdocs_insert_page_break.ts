import { google } from "googleapis";
import { GDocsInsertPageBreakInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_insert_page_break",
  description: "Insert a page break at a specific position in a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      index: {
        type: "number",
        description: "Position to insert page break (1-based)",
      },
    },
    required: ["documentId", "index"],
  },
} as const;

export async function insertPageBreak(
  args: GDocsInsertPageBreakInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateIndex(args.index)) {
      throw new Error("Index must be a positive integer");
    }

    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertPageBreak: {
              location: {
                index: args.index,
              },
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      insertedAt: args.index,
    }, "Page break inserted successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
