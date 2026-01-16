import { google } from "googleapis";
import { SlidesBatchUpdateInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "slides_batch_update",
  description:
    "Execute multiple update operations on a presentation in a single batch request. This is a powerful tool for performing complex operations that combine multiple requests.",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation to update",
      },
      requests: {
        type: "array",
        description:
          "Array of batch update requests. Each request should have a 'type' (e.g., 'createSlide', 'insertText') and 'params' object with the request parameters.",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description:
                "The type of request (e.g., 'createSlide', 'createShape', 'insertText', 'deleteObject', etc.)",
            },
            params: {
              type: "object",
              description: "Parameters for the request",
            },
          },
          required: ["type", "params"],
        },
      },
    },
    required: ["presentationId", "requests"],
  },
} as const;

export async function batchUpdate(
  args: SlidesBatchUpdateInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, requests: inputRequests } = args;

    if (!inputRequests || inputRequests.length === 0) {
      return ResponseFormatter.error(
        new Error("At least one request is required"),
      );
    }

    // Valid Slides API request types (based on Google Slides API v1)
    const VALID_REQUEST_TYPES = [
      'createSlide',
      'deleteObject',
      'updateSlideProperties',
      'updatePageProperties',
      'createShape',
      'createImage',
      'createVideo',
      'createTable',
      'createLine',
      'insertText',
      'deleteText',
      'replaceAllText',
      'updateShapeProperties',
      'updateImageProperties',
      'updateVideoProperties',
      'updateTableProperties',
      'updateLineProperties',
      'updateTextStyle',
      'updateParagraphStyle',
      'createParagraphBullets',
      'deleteParagraphBullets',
      'updateTableCellProperties',
      'insertTableRows',
      'insertTableColumns',
      'deleteTableRow',
      'deleteTableColumn',
      'replaceImage',
      'refreshSheetsChart',
      'updateSheetsChartProperties',
      'groupObjects',
      'ungroupObjects',
      'duplicateObject',
      'updatePageElementTransform',
      'updatePageElementAltText',
      'replaceAllShapesWithImage',
      'replaceAllShapesWithSheetsChart',
      'mergeTableCells',
      'unmergeTableCells',
      'updateTableBorderProperties',
      'updateTableRowProperties',
      'updateTableColumnProperties',
    ] as const;

    // Transform input requests to Google Slides API format with validation
    const apiRequests = inputRequests.map((req, index) => {
      // Validate request type
      if (!VALID_REQUEST_TYPES.includes(req.type as any)) {
        throw new Error(
          `Invalid request type at index ${index}: "${req.type}". Must be one of the valid Slides API request types.`
        );
      }

      // Validate params
      if (!req.params || typeof req.params !== 'object' || Array.isArray(req.params)) {
        throw new Error(
          `Invalid params at index ${index}: must be a non-null object.`
        );
      }

      return {
        [req.type]: req.params,
      };
    });

    const response = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: apiRequests,
      },
    });

    if (!response.data) {
      return ResponseFormatter.error(
        new Error("Failed to execute batch update"),
      );
    }

    const replies = response.data.replies || [];
    const repliesCount = replies.length;

    let output = `Batch update executed successfully:\n\n`;
    output += `Presentation ID: ${presentationId}\n`;
    output += `Requests processed: ${repliesCount}\n\n`;

    // Format replies
    if (repliesCount > 0) {
      output += `Replies:\n`;
      replies.forEach((reply, index) => {
        const replyType = Object.keys(reply)[0];
        output += `  ${index + 1}. ${replyType}\n`;
      });
    }

    return ResponseFormatter.success(
      {
        presentationId,
        requestsCount: inputRequests.length,
        replies,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
