import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { sendMessage } from '../gmail/send/gmail_send_message.js';

vi.mock('googleapis');

describe('gmail_send_message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a plain text message successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          send: vi.fn().mockResolvedValue({
            data: {
              id: 'msg123',
              threadId: 'thread123',
              labelIds: ['SENT'],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await sendMessage({
      to: 'recipient@example.com',
      subject: 'Test Email',
      body: 'This is a test message.',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Message sent successfully');
    expect(result.content[0].text).toContain('msg123');
    expect(result.content[0].text).toContain('To: recipient@example.com');
    expect(result.content[0].text).toContain('Subject: Test Email');

    expect(mockGmail.users.messages.send).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'me',
        requestBody: expect.objectContaining({
          raw: expect.any(String),
        }),
      })
    );
  });

  it('should send an HTML message successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          send: vi.fn().mockResolvedValue({
            data: {
              id: 'msg456',
              threadId: 'thread456',
              labelIds: ['SENT'],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await sendMessage({
      to: 'recipient@example.com',
      subject: 'HTML Email',
      body: '<h1>Hello</h1><p>This is HTML</p>',
      bodyFormat: 'html',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Format: html');
  });

  it('should send message with CC and BCC', async () => {
    const mockGmail = {
      users: {
        messages: {
          send: vi.fn().mockResolvedValue({
            data: {
              id: 'msg789',
              threadId: 'thread789',
              labelIds: ['SENT'],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await sendMessage({
      to: 'recipient@example.com',
      subject: 'Test with CC/BCC',
      body: 'Message body',
      cc: 'cc@example.com',
      bcc: 'bcc@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('CC: cc@example.com');
    expect(result.content[0].text).toContain('BCC: bcc@example.com');
  });

  it('should send message as reply', async () => {
    const mockGmail = {
      users: {
        messages: {
          send: vi.fn().mockResolvedValue({
            data: {
              id: 'msg999',
              threadId: 'thread123',
              labelIds: ['SENT'],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await sendMessage({
      to: 'recipient@example.com',
      subject: 'Re: Original Subject',
      body: 'Reply message',
      threadId: 'thread123',
      inReplyTo: '<msg-id-original@example.com>',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Reply to thread: thread123');

    expect(mockGmail.users.messages.send).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          threadId: 'thread123',
        }),
      })
    );
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        messages: {
          send: vi.fn().mockRejectedValue(new Error('Send failed')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await sendMessage({
      to: 'invalid@',
      subject: 'Test',
      body: 'Body',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
