import { google } from "googleapis";
import { GDocsReplaceTextInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_replace_text",
  description: "Find and replace all occurrences of text in a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      findText: {
        type: "string",
        description: "Text to find",
      },
      replaceText: {
        type: "string",
        description: "Text to replace with",
      },
      matchCase: {
        type: "boolean",
        description: "Whether to match case (default: false)",
      },
    },
    required: ["documentId", "findText", "replaceText"],
  },
} as const;

export async function replaceText(
  args: GDocsReplaceTextInput,
): Promise<InternalToolResponse> {
  try {
    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: {
                text: args.findText,
                matchCase: args.matchCase || false,
              },
              replaceText: args.replaceText,
            },
          },
        ],
      },
    });

    // Get occurrences replaced from response
    const occurrencesReplaced = response.data.replies?.[0]?.replaceAllText?.occurrencesChanged || 0;

    return ResponseFormatter.success({
      documentId,
      findText: args.findText,
      replaceText: args.replaceText,
      occurrencesReplaced,
    }, `Replaced ${occurrencesReplaced} occurrence(s)`);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
