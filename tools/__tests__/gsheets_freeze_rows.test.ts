import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { freezeRows } from '../sheets/formatting/gsheets_freeze_rows.js';

vi.mock('googleapis');

describe('gsheets_freeze_rows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should freeze rows', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await freezeRows({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      count: 3,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Froze 3 row(s)');

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
                    frozenRowCount: 3,
                  },
                },
                fields: 'gridProperties.frozenRowCount',
              },
            },
          ],
        },
      })
    );
  });

  it('should unfreeze rows when count is 0', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await freezeRows({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      count: 0,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Unfroze all rows');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await freezeRows({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      count: 2,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error freezing rows');
  });
});
