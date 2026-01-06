import { google } from "googleapis";
import { GDocsCreateHeadingInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_create_heading",
  description: "Create a heading (H1-H6) in a Google Document. If index is not provided, appends to end.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      text: {
        type: "string",
        description: "Heading text",
      },
      level: {
        type: "number",
        description: "Heading level (1-6, where 1 is H1, 2 is H2, etc.)",
        enum: [1, 2, 3, 4, 5, 6],
      },
      index: {
        type: "number",
        description: "Position to insert heading (1-based). If not provided, appends to end.",
      },
    },
    required: ["documentId", "text", "level"],
  },
} as const;

export async function createHeading(
  args: GDocsCreateHeadingInput,
): Promise<InternalToolResponse> {
  try {
    // Validate level
    if (![1, 2, 3, 4, 5, 6].includes(args.level)) {
      throw new Error("Level must be between 1 and 6");
    }

    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    // Determine insertion index
    let insertIndex = args.index;
    if (!insertIndex) {
      const doc = await docs.documents.get({ documentId });
      const endIndex = doc.data.body?.content?.[doc.data.body.content.length - 1]?.endIndex || 1;
      insertIndex = endIndex - 1;
    }

    // Map level to named style
    const namedStyleType = `HEADING_${args.level}`;
    const headingText = args.text + "\n";

    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              text: headingText,
              location: {
                index: insertIndex,
              },
            },
          },
          {
            updateParagraphStyle: {
              paragraphStyle: {
                namedStyleType,
              },
              fields: "namedStyleType",
              range: {
                startIndex: insertIndex,
                endIndex: insertIndex + headingText.length,
              },
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      headingText: args.text,
      level: args.level,
      insertedAt: insertIndex,
      namedStyleType,
    }, `Heading ${args.level} created successfully`);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
