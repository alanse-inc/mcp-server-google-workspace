import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { appendData } from '../sheets/data/gsheets_append_data.js';

vi.mock('googleapis');

describe('gsheets_append_data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should append data successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          append: vi.fn().mockResolvedValue({
            data: {
              updates: {
                updatedRows: 2,
                updatedColumns: 3,
                updatedRange: 'Sheet1!A10:C11',
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await appendData({
      spreadsheetId: 'test-spreadsheet-id',
      range: 'Sheet1!A:C',
      values: [
        ['Name', 'Age', 'City'],
        ['John', '30', 'NYC'],
      ],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully appended');
    expect(result.content[0].text).toContain('2 row(s)');
    expect(result.content[0].text).toContain('3 column(s)');

    expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      range: 'Sheet1!A:C',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['Name', 'Age', 'City'],
          ['John', '30', 'NYC'],
        ],
      },
    });
  });

  it('should support USER_ENTERED value input option', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          append: vi.fn().mockResolvedValue({
            data: {
              updates: {
                updatedRows: 1,
                updatedColumns: 2,
                updatedRange: 'Sheet1!A1:B1',
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await appendData({
      spreadsheetId: 'test-spreadsheet-id',
      range: 'Sheet1!A:B',
      values: [['=SUM(A1:A10)', '100']],
      valueInputOption: 'USER_ENTERED',
    });

    expect(result.isError).toBe(false);

    expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      range: 'Sheet1!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['=SUM(A1:A10)', '100']],
      },
    });
  });

  it('should handle API errors', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          append: vi.fn().mockRejectedValue(new Error('Invalid range')),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await appendData({
      spreadsheetId: 'test-spreadsheet-id',
      range: 'InvalidRange',
      values: [['test']],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error appending data');
    expect(result.content[0].text).toContain('Invalid range');
  });
});
