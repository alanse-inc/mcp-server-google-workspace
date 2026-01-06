import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addSheet } from '../sheets/basic/gsheets_add_sheet.js';

vi.mock('googleapis');

describe('gsheets_add_sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a new sheet successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addSheet: {
                  properties: {
                    sheetId: 123,
                    title: 'NewSheet',
                    index: 2,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addSheet({
      spreadsheetId: 'test-spreadsheet-id',
      title: 'NewSheet',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully added sheet');
    expect(result.content[0].text).toContain('NewSheet');
    expect(result.content[0].text).toContain('123');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'NewSheet',
              },
            },
          },
        ],
      },
    });
  });

  it('should add a sheet with specified index', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addSheet: {
                  properties: {
                    sheetId: 456,
                    title: 'FirstSheet',
                    index: 0,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addSheet({
      spreadsheetId: 'test-spreadsheet-id',
      title: 'FirstSheet',
      index: 0,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Index: 0');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'FirstSheet',
                index: 0,
              },
            },
          },
        ],
      },
    });
  });

  it('should handle errors gracefully', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Sheet already exists')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addSheet({
      spreadsheetId: 'test-spreadsheet-id',
      title: 'DuplicateSheet',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error adding sheet');
    expect(result.content[0].text).toContain('Sheet already exists');
  });
});
