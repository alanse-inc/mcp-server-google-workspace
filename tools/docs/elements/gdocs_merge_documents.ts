import { google } from "googleapis";
import { GDocsMergeDocumentsInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_merge_documents",
  description: "Merge multiple Google Documents into one. Creates a new document or appends to an existing target document.",
  inputSchema: {
    type: "object",
    properties: {
      sourceDocumentIds: {
        type: "array",
        description: "Array of source document IDs or URLs to merge (in order)",
        items: {
          type: "string",
        },
      },
      targetDocumentId: {
        type: "string",
        description: "Target document ID or URL to merge into. If not provided, creates a new document.",
      },
      title: {
        type: "string",
        description: "Title for the new merged document (only used if targetDocumentId is not provided)",
      },
    },
    required: ["sourceDocumentIds"],
  },
} as const;

export async function mergeDocuments(
  args: GDocsMergeDocumentsInput,
): Promise<InternalToolResponse> {
  try {
    if (args.sourceDocumentIds.length === 0) {
      throw new Error("At least one source document is required");
    }

    const docs = google.docs("v1");

    // Resolve source document IDs
    const sourceIds = args.sourceDocumentIds.map((id) => {
      const ref = DocumentIdResolver.resolve(id);
      return ref.id;
    });

    // Determine target document
    let targetDocumentId: string;
    if (args.targetDocumentId) {
      const targetRef = DocumentIdResolver.resolve(args.targetDocumentId);
      targetDocumentId = targetRef.id;
    } else {
      // Create a new document
      const createResponse = await docs.documents.create({
        requestBody: {
          title: args.title || "Merged Document",
        },
      });
      targetDocumentId = createResponse.data.documentId!;
    }

    // Read each source document and append to target
    for (const sourceId of sourceIds) {
      const sourceDoc = await docs.documents.get({ documentId: sourceId });

      // Extract text content from source
      let textContent = "";
      if (sourceDoc.data.body?.content) {
        for (const element of sourceDoc.data.body.content) {
          if (element.paragraph?.elements) {
            for (const textElement of element.paragraph.elements) {
              if (textElement.textRun?.content) {
                textContent += textElement.textRun.content;
              }
            }
          }
        }
      }

      // Get target document end index
      const targetDoc = await docs.documents.get({ documentId: targetDocumentId });
      const endIndex = targetDoc.data.body?.content?.[targetDoc.data.body.content.length - 1]?.endIndex || 1;

      // Append content to target
      if (textContent) {
        await docs.documents.batchUpdate({
          documentId: targetDocumentId,
          requestBody: {
            requests: [
              {
                insertText: {
                  text: "\n" + textContent,
                  location: {
                    index: endIndex - 1,
                  },
                },
              },
            ],
          },
        });
      }
    }

    const targetUrl = `https://docs.google.com/document/d/${targetDocumentId}/edit`;

    return ResponseFormatter.success({
      targetDocumentId,
      targetDocumentUrl: targetUrl,
      mergedDocuments: sourceIds.length,
      sourceDocumentIds: sourceIds,
    }, `Successfully merged ${sourceIds.length} document(s)`);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
