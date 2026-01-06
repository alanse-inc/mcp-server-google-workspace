import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addNamedRange } from '../sheets/protection/gsheets_add_named_range.js';

vi.mock('googleapis');

describe('gsheets_add_named_range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a named range', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addNamedRange: {
                  namedRange: {
                    namedRangeId: 'range-123',
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addNamedRange({
      spreadsheetId: 'test-spreadsheet-id',
      name: 'SalesData',
      sheetId: 0,
      startRow: 0,
      endRow: 100,
      startColumn: 0,
      endColumn: 10,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('SalesData');
    expect(result.content[0].text).toContain('range-123');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              addNamedRange: {
                namedRange: {
                  name: 'SalesData',
                  range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 100,
                    startColumnIndex: 0,
                    endColumnIndex: 10,
                  },
                },
              },
            },
          ],
        },
      })
    );
  });

  it('should handle errors when name already exists', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Named range already exists')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addNamedRange({
      spreadsheetId: 'test-spreadsheet-id',
      name: 'DuplicateName',
      sheetId: 0,
      startRow: 0,
      endRow: 10,
      startColumn: 0,
      endColumn: 5,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating named range');
  });
});
