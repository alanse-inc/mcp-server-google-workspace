import { google } from "googleapis";
import { GSheetsAddTreemapInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_treemap",
  description: "Add a treemap chart to a spreadsheet (displays hierarchical data as nested rectangles)",
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
        description: "Column index for labels (0-based)",
      },
      parentLabelsColumn: {
        type: "number",
        description: "Column index for parent labels (0-based, optional)",
      },
      sizeColumn: {
        type: "number",
        description: "Column index for size values (0-based)",
      },
      colorColumn: {
        type: "number",
        description: "Column index for color values (0-based, optional)",
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
    required: ["spreadsheetId", "sheetId", "dataSheetId", "dataStartRow", "dataEndRow", "labelsColumn", "sizeColumn"],
  },
} as const;

export async function addTreemap(
  args: GSheetsAddTreemapInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const treemapChart: any = {
      labels: {
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
      },
      sizeData: {
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

    if (args.parentLabelsColumn !== undefined) {
      treemapChart.parentLabels = {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.parentLabelsColumn,
              endColumnIndex: args.parentLabelsColumn + 1,
            },
          ],
        },
      };
    }

    if (args.colorColumn !== undefined) {
      treemapChart.colorData = {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.colorColumn,
              endColumnIndex: args.colorColumn + 1,
            },
          ],
        },
      };
    }

    const chartSpec: any = {
      title: args.title || "Treemap Chart",
      treemapChart,
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
          text: `Successfully created treemap chart. Chart ID: ${chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating treemap chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
