import { google } from "googleapis";
import { SlidesAddSlideInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { generateObjectId } from "../../../lib/slides-helpers.js";

export const schema = {
  name: "slides_add_slide",
  description:
    "Add a new blank slide to an existing Google Slides presentation. Optionally specify the position and layout.",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation to add a slide to",
      },
      insertionIndex: {
        type: "number",
        description:
          "The zero-based index where the slide should be inserted (default: append to end)",
      },
      slideLayoutReference: {
        type: "string",
        description:
          "The layout reference to use for the new slide (default: BLANK)",
      },
    },
    required: ["presentationId"],
  },
} as const;

export async function addSlide(
  args: SlidesAddSlideInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, insertionIndex, slideLayoutReference } = args;

    // Generate unique object ID for the new slide
    const slideId = generateObjectId("slide");

    // Create the slide request
    const requests: any[] = [
      {
        createSlide: {
          objectId: slideId,
          insertionIndex,
          slideLayoutReference: slideLayoutReference
            ? { predefinedLayout: slideLayoutReference }
            : { predefinedLayout: "BLANK" },
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
      return ResponseFormatter.error(new Error("Failed to add slide"));
    }

    const reply = response.data.replies[0];
    const createdSlide = reply.createSlide;

    if (!createdSlide) {
      return ResponseFormatter.error(new Error("Failed to create slide"));
    }

    return ResponseFormatter.success(
      {
        slideId: createdSlide.objectId,
        presentationId,
      },
      `Slide added successfully:\n\nSlide ID: ${createdSlide.objectId}\nPresentation ID: ${presentationId}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
