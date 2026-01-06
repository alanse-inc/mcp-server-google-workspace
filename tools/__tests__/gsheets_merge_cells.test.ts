import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { mergeCells } from '../sheets/formatting/gsheets_merge_cells.js';

vi.mock('googleapis');

describe('gsheets_merge_cells', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should merge cells with MERGE_ALL type', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await mergeCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
      mergeType: 'MERGE_ALL',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully merged cells');
    expect(result.content[0].text).toContain('MERGE_ALL');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            mergeCells: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
              mergeType: 'MERGE_ALL',
            },
          },
        ],
      },
    });
  });

  it('should merge cells with MERGE_COLUMNS type', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await mergeCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 3,
      mergeType: 'MERGE_COLUMNS',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('MERGE_COLUMNS');
  });

  it('should merge cells with MERGE_ROWS type', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await mergeCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 3,
      startColumn: 0,
      endColumn: 5,
      mergeType: 'MERGE_ROWS',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('MERGE_ROWS');
  });

  it('should use MERGE_ALL as default when mergeType is not specified', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await mergeCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              mergeCells: expect.objectContaining({
                mergeType: 'MERGE_ALL',
              }),
            }),
          ],
        },
      })
    );
  });

  it('should handle errors when merging cells fails', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await mergeCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error merging cells');
    expect(result.content[0].text).toContain('API error');
  });
});
