import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { findReplace } from '../sheets/data/gsheets_find_replace.js';

vi.mock('googleapis');

describe('gsheets_find_replace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find and replace text in entire spreadsheet', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                findReplace: {
                  occurrencesChanged: 5,
                  rowsChanged: 3,
                  sheetsChanged: 2,
                  valuesChanged: 5,
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await findReplace({
      spreadsheetId: 'test-spreadsheet-id',
      find: 'old text',
      replacement: 'new text',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('old text');
    expect(result.content[0].text).toContain('new text');
    expect(result.content[0].text).toContain('5 occurrences');
    expect(result.content[0].text).toContain('3 rows');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              findReplace: {
                find: 'old text',
                replacement: 'new text',
                matchCase: false,
                matchEntireCell: false,
                searchByRegex: false,
              },
            },
          ],
        },
      })
    );
  });

  it('should find and replace with regex', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                findReplace: {
                  occurrencesChanged: 3,
                  rowsChanged: 2,
                  sheetsChanged: 1,
                  valuesChanged: 3,
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await findReplace({
      spreadsheetId: 'test-spreadsheet-id',
      find: '\\d{4}',
      replacement: 'YEAR',
      searchByRegex: true,
      matchCase: true,
    });

    expect(result.isError).toBe(false);
  });

  it('should find and replace in specific range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                findReplace: {
                  occurrencesChanged: 2,
                  rowsChanged: 2,
                  sheetsChanged: 1,
                  valuesChanged: 2,
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await findReplace({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      find: 'test',
      replacement: 'production',
      startRow: 0,
      endRow: 10,
      startColumn: 0,
      endColumn: 5,
      matchEntireCell: true,
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            {
              findReplace: expect.objectContaining({
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 10,
                  startColumnIndex: 0,
                  endColumnIndex: 5,
                },
                matchEntireCell: true,
              }),
            },
          ],
        },
      })
    );
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid regex')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await findReplace({
      spreadsheetId: 'test-spreadsheet-id',
      find: '[invalid',
      replacement: 'test',
      searchByRegex: true,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error finding and replacing');
  });
});
