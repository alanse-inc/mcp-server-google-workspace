import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { copySheet } from '../sheets/basic/gsheets_copy_sheet.js';

vi.mock('googleapis');

describe('gsheets_copy_sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should copy sheet to another spreadsheet successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        sheets: {
          copyTo: vi.fn().mockResolvedValue({
            data: {
              sheetId: 456,
              title: 'Copy of Sheet1',
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copySheet({
      sourceSpreadsheetId: 'source-spreadsheet-id',
      sourceSheetId: 123,
      destinationSpreadsheetId: 'destination-spreadsheet-id',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully copied sheet');
    expect(result.content[0].text).toContain('456');
    expect(result.content[0].text).toContain('Copy of Sheet1');

    expect(mockSheets.spreadsheets.sheets.copyTo).toHaveBeenCalledWith({
      spreadsheetId: 'source-spreadsheet-id',
      sheetId: 123,
      requestBody: {
        destinationSpreadsheetId: 'destination-spreadsheet-id',
      },
    });
  });

  it('should copy sheet within same spreadsheet', async () => {
    const mockSheets = {
      spreadsheets: {
        sheets: {
          copyTo: vi.fn().mockResolvedValue({
            data: {
              sheetId: 789,
              title: 'Sheet1 (2)',
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copySheet({
      sourceSpreadsheetId: 'same-spreadsheet-id',
      sourceSheetId: 0,
      destinationSpreadsheetId: 'same-spreadsheet-id',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('789');
    expect(result.content[0].text).toContain('Sheet1 (2)');

    expect(mockSheets.spreadsheets.sheets.copyTo).toHaveBeenCalledWith({
      spreadsheetId: 'same-spreadsheet-id',
      sheetId: 0,
      requestBody: {
        destinationSpreadsheetId: 'same-spreadsheet-id',
      },
    });
  });

  it('should handle API errors', async () => {
    const mockSheets = {
      spreadsheets: {
        sheets: {
          copyTo: vi.fn().mockRejectedValue(new Error('Sheet not found')),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copySheet({
      sourceSpreadsheetId: 'source-spreadsheet-id',
      sourceSheetId: 999,
      destinationSpreadsheetId: 'destination-spreadsheet-id',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error copying sheet');
    expect(result.content[0].text).toContain('Sheet not found');
  });

  it('should handle permission errors', async () => {
    const mockSheets = {
      spreadsheets: {
        sheets: {
          copyTo: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await copySheet({
      sourceSpreadsheetId: 'source-spreadsheet-id',
      sourceSheetId: 0,
      destinationSpreadsheetId: 'unauthorized-spreadsheet-id',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error copying sheet');
    expect(result.content[0].text).toContain('Permission denied');
  });
});
