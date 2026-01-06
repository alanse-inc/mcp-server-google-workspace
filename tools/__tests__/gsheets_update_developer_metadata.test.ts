import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { updateDeveloperMetadata } from '../sheets/advanced/gsheets_update_developer_metadata.js';

vi.mock('googleapis');

describe('gsheets_update_developer_metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update metadata value', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateDeveloperMetadata({
      spreadsheetId: 'test-spreadsheet-id',
      metadataId: 12345,
      metadataValue: '2.0.0',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('updated developer metadata');
    expect(result.content[0].text).toContain('12345');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              updateDeveloperMetadata: expect.objectContaining({
                dataFilters: expect.arrayContaining([
                  expect.objectContaining({
                    developerMetadataLookup: expect.objectContaining({
                      metadataId: 12345,
                    }),
                  }),
                ]),
                developerMetadata: expect.objectContaining({
                  metadataId: 12345,
                  metadataValue: '2.0.0',
                }),
                fields: 'metadataValue',
              }),
            }),
          ],
        },
      })
    );
  });

  it('should update multiple fields', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateDeveloperMetadata({
      spreadsheetId: 'test-spreadsheet-id',
      metadataId: 12345,
      metadataKey: 'newKey',
      metadataValue: 'newValue',
      visibility: 'PROJECT',
    });

    expect(result.isError).toBe(false);

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          requests: [
            expect.objectContaining({
              updateDeveloperMetadata: expect.objectContaining({
                fields: expect.stringContaining('metadataKey'),
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

    const result = await updateDeveloperMetadata({
      spreadsheetId: 'test-spreadsheet-id',
      metadataId: 99999,
      metadataValue: 'test',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error updating developer metadata');
  });
});
