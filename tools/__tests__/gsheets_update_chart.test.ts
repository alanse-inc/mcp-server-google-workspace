import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { updateChart } from '../sheets/charts/gsheets_update_chart.js';

vi.mock('googleapis');

describe('gsheets_update_chart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update chart title', async () => {
    const mockSheets = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: {
            sheets: [
              {
                charts: [
                  {
                    chartId: 12345,
                    spec: {
                      title: 'Old Title',
                      basicChart: {
                        chartType: 'COLUMN',
                      },
                    },
                    position: {
                      overlayPosition: {
                        anchorCell: {
                          sheetId: 0,
                          rowIndex: 0,
                          columnIndex: 0,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        }),
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateChart({
      spreadsheetId: 'test-spreadsheet-id',
      chartId: 12345,
      title: 'New Title',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully updated chart 12345');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              updateChartSpec: {
                chartId: 12345,
                spec: expect.objectContaining({
                  title: 'New Title',
                }),
              },
            },
          ],
        },
      })
    );
  });

  it('should handle chart not found error', async () => {
    const mockSheets = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: {
            sheets: [
              {
                charts: [],
              },
            ],
          },
        }),
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateChart({
      spreadsheetId: 'test-spreadsheet-id',
      chartId: 99999,
      title: 'New Title',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Chart 99999 not found');
  });

  it('should handle API errors', async () => {
    const mockSheets = {
      spreadsheets: {
        get: vi.fn().mockRejectedValue(new Error('API error')),
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateChart({
      spreadsheetId: 'test-spreadsheet-id',
      chartId: 12345,
      title: 'New Title',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error updating chart');
  });
});
