import { google } from "googleapis";
import { GSheetsAddChartInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_chart",
  description: "Add a chart to a spreadsheet",
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
      chartType: {
        type: "string",
        enum: ["COLUMN", "BAR", "LINE", "AREA", "PIE", "SCATTER"],
        description: "The type of chart to create",
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
        description: "Chart position (optional, defaults to top-left)",
      },
    },
    required: ["spreadsheetId", "sheetId", "chartType", "dataSheetId", "dataStartRow", "dataEndRow", "dataStartColumn", "dataEndColumn"],
  },
} as const;

export async function addChart(
  args: GSheetsAddChartInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const chartSpec: any = {
      title: args.title || "Chart",
      basicChart: {
        chartType: args.chartType,
        legendPosition: "BOTTOM_LEGEND",
        axis: [
          {
            position: "BOTTOM_AXIS",
          },
          {
            position: "LEFT_AXIS",
          },
        ],
        domains: [
          {
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
          },
        ],
        series: [
          {
            series: {
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
          },
        ],
        headerCount: 1,
      },
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
          text: `Successfully created ${args.chartType} chart. Chart ID: ${chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
