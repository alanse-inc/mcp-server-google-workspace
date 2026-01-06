import { google } from "googleapis";
import { GDocsBatchUpdateInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_batch_update",
  description: "Execute multiple update operations on a Google Document in a single API call. Requests are executed in order.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      requests: {
        type: "array",
        description: "Array of update requests to execute",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "Type of operation",
              enum: [
                "insertText",
                "deleteContentRange",
                "updateTextStyle",
                "updateParagraphStyle",
                "createParagraphBullets",
                "insertTable",
                "insertInlineImage",
                "insertPageBreak",
                "createHeader",
                "createFooter",
              ],
            },
            params: {
              type: "object",
              description: "Parameters for the operation (structure depends on type)",
            },
          },
          required: ["type", "params"],
        },
      },
    },
    required: ["documentId", "requests"],
  },
} as const;

export async function batchUpdate(
  args: GDocsBatchUpdateInput,
): Promise<InternalToolResponse> {
  try {
    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    // Convert our simplified request format to Google Docs API format
    const requests = args.requests.map((req) => {
      const apiRequest: any = {};

      switch (req.type) {
        case "insertText":
          apiRequest.insertText = req.params;
          break;
        case "deleteContentRange":
          apiRequest.deleteContentRange = req.params;
          break;
        case "updateTextStyle":
          apiRequest.updateTextStyle = req.params;
          break;
        case "updateParagraphStyle":
          apiRequest.updateParagraphStyle = req.params;
          break;
        case "createParagraphBullets":
          apiRequest.createParagraphBullets = req.params;
          break;
        case "insertTable":
          apiRequest.insertTable = req.params;
          break;
        case "insertInlineImage":
          apiRequest.insertInlineImage = req.params;
          break;
        case "insertPageBreak":
          apiRequest.insertPageBreak = req.params;
          break;
        case "createHeader":
          apiRequest.createHeader = req.params;
          break;
        case "createFooter":
          apiRequest.createFooter = req.params;
          break;
        default:
          throw new Error(`Unknown request type: ${req.type}`);
      }

      return apiRequest;
    });

    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });

    return ResponseFormatter.success({
      documentId,
      operationsExecuted: args.requests.length,
      requestTypes: args.requests.map((r) => r.type),
    }, `Successfully executed ${args.requests.length} operation(s)`);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
