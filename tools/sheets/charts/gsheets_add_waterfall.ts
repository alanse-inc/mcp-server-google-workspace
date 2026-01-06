import { google } from "googleapis";
import { GSheetsAddWaterfallInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_waterfall",
  description: "Add a waterfall chart to a spreadsheet",
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
      dataStartColumn: {
        type: "number",
        description: "Starting column of data range (0-based)",
      },
      dataEndColumn: {
        type: "number",
        description: "Ending column of data range (exclusive, 0-based)",
      },
      firstValueIsTotal: {
        type: "boolean",
        description: "Whether the first value should be treated as a total (optional)",
      },
      hideConnectorLines: {
        type: "boolean",
        description: "Whether to hide connector lines (optional)",
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
    required: ["spreadsheetId", "sheetId", "dataSheetId", "dataStartRow", "dataEndRow", "dataStartColumn", "dataEndColumn"],
  },
} as const;

export async function addWaterfall(
  args: GSheetsAddWaterfallInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const waterfallChart: any = {
      series: [
        {
          sourceRange: {
            sources: [
              {
                sheetId: args.dataSheetId,
                startRowIndex: args.dataStartRow,
                endRowIndex: args.dataEndRow,
                startColumnIndex: args.dataStartColumn + 1,
                endColumnIndex: args.dataEndColumn,
              },
            ],
          },
        },
      ],
      domain: {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.dataStartColumn,
              endColumnIndex: args.dataStartColumn + 1,
            },
          ],
        },
      },
    };

    if (args.firstValueIsTotal !== undefined) {
      waterfallChart.firstValueIsTotal = args.firstValueIsTotal;
    }

    if (args.hideConnectorLines !== undefined) {
      waterfallChart.hideConnectorLines = args.hideConnectorLines;
    }

    const chartSpec: any = {
      title: args.title || "Waterfall Chart",
      waterfallChart,
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
          text: `Successfully created waterfall chart. Chart ID: ${chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating waterfall chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
