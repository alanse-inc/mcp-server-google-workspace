import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { batchClear } from '../sheets/data/gsheets_batch_clear.js';

vi.mock('googleapis');

describe('gsheets_batch_clear', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should clear multiple ranges', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchClear: vi.fn().mockResolvedValue({}),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await batchClear({
      spreadsheetId: 'test-spreadsheet-id',
      ranges: ['Sheet1!A1:B10', 'Sheet2!C5:D20'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('2 range(s)');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchClear: vi.fn().mockRejectedValue(new Error('API error')),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await batchClear({
      spreadsheetId: 'test-spreadsheet-id',
      ranges: ['Sheet1!A1:B10'],
    });

    expect(result.isError).toBe(true);
  });
});
