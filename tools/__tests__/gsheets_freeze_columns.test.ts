import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { freezeColumns } from '../sheets/formatting/gsheets_freeze_columns.js';

vi.mock('googleapis');

describe('gsheets_freeze_columns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should freeze columns', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await freezeColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      count: 2,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Froze 2 column(s)');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenColumnCount: 2,
                  },
                },
                fields: 'gridProperties.frozenColumnCount',
              },
            },
          ],
        },
      })
    );
  });

  it('should unfreeze columns when count is 0', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await freezeColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      count: 0,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Unfroze all columns');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await freezeColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      count: 1,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error freezing columns');
  });
});
