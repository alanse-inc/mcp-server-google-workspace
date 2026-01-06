import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { setDataValidation } from '../sheets/data/gsheets_set_data_validation.js';

vi.mock('googleapis');

describe('gsheets_set_data_validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set dropdown list validation', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await setDataValidation({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 1,
      endRow: 100,
      startColumn: 5,
      endColumn: 6,
      validation: {
        type: 'ONE_OF_LIST',
        values: ['Option A', 'Option B', 'Option C'],
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('ONE_OF_LIST');
  });

  it('should set number range validation', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await setDataValidation({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 10,
      startColumn: 0,
      endColumn: 1,
      validation: {
        type: 'NUMBER_BETWEEN',
        minValue: '0',
        maxValue: '100',
      },
    });

    expect(result.isError).toBe(false);
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid range')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await setDataValidation({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 1,
      validation: {
        type: 'ONE_OF_LIST',
        values: ['Yes', 'No'],
      },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error setting data validation');
  });
});
