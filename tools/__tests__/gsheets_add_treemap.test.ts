import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addTreemap } from '../sheets/charts/gsheets_add_treemap.js';

vi.mock('googleapis');

describe('gsheets_add_treemap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a treemap chart', async () => {
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

    const result = await addTreemap({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Product Categories',
      dataSheetId: 0,
      dataStartRow: 1,
      dataEndRow: 15,
      labelsColumn: 0,
      parentLabelsColumn: 1,
      sizeColumn: 2,
      colorColumn: 3,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('treemap chart');
    expect(result.content[0].text).toContain('67890');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addChart: expect.objectContaining({
                chart: expect.objectContaining({
                  spec: expect.objectContaining({
                    title: 'Product Categories',
                    treemapChart: expect.any(Object),
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
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid hierarchy')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addTreemap({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dataSheetId: 0,
      dataStartRow: 1,
      dataEndRow: 15,
      labelsColumn: 0,
      sizeColumn: 2,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating treemap');
  });
});
