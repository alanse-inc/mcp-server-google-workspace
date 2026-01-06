import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { batchUpdate } from '../sheets/data/gsheets_batch_update.js';

vi.mock('googleapis');

describe('gsheets_batch_update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should batch update multiple ranges successfully', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchUpdate: vi.fn().mockResolvedValue({
            data: {
              totalUpdatedRows: 5,
              totalUpdatedCells: 15,
              responses: [
                { updatedRange: 'Sheet1!A1:C2' },
                { updatedRange: 'Sheet2!D1:E3' },
              ],
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await batchUpdate({
      spreadsheetId: 'test-spreadsheet-id',
      updates: [
        {
          range: 'Sheet1!A1:C2',
          values: [
            ['A1', 'B1', 'C1'],
            ['A2', 'B2', 'C2'],
          ],
        },
        {
          range: 'Sheet2!D1:E3',
          values: [
            ['D1', 'E1'],
            ['D2', 'E2'],
            ['D3', 'E3'],
          ],
        },
      ],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully updated');
    expect(result.content[0].text).toContain('2 range(s)');
    expect(result.content[0].text).toContain('5 row(s)');
    expect(result.content[0].text).toContain('15 cell(s)');

    expect(mockSheets.spreadsheets.values.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range: 'Sheet1!A1:C2',
            values: [
              ['A1', 'B1', 'C1'],
              ['A2', 'B2', 'C2'],
            ],
          },
          {
            range: 'Sheet2!D1:E3',
            values: [
              ['D1', 'E1'],
              ['D2', 'E2'],
              ['D3', 'E3'],
            ],
          },
        ],
      },
    });
  });

  it('should support USER_ENTERED value input option', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchUpdate: vi.fn().mockResolvedValue({
            data: {
              totalUpdatedRows: 1,
              totalUpdatedCells: 2,
              responses: [{ updatedRange: 'Sheet1!A1:B1' }],
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await batchUpdate({
      spreadsheetId: 'test-spreadsheet-id',
      updates: [
        {
          range: 'Sheet1!A1:B1',
          values: [['=SUM(A2:A10)', '=AVERAGE(B2:B10)']],
        },
      ],
      valueInputOption: 'USER_ENTERED',
    });

    expect(result.isError).toBe(false);

    expect(mockSheets.spreadsheets.values.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'Sheet1!A1:B1',
            values: [['=SUM(A2:A10)', '=AVERAGE(B2:B10)']],
          },
        ],
      },
    });
  });

  it('should handle single range update', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchUpdate: vi.fn().mockResolvedValue({
            data: {
              totalUpdatedRows: 1,
              totalUpdatedCells: 3,
              responses: [{ updatedRange: 'Sheet1!A1:C1' }],
            },
          }),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await batchUpdate({
      spreadsheetId: 'test-spreadsheet-id',
      updates: [
        {
          range: 'Sheet1!A1:C1',
          values: [['Header1', 'Header2', 'Header3']],
        },
      ],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('1 range(s)');
  });

  it('should handle API errors', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid range format')),
        },
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await batchUpdate({
      spreadsheetId: 'test-spreadsheet-id',
      updates: [
        {
          range: 'InvalidRange',
          values: [['test']],
        },
      ],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error batch updating');
    expect(result.content[0].text).toContain('Invalid range format');
  });
});
