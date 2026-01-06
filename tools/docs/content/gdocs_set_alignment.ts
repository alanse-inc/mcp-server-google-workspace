import { google } from "googleapis";
import { GDocsSetAlignmentInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_set_alignment",
  description: "Set paragraph alignment (left, center, right, justified) for a range in a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      startIndex: {
        type: "number",
        description: "Start position of paragraph to align (1-based, inclusive)",
      },
      endIndex: {
        type: "number",
        description: "End position of paragraph to align (1-based, exclusive)",
      },
      alignment: {
        type: "string",
        description: "Alignment type",
        enum: ["START", "CENTER", "END", "JUSTIFIED"],
      },
    },
    required: ["documentId", "startIndex", "endIndex", "alignment"],
  },
} as const;

export async function setAlignment(
  args: GDocsSetAlignmentInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateRange(args.startIndex, args.endIndex)) {
      throw new Error("Invalid range: startIndex must be less than endIndex and both must be positive");
    }

    if (!Validator.validateAlignment(args.alignment)) {
      throw new Error("alignment must be one of: START, CENTER, END, JUSTIFIED");
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
            updateParagraphStyle: {
              paragraphStyle: {
                alignment: args.alignment,
              },
              fields: "alignment",
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
      alignment: args.alignment,
      range: {
        startIndex: args.startIndex,
        endIndex: args.endIndex,
      },
    }, "Paragraph alignment set successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
