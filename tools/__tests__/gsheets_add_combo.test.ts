import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addCombo } from '../sheets/charts/gsheets_add_combo.js';

vi.mock('googleapis');

describe('gsheets_add_combo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a combo chart with different series types', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addChart: {
                  chart: {
                    chartId: 45678,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addCombo({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Sales and Trend',
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 12,
      dataStartColumn: 0,
      dataEndColumn: 3,
      seriesTypes: ['COLUMN', 'LINE'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('combo chart');
    expect(result.content[0].text).toContain('45678');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addChart: expect.objectContaining({
                chart: expect.objectContaining({
                  spec: expect.objectContaining({
                    title: 'Sales and Trend',
                    basicChart: expect.objectContaining({
                      chartType: 'COMBO',
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
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid series')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addCombo({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 12,
      dataStartColumn: 0,
      dataEndColumn: 3,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating combo');
  });
});
