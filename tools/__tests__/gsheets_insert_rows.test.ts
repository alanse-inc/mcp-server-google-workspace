import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { insertRows } from '../sheets/basic/gsheets_insert_rows.js';

vi.mock('googleapis');

describe('gsheets_insert_rows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should insert rows successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await insertRows({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startIndex: 5,
      count: 3,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully inserted');
    expect(result.content[0].text).toContain('3 row(s)');
    expect(result.content[0].text).toContain('index 5');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: 5,
                endIndex: 8,
              },
            },
          },
        ],
      },
    });
  });

  it('should insert single row', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await insertRows({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startIndex: 0,
      count: 1,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('1 row(s)');
    expect(result.content[0].text).toContain('index 0');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
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

    const result = await insertRows({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 999,
      startIndex: 0,
      count: 5,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error inserting rows');
    expect(result.content[0].text).toContain('Invalid sheet ID');
  });
});
