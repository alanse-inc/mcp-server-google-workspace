import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { modifyLabels } from '../gmail/labels/gmail_modify_labels.js';

vi.mock('googleapis');

describe('gmail_modify_labels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add labels to message successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          modify: vi.fn().mockResolvedValue({
            data: {
              id: 'msg123',
              labelIds: ['INBOX', 'STARRED', 'IMPORTANT'],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await modifyLabels({
      messageId: 'msg123',
      addLabelIds: ['STARRED', 'IMPORTANT'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully modified labels');
    expect(result.content[0].text).toContain('Added labels: STARRED, IMPORTANT');

    expect(mockGmail.users.messages.modify).toHaveBeenCalledWith({
      userId: 'me',
      id: 'msg123',
      requestBody: {
        addLabelIds: ['STARRED', 'IMPORTANT'],
        removeLabelIds: undefined,
      },
    });
  });

  it('should remove labels from message successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          modify: vi.fn().mockResolvedValue({
            data: {
              id: 'msg123',
              labelIds: ['INBOX'],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await modifyLabels({
      messageId: 'msg123',
      removeLabelIds: ['UNREAD', 'SPAM'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Removed labels: UNREAD, SPAM');

    expect(mockGmail.users.messages.modify).toHaveBeenCalledWith({
      userId: 'me',
      id: 'msg123',
      requestBody: {
        addLabelIds: undefined,
        removeLabelIds: ['UNREAD', 'SPAM'],
      },
    });
  });

  it('should add and remove labels simultaneously', async () => {
    const mockGmail = {
      users: {
        messages: {
          modify: vi.fn().mockResolvedValue({
            data: {
              id: 'msg123',
              labelIds: ['INBOX', 'STARRED'],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await modifyLabels({
      messageId: 'msg123',
      addLabelIds: ['STARRED'],
      removeLabelIds: ['UNREAD'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Added labels: STARRED');
    expect(result.content[0].text).toContain('Removed labels: UNREAD');
  });

  it('should fail when no labels provided', async () => {
    const result = await modifyLabels({
      messageId: 'msg123',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('At least one of addLabelIds or removeLabelIds must be provided');
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        messages: {
          modify: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await modifyLabels({
      messageId: 'msg123',
      addLabelIds: ['STARRED'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
