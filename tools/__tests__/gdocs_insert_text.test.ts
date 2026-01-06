import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { insertText } from '../docs/content/gdocs_insert_text.js';

vi.mock('googleapis');

describe('gdocs_insert_text', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should insert text successfully', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            documentId: 'test-doc-id',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const documentId = '1abcdefghijklmnopqrstuvwxyz123456789';

    const result = await insertText({
      documentId,
      text: 'Hello, World!',
      index: 1,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Text inserted successfully');
    expect(result.content[0].text).toContain(documentId);
    expect(result.content[0].text).toContain('Hello, World!');

    expect(mockDocs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: 'Hello, World!',
            },
          },
        ],
      },
    });
  });

  it('should insert multiline text', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            documentId: 'test-doc-id',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const documentId = '1abcdefghijklmnopqrstuvwxyz123456789';

    const result = await insertText({
      documentId,
      text: 'Line 1\nLine 2\nLine 3',
      index: 5,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Text inserted successfully');

    expect(mockDocs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 5,
              },
              text: 'Line 1\nLine 2\nLine 3',
            },
          },
        ],
      },
    });
  });

  it('should handle errors gracefully', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid index')),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const documentId = '1abcdefghijklmnopqrstuvwxyz123456789';

    const result = await insertText({
      documentId,
      text: 'Test',
      index: 999999,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
