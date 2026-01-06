import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { searchMessages } from '../gmail/basic/gmail_search_messages.js';

vi.mock('googleapis');

describe('gmail_search_messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should search messages successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          list: vi.fn().mockResolvedValue({
            data: {
              messages: [
                { id: 'msg1', threadId: 'thread1' },
                { id: 'msg2', threadId: 'thread2' },
              ],
              resultSizeEstimate: 2,
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await searchMessages({
      query: 'from:example@gmail.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Found 2 message(s)');
    expect(result.content[0].text).toContain('from:example@gmail.com');

    expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
      userId: 'me',
      q: 'from:example@gmail.com',
      maxResults: 10,
      pageToken: undefined,
    });
  });

  it('should handle pagination', async () => {
    const mockGmail = {
      users: {
        messages: {
          list: vi.fn().mockResolvedValue({
            data: {
              messages: [
                { id: 'msg1', threadId: 'thread1' },
              ],
              nextPageToken: 'next-token-123',
              resultSizeEstimate: 1,
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await searchMessages({
      query: 'test',
      pageSize: 10,
      pageToken: 'current-token',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('next-token-123');

    expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
      userId: 'me',
      q: 'test',
      maxResults: 10,
      pageToken: 'current-token',
    });
  });

  it('should handle no results', async () => {
    const mockGmail = {
      users: {
        messages: {
          list: vi.fn().mockResolvedValue({
            data: {
              messages: [],
              resultSizeEstimate: 0,
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await searchMessages({
      query: 'nonexistent',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No messages found');
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        messages: {
          list: vi.fn().mockRejectedValue(new Error('Search failed')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await searchMessages({
      query: 'test',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
