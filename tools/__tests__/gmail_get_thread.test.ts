import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { getThread } from '../gmail/basic/gmail_get_thread.js';

vi.mock('googleapis');

describe('gmail_get_thread', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get thread successfully', async () => {
    const mockGmail = {
      users: {
        threads: {
          get: vi.fn().mockResolvedValue({
            data: {
              id: 'thread123',
              messages: [
                {
                  id: 'msg1',
                  snippet: 'First message in thread',
                  payload: {
                    headers: [
                      { name: 'Subject', value: 'Re: Discussion' },
                      { name: 'From', value: 'user1@example.com' },
                      { name: 'Date', value: 'Mon, 1 Jan 2024 10:00:00 +0000' },
                    ],
                    body: { data: 'Rmlyc3QgbWVzc2FnZQ==' },
                  },
                },
                {
                  id: 'msg2',
                  snippet: 'Second message in thread',
                  payload: {
                    headers: [
                      { name: 'Subject', value: 'Re: Discussion' },
                      { name: 'From', value: 'user2@example.com' },
                      { name: 'Date', value: 'Mon, 1 Jan 2024 11:00:00 +0000' },
                    ],
                    body: { data: 'U2Vjb25kIG1lc3NhZ2U=' },
                  },
                },
              ],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getThread({
      threadId: 'thread123',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Thread ID: thread123');
    expect(result.content[0].text).toContain('Messages: 2');

    expect(mockGmail.users.threads.get).toHaveBeenCalledWith({
      userId: 'me',
      id: 'thread123',
      format: 'full',
    });
  });

  it('should handle single message thread', async () => {
    const mockGmail = {
      users: {
        threads: {
          get: vi.fn().mockResolvedValue({
            data: {
              id: 'thread456',
              messages: [
                {
                  id: 'msg1',
                  snippet: 'Single message',
                  payload: {
                    headers: [
                      { name: 'Subject', value: 'Standalone' },
                      { name: 'From', value: 'user@example.com' },
                      { name: 'Date', value: 'Mon, 1 Jan 2024 10:00:00 +0000' },
                    ],
                    body: { data: 'U2luZ2xlIG1lc3NhZ2U=' },
                  },
                },
              ],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getThread({
      threadId: 'thread456',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Messages: 1');
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        threads: {
          get: vi.fn().mockRejectedValue(new Error('Thread not found')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getThread({
      threadId: 'invalid',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
