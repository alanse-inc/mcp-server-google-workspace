import { google } from "googleapis";
import { GDocsUpdateTextInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_update_text",
  description: "Update (replace) text in a specific range in a Google Document. Indices are 1-based.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      startIndex: {
        type: "number",
        description: "Start position of text to replace (1-based, inclusive)",
      },
      endIndex: {
        type: "number",
        description: "End position of text to replace (1-based, exclusive)",
      },
      text: {
        type: "string",
        description: "New text to replace the range with",
      },
    },
    required: ["documentId", "startIndex", "endIndex", "text"],
  },
} as const;

export async function updateText(
  args: GDocsUpdateTextInput,
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

    // First delete the range, then insert new text
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
          {
            insertText: {
              text: args.text,
              location: {
                index: args.startIndex,
              },
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      updatedRange: {
        startIndex: args.startIndex,
        endIndex: args.startIndex + args.text.length,
      },
      newText: args.text,
      replacedLength: args.endIndex - args.startIndex,
    }, "Text updated successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
