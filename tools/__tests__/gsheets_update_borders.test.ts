import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { updateBorders } from '../sheets/formatting/gsheets_update_borders.js';

vi.mock('googleapis');

describe('gsheets_update_borders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update borders with specified style', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateBorders({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 5,
      top: {
        style: 'SOLID',
        width: 2,
        color: { red: 0, green: 0, blue: 0 },
      },
      bottom: {
        style: 'SOLID',
        width: 2,
        color: { red: 0, green: 0, blue: 0 },
      },
      left: {
        style: 'SOLID',
        width: 2,
        color: { red: 0, green: 0, blue: 0 },
      },
      right: {
        style: 'SOLID',
        width: 2,
        color: { red: 0, green: 0, blue: 0 },
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully updated borders');
    expect(result.content[0].text).toContain('R0C0:R4C4');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        requests: [
          {
            updateBorders: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 5,
                startColumnIndex: 0,
                endColumnIndex: 5,
              },
              top: {
                style: 'SOLID',
                width: 2,
                color: { red: 0, green: 0, blue: 0 },
              },
              bottom: {
                style: 'SOLID',
                width: 2,
                color: { red: 0, green: 0, blue: 0 },
              },
              left: {
                style: 'SOLID',
                width: 2,
                color: { red: 0, green: 0, blue: 0 },
              },
              right: {
                style: 'SOLID',
                width: 2,
                color: { red: 0, green: 0, blue: 0 },
              },
            },
          },
        ],
      },
    });
  });

  it('should update only specified borders', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateBorders({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 3,
      startColumn: 0,
      endColumn: 3,
      top: {
        style: 'DOUBLE',
        width: 3,
        color: { red: 1, green: 0, blue: 0 },
      },
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              updateBorders: expect.objectContaining({
                top: {
                  style: 'DOUBLE',
                  width: 3,
                  color: { red: 1, green: 0, blue: 0 },
                },
              }),
            }),
          ],
        },
      })
    );
  });

  it('should support different border styles', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateBorders({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
      top: {
        style: 'DASHED',
        width: 1,
        color: { red: 0, green: 0, blue: 1 },
      },
      bottom: {
        style: 'DOTTED',
        width: 1,
        color: { red: 0, green: 1, blue: 0 },
      },
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              updateBorders: expect.objectContaining({
                top: expect.objectContaining({
                  style: 'DASHED',
                }),
                bottom: expect.objectContaining({
                  style: 'DOTTED',
                }),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should handle errors when updating borders fails', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateBorders({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 2,
      startColumn: 0,
      endColumn: 2,
      top: {
        style: 'SOLID',
        width: 1,
        color: { red: 0, green: 0, blue: 0 },
      },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error updating borders');
    expect(result.content[0].text).toContain('API error');
  });
});
