import { google } from "googleapis";
import { SlidesInsertTextInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  generateObjectId,
  validateDimensions,
  getDefaultTextBoxDimensions,
  inchesToEMU,
} from "../../../lib/slides-helpers.js";

export const schema = {
  name: "slides_insert_text",
  description:
    "Insert a text box with specified content into a slide. Optionally specify position and size in inches (converted to EMU internally).",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation",
      },
      slideId: {
        type: "string",
        description: "The ID of the slide to insert text into",
      },
      text: {
        type: "string",
        description: "The text content to insert",
      },
      x: {
        type: "number",
        description: "X position in inches (default: 1)",
      },
      y: {
        type: "number",
        description: "Y position in inches (default: 1)",
      },
      width: {
        type: "number",
        description: "Width in inches (default: 6)",
      },
      height: {
        type: "number",
        description: "Height in inches (default: 1)",
      },
    },
    required: ["presentationId", "slideId", "text"],
  },
} as const;

export async function insertText(
  args: SlidesInsertTextInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, slideId, text, x, y, width, height } = args;

    // Use default dimensions or convert provided inches to EMU
    const defaults = getDefaultTextBoxDimensions();
    const dimensions = {
      x: x !== undefined ? inchesToEMU(x) : defaults.x,
      y: y !== undefined ? inchesToEMU(y) : defaults.y,
      width: width !== undefined ? inchesToEMU(width) : defaults.width,
      height: height !== undefined ? inchesToEMU(height) : defaults.height,
    };

    // Validate dimensions
    const validation = validateDimensions(dimensions);
    if (!validation.valid) {
      return ResponseFormatter.error(new Error(validation.error));
    }

    // Generate unique object ID for the text box
    const textBoxId = generateObjectId("textbox");

    // Create text box and insert text
    const requests: any[] = [
      {
        createShape: {
          objectId: textBoxId,
          shapeType: "TEXT_BOX",
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: dimensions.width, unit: "EMU" },
              height: { magnitude: dimensions.height, unit: "EMU" },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: dimensions.x,
              translateY: dimensions.y,
            },
          },
        },
      },
      {
        insertText: {
          objectId: textBoxId,
          text,
        },
      },
    ];

    const response = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    });

    if (!response.data || !response.data.replies) {
      return ResponseFormatter.error(new Error("Failed to insert text"));
    }

    return ResponseFormatter.success(
      {
        textBoxId,
        slideId,
        presentationId,
        text,
      },
      `Text inserted successfully:\n\nText Box ID: ${textBoxId}\nSlide ID: ${slideId}\nContent: "${text}"`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
