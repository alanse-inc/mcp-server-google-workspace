import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { getMessagesBatch } from '../gmail/batch/gmail_get_messages_batch.js';

vi.mock('googleapis');

describe('gmail_get_messages_batch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve multiple messages successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          get: vi.fn()
            .mockResolvedValueOnce({
              data: {
                id: 'msg1',
                threadId: 'thread1',
                snippet: 'First message',
                payload: {
                  headers: [
                    { name: 'Subject', value: 'Subject 1' },
                    { name: 'From', value: 'sender1@example.com' },
                    { name: 'To', value: 'recipient@example.com' },
                    { name: 'Date', value: 'Mon, 1 Jan 2024 10:00:00 +0000' },
                  ],
                },
              },
            })
            .mockResolvedValueOnce({
              data: {
                id: 'msg2',
                threadId: 'thread2',
                snippet: 'Second message',
                payload: {
                  headers: [
                    { name: 'Subject', value: 'Subject 2' },
                    { name: 'From', value: 'sender2@example.com' },
                    { name: 'To', value: 'recipient@example.com' },
                    { name: 'Date', value: 'Mon, 1 Jan 2024 11:00:00 +0000' },
                  ],
                },
              },
            }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getMessagesBatch({
      messageIds: ['msg1', 'msg2'],
      format: 'metadata',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Requested: 2 messages');
    expect(result.content[0].text).toContain('Successful: 2');
    expect(result.content[0].text).toContain('Subject 1');
    expect(result.content[0].text).toContain('Subject 2');

    expect(mockGmail.users.messages.get).toHaveBeenCalledTimes(2);
  });

  it('should handle mixed success and errors', async () => {
    const mockGmail = {
      users: {
        messages: {
          get: vi.fn()
            .mockResolvedValueOnce({
              data: {
                id: 'msg1',
                threadId: 'thread1',
                snippet: 'Success message',
                payload: {
                  headers: [
                    { name: 'Subject', value: 'Subject 1' },
                    { name: 'From', value: 'sender@example.com' },
                    { name: 'To', value: 'recipient@example.com' },
                    { name: 'Date', value: 'Mon, 1 Jan 2024 10:00:00 +0000' },
                  ],
                },
              },
            })
            .mockRejectedValueOnce(new Error('Message not found')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getMessagesBatch({
      messageIds: ['msg1', 'invalid'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successful: 1');
    expect(result.content[0].text).toContain('Failed: 1');
    expect(result.content[0].text).toContain('Failed Messages');
  });

  it('should fail with empty message IDs array', async () => {
    const result = await getMessagesBatch({
      messageIds: [],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('messageIds array cannot be empty');
  });

  it('should fail with too many message IDs', async () => {
    const messageIds = Array.from({ length: 101 }, (_, i) => `msg${i}`);

    const result = await getMessagesBatch({
      messageIds,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Too many message IDs');
  });

  it('should handle full format', async () => {
    const mockGmail = {
      users: {
        messages: {
          get: vi.fn().mockResolvedValue({
            data: {
              id: 'msg1',
              threadId: 'thread1',
              snippet: 'Message with body',
              payload: {
                headers: [
                  { name: 'Subject', value: 'Test' },
                  { name: 'From', value: 'sender@example.com' },
                  { name: 'To', value: 'recipient@example.com' },
                  { name: 'Date', value: 'Mon, 1 Jan 2024 10:00:00 +0000' },
                ],
                body: {
                  data: 'VGVzdCBib2R5',
                },
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getMessagesBatch({
      messageIds: ['msg1'],
      format: 'full',
    });

    expect(result.isError).toBe(false);
    expect(mockGmail.users.messages.get).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'full',
      })
    );
  });
});
