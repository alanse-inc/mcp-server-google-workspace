import { google } from "googleapis";
import { GDocsInsertTextInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_insert_text",
  description: "Insert text at a specific position in a Google Document. Position is 1-based (1 = start of document).",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      text: {
        type: "string",
        description: "Text to insert",
      },
      index: {
        type: "number",
        description: "Position to insert text (1-based index, 1 = start of document)",
      },
    },
    required: ["documentId", "text", "index"],
  },
} as const;

export async function insertText(
  args: GDocsInsertTextInput,
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
            insertText: {
              text: args.text,
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
      insertedText: args.text,
      insertedAt: args.index,
      length: args.text.length,
    }, "Text inserted successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
