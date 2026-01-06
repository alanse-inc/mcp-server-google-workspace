import { google } from "googleapis";
import { GSheetsAddHistogramInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_histogram",
  description: "Add a histogram chart to a spreadsheet",
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
      bucketSize: {
        type: "number",
        description: "The size of histogram buckets (optional)",
      },
      outlierPercentile: {
        type: "number",
        description: "Percentile to use for outlier detection (optional, 0-1)",
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

export async function addHistogram(
  args: GSheetsAddHistogramInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const histogramChart: any = {
      legendPosition: "BOTTOM_LEGEND",
      series: [
        {
          sourceRange: {
            sources: [
              {
                sheetId: args.dataSheetId,
                startRowIndex: args.dataStartRow,
                endRowIndex: args.dataEndRow,
                startColumnIndex: args.dataStartColumn,
                endColumnIndex: args.dataEndColumn,
              },
            ],
          },
        },
      ],
    };

    if (args.bucketSize !== undefined) {
      histogramChart.bucketSize = args.bucketSize;
    }

    if (args.outlierPercentile !== undefined) {
      histogramChart.outlierPercentile = args.outlierPercentile;
    }

    const chartSpec: any = {
      title: args.title || "Histogram",
      histogramChart,
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
          text: `Successfully created histogram chart. Chart ID: ${chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating histogram: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
