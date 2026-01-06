import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addPivotTable } from '../sheets/advanced/gsheets_add_pivot_table.js';

vi.mock('googleapis');

describe('gsheets_add_pivot_table', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a pivot table', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addPivotTable({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
      sourceStartRow: 0,
      sourceEndRow: 100,
      sourceStartColumn: 0,
      sourceEndColumn: 5,
      targetSheetId: 1,
      targetRow: 0,
      targetColumn: 0,
      rows: [
        {
          sourceColumnOffset: 0,
          sortOrder: 'ASCENDING',
          showTotals: true,
        },
      ],
      values: [
        {
          sourceColumnOffset: 2,
          summarizeFunction: 'SUM',
        },
      ],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('pivot table');
    expect(result.content[0].text).toContain('sheet 1');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              updateCells: expect.objectContaining({
                rows: expect.arrayContaining([
                  expect.objectContaining({
                    values: expect.arrayContaining([
                      expect.objectContaining({
                        pivotTable: expect.objectContaining({
                          source: expect.objectContaining({
                            sheetId: 0,
                            startRowIndex: 0,
                            endRowIndex: 100,
                            startColumnIndex: 0,
                            endColumnIndex: 5,
                          }),
                          rows: expect.arrayContaining([
                            expect.objectContaining({
                              sourceColumnOffset: 0,
                              sortOrder: 'ASCENDING',
                              showTotals: true,
                            }),
                          ]),
                          values: expect.arrayContaining([
                            expect.objectContaining({
                              sourceColumnOffset: 2,
                              summarizeFunction: 'SUM',
                            }),
                          ]),
                        }),
                      }),
                    ]),
                  }),
                ]),
                fields: 'pivotTable',
                start: expect.objectContaining({
                  sheetId: 1,
                  rowIndex: 0,
                  columnIndex: 0,
                }),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should create a pivot table with column groups', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addPivotTable({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
      sourceStartRow: 0,
      sourceEndRow: 100,
      sourceStartColumn: 0,
      sourceEndColumn: 5,
      targetSheetId: 1,
      targetRow: 0,
      targetColumn: 0,
      rows: [
        {
          sourceColumnOffset: 0,
        },
      ],
      columns: [
        {
          sourceColumnOffset: 1,
          sortOrder: 'DESCENDING',
        },
      ],
      values: [
        {
          sourceColumnOffset: 2,
          summarizeFunction: 'AVERAGE',
        },
      ],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('pivot table');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              updateCells: expect.objectContaining({
                rows: expect.arrayContaining([
                  expect.objectContaining({
                    values: expect.arrayContaining([
                      expect.objectContaining({
                        pivotTable: expect.objectContaining({
                          columns: expect.arrayContaining([
                            expect.objectContaining({
                              sourceColumnOffset: 1,
                              sortOrder: 'DESCENDING',
                            }),
                          ]),
                        }),
                      }),
                    ]),
                  }),
                ]),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid pivot table configuration')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addPivotTable({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
      sourceStartRow: 0,
      sourceEndRow: 100,
      sourceStartColumn: 0,
      sourceEndColumn: 5,
      targetSheetId: 1,
      targetRow: 0,
      targetColumn: 0,
      rows: [{ sourceColumnOffset: 0 }],
      values: [{ sourceColumnOffset: 2, summarizeFunction: 'SUM' }],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating pivot table');
  });
});
