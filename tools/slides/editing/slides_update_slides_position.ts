import { google } from "googleapis";
import {
  SlidesUpdateSlidesPositionInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "slides_update_slides_position",
  description:
    "Change the position of one or more slides in a presentation. The slides will be moved to the specified index while preserving their relative order.",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation",
      },
      slideIds: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "Array of slide object IDs to move. The slides will maintain their relative order.",
      },
      insertionIndex: {
        type: "number",
        description:
          "The zero-based index where the slides should be inserted",
      },
    },
    required: ["presentationId", "slideIds", "insertionIndex"],
  },
} as const;

export async function updateSlidesPosition(
  args: SlidesUpdateSlidesPositionInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, slideIds, insertionIndex } = args;

    // Validate inputs
    if (!slideIds || slideIds.length === 0) {
      return ResponseFormatter.error(
        new Error("At least one slide ID is required"),
      );
    }

    if (insertionIndex < 0) {
      return ResponseFormatter.error(
        new Error("Insertion index must be non-negative"),
      );
    }

    const requests: any[] = [
      {
        updateSlidesPosition: {
          slideObjectIds: slideIds,
          insertionIndex,
        },
      },
    ];

    const response = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    });

    if (!response.data) {
      return ResponseFormatter.error(
        new Error("Failed to update slides position"),
      );
    }

    let output = `Slides position updated successfully:\n\n`;
    output += `Slides moved: ${slideIds.length}\n`;
    output += `Slide IDs: ${slideIds.join(", ")}\n`;
    output += `New position index: ${insertionIndex}`;

    return ResponseFormatter.success(
      {
        presentationId,
        slideIds,
        insertionIndex,
        movedCount: slideIds.length,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
