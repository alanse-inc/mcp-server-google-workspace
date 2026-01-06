import { google } from 'googleapis';
import type { InternalToolResponse, GSheetsUpdateDeveloperMetadataInput } from '../../types.js';

export const schema = {
  name: "gsheets_update_developer_metadata",
  description: "Update existing developer metadata by metadata ID.",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet"
      },
      metadataId: {
        type: "number",
        description: "The ID of the metadata to update"
      },
      metadataKey: {
        type: "string",
        description: "The new metadata key (optional)"
      },
      metadataValue: {
        type: "string",
        description: "The new metadata value (optional)"
      },
      visibility: {
        type: "string",
        enum: ["DOCUMENT", "PROJECT"],
        description: "The new visibility (optional)"
      }
    },
    required: ["spreadsheetId", "metadataId"]
  }
} as const;

export async function updateDeveloperMetadata(
  args: GSheetsUpdateDeveloperMetadataInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const fields: string[] = [];
    const developerMetadata: any = {
      metadataId: args.metadataId,
    };

    if (args.metadataKey !== undefined) {
      developerMetadata.metadataKey = args.metadataKey;
      fields.push("metadataKey");
    }

    if (args.metadataValue !== undefined) {
      developerMetadata.metadataValue = args.metadataValue;
      fields.push("metadataValue");
    }

    if (args.visibility !== undefined) {
      developerMetadata.visibility = args.visibility;
      fields.push("visibility");
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateDeveloperMetadata: {
              dataFilters: [
                {
                  developerMetadataLookup: {
                    metadataId: args.metadataId,
                  },
                },
              ],
              developerMetadata,
              fields: fields.join(","),
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated developer metadata with ID ${args.metadataId}.`,
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
          text: `Error updating developer metadata: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
