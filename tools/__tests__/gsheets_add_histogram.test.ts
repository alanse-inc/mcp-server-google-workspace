import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addHistogram } from '../sheets/charts/gsheets_add_histogram.js';

vi.mock('googleapis');

describe('gsheets_add_histogram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a histogram chart', async () => {
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

    const result = await addHistogram({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Test Histogram',
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 100,
      dataStartColumn: 0,
      dataEndColumn: 1,
      bucketSize: 10,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('histogram chart');
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
                    title: 'Test Histogram',
                    histogramChart: expect.objectContaining({
                      bucketSize: 10,
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

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid data range')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addHistogram({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 100,
      dataStartColumn: 0,
      dataEndColumn: 1,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating histogram');
  });
});
