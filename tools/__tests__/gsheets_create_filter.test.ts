import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { createFilter } from '../sheets/data/gsheets_create_filter.js';

vi.mock('googleapis');

describe('gsheets_create_filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a filter', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await createFilter({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 100,
      startColumn: 0,
      endColumn: 10,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('filter');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Filter already exists')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await createFilter({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 10,
      startColumn: 0,
      endColumn: 5,
    });

    expect(result.isError).toBe(true);
  });
});
