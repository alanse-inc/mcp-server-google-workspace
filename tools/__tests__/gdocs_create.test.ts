import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { createDocument } from '../docs/basic/gdocs_create.js';

vi.mock('googleapis');

describe('gdocs_create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new document successfully', async () => {
    const mockDocs = {
      documents: {
        create: vi.fn().mockResolvedValue({
          data: {
            documentId: 'test-document-id-123',
            title: 'Test Document',
            revisionId: 'rev-001',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await createDocument({
      title: 'Test Document',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Document created successfully');
    expect(result.content[0].text).toContain('test-document-id-123');
    expect(result.content[0].text).toContain('Test Document');
    expect(result.content[0].text).toContain('https://docs.google.com/document/d/test-document-id-123/edit');

    expect(mockDocs.documents.create).toHaveBeenCalledWith({
      requestBody: {
        title: 'Test Document',
      },
    });
  });

  it('should create a document with empty title', async () => {
    const mockDocs = {
      documents: {
        create: vi.fn().mockResolvedValue({
          data: {
            documentId: 'test-document-id-456',
            title: '',
            revisionId: 'rev-002',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await createDocument({
      title: '',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Document created successfully');
    expect(result.content[0].text).toContain('test-document-id-456');

    expect(mockDocs.documents.create).toHaveBeenCalledWith({
      requestBody: {
        title: '',
      },
    });
  });

  it('should handle errors gracefully', async () => {
    const mockDocs = {
      documents: {
        create: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await createDocument({
      title: 'Failed Document',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
    expect(result.content[0].text).toContain('Permission denied');
  });
});
