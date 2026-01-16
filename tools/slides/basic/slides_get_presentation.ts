import { google } from "googleapis";
import {
  SlidesGetPresentationInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatPresentation, formatSlide } from "../../../lib/slides-helpers.js";

export const schema = {
  name: "slides_get_presentation",
  description:
    "Get detailed information about a Google Slides presentation, including all slides and their content.",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation to retrieve",
      },
    },
    required: ["presentationId"],
  },
} as const;

export async function getPresentation(
  args: SlidesGetPresentationInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId } = args;

    const response = await slides.presentations.get({
      presentationId,
    });

    const presentation = response.data;

    if (!presentation) {
      return ResponseFormatter.error(
        new Error("Presentation not found"),
      );
    }

    // Format presentation details
    let formattedOutput = formatPresentation(presentation);

    // Format slides if available
    if (presentation.slides && presentation.slides.length > 0) {
      formattedOutput += "\n\n📑 Slides:";
      presentation.slides.forEach((slide, index) => {
        formattedOutput += formatSlide(slide, index);
      });
    }

    return ResponseFormatter.success(
      {
        presentationId: presentation.presentationId,
        title: presentation.title,
        slides: presentation.slides,
        pageSize: presentation.pageSize,
      },
      `Presentation retrieved successfully:\n\n${formattedOutput}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
