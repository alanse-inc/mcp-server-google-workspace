import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { listSheets } from '../sheets/basic/gsheets_list_sheets.js';

vi.mock('googleapis');

describe('gsheets_list_sheets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list all sheets in a spreadsheet', async () => {
    const mockSheets = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: {
            sheets: [
              {
                properties: {
                  sheetId: 0,
                  title: 'Sheet1',
                  index: 0,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 26,
                  },
                },
              },
              {
                properties: {
                  sheetId: 1,
                  title: 'Sheet2',
                  index: 1,
                  gridProperties: {
                    rowCount: 100,
                    columnCount: 10,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await listSheets({
      spreadsheetId: 'test-spreadsheet-id',
    });

    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);

    const responseData = JSON.parse(result.content[0].text);
    expect(responseData.sheets).toHaveLength(2);
    expect(responseData.sheets[0].title).toBe('Sheet1');
    expect(responseData.sheets[1].title).toBe('Sheet2');
    expect(mockSheets.spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      fields: 'sheets.properties',
    });
  });

  it('should handle errors gracefully', async () => {
    const mockSheets = {
      spreadsheets: {
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await listSheets({
      spreadsheetId: 'test-spreadsheet-id',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error listing sheets');
    expect(result.content[0].text).toContain('API Error');
  });

  it('should handle empty spreadsheet', async () => {
    const mockSheets = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: {
            sheets: [],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await listSheets({
      spreadsheetId: 'test-spreadsheet-id',
    });

    expect(result.isError).toBe(false);
    const responseData = JSON.parse(result.content[0].text);
    expect(responseData.sheets).toHaveLength(0);
  });
});
