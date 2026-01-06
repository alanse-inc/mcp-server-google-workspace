import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { deleteNamedRange } from '../sheets/protection/gsheets_delete_named_range.js';

vi.mock('googleapis');

describe('gsheets_delete_named_range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete named range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteNamedRange({
      spreadsheetId: 'test-spreadsheet-id',
      namedRangeId: 'range-123',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully deleted named range range-123');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              deleteNamedRange: {
                namedRangeId: 'range-123',
              },
            },
          ],
        },
      })
    );
  });

  it('should handle errors when named range not found', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Named range not found')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteNamedRange({
      spreadsheetId: 'test-spreadsheet-id',
      namedRangeId: 'invalid-range',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error deleting named range');
  });
});
