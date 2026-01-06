import { google } from "googleapis";
import { GDocsDeleteTextInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_delete_text",
  description: "Delete text in a specific range from a Google Document. Indices are 1-based.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      startIndex: {
        type: "number",
        description: "Start position of text to delete (1-based, inclusive)",
      },
      endIndex: {
        type: "number",
        description: "End position of text to delete (1-based, exclusive)",
      },
    },
    required: ["documentId", "startIndex", "endIndex"],
  },
} as const;

export async function deleteText(
  args: GDocsDeleteTextInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateRange(args.startIndex, args.endIndex)) {
      throw new Error("Invalid range: startIndex must be less than endIndex and both must be positive");
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
            deleteContentRange: {
              range: {
                startIndex: args.startIndex,
                endIndex: args.endIndex,
              },
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      deletedRange: {
        startIndex: args.startIndex,
        endIndex: args.endIndex,
      },
      deletedLength: args.endIndex - args.startIndex,
    }, "Text deleted successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
