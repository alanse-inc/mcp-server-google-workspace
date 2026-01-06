import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { formatCells } from '../sheets/formatting/gsheets_format_cells.js';

vi.mock('googleapis');

describe('gsheets_format_cells', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format cells with bold text', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await formatCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 5,
      format: {
        bold: true,
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully formatted cells');
    expect(result.content[0].text).toContain('bold');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              repeatCell: expect.objectContaining({
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat.textFormat.bold',
              }),
            }),
          ],
        },
      })
    );
  });

  it('should format cells with font properties', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await formatCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
      format: {
        bold: true,
        italic: true,
        fontSize: 14,
        fontFamily: 'Arial',
      },
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              repeatCell: expect.objectContaining({
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                      italic: true,
                      fontSize: 14,
                      fontFamily: 'Arial',
                    },
                  },
                },
                fields: expect.stringContaining('textFormat'),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should format cells with text and background colors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await formatCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 3,
      startColumn: 0,
      endColumn: 3,
      format: {
        textColor: { red: 1, green: 0, blue: 0 },
        backgroundColor: { red: 1, green: 1, blue: 0 },
      },
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              repeatCell: expect.objectContaining({
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      foregroundColor: { red: 1, green: 0, blue: 0 },
                    },
                    backgroundColor: { red: 1, green: 1, blue: 0 },
                  },
                },
              }),
            }),
          ],
        },
      })
    );
  });

  it('should format cells with alignment', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await formatCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
      format: {
        horizontalAlignment: 'CENTER',
        verticalAlignment: 'MIDDLE',
      },
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              repeatCell: expect.objectContaining({
                cell: {
                  userEnteredFormat: {
                    horizontalAlignment: 'CENTER',
                    verticalAlignment: 'MIDDLE',
                  },
                },
                fields: expect.stringContaining('horizontalAlignment'),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should format cells with multiple format options', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await formatCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 5,
      format: {
        bold: true,
        italic: false,
        fontSize: 12,
        fontFamily: 'Roboto',
        textColor: { red: 0, green: 0, blue: 1 },
        backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
        horizontalAlignment: 'RIGHT',
        verticalAlignment: 'TOP',
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully formatted cells');
  });

  it('should handle errors when formatting cells fails', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await formatCells({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
      format: {
        bold: true,
      },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error formatting cells');
    expect(result.content[0].text).toContain('API error');
  });
});
