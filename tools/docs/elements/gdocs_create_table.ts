import { google } from "googleapis";
import { GDocsCreateTableInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { DocumentIdResolver } from "../../../lib/document-id-resolver.js";
import { Validator } from "../../../lib/validation.js";

export const schema = {
  name: "gdocs_create_table",
  description: "Create a table with specified rows and columns in a Google Document.",
  inputSchema: {
    type: "object",
    properties: {
      documentId: {
        type: "string",
        description: "Document ID or full Google Docs URL",
      },
      rows: {
        type: "number",
        description: "Number of rows in the table",
      },
      columns: {
        type: "number",
        description: "Number of columns in the table",
      },
      index: {
        type: "number",
        description: "Position to insert table (1-based)",
      },
    },
    required: ["documentId", "rows", "columns", "index"],
  },
} as const;

export async function createTable(
  args: GDocsCreateTableInput,
): Promise<InternalToolResponse> {
  try {
    // Validate inputs
    if (!Validator.validateIndex(args.index)) {
      throw new Error("Index must be a positive integer");
    }

    if (!Validator.validateIndex(args.rows) || args.rows < 1 || args.rows > 20) {
      throw new Error("Rows must be between 1 and 20");
    }

    if (!Validator.validateIndex(args.columns) || args.columns < 1 || args.columns > 20) {
      throw new Error("Columns must be between 1 and 20");
    }

    // Resolve document ID from URL if needed
    const docRef = DocumentIdResolver.resolve(args.documentId);
    const documentId = docRef.id;

    const docs = google.docs("v1");

    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertTable: {
              rows: args.rows,
              columns: args.columns,
              location: {
                index: args.index,
              },
            },
          },
        ],
      },
    });

    return ResponseFormatter.success({
      documentId,
      rows: args.rows,
      columns: args.columns,
      insertedAt: args.index,
    }, `Table created successfully (${args.rows}x${args.columns})`);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
