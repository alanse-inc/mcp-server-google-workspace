import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { duplicateSheet } from '../sheets/basic/gsheets_duplicate_sheet.js';

vi.mock('googleapis');

describe('gsheets_duplicate_sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should duplicate a sheet', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                duplicateSheet: {
                  properties: {
                    sheetId: 123,
                    title: 'Copy of Sheet1',
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await duplicateSheet({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('123');
    expect(result.content[0].text).toContain('Copy of Sheet1');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Sheet not found')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await duplicateSheet({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 999,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error duplicating sheet');
  });
});
