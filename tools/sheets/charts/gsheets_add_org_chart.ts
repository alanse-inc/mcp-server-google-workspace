import { google } from "googleapis";
import { GSheetsAddOrgChartInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_add_org_chart",
  description: "Add an organizational chart to a spreadsheet (displays hierarchical relationships)",
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
        description: "Column index for node labels (0-based)",
      },
      parentLabelsColumn: {
        type: "number",
        description: "Column index for parent labels (0-based, optional for root nodes)",
      },
      tooltipsColumn: {
        type: "number",
        description: "Column index for tooltips (0-based, optional)",
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
    required: ["spreadsheetId", "sheetId", "dataSheetId", "dataStartRow", "dataEndRow", "labelsColumn"],
  },
} as const;

export async function addOrgChart(
  args: GSheetsAddOrgChartInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    const orgChart: any = {
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
    };

    if (args.parentLabelsColumn !== undefined) {
      orgChart.parentLabels = {
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

    if (args.tooltipsColumn !== undefined) {
      orgChart.tooltips = {
        sourceRange: {
          sources: [
            {
              sheetId: args.dataSheetId,
              startRowIndex: args.dataStartRow,
              endRowIndex: args.dataEndRow,
              startColumnIndex: args.tooltipsColumn,
              endColumnIndex: args.tooltipsColumn + 1,
            },
          ],
        },
      };
    }

    const chartSpec: any = {
      title: args.title || "Organizational Chart",
      orgChart,
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
          text: `Successfully created organizational chart. Chart ID: ${chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating organizational chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
