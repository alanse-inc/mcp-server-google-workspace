import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { updateNamedRange } from '../sheets/protection/gsheets_update_named_range.js';

vi.mock('googleapis');

describe('gsheets_update_named_range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update named range name', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateNamedRange({
      spreadsheetId: 'test-spreadsheet-id',
      namedRangeId: 'range-123',
      name: 'NewName',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully updated named range range-123');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              updateNamedRange: {
                namedRange: {
                  namedRangeId: 'range-123',
                  name: 'NewName',
                },
                fields: 'name',
              },
            },
          ],
        },
      })
    );
  });

  it('should update named range position', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateNamedRange({
      spreadsheetId: 'test-spreadsheet-id',
      namedRangeId: 'range-456',
      sheetId: 1,
      startRow: 10,
      endRow: 50,
      startColumn: 2,
      endColumn: 8,
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            {
              updateNamedRange: {
                namedRange: {
                  namedRangeId: 'range-456',
                  range: {
                    sheetId: 1,
                    startRowIndex: 10,
                    endRowIndex: 50,
                    startColumnIndex: 2,
                    endColumnIndex: 8,
                  },
                },
                fields: 'range',
              },
            },
          ],
        },
      })
    );
  });

  it('should update both name and range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateNamedRange({
      spreadsheetId: 'test-spreadsheet-id',
      namedRangeId: 'range-789',
      name: 'UpdatedName',
      sheetId: 0,
      startRow: 0,
      endRow: 20,
      startColumn: 0,
      endColumn: 5,
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            {
              updateNamedRange: {
                namedRange: expect.objectContaining({
                  namedRangeId: 'range-789',
                  name: 'UpdatedName',
                  range: expect.any(Object),
                }),
                fields: 'name,range',
              },
            },
          ],
        },
      })
    );
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Not found')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateNamedRange({
      spreadsheetId: 'test-spreadsheet-id',
      namedRangeId: 'invalid-range',
      name: 'NewName',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error updating named range');
  });
});
