import { google } from 'googleapis';
import type { InternalToolResponse, GSheetsCreateDeveloperMetadataInput } from '../../types.js';

export const schema = {
  name: "gsheets_create_developer_metadata",
  description: "Create developer metadata for a spreadsheet, sheet, row, or column. Allows storing custom key-value metadata.",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet"
      },
      location: {
        type: "object",
        description: "The location where the metadata should be attached",
        properties: {
          type: {
            type: "string",
            enum: ["SPREADSHEET", "SHEET", "ROW", "COLUMN"],
            description: "The type of location"
          },
          sheetId: {
            type: "number",
            description: "The sheet ID (required for SHEET, ROW, COLUMN)"
          },
          dimensionRange: {
            type: "object",
            description: "The dimension range (required for ROW, COLUMN)",
            properties: {
              dimension: {
                type: "string",
                enum: ["ROWS", "COLUMNS"]
              },
              startIndex: {
                type: "number"
              },
              endIndex: {
                type: "number"
              }
            }
          }
        },
        required: ["type"]
      },
      metadataKey: {
        type: "string",
        description: "The metadata key"
      },
      metadataValue: {
        type: "string",
        description: "The metadata value"
      },
      visibility: {
        type: "string",
        enum: ["DOCUMENT", "PROJECT"],
        description: "The visibility of the metadata (DOCUMENT or PROJECT)"
      }
    },
    required: ["spreadsheetId", "location", "metadataKey", "metadataValue", "visibility"]
  }
} as const;

export async function createDeveloperMetadata(
  args: GSheetsCreateDeveloperMetadataInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const metadataLocation: any = {};

    if (args.location.type === "SPREADSHEET") {
      metadataLocation.spreadsheet = true;
    } else if (args.location.type === "SHEET" && args.location.sheetId !== undefined) {
      metadataLocation.sheetId = args.location.sheetId;
    } else if ((args.location.type === "ROW" || args.location.type === "COLUMN") &&
               args.location.sheetId !== undefined &&
               args.location.dimensionRange) {
      metadataLocation.dimensionRange = {
        sheetId: args.location.sheetId,
        dimension: args.location.dimensionRange.dimension,
        startIndex: args.location.dimensionRange.startIndex,
        endIndex: args.location.dimensionRange.endIndex,
      };
    }

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            createDeveloperMetadata: {
              developerMetadata: {
                location: metadataLocation,
                metadataKey: args.metadataKey,
                metadataValue: args.metadataValue,
                visibility: args.visibility,
              },
            },
          },
        ],
      },
    });

    const metadataId = response.data.replies?.[0]?.createDeveloperMetadata?.developerMetadata?.metadataId;

    return {
      content: [
        {
          type: "text",
          text: `Successfully created developer metadata with key "${args.metadataKey}" and value "${args.metadataValue}". Metadata ID: ${metadataId}.`,
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
          text: `Error creating developer metadata: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
