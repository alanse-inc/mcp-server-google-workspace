import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addChart } from '../sheets/charts/gsheets_add_chart.js';

vi.mock('googleapis');

describe('gsheets_add_chart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a column chart', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addChart: {
                  chart: {
                    chartId: 12345,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addChart({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      chartType: 'COLUMN',
      title: 'Sales Data',
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 10,
      dataStartColumn: 0,
      dataEndColumn: 3,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('COLUMN chart');
    expect(result.content[0].text).toContain('12345');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addChart: expect.objectContaining({
                chart: expect.objectContaining({
                  spec: expect.objectContaining({
                    title: 'Sales Data',
                    basicChart: expect.objectContaining({
                      chartType: 'COLUMN',
                    }),
                  }),
                }),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should create a pie chart with custom position', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addChart: {
                  chart: {
                    chartId: 67890,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addChart({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      chartType: 'PIE',
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 5,
      dataStartColumn: 0,
      dataEndColumn: 2,
      position: {
        overlayRow: 5,
        overlayColumn: 5,
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('PIE chart');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid data range')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addChart({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      chartType: 'LINE',
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 10,
      dataStartColumn: 0,
      dataEndColumn: 3,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating chart');
  });
});
