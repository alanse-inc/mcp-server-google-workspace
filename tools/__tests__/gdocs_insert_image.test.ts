import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { insertImage } from '../docs/elements/gdocs_insert_image.js';

vi.mock('googleapis');

describe('gdocs_insert_image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should insert image successfully', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await insertImage({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      imageUrl: 'https://example.com/image.png',
      index: 1,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Image inserted successfully');
    expect(result.content[0].text).toContain('1abcdefghijklmnopqrstuvwxyz123456789');
    expect(result.content[0].text).toContain('https://example.com/image.png');

    expect(mockDocs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      requestBody: {
        requests: [
          {
            insertInlineImage: {
              location: {
                index: 1,
              },
              uri: 'https://example.com/image.png',
            },
          },
        ],
      },
    });
  });

  it('should insert image with specified dimensions', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await insertImage({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      imageUrl: 'https://example.com/logo.jpg',
      index: 10,
      width: 400,
      height: 300,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Image inserted successfully');

    const batchUpdateCall = mockDocs.documents.batchUpdate.mock.calls[0][0];
    const request = batchUpdateCall.requestBody.requests[0].insertInlineImage;

    expect(request.location.index).toBe(10);
    expect(request.uri).toBe('https://example.com/logo.jpg');
    expect(request.objectSize?.width?.magnitude).toBe(400);
    expect(request.objectSize?.width?.unit).toBe('PT');
    expect(request.objectSize?.height?.magnitude).toBe(300);
    expect(request.objectSize?.height?.unit).toBe('PT');
  });

  it('should insert image with only width specified', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await insertImage({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      imageUrl: 'https://example.com/banner.png',
      index: 5,
      width: 600,
    });

    expect(result.isError).toBe(false);

    const batchUpdateCall = mockDocs.documents.batchUpdate.mock.calls[0][0];
    const request = batchUpdateCall.requestBody.requests[0].insertInlineImage;

    expect(request.objectSize?.width?.magnitude).toBe(600);
    expect(request.objectSize?.height).toBeUndefined();
  });

  it('should handle errors gracefully', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid image URL')),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await insertImage({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      imageUrl: 'invalid-url',
      index: 1,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
    expect(result.content[0].text).toContain('Invalid image URL');
  });
});
