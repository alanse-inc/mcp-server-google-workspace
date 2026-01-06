import { google } from "googleapis";
import { GDocsCreateListInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_create_list",
  description: "Convert a range of paragraphs into a bulleted or numbered list in a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      startIndex: {
        type: "number",
        description: "Start position of text to convert to list (1-based, inclusive)",
      },
      endIndex: {
        type: "number",
        description: "End position of text to convert to list (1-based, exclusive)",
      },
      listType: {
        type: "string",
        description: "Type of list to create",
        enum: ["ORDERED", "UNORDERED"],
      },
      nestingLevel: {
        type: "number",
        description: "Nesting level of the list (0-8, default: 0)",
      },
    },
    required: ["documentId", "startIndex", "endIndex", "listType"],
  },
} as const;

export async function createList(
  args: GDocsCreateListInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateRange(args.startIndex, args.endIndex)) {
      throw new Error("Invalid range: startIndex must be less than endIndex and both must be positive");
    }

    if (!["ORDERED", "UNORDERED"].includes(args.listType)) {
      throw new Error("listType must be either 'ORDERED' or 'UNORDERED'");
    }

    const nestingLevel = args.nestingLevel || 0;
    if (nestingLevel < 0 || nestingLevel > 8) {
      throw new Error("nestingLevel must be between 0 and 8");
    }

    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    // Map list type to glyph type
    const glyphType = args.listType === "ORDERED" ? undefined : "GLYPH_TYPE_UNSPECIFIED";

    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            createParagraphBullets: {
              range: {
                startIndex: args.startIndex,
                endIndex: args.endIndex,
              },
              bulletPreset: args.listType === "ORDERED"
                ? "NUMBERED_DECIMAL_ALPHA_ROMAN"
                : "BULLET_DISC_CIRCLE_SQUARE",
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      listType: args.listType,
      range: {
        startIndex: args.startIndex,
        endIndex: args.endIndex,
      },
      nestingLevel,
    }, `List created successfully (${args.listType.toLowerCase()})`);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
