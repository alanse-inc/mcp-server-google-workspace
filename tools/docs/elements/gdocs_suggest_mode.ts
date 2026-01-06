import { google } from "googleapis";
import { GDocsSuggestModeInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";

export const schema = {
  name: "gdocs_suggest_mode",
  description: "NOTE: This tool cannot programmatically control suggestion mode. The Google Docs API doesn't support enabling/disabling suggestion mode. To use suggestion mode, open the document in Google Docs UI and use the 'Editing/Suggesting/Viewing' dropdown in the top-right corner.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      enabled: {
        type: "boolean",
        description: "true to enable suggestion mode, false to disable",
      },
    },
    required: ["documentId", "enabled"],
  },
} as const;

export async function suggestMode(
  args: GDocsSuggestModeInput,
): Promise<InternalToolResponse> {
  try {
    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    // Verify document exists
    await docs.documents.get({ documentId });

    // Return informative error about API limitation
    return ResponseFormatter.error(
      new Error(
        `Suggestion mode cannot be controlled programmatically via the Google Docs API. ` +
        `To ${args.enabled ? "enable" : "disable"} suggestion mode, please:\n\n` +
        `1. Open the document at: https://docs.google.com/document/d/${documentId}/edit\n` +
        `2. Click the 'Editing' dropdown in the top-right corner\n` +
        `3. Select '${args.enabled ? "Suggesting" : "Editing"}'\n\n` +
        `This is a limitation of the Google Docs API, not this tool.`
      )
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
