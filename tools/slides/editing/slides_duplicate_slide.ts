import { google } from "googleapis";
import {
  SlidesDuplicateSlideInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { generateObjectId } from "../../../lib/slides-helpers.js";

export const schema = {
  name: "slides_duplicate_slide",
  description:
    "Duplicate an existing slide in a presentation. The duplicated slide will be inserted at a specified index or immediately after the source slide by default.",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation",
      },
      slideId: {
        type: "string",
        description: "The object ID of the slide to duplicate",
      },
      insertionIndex: {
        type: "number",
        description:
          "The zero-based index where the duplicated slide should be inserted. If not specified, the slide will be inserted immediately after the source slide.",
      },
    },
    required: ["presentationId", "slideId"],
  },
} as const;

export async function duplicateSlide(
  args: SlidesDuplicateSlideInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, slideId, insertionIndex } = args;

    // Generate a unique ID for the duplicated slide
    const duplicatedSlideId = generateObjectId("slide");

    // Build the duplicate request with explicit ID mapping
    const requests: any[] = [
      {
        duplicateObject: {
          objectId: slideId,
          objectIds: {
            [slideId]: duplicatedSlideId,
          },
        },
      },
    ];

    // If insertionIndex is specified, add a second request to move the slide
    if (insertionIndex !== undefined) {
      requests.push({
        updateSlidesPosition: {
          slideObjectIds: [duplicatedSlideId],
          insertionIndex,
        },
      });
    }

    const response = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    });

    if (!response.data || !response.data.replies || response.data.replies.length === 0) {
      return ResponseFormatter.error(new Error("Failed to duplicate slide"));
    }

    let output = `Slide duplicated successfully:\n\n`;
    output += `Original Slide ID: ${slideId}\n`;
    output += `Duplicated Slide ID: ${duplicatedSlideId}\n`;
    if (insertionIndex !== undefined) {
      output += `Insertion Index: ${insertionIndex}`;
    } else {
      output += `Inserted immediately after source slide`;
    }

    return ResponseFormatter.success(
      {
        presentationId,
        originalSlideId: slideId,
        duplicatedSlideId,
        insertionIndex,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
