import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { updateProtectedRange } from '../sheets/protection/gsheets_update_protected_range.js';

vi.mock('googleapis');

describe('gsheets_update_protected_range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update protected range description', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      protectedRangeId: 123,
      description: 'Updated description',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully updated protected range 123');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              updateProtectedRange: {
                protectedRange: {
                  protectedRangeId: 123,
                  description: 'Updated description',
                },
                fields: 'description',
              },
            },
          ],
        },
      })
    );
  });

  it('should update warningOnly flag', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      protectedRangeId: 456,
      warningOnly: true,
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            {
              updateProtectedRange: {
                protectedRange: {
                  protectedRangeId: 456,
                  warningOnly: true,
                },
                fields: 'warningOnly',
              },
            },
          ],
        },
      })
    );
  });

  it('should update editors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      protectedRangeId: 789,
      editors: {
        users: ['newuser@example.com'],
        domainUsersCanEdit: true,
      },
    });

    expect(result.isError).toBe(false);
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      protectedRangeId: 123,
      description: 'Failed update',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error updating protected range');
  });
});
