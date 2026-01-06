import { google } from "googleapis";
import { GSheetsAddBubbleInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_bubble",
  description: "Add a bubble chart to a spreadsheet (displays 3D data with bubble size)",
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
      labelsColumn: {
        type: "number",
        description: "Column index for labels (0-based, optional)",
      },
      xValuesColumn: {
        type: "number",
        description: "Column index for X-axis values (0-based)",
      },
      yValuesColumn: {
        type: "number",
        description: "Column index for Y-axis values (0-based)",
      },
      sizeColumn: {
        type: "number",
        description: "Column index for bubble size values (0-based)",
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
    required: ["spreadsheetId", "sheetId", "dataSheetId", "dataStartRow", "dataEndRow", "xValuesColumn", "yValuesColumn", "sizeColumn"],
  },
} as const;

export async function addBubble(
  args: GSheetsAddBubbleInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const bubbleChart: any = {
      legendPosition: "BOTTOM_LEGEND",
      domain: {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.xValuesColumn,
              endColumnIndex: args.xValuesColumn + 1,
            },
          ],
        },
      },
      series: {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.yValuesColumn,
              endColumnIndex: args.yValuesColumn + 1,
            },
          ],
        },
      },
      bubbleSizes: {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.sizeColumn,
              endColumnIndex: args.sizeColumn + 1,
            },
          ],
        },
      },
    };

    if (args.labelsColumn !== undefined) {
      bubbleChart.bubbleLabels = {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.labelsColumn,
              endColumnIndex: args.labelsColumn + 1,
            },
          ],
        },
      };
    }

    const chartSpec: any = {
      title: args.title || "Bubble Chart",
      bubbleChart,
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
          text: `Successfully created bubble chart. Chart ID: ${chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating bubble chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
