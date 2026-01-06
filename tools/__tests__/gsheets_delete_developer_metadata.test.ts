import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { deleteDeveloperMetadata } from '../sheets/advanced/gsheets_delete_developer_metadata.js';

vi.mock('googleapis');

describe('gsheets_delete_developer_metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete developer metadata', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteDeveloperMetadata({
      spreadsheetId: 'test-spreadsheet-id',
      metadataId: 12345,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('deleted developer metadata');
    expect(result.content[0].text).toContain('12345');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              deleteDeveloperMetadata: expect.objectContaining({
                dataFilter: expect.objectContaining({
                  developerMetadataLookup: expect.objectContaining({
                    metadataId: 12345,
                  }),
                }),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Metadata not found')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await deleteDeveloperMetadata({
      spreadsheetId: 'test-spreadsheet-id',
      metadataId: 99999,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error deleting developer metadata');
  });
});
