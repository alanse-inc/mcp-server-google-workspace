import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { deleteChart } from '../sheets/charts/gsheets_delete_chart.js';

vi.mock('googleapis');

describe('gsheets_delete_chart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a chart', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteChart({
      spreadsheetId: 'test-spreadsheet-id',
      chartId: 12345,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully deleted chart 12345');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            {
              deleteEmbeddedObject: {
                objectId: 12345,
              },
            },
          ],
        },
      })
    );
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Chart not found')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteChart({
      spreadsheetId: 'test-spreadsheet-id',
      chartId: 99999,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error deleting chart');
  });
});
