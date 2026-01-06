import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { deleteColumns } from '../sheets/basic/gsheets_delete_columns.js';

vi.mock('googleapis');

describe('gsheets_delete_columns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete columns successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startIndex: 2,
      count: 3,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully deleted');
    expect(result.content[0].text).toContain('3 column(s)');
    expect(result.content[0].text).toContain('index 2');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 2,
                endIndex: 5,
              },
            },
          },
        ],
      },
    });
  });

  it('should delete single column', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startIndex: 5,
      count: 1,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('1 column(s)');
    expect(result.content[0].text).toContain('index 5');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 5,
                endIndex: 6,
              },
            },
          },
        ],
      },
    });
  });

  it('should handle API errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid column range')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startIndex: 50,
      count: 10,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error deleting columns');
    expect(result.content[0].text).toContain('Invalid column range');
  });
});
