import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { autoResize } from '../sheets/formatting/gsheets_auto_resize.js';

vi.mock('googleapis');

describe('gsheets_auto_resize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should auto-resize columns', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await autoResize({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'COLUMNS',
      startIndex: 0,
      endIndex: 5,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('5 columns');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await autoResize({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'ROWS',
      startIndex: 0,
      endIndex: 10,
    });

    expect(result.isError).toBe(true);
  });
});
