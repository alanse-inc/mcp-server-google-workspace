import { google } from "googleapis";
import { SlidesInsertImageInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  generateObjectId,
  validateDimensions,
  getDefaultImageDimensions,
  inchesToEMU,
} from "../../../lib/slides-helpers.js";

export const schema = {
  name: "slides_insert_image",
  description:
    "Insert an image into a slide from a URL. Optionally specify position and size in inches (converted to EMU internally).",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation",
      },
      slideId: {
        type: "string",
        description: "The ID of the slide to insert image into",
      },
      imageUrl: {
        type: "string",
        description: "The URL of the image to insert (must be publicly accessible)",
      },
      x: {
        type: "number",
        description: "X position in inches (default: 2)",
      },
      y: {
        type: "number",
        description: "Y position in inches (default: 2)",
      },
      width: {
        type: "number",
        description: "Width in inches (default: 4)",
      },
      height: {
        type: "number",
        description: "Height in inches (default: 3)",
      },
    },
    required: ["presentationId", "slideId", "imageUrl"],
  },
} as const;

export async function insertImage(
  args: SlidesInsertImageInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, slideId, imageUrl, x, y, width, height } = args;

    // Validate URL format and protocol
    try {
      const url = new URL(imageUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return ResponseFormatter.error(
          new Error("Invalid image URL protocol. Only HTTP and HTTPS URLs are supported.")
        );
      }
    } catch {
      return ResponseFormatter.error(
        new Error("Invalid image URL format. Must be a valid HTTP/HTTPS URL."),
      );
    }

    // Use default dimensions or convert provided inches to EMU
    const defaults = getDefaultImageDimensions();
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

    // Generate unique object ID for the image
    const imageId = generateObjectId("image");

    // Create image request
    const requests: any[] = [
      {
        createImage: {
          objectId: imageId,
          url: imageUrl,
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
    ];

    const response = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    });

    if (!response.data || !response.data.replies) {
      return ResponseFormatter.error(new Error("Failed to insert image"));
    }

    return ResponseFormatter.success(
      {
        imageId,
        slideId,
        presentationId,
        imageUrl,
      },
      `Image inserted successfully:\n\nImage ID: ${imageId}\nSlide ID: ${slideId}\nImage URL: ${imageUrl}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
