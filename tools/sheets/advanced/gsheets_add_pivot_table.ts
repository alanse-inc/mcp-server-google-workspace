import { google } from "googleapis";
import { GSheetsAddPivotTableInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_pivot_table",
  description: "Create a pivot table in a spreadsheet",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      sourceSheetId: {
        type: "number",
        description: "The sheet ID containing source data",
      },
      sourceStartRow: {
        type: "number",
        description: "Starting row of source data (0-based)",
      },
      sourceEndRow: {
        type: "number",
        description: "Ending row of source data (exclusive, 0-based)",
      },
      sourceStartColumn: {
        type: "number",
        description: "Starting column of source data (0-based)",
      },
      sourceEndColumn: {
        type: "number",
        description: "Ending column of source data (exclusive, 0-based)",
      },
      targetSheetId: {
        type: "number",
        description: "The sheet ID where pivot table will be placed",
      },
      targetRow: {
        type: "number",
        description: "Row position for pivot table (0-based)",
      },
      targetColumn: {
        type: "number",
        description: "Column position for pivot table (0-based)",
      },
      rows: {
        type: "array",
        items: {
          type: "object",
          properties: {
            sourceColumnOffset: {
              type: "number",
              description: "Column offset in source data (0-based)",
            },
            sortOrder: {
              type: "string",
              enum: ["ASCENDING", "DESCENDING"],
              description: "Sort order for this row group",
            },
            showTotals: {
              type: "boolean",
              description: "Show totals for this row group",
            },
          },
          required: ["sourceColumnOffset"],
        },
        description: "Row groups for pivot table",
      },
      columns: {
        type: "array",
        items: {
          type: "object",
          properties: {
            sourceColumnOffset: {
              type: "number",
              description: "Column offset in source data (0-based)",
            },
            sortOrder: {
              type: "string",
              enum: ["ASCENDING", "DESCENDING"],
              description: "Sort order for this column group",
            },
            showTotals: {
              type: "boolean",
              description: "Show totals for this column group",
            },
          },
          required: ["sourceColumnOffset"],
        },
        description: "Column groups for pivot table (optional)",
      },
      values: {
        type: "array",
        items: {
          type: "object",
          properties: {
            sourceColumnOffset: {
              type: "number",
              description: "Column offset in source data (0-based)",
            },
            summarizeFunction: {
              type: "string",
              enum: ["SUM", "COUNT", "AVERAGE", "MAX", "MIN", "MEDIAN", "PRODUCT", "STDEV", "STDEVP", "VAR", "VARP"],
              description: "Function to aggregate values",
            },
          },
          required: ["sourceColumnOffset", "summarizeFunction"],
        },
        description: "Values to aggregate in pivot table",
      },
    },
    required: ["spreadsheetId", "sourceSheetId", "sourceStartRow", "sourceEndRow", "sourceStartColumn", "sourceEndColumn", "targetSheetId", "targetRow", "targetColumn", "rows", "values"],
  },
} as const;

export async function addPivotTable(
  args: GSheetsAddPivotTableInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const pivotTable: any = {
      source: {
        sheetId: args.sourceSheetId,
        startRowIndex: args.sourceStartRow,
        endRowIndex: args.sourceEndRow,
        startColumnIndex: args.sourceStartColumn,
        endColumnIndex: args.sourceEndColumn,
      },
      rows: args.rows.map((row) => ({
        sourceColumnOffset: row.sourceColumnOffset,
        showTotals: row.showTotals !== false,
        sortOrder: row.sortOrder || "ASCENDING",
      })),
      values: args.values.map((value) => ({
        sourceColumnOffset: value.sourceColumnOffset,
        summarizeFunction: value.summarizeFunction,
      })),
    };

    if (args.columns && args.columns.length > 0) {
      pivotTable.columns = args.columns.map((column) => ({
        sourceColumnOffset: column.sourceColumnOffset,
        showTotals: column.showTotals !== false,
        sortOrder: column.sortOrder || "ASCENDING",
      }));
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateCells: {
              rows: [
                {
                  values: [
                    {
                      pivotTable,
                    },
                  ],
                },
              ],
              fields: "pivotTable",
              start: {
                sheetId: args.targetSheetId,
                rowIndex: args.targetRow,
                columnIndex: args.targetColumn,
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
          text: `Successfully created pivot table at sheet ${args.targetSheetId}, position R${args.targetRow}C${args.targetColumn}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating pivot table: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
