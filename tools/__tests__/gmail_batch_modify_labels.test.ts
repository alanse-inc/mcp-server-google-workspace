import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { batchModifyLabels } from '../gmail/batch/gmail_batch_modify_labels.js';

vi.mock('googleapis');

describe('gmail_batch_modify_labels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add labels to multiple messages successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          batchModify: vi.fn().mockResolvedValue({}),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await batchModifyLabels({
      messageIds: ['msg1', 'msg2', 'msg3'],
      addLabelIds: ['STARRED', 'IMPORTANT'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully modified labels on 3 message(s)');
    expect(result.content[0].text).toContain('Added labels: STARRED, IMPORTANT');

    expect(mockGmail.users.messages.batchModify).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        ids: ['msg1', 'msg2', 'msg3'],
        addLabelIds: ['STARRED', 'IMPORTANT'],
        removeLabelIds: undefined,
      },
    });
  });

  it('should remove labels from multiple messages successfully', async () => {
    const mockGmail = {
      users: {
        messages: {
          batchModify: vi.fn().mockResolvedValue({}),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await batchModifyLabels({
      messageIds: ['msg1', 'msg2'],
      removeLabelIds: ['UNREAD', 'SPAM'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Removed labels: UNREAD, SPAM');

    expect(mockGmail.users.messages.batchModify).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        ids: ['msg1', 'msg2'],
        addLabelIds: undefined,
        removeLabelIds: ['UNREAD', 'SPAM'],
      },
    });
  });

  it('should add and remove labels simultaneously', async () => {
    const mockGmail = {
      users: {
        messages: {
          batchModify: vi.fn().mockResolvedValue({}),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await batchModifyLabels({
      messageIds: ['msg1', 'msg2'],
      addLabelIds: ['STARRED'],
      removeLabelIds: ['UNREAD'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Added labels: STARRED');
    expect(result.content[0].text).toContain('Removed labels: UNREAD');
  });

  it('should fail with empty message IDs array', async () => {
    const result = await batchModifyLabels({
      messageIds: [],
      addLabelIds: ['STARRED'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('messageIds array cannot be empty');
  });

  it('should fail with too many message IDs', async () => {
    const messageIds = Array.from({ length: 1001 }, (_, i) => `msg${i}`);

    const result = await batchModifyLabels({
      messageIds,
      addLabelIds: ['STARRED'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Too many message IDs');
  });

  it('should fail when no labels provided', async () => {
    const result = await batchModifyLabels({
      messageIds: ['msg1', 'msg2'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('At least one of addLabelIds or removeLabelIds must be provided');
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        messages: {
          batchModify: vi.fn().mockRejectedValue(new Error('Batch modify failed')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await batchModifyLabels({
      messageIds: ['msg1'],
      addLabelIds: ['STARRED'],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
