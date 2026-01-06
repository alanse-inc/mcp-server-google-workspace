import { google } from "googleapis";
import { GDocsApplyStyleInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_apply_style",
  description: "Apply a named style (Normal, Heading 1-6, Title, Subtitle) to a paragraph range in a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      startIndex: {
        type: "number",
        description: "Start position of paragraph to style (1-based, inclusive)",
      },
      endIndex: {
        type: "number",
        description: "End position of paragraph to style (1-based, exclusive)",
      },
      namedStyleType: {
        type: "string",
        description: "Named style to apply",
        enum: [
          "NORMAL_TEXT",
          "HEADING_1",
          "HEADING_2",
          "HEADING_3",
          "HEADING_4",
          "HEADING_5",
          "HEADING_6",
          "TITLE",
          "SUBTITLE",
        ],
      },
    },
    required: ["documentId", "startIndex", "endIndex", "namedStyleType"],
  },
} as const;

export async function applyStyle(
  args: GDocsApplyStyleInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateRange(args.startIndex, args.endIndex)) {
      throw new Error("Invalid range: startIndex must be less than endIndex and both must be positive");
    }

    if (!Validator.validateNamedStyleType(args.namedStyleType)) {
      throw new Error("Invalid namedStyleType. Must be one of: NORMAL_TEXT, HEADING_1-6, TITLE, SUBTITLE");
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
                namedStyleType: args.namedStyleType,
              },
              fields: "namedStyleType",
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
      namedStyleType: args.namedStyleType,
      range: {
        startIndex: args.startIndex,
        endIndex: args.endIndex,
      },
    }, `Style '${args.namedStyleType}' applied successfully`);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
