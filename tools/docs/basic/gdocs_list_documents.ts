import { google } from "googleapis";
import { GDocsListDocumentsInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "gdocs_list_documents",
  description: "List Google Documents from Google Drive. Use query parameter to filter by name, owner, etc.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query to filter documents (e.g., 'name contains \"report\"'). Default: list all documents",
      },
      pageToken: {
        type: "string",
        description: "Token for pagination to get the next page of results",
      },
      pageSize: {
        type: "number",
        description: "Maximum number of documents to return (default: 10, max: 100)",
      },
    },
    required: [],
  },
} as const;

export async function listDocuments(
  args: GDocsListDocumentsInput,
): Promise<InternalToolResponse> {
  try {
    const drive = google.drive("v3");

    // Build query to find Google Docs files
    let query = "mimeType='application/vnd.google-apps.document'";
    if (args.query) {
      query += ` and ${args.query}`;
    }

    const response = await drive.files.list({
      q: query,
      pageSize: args.pageSize || 10,
      pageToken: args.pageToken,
      fields: "nextPageToken, files(id, name, createdTime, modifiedTime, owners, webViewLink)",
      orderBy: "modifiedTime desc",
    });

    const files = response.data.files || [];

    const documents = files.map((file) => ({
      documentId: file.id,
      name: file.name,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      owners: file.owners?.map((owner) => owner.emailAddress),
      webViewLink: file.webViewLink,
    }));

    const result = {
      documents,
      count: documents.length,
      nextPageToken: response.data.nextPageToken,
    };

    return ResponseFormatter.success(result, `Found ${documents.length} document(s)`);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
