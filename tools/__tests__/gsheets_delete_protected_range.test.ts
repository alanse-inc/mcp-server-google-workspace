import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { deleteProtectedRange } from '../sheets/protection/gsheets_delete_protected_range.js';

vi.mock('googleapis');

describe('gsheets_delete_protected_range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete protected range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      protectedRangeId: 123,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully deleted protected range 123');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              deleteProtectedRange: {
                protectedRangeId: 123,
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

    const result = await deleteProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      protectedRangeId: 999,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error deleting protected range');
  });
});
