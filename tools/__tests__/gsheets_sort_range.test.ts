import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { sortRange } from '../sheets/data/gsheets_sort_range.js';

vi.mock('googleapis');

describe('gsheets_sort_range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sort range by single column in ascending order', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await sortRange({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 10,
      startColumn: 0,
      endColumn: 5,
      sortSpecs: [
        {
          dimensionIndex: 0,
          sortOrder: 'ASCENDING',
        },
      ],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully sorted range');
    expect(result.content[0].text).toContain('R0C0:R9C4');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            sortRange: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 10,
                startColumnIndex: 0,
                endColumnIndex: 5,
              },
              sortSpecs: [
                {
                  dimensionIndex: 0,
                  sortOrder: 'ASCENDING',
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('should sort range by single column in descending order', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await sortRange({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 1,
      endRow: 20,
      startColumn: 0,
      endColumn: 3,
      sortSpecs: [
        {
          dimensionIndex: 2,
          sortOrder: 'DESCENDING',
        },
      ],
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              sortRange: expect.objectContaining({
                sortSpecs: [
                  {
                    dimensionIndex: 2,
                    sortOrder: 'DESCENDING',
                  },
                ],
              }),
            }),
          ],
        },
      })
    );
  });

  it('should sort range with multiple sort specifications', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await sortRange({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 15,
      startColumn: 0,
      endColumn: 6,
      sortSpecs: [
        {
          dimensionIndex: 0,
          sortOrder: 'ASCENDING',
        },
        {
          dimensionIndex: 2,
          sortOrder: 'DESCENDING',
        },
        {
          dimensionIndex: 4,
          sortOrder: 'ASCENDING',
        },
      ],
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              sortRange: expect.objectContaining({
                sortSpecs: [
                  {
                    dimensionIndex: 0,
                    sortOrder: 'ASCENDING',
                  },
                  {
                    dimensionIndex: 2,
                    sortOrder: 'DESCENDING',
                  },
                  {
                    dimensionIndex: 4,
                    sortOrder: 'ASCENDING',
                  },
                ],
              }),
            }),
          ],
        },
      })
    );
  });

  it('should handle sorting with different sheet and range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await sortRange({
      spreadsheetId: 'another-spreadsheet-id',
      sheetId: 5,
      startRow: 2,
      endRow: 50,
      startColumn: 1,
      endColumn: 10,
      sortSpecs: [
        {
          dimensionIndex: 3,
          sortOrder: 'ASCENDING',
        },
      ],
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'another-spreadsheet-id',
      requestBody: {
        requests: [
          {
            sortRange: {
              range: {
                sheetId: 5,
                startRowIndex: 2,
                endRowIndex: 50,
                startColumnIndex: 1,
                endColumnIndex: 10,
              },
              sortSpecs: [
                {
                  dimensionIndex: 3,
                  sortOrder: 'ASCENDING',
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('should handle errors when sorting range fails', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await sortRange({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 10,
      startColumn: 0,
      endColumn: 5,
      sortSpecs: [
        {
          dimensionIndex: 0,
          sortOrder: 'ASCENDING',
        },
      ],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error sorting range');
    expect(result.content[0].text).toContain('API error');
  });
});
