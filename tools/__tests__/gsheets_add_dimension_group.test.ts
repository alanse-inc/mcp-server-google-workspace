import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addDimensionGroup } from '../sheets/advanced/gsheets_add_dimension_group.js';

vi.mock('googleapis');

describe('gsheets_add_dimension_group', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a row group', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addDimensionGroup({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'ROWS',
      startIndex: 5,
      endIndex: 10,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('rows group');
    expect(result.content[0].text).toContain('5 to 10');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addDimensionGroup: expect.objectContaining({
                range: expect.objectContaining({
                  sheetId: 0,
                  dimension: 'ROWS',
                  startIndex: 5,
                  endIndex: 10,
                }),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should add a column group', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addDimensionGroup({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'COLUMNS',
      startIndex: 2,
      endIndex: 5,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('columns group');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              addDimensionGroup: expect.objectContaining({
                range: expect.objectContaining({
                  dimension: 'COLUMNS',
                }),
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
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid dimension group range')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addDimensionGroup({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'ROWS',
      startIndex: 5,
      endIndex: 10,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error adding dimension group');
  });
});
