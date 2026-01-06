import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { deleteDimensionGroup } from '../sheets/advanced/gsheets_delete_dimension_group.js';

vi.mock('googleapis');

describe('gsheets_delete_dimension_group', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a dimension group', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteDimensionGroup({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'ROWS',
      startIndex: 5,
      endIndex: 10,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('deleted rows group');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              deleteDimensionGroup: expect.objectContaining({
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

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Group not found')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteDimensionGroup({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'ROWS',
      startIndex: 5,
      endIndex: 10,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error deleting dimension group');
  });
});
