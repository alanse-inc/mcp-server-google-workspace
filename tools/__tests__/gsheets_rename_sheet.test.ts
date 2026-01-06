import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { renameSheet } from '../sheets/basic/gsheets_rename_sheet.js';

vi.mock('googleapis');

describe('gsheets_rename_sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should rename a sheet', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await renameSheet({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      newTitle: 'New Sheet Name',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('New Sheet Name');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid sheet')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await renameSheet({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      newTitle: 'Test',
    });

    expect(result.isError).toBe(true);
  });
});
