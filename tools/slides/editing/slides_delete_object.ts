import { google } from "googleapis";
import {
  SlidesDeleteObjectInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "slides_delete_object",
  description:
    "Delete an object (shape, text box, image, video, line, table, etc.) from a slide. Use this to remove unwanted elements from your presentation.",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation",
      },
      objectId: {
        type: "string",
        description: "The object ID of the element to delete",
      },
    },
    required: ["presentationId", "objectId"],
  },
} as const;

export async function deleteObject(
  args: SlidesDeleteObjectInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, objectId } = args;

    const requests: any[] = [
      {
        deleteObject: {
          objectId,
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
        new Error("Failed to delete object"),
      );
    }

    let output = `Object deleted successfully:\n\n`;
    output += `Presentation ID: ${presentationId}\n`;
    output += `Deleted Object ID: ${objectId}`;

    return ResponseFormatter.success(
      {
        presentationId,
        objectId,
        deleted: true,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
