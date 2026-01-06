import { google } from "googleapis";
import { GDocsInsertLinkInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_insert_link",
  description: "Insert a hyperlink on a text range in a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      startIndex: {
        type: "number",
        description: "Start position of text to link (1-based, inclusive)",
      },
      endIndex: {
        type: "number",
        description: "End position of text to link (1-based, exclusive)",
      },
      url: {
        type: "string",
        description: "URL to link to (must start with http:// or https://)",
      },
    },
    required: ["documentId", "startIndex", "endIndex", "url"],
  },
} as const;

export async function insertLink(
  args: GDocsInsertLinkInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateRange(args.startIndex, args.endIndex)) {
      throw new Error("Invalid range: startIndex must be less than endIndex and both must be positive");
    }

    if (!Validator.validateUrl(args.url)) {
      throw new Error("Invalid URL: must start with http:// or https://");
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
            updateTextStyle: {
              textStyle: {
                link: {
                  url: args.url,
                },
              },
              fields: "link",
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
      url: args.url,
      range: {
        startIndex: args.startIndex,
        endIndex: args.endIndex,
      },
    }, "Hyperlink inserted successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
