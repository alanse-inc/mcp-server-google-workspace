import { google } from "googleapis";
import { GDocsAppendTextInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_append_text",
  description: "Append text to the end of a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      text: {
        type: "string",
        description: "Text to append to the end of the document",
      },
    },
    required: ["documentId", "text"],
  },
} as const;

export async function appendText(
  args: GDocsAppendTextInput,
): Promise<InternalToolResponse> {
  try {
    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    // First get the document to find the end index
    const doc = await docs.documents.get({ documentId });
    const endIndex = doc.data.body?.content?.[doc.data.body.content.length - 1]?.endIndex || 1;

    // Insert text at the end (endIndex - 1 because endIndex is exclusive)
    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              text: args.text,
              location: {
                index: endIndex - 1,
              },
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      appendedText: args.text,
      appendedAt: endIndex - 1,
      length: args.text.length,
    }, "Text appended successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
