import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { clearData } from '../sheets/data/gsheets_clear_data.js';

vi.mock('googleapis');

describe('gsheets_clear_data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should clear data from single range', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchClear: vi.fn().mockResolvedValue({
            data: {
              clearedRanges: ['Sheet1!A1:B10'],
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await clearData({
      spreadsheetId: 'test-spreadsheet-id',
      ranges: ['Sheet1!A1:B10'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully cleared');
    expect(result.content[0].text).toContain('1 range(s)');
    expect(result.content[0].text).toContain('Sheet1!A1:B10');

    expect(mockSheets.spreadsheets.values.batchClear).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        ranges: ['Sheet1!A1:B10'],
      },
    });
  });

  it('should clear data from multiple ranges', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchClear: vi.fn().mockResolvedValue({
            data: {
              clearedRanges: ['Sheet1!A1:B10', 'Sheet2!C1:D5', 'Sheet3!E1:F3'],
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await clearData({
      spreadsheetId: 'test-spreadsheet-id',
      ranges: ['Sheet1!A1:B10', 'Sheet2!C1:D5', 'Sheet3!E1:F3'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('3 range(s)');
    expect(result.content[0].text).toContain('Sheet1!A1:B10');
    expect(result.content[0].text).toContain('Sheet2!C1:D5');
    expect(result.content[0].text).toContain('Sheet3!E1:F3');

    expect(mockSheets.spreadsheets.values.batchClear).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        ranges: ['Sheet1!A1:B10', 'Sheet2!C1:D5', 'Sheet3!E1:F3'],
      },
    });
  });

  it('should handle API errors', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchClear: vi.fn().mockRejectedValue(new Error('Invalid range format')),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await clearData({
      spreadsheetId: 'test-spreadsheet-id',
      ranges: ['InvalidRange'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error clearing data');
    expect(result.content[0].text).toContain('Invalid range format');
  });

  it('should handle empty ranges array', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchClear: vi.fn().mockResolvedValue({
            data: {
              clearedRanges: [],
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await clearData({
      spreadsheetId: 'test-spreadsheet-id',
      ranges: [],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('0 range(s)');
  });
});
