import { google } from "googleapis";
import { GDocsInsertImageInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_insert_image",
  description: "Insert an image from a URL into a Google Document at a specific position.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      imageUrl: {
        type: "string",
        description: "URL of the image to insert (must be publicly accessible)",
      },
      index: {
        type: "number",
        description: "Position to insert image (1-based)",
      },
      width: {
        type: "number",
        description: "Image width in points (optional)",
      },
      height: {
        type: "number",
        description: "Image height in points (optional)",
      },
    },
    required: ["documentId", "imageUrl", "index"],
  },
} as const;

export async function insertImage(
  args: GDocsInsertImageInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateIndex(args.index)) {
      throw new Error("Index must be a positive integer");
    }

    if (!Validator.validateUrl(args.imageUrl)) {
      throw new Error("Invalid image URL");
    }

    if (args.width && !Validator.validatePositiveNumber(args.width)) {
      throw new Error("Width must be a positive number");
    }

    if (args.height && !Validator.validatePositiveNumber(args.height)) {
      throw new Error("Height must be a positive number");
    }

    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    // Build image properties
    const imageProperties: any = {
      contentUri: args.imageUrl,
    };

    if (args.width || args.height) {
      imageProperties.sourceUri = args.imageUrl;
    }

    // Build object size if dimensions specified
    let objectSize;
    if (args.width || args.height) {
      objectSize = {
        width: args.width ? { magnitude: args.width, unit: "PT" } : undefined,
        height: args.height ? { magnitude: args.height, unit: "PT" } : undefined,
      };
    }

    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertInlineImage: {
              uri: args.imageUrl,
              location: {
                index: args.index,
              },
              objectSize,
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      imageUrl: args.imageUrl,
      insertedAt: args.index,
      width: args.width,
      height: args.height,
    }, "Image inserted successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
