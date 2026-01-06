import { google } from "googleapis";
import { GSheetsUpdateChartInput, InternalToolResponse } from "../../types.js";

export const schema = {
  name: "gsheets_update_chart",
  description: "Update an existing chart's properties",
  inputSchema: {
    type: "object",
    properties: {
      spreadsheetId: {
        type: "string",
        description: "The ID of the spreadsheet",
      },
      chartId: {
        type: "number",
        description: "The ID of the chart to update",
      },
      title: {
        type: "string",
        description: "New chart title (optional)",
      },
      position: {
        type: "object",
        properties: {
          sheetId: {
            type: "number",
            description: "Sheet ID for chart position",
          },
          overlayRow: {
            type: "number",
            description: "Row position for chart overlay (0-based)",
          },
          overlayColumn: {
            type: "number",
            description: "Column position for chart overlay (0-based)",
          },
        },
        description: "New chart position (optional)",
      },
    },
    required: ["spreadsheetId", "chartId"],
  },
} as const;

export async function updateChart(
  args: GSheetsUpdateChartInput,
): Promise<InternalToolResponse> {
  try {
    const sheets = google.sheets("v4");

    // First, get the current chart to preserve properties we're not updating
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: args.spreadsheetId,
    });

    let currentChart: any = null;
    for (const sheet of spreadsheet.data.sheets || []) {
      const chart = sheet.charts?.find((c: any) => c.chartId === args.chartId);
      if (chart) {
        currentChart = chart;
        break;
      }
    }

    if (!currentChart) {
      throw new Error(`Chart ${args.chartId} not found`);
    }

    const updatedChart: any = {
      chartId: args.chartId,
      spec: currentChart.spec,
      position: currentChart.position,
    };

    const fields: string[] = [];

    // Update title if provided
    if (args.title !== undefined) {
      updatedChart.spec.title = args.title;
      fields.push("spec.title");
    }

    // Update position if provided
    if (args.position) {
      updatedChart.position = {
        overlayPosition: {
          anchorCell: {
            sheetId: args.position.sheetId,
            rowIndex: args.position.overlayRow || 0,
            columnIndex: args.position.overlayColumn || 0,
          },
        },
      };
      fields.push("position");
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateChartSpec: {
              chartId: args.chartId,
              spec: updatedChart.spec,
            },
          },
        ],
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated chart ${args.chartId}`,
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error updating chart: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
