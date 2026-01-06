import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addWaterfall } from '../sheets/charts/gsheets_add_waterfall.js';

vi.mock('googleapis');

describe('gsheets_add_waterfall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a waterfall chart', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addChart: {
                  chart: {
                    chartId: 23456,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addWaterfall({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Test Waterfall',
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 10,
      dataStartColumn: 0,
      dataEndColumn: 2,
      firstValueIsTotal: true,
      hideConnectorLines: false,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('waterfall chart');
    expect(result.content[0].text).toContain('23456');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addChart: expect.objectContaining({
                chart: expect.objectContaining({
                  spec: expect.objectContaining({
                    title: 'Test Waterfall',
                    waterfallChart: expect.objectContaining({
                      firstValueIsTotal: true,
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
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid data')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addWaterfall({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dataSheetId: 0,
      dataStartRow: 0,
      dataEndRow: 10,
      dataStartColumn: 0,
      dataEndColumn: 2,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating waterfall');
  });
});
