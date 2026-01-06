import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { copyTo } from '../sheets/basic/gsheets_copy_to.js';

vi.mock('googleapis');

describe('gsheets_copy_to', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should copy range to another range successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copyTo({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
      sourceStartRow: 0,
      sourceStartColumn: 0,
      sourceEndRow: 5,
      sourceEndColumn: 3,
      destinationSheetId: 1,
      destinationStartRow: 10,
      destinationStartColumn: 5,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully copied data');
    expect(result.content[0].text).toContain('sheet 0');
    expect(result.content[0].text).toContain('sheet 1');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            copyPaste: {
              source: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 5,
                startColumnIndex: 0,
                endColumnIndex: 3,
              },
              destination: {
                sheetId: 1,
                startRowIndex: 10,
                startColumnIndex: 5,
              },
              pasteType: 'NORMAL',
            },
          },
        ],
      },
    });
  });

  it('should support VALUES paste type', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copyTo({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
      sourceStartRow: 0,
      sourceStartColumn: 0,
      sourceEndRow: 2,
      sourceEndColumn: 2,
      destinationSheetId: 0,
      destinationStartRow: 5,
      destinationStartColumn: 5,
      pasteType: 'VALUES',
    });

    expect(result.isError).toBe(false);

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            copyPaste: {
              source: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
              destination: {
                sheetId: 0,
                startRowIndex: 5,
                startColumnIndex: 5,
              },
              pasteType: 'VALUES',
            },
          },
        ],
      },
    });
  });

  it('should support FORMAT paste type', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copyTo({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
      sourceStartRow: 0,
      sourceStartColumn: 0,
      sourceEndRow: 1,
      sourceEndColumn: 1,
      destinationSheetId: 0,
      destinationStartRow: 2,
      destinationStartColumn: 2,
      pasteType: 'FORMAT',
    });

    expect(result.isError).toBe(false);

    const call = mockSheets.spreadsheets.batchUpdate.mock.calls[0][0];
    expect(call.requestBody.requests[0].copyPaste.pasteType).toBe('FORMAT');
  });

  it('should support FORMULA paste type', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copyTo({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
      sourceStartRow: 0,
      sourceStartColumn: 0,
      sourceEndRow: 1,
      sourceEndColumn: 1,
      destinationSheetId: 0,
      destinationStartRow: 3,
      destinationStartColumn: 3,
      pasteType: 'FORMULA',
    });

    expect(result.isError).toBe(false);

    const call = mockSheets.spreadsheets.batchUpdate.mock.calls[0][0];
    expect(call.requestBody.requests[0].copyPaste.pasteType).toBe('FORMULA');
  });

  it('should handle API errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid range')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copyTo({
      spreadsheetId: 'test-spreadsheet-id',
      sourceSheetId: 0,
      sourceStartRow: 0,
      sourceStartColumn: 0,
      sourceEndRow: 100,
      sourceEndColumn: 100,
      destinationSheetId: 999,
      destinationStartRow: 0,
      destinationStartColumn: 0,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error copying data');
    expect(result.content[0].text).toContain('Invalid range');
  });
});
