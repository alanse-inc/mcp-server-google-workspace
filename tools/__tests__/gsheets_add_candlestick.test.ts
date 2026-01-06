import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addCandlestick } from '../sheets/charts/gsheets_add_candlestick.js';

vi.mock('googleapis');

describe('gsheets_add_candlestick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a candlestick chart', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addChart: {
                  chart: {
                    chartId: 34567,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addCandlestick({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Stock Prices',
      dataSheetId: 0,
      dataStartRow: 1,
      dataEndRow: 10,
      domainColumn: 0,
      lowColumn: 1,
      openColumn: 2,
      closeColumn: 3,
      highColumn: 4,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('candlestick chart');
    expect(result.content[0].text).toContain('34567');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addChart: expect.objectContaining({
                chart: expect.objectContaining({
                  spec: expect.objectContaining({
                    title: 'Stock Prices',
                    candlestickChart: expect.any(Object),
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
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid columns')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addCandlestick({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dataSheetId: 0,
      dataStartRow: 1,
      dataEndRow: 10,
      domainColumn: 0,
      lowColumn: 1,
      openColumn: 2,
      closeColumn: 3,
      highColumn: 4,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating candlestick');
  });
});
