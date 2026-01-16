import { google } from "googleapis";
import {
  SlidesCreatePresentationInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatPresentation } from "../../../lib/slides-helpers.js";

export const schema = {
  name: "slides_create_presentation",
  description:
    "Create a new Google Slides presentation with a specified title. Returns the presentation ID and metadata.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title of the new presentation",
      },
    },
    required: ["title"],
  },
} as const;

export async function createPresentation(
  args: SlidesCreatePresentationInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { title } = args;

    const response = await slides.presentations.create({
      requestBody: {
        title,
      },
    });

    const presentation = response.data;

    if (!presentation || !presentation.presentationId) {
      return ResponseFormatter.error(
        new Error("Failed to create presentation"),
      );
    }

    const formattedOutput = formatPresentation(presentation);

    return ResponseFormatter.success(
      {
        presentationId: presentation.presentationId,
        title: presentation.title,
        slidesCount: presentation.slides?.length || 0,
      },
      `Presentation created successfully:\n\n${formattedOutput}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
