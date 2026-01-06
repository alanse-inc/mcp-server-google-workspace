import { google } from "googleapis";
import { GSheetsAddComboInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_combo",
  description: "Add a combo chart to a spreadsheet (combines multiple chart types like column and line)",
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
      seriesTypes: {
        type: "array",
        items: {
          type: "string",
          enum: ["COLUMN", "BAR", "LINE", "AREA"],
        },
        description: "Array of chart types for each series (optional, defaults to COLUMN for all)",
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

export async function addCombo(
  args: GSheetsAddComboInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const series: any[] = [];
    const numSeries = args.dataEndColumn - args.dataStartColumn - 1;

    for (let i = 0; i < numSeries; i++) {
      const seriesSpec: any = {
        series: {
          sourceRange: {
            sources: [
              {
                sheetId: args.dataSheetId,
                startRowIndex: args.dataStartRow,
                endRowIndex: args.dataEndRow,
                startColumnIndex: args.dataStartColumn + 1 + i,
                endColumnIndex: args.dataStartColumn + 2 + i,
              },
            ],
          },
        },
      };

      if (args.seriesTypes && args.seriesTypes[i]) {
        seriesSpec.type = args.seriesTypes[i];
      }

      series.push(seriesSpec);
    }

    const basicChart: any = {
      chartType: "COMBO",
      legendPosition: "BOTTOM_LEGEND",
      axis: [
        { position: "BOTTOM_AXIS" },
        { position: "LEFT_AXIS" },
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
      series,
      headerCount: 1,
    };

    const chartSpec: any = {
      title: args.title || "Combo Chart",
      basicChart,
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
          text: `Successfully created combo chart. Chart ID: ${chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating combo chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
