import { google } from "googleapis";
import { SlidesGetPageInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatSlide } from "../../../lib/slides-helpers.js";

export const schema = {
  name: "slides_get_page",
  description:
    "Get detailed information about a specific slide (page) in a presentation, including all page elements (shapes, text, images, etc.).",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation",
      },
      pageObjectId: {
        type: "string",
        description: "The object ID of the page (slide) to retrieve",
      },
    },
    required: ["presentationId", "pageObjectId"],
  },
} as const;

export async function getPage(
  args: SlidesGetPageInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, pageObjectId } = args;

    const response = await slides.presentations.pages.get({
      presentationId,
      pageObjectId,
    });

    const page = response.data;

    if (!page) {
      return ResponseFormatter.error(new Error("Page not found"));
    }

    // Format page details
    const formattedOutput = formatSlide(page, 0);

    // Additional page element details
    let elementsSummary = "\n\n📦 Page Elements:";
    if (page.pageElements && page.pageElements.length > 0) {
      elementsSummary += `\n  Total elements: ${page.pageElements.length}`;

      // Count element types
      const elementTypes: Record<string, number> = {};
      page.pageElements.forEach((element) => {
        if (element.shape) elementTypes["shape"] = (elementTypes["shape"] || 0) + 1;
        if (element.image) elementTypes["image"] = (elementTypes["image"] || 0) + 1;
        if (element.video) elementTypes["video"] = (elementTypes["video"] || 0) + 1;
        if (element.line) elementTypes["line"] = (elementTypes["line"] || 0) + 1;
        if (element.table) elementTypes["table"] = (elementTypes["table"] || 0) + 1;
        if (element.wordArt) elementTypes["wordArt"] = (elementTypes["wordArt"] || 0) + 1;
        if (element.sheetsChart) elementTypes["sheetsChart"] = (elementTypes["sheetsChart"] || 0) + 1;
      });

      Object.entries(elementTypes).forEach(([type, count]) => {
        elementsSummary += `\n  - ${type}: ${count}`;
      });
    } else {
      elementsSummary += "\n  No elements on this page";
    }

    return ResponseFormatter.success(
      {
        presentationId,
        pageObjectId: page.objectId,
        pageType: page.pageType,
        pageElements: page.pageElements,
        slideProperties: page.slideProperties,
      },
      `Page retrieved successfully:\n${formattedOutput}${elementsSummary}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
