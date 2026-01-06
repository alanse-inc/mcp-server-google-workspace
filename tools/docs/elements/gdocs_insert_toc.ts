import { google } from "googleapis";
import { GDocsInsertTocInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_insert_toc",
  description: "Insert a 'Table of Contents' heading at a specific position. NOTE: The Google Docs API doesn't support auto-generated TOC insertion. To insert an actual auto-updating TOC, use Insert > Table of contents in the Google Docs UI.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      index: {
        type: "number",
        description: "Position to insert TOC heading (1-based)",
      },
    },
    required: ["documentId", "index"],
  },
} as const;

export async function insertToc(
  args: GDocsInsertTocInput,
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

    // NOTE: Google Docs API doesn't support programmatic TOC insertion
    // This is a workaround that inserts a styled "Table of Contents" heading
    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: args.index,
              },
              text: "Table of Contents\n",
            },
          },
          {
            updateParagraphStyle: {
              range: {
                startIndex: args.index,
                endIndex: args.index + 19, // "Table of Contents\n".length
              },
              paragraphStyle: {
                namedStyleType: "HEADING_1",
              },
              fields: "namedStyleType",
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      insertedAt: args.index,
      note: "Inserted 'Table of Contents' heading. To insert an auto-updating TOC, use Insert > Table of contents in the Google Docs UI. The API doesn't support programmatic TOC generation.",
    }, "Table of Contents heading inserted successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
