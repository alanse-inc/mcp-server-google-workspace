import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addProtectedRange } from '../sheets/protection/gsheets_add_protected_range.js';

vi.mock('googleapis');

describe('gsheets_add_protected_range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add basic protected range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addProtectedRange: {
                  protectedRange: {
                    protectedRangeId: 123,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 10,
      startColumn: 0,
      endColumn: 5,
      description: 'Protected data',
      warningOnly: false,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully added protection to range');
    expect(result.content[0].text).toContain('123');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addProtectedRange: expect.objectContaining({
                protectedRange: expect.objectContaining({
                  range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 10,
                    startColumnIndex: 0,
                    endColumnIndex: 5,
                  },
                  warningOnly: false,
                }),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should add protected range with editors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addProtectedRange: {
                  protectedRange: {
                    protectedRangeId: 456,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 3,
      warningOnly: true,
      editors: {
        users: ['user@example.com'],
        groups: ['group@example.com'],
        domainUsersCanEdit: false,
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('456');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addProtectedRange({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 3,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error adding protected range');
  });
});
