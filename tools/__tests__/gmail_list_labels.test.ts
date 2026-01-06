import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { listLabels } from '../gmail/basic/gmail_list_labels.js';

vi.mock('googleapis');

describe('gmail_list_labels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list all Gmail labels successfully', async () => {
    const mockGmail = {
      users: {
        labels: {
          list: vi.fn().mockResolvedValue({
            data: {
              labels: [
                { id: 'INBOX', name: 'INBOX', type: 'system' },
                { id: 'SENT', name: 'SENT', type: 'system' },
                { id: 'Label_1', name: 'Work', type: 'user' },
                { id: 'Label_2', name: 'Personal', type: 'user' },
              ],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await listLabels({});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Total labels: 4');
    expect(result.content[0].text).toContain('System Labels (2)');
    expect(result.content[0].text).toContain('User Labels (2)');
    expect(result.content[0].text).toContain('INBOX');
    expect(result.content[0].text).toContain('Work');

    expect(mockGmail.users.labels.list).toHaveBeenCalledWith({
      userId: 'me',
    });
  });

  it('should handle empty label list', async () => {
    const mockGmail = {
      users: {
        labels: {
          list: vi.fn().mockResolvedValue({
            data: {
              labels: [],
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await listLabels({});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No labels found');
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        labels: {
          list: vi.fn().mockRejectedValue(new Error('API error')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await listLabels({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
