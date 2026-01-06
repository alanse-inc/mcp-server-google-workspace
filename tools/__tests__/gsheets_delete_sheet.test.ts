import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { deleteSheet } from '../sheets/basic/gsheets_delete_sheet.js';

vi.mock('googleapis');

describe('gsheets_delete_sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a sheet successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteSheet({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 123,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully deleted sheet');
    expect(result.content[0].text).toContain('123');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            deleteSheet: {
              sheetId: 123,
            },
          },
        ],
      },
    });
  });

  it('should handle API errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Cannot delete the only sheet')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteSheet({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error deleting sheet');
    expect(result.content[0].text).toContain('Cannot delete the only sheet');
  });

  it('should handle non-existent sheet ID', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Sheet not found')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteSheet({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 999999,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error deleting sheet');
    expect(result.content[0].text).toContain('Sheet not found');
  });
});
