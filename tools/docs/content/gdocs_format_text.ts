import { google } from "googleapis";
import { GDocsFormatTextInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_format_text",
  description: "Apply text formatting (bold, italic, font, color, etc.) to a range in a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      startIndex: {
        type: "number",
        description: "Start position of text to format (1-based, inclusive)",
      },
      endIndex: {
        type: "number",
        description: "End position of text to format (1-based, exclusive)",
      },
      format: {
        type: "object",
        description: "Formatting options to apply",
        properties: {
          bold: { type: "boolean", description: "Make text bold" },
          italic: { type: "boolean", description: "Make text italic" },
          underline: { type: "boolean", description: "Underline text" },
          fontSize: { type: "number", description: "Font size in points" },
          fontFamily: { type: "string", description: "Font family (e.g., 'Arial', 'Times New Roman')" },
          foregroundColor: {
            type: "object",
            description: "Text color (RGB values 0-1)",
            properties: {
              red: { type: "number" },
              green: { type: "number" },
              blue: { type: "number" },
            },
          },
          backgroundColor: {
            type: "object",
            description: "Background color (RGB values 0-1)",
            properties: {
              red: { type: "number" },
              green: { type: "number" },
              blue: { type: "number" },
            },
          },
        },
      },
    },
    required: ["documentId", "startIndex", "endIndex", "format"],
  },
} as const;

export async function formatText(
  args: GDocsFormatTextInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateRange(args.startIndex, args.endIndex)) {
      throw new Error("Invalid range: startIndex must be less than endIndex and both must be positive");
    }

    if (!Validator.validateTextStyle(args.format)) {
      throw new Error("Invalid format: at least one formatting property must be specified");
    }

    // Validate colors if provided
    if (args.format.foregroundColor && !Validator.validateColor(args.format.foregroundColor)) {
      throw new Error("Invalid foregroundColor: RGB values must be between 0 and 1");
    }

    if (args.format.backgroundColor && !Validator.validateColor(args.format.backgroundColor)) {
      throw new Error("Invalid backgroundColor: RGB values must be between 0 and 1");
    }

    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    // Build text style object
    const textStyle: any = {};
    if (args.format.bold !== undefined) textStyle.bold = args.format.bold;
    if (args.format.italic !== undefined) textStyle.italic = args.format.italic;
    if (args.format.underline !== undefined) textStyle.underline = args.format.underline;
    if (args.format.fontSize) {
      textStyle.fontSize = {
        magnitude: args.format.fontSize,
        unit: "PT",
      };
    }
    if (args.format.fontFamily) textStyle.weightedFontFamily = { fontFamily: args.format.fontFamily };
    if (args.format.foregroundColor) {
      textStyle.foregroundColor = {
        color: {
          rgbColor: args.format.foregroundColor,
        },
      };
    }
    if (args.format.backgroundColor) {
      textStyle.backgroundColor = {
        color: {
          rgbColor: args.format.backgroundColor,
        },
      };
    }

    // Build fields mask
    const fields = Object.keys(textStyle).join(",");

    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            updateTextStyle: {
              textStyle,
              fields,
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
      formattedRange: {
        startIndex: args.startIndex,
        endIndex: args.endIndex,
      },
      appliedFormats: Object.keys(args.format),
    }, "Text formatted successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
