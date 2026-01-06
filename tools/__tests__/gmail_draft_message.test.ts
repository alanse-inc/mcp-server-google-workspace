import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { draftMessage } from '../gmail/send/gmail_draft_message.js';

vi.mock('googleapis');

describe('gmail_draft_message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a draft successfully', async () => {
    const mockGmail = {
      users: {
        drafts: {
          create: vi.fn().mockResolvedValue({
            data: {
              id: 'draft123',
              message: {
                id: 'msg123',
                threadId: 'thread123',
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await draftMessage({
      subject: 'Draft Subject',
      body: 'Draft body content',
      to: 'recipient@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Draft created successfully');
    expect(result.content[0].text).toContain('draft123');
    expect(result.content[0].text).toContain('Subject: Draft Subject');

    expect(mockGmail.users.drafts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'me',
        requestBody: expect.objectContaining({
          message: expect.objectContaining({
            raw: expect.any(String),
          }),
        }),
      })
    );
  });

  it('should create draft without recipients', async () => {
    const mockGmail = {
      users: {
        drafts: {
          create: vi.fn().mockResolvedValue({
            data: {
              id: 'draft456',
              message: {
                id: 'msg456',
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await draftMessage({
      subject: 'Draft without To',
      body: 'Body content',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Draft created successfully');
  });

  it('should create HTML draft', async () => {
    const mockGmail = {
      users: {
        drafts: {
          create: vi.fn().mockResolvedValue({
            data: {
              id: 'draft789',
              message: {
                id: 'msg789',
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await draftMessage({
      subject: 'HTML Draft',
      body: '<h1>Hello</h1>',
      bodyFormat: 'html',
      to: 'recipient@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Format: html');
  });

  it('should create draft with CC and BCC', async () => {
    const mockGmail = {
      users: {
        drafts: {
          create: vi.fn().mockResolvedValue({
            data: {
              id: 'draft999',
              message: {
                id: 'msg999',
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await draftMessage({
      subject: 'Draft with CC/BCC',
      body: 'Body',
      to: 'recipient@example.com',
      cc: 'cc@example.com',
      bcc: 'bcc@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('CC: cc@example.com');
    expect(result.content[0].text).toContain('BCC: bcc@example.com');
  });

  it('should create draft as reply', async () => {
    const mockGmail = {
      users: {
        drafts: {
          create: vi.fn().mockResolvedValue({
            data: {
              id: 'draft111',
              message: {
                id: 'msg111',
                threadId: 'thread123',
              },
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await draftMessage({
      subject: 'Re: Original',
      body: 'Reply draft',
      threadId: 'thread123',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Reply to thread: thread123');

    expect(mockGmail.users.drafts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          message: expect.objectContaining({
            threadId: 'thread123',
          }),
        }),
      })
    );
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        drafts: {
          create: vi.fn().mockRejectedValue(new Error('Draft creation failed')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await draftMessage({
      subject: 'Failed Draft',
      body: 'Body',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
