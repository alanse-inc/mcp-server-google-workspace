import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { getMessage } from '../gmail/basic/gmail_get_message.js';

vi.mock('googleapis');

describe('gmail_get_message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get message successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          get: vi.fn().mockResolvedValue({
            data: {
              id: 'msg123',
              threadId: 'thread123',
              labelIds: ['INBOX', 'UNREAD'],
              snippet: 'This is a test message...',
              payload: {
                headers: [
                  { name: 'Subject', value: 'Test Subject' },
                  { name: 'From', value: 'sender@example.com' },
                  { name: 'To', value: 'recipient@example.com' },
                  { name: 'Date', value: 'Mon, 1 Jan 2024 10:00:00 +0000' },
                ],
                body: {
                  data: 'VGhpcyBpcyB0aGUgbWVzc2FnZSBib2R5',
                },
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getMessage({
      messageId: 'msg123',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Message ID: msg123');
    expect(result.content[0].text).toContain('Thread ID: thread123');
    expect(result.content[0].text).toContain('Subject: Test Subject');
    expect(result.content[0].text).toContain('From: sender@example.com');

    expect(mockGmail.users.messages.get).toHaveBeenCalledWith({
      userId: 'me',
      id: 'msg123',
      format: 'full',
    });
  });

  it('should handle message with attachments', async () => {
    const mockGmail = {
      users: {
        messages: {
          get: vi.fn().mockResolvedValue({
            data: {
              id: 'msg123',
              threadId: 'thread123',
              payload: {
                headers: [
                  { name: 'Subject', value: 'Message with attachment' },
                  { name: 'From', value: 'sender@example.com' },
                  { name: 'To', value: 'recipient@example.com' },
                  { name: 'Date', value: 'Mon, 1 Jan 2024 10:00:00 +0000' },
                ],
                parts: [
                  {
                    filename: 'document.pdf',
                    mimeType: 'application/pdf',
                    body: {
                      attachmentId: 'att123',
                      size: 102400,
                    },
                  },
                ],
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getMessage({
      messageId: 'msg123',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Attachments (1)');
    expect(result.content[0].text).toContain('document.pdf');
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        messages: {
          get: vi.fn().mockRejectedValue(new Error('Message not found')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await getMessage({
      messageId: 'invalid',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
