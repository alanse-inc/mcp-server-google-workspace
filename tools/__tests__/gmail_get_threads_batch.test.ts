import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { getThreadsBatch } from '../gmail/batch/gmail_get_threads_batch.js';

vi.mock('googleapis');

describe('gmail_get_threads_batch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve multiple threads successfully', async () => {
    const mockGmail = {
      users: {
        threads: {
          get: vi.fn()
            .mockResolvedValueOnce({
              data: {
                id: 'thread1',
                snippet: 'First thread snippet',
                messages: [
                  { id: 'msg1', snippet: 'Message 1' },
                  { id: 'msg2', snippet: 'Message 2' },
                ],
              },
            })
            .mockResolvedValueOnce({
              data: {
                id: 'thread2',
                snippet: 'Second thread snippet',
                messages: [
                  { id: 'msg3', snippet: 'Message 3' },
                ],
              },
            }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getThreadsBatch({
      threadIds: ['thread1', 'thread2'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Requested: 2 threads');
    expect(result.content[0].text).toContain('Successful: 2');
    expect(result.content[0].text).toContain('thread1');
    expect(result.content[0].text).toContain('thread2');
    expect(result.content[0].text).toContain('Messages: 2');
    expect(result.content[0].text).toContain('Messages: 1');

    expect(mockGmail.users.threads.get).toHaveBeenCalledTimes(2);
  });

  it('should handle mixed success and errors', async () => {
    const mockGmail = {
      users: {
        threads: {
          get: vi.fn()
            .mockResolvedValueOnce({
              data: {
                id: 'thread1',
                snippet: 'Success thread',
                messages: [
                  { id: 'msg1', snippet: 'Message 1' },
                ],
              },
            })
            .mockRejectedValueOnce(new Error('Thread not found')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getThreadsBatch({
      threadIds: ['thread1', 'invalid'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successful: 1');
    expect(result.content[0].text).toContain('Failed: 1');
    expect(result.content[0].text).toContain('Failed Threads');
  });

  it('should fail with empty thread IDs array', async () => {
    const result = await getThreadsBatch({
      threadIds: [],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('threadIds array cannot be empty');
  });

  it('should fail with too many thread IDs', async () => {
    const threadIds = Array.from({ length: 51 }, (_, i) => `thread${i}`);

    const result = await getThreadsBatch({
      threadIds,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Too many thread IDs');
  });

  it('should include message IDs in output', async () => {
    const mockGmail = {
      users: {
        threads: {
          get: vi.fn().mockResolvedValue({
            data: {
              id: 'thread1',
              snippet: 'Thread with messages',
              messages: [
                { id: 'msg1', snippet: 'Message 1', labelIds: ['INBOX'] },
                { id: 'msg2', snippet: 'Message 2', labelIds: ['SENT'] },
              ],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getThreadsBatch({
      threadIds: ['thread1'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('msg1');
    expect(result.content[0].text).toContain('msg2');
  });
});
