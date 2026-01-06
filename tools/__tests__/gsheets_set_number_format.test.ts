import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { setNumberFormat } from '../sheets/formatting/gsheets_set_number_format.js';

vi.mock('googleapis');

describe('gsheets_set_number_format', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set currency format', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await setNumberFormat({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 10,
      startColumn: 2,
      endColumn: 3,
      numberFormat: {
        type: 'CURRENCY',
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('CURRENCY');
    expect(result.content[0].text).toContain('$#,##0.00');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              repeatCell: expect.objectContaining({
                cell: {
                  userEnteredFormat: {
                    numberFormat: {
                      type: 'CURRENCY',
                      pattern: '$#,##0.00',
                    },
                  },
                },
              }),
            }),
          ],
        },
      })
    );
  });

  it('should set custom pattern', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await setNumberFormat({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 1,
      numberFormat: {
        type: 'NUMBER',
        pattern: '#,##0.000',
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('#,##0.000');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await setNumberFormat({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 1,
      numberFormat: {
        type: 'PERCENT',
      },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error setting number format');
  });
});
