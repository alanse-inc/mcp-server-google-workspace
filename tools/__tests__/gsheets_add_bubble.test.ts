import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addBubble } from '../sheets/charts/gsheets_add_bubble.js';

vi.mock('googleapis');

describe('gsheets_add_bubble', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a bubble chart', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addChart: {
                  chart: {
                    chartId: 56789,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addBubble({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Market Analysis',
      dataSheetId: 0,
      dataStartRow: 1,
      dataEndRow: 20,
      labelsColumn: 0,
      xValuesColumn: 1,
      yValuesColumn: 2,
      sizeColumn: 3,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('bubble chart');
    expect(result.content[0].text).toContain('56789');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addChart: expect.objectContaining({
                chart: expect.objectContaining({
                  spec: expect.objectContaining({
                    title: 'Market Analysis',
                    bubbleChart: expect.any(Object),
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
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid data columns')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addBubble({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dataSheetId: 0,
      dataStartRow: 1,
      dataEndRow: 20,
      xValuesColumn: 1,
      yValuesColumn: 2,
      sizeColumn: 3,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating bubble');
  });
});
