import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { insertColumns } from '../sheets/basic/gsheets_insert_columns.js';

vi.mock('googleapis');

describe('gsheets_insert_columns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should insert columns successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await insertColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startIndex: 2,
      count: 4,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully inserted');
    expect(result.content[0].text).toContain('4 column(s)');
    expect(result.content[0].text).toContain('index 2');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 2,
                endIndex: 6,
              },
            },
          },
        ],
      },
    });
  });

  it('should insert single column', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await insertColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startIndex: 0,
      count: 1,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('1 column(s)');
    expect(result.content[0].text).toContain('index 0');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1,
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
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid sheet ID')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await insertColumns({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 999,
      startIndex: 0,
      count: 3,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error inserting columns');
    expect(result.content[0].text).toContain('Invalid sheet ID');
  });
});
