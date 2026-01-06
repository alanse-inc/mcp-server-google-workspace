import { google } from "googleapis";
import { GDocsCreateInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "gdocs_create",
  description: "Create a new Google Document",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "The title of the new document",
      },
    },
    required: ["title"],
  },
} as const;

export async function createDocument(
  args: GDocsCreateInput,
): Promise<InternalToolResponse> {
  try {
    const docs = google.docs("v1");

    const response = await docs.documents.create({
      requestBody: {
        title: args.title,
      },
    });

    const documentId = response.data.documentId;
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    return ResponseFormatter.success({
      documentId,
      documentUrl,
      title: response.data.title,
      revisionId: response.data.revisionId,
    }, "Document created successfully");
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
