import { google } from "googleapis";
import { GSheetsAddCandlestickInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_candlestick",
  description: "Add a candlestick chart to a spreadsheet (for financial data with open/high/low/close values)",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      sheetId: {
        type: "number",
        description: "The ID of the sheet where the chart will be placed",
      },
      title: {
        type: "string",
        description: "Chart title (optional)",
      },
      dataSheetId: {
        type: "number",
        description: "The sheet ID containing the data",
      },
      dataStartRow: {
        type: "number",
        description: "Starting row of data range (0-based)",
      },
      dataEndRow: {
        type: "number",
        description: "Ending row of data range (exclusive, 0-based)",
      },
      domainColumn: {
        type: "number",
        description: "Column index for domain/labels (0-based)",
      },
      lowColumn: {
        type: "number",
        description: "Column index for low values (0-based)",
      },
      openColumn: {
        type: "number",
        description: "Column index for open values (0-based)",
      },
      closeColumn: {
        type: "number",
        description: "Column index for close values (0-based)",
      },
      highColumn: {
        type: "number",
        description: "Column index for high values (0-based)",
      },
      position: {
        type: "object",
        properties: {
          overlayRow: {
            type: "number",
            description: "Row position for chart overlay (0-based)",
          },
          overlayColumn: {
            type: "number",
            description: "Column position for chart overlay (0-based)",
          },
        },
        description: "Chart position (optional)",
      },
    },
    required: ["spreadsheetId", "sheetId", "dataSheetId", "dataStartRow", "dataEndRow", "domainColumn", "lowColumn", "openColumn", "closeColumn", "highColumn"],
  },
} as const;

export async function addCandlestick(
  args: GSheetsAddCandlestickInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const candlestickChart: any = {
      domain: {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.domainColumn,
              endColumnIndex: args.domainColumn + 1,
            },
          ],
        },
      },
      data: [
        {
          sourceRange: {
            sources: [
              {
                sheetId: args.dataSheetId,
                startRowIndex: args.dataStartRow,
                endRowIndex: args.dataEndRow,
                startColumnIndex: args.lowColumn,
                endColumnIndex: args.lowColumn + 1,
              },
            ],
          },
        },
        {
          sourceRange: {
            sources: [
              {
                sheetId: args.dataSheetId,
                startRowIndex: args.dataStartRow,
                endRowIndex: args.dataEndRow,
                startColumnIndex: args.openColumn,
                endColumnIndex: args.openColumn + 1,
              },
            ],
          },
        },
        {
          sourceRange: {
            sources: [
              {
                sheetId: args.dataSheetId,
                startRowIndex: args.dataStartRow,
                endRowIndex: args.dataEndRow,
                startColumnIndex: args.closeColumn,
                endColumnIndex: args.closeColumn + 1,
              },
            ],
          },
        },
        {
          sourceRange: {
            sources: [
              {
                sheetId: args.dataSheetId,
                startRowIndex: args.dataStartRow,
                endRowIndex: args.dataEndRow,
                startColumnIndex: args.highColumn,
                endColumnIndex: args.highColumn + 1,
              },
            ],
          },
        },
      ],
    };

    const chartSpec: any = {
      title: args.title || "Candlestick Chart",
      candlestickChart,
    };

    const position: any = {
      overlayPosition: {
        anchorCell: {
          sheetId: args.sheetId,
          rowIndex: args.position?.overlayRow || 0,
          columnIndex: args.position?.overlayColumn || 0,
        },
      },
    };

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            addChart: {
              chart: {
                spec: chartSpec,
                position,
              },
            },
          },
        ],
      },
    });

    const chartId = response.data.replies?.[0]?.addChart?.chart?.chartId;

    return {
      content: [
        {
          type: "text",
          text: `Successfully created candlestick chart. Chart ID: ${chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating candlestick chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
