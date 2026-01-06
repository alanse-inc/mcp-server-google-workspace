import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { unmergeCells } from '../sheets/formatting/gsheets_unmerge_cells.js';

vi.mock('googleapis');

describe('gsheets_unmerge_cells', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should unmerge cells in a specified range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await unmergeCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully unmerged cells');
    expect(result.content[0].text).toContain('R0C0:R1C1');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            unmergeCells: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
            },
          },
        ],
      },
    });
  });

  it('should handle unmerging cells in a larger range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await unmergeCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 1,
      startRow: 5,
      endRow: 10,
      startColumn: 2,
      endColumn: 8,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('R5C2:R9C7');
  });

  it('should handle errors when unmerging cells fails', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await unmergeCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error unmerging cells');
    expect(result.content[0].text).toContain('API error');
  });
});
