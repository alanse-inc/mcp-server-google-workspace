import { google } from 'googleapis';
import type { InternalToolResponse, GSheetsDeleteDeveloperMetadataInput } from '../../types.js';

export const schema = {
  name: "gsheets_delete_developer_metadata",
  description: "Delete developer metadata by metadata ID.",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet"
      },
      metadataId: {
        type: "number",
        description: "The ID of the metadata to delete"
      }
    },
    required: ["spreadsheetId", "metadataId"]
  }
} as const;

export async function deleteDeveloperMetadata(
  args: GSheetsDeleteDeveloperMetadataInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDeveloperMetadata: {
              dataFilter: {
                developerMetadataLookup: {
                  metadataId: args.metadataId,
                },
              },
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully deleted developer metadata with ID ${args.metadataId}.`,
        },
      ],
      isError: false,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error deleting developer metadata: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
