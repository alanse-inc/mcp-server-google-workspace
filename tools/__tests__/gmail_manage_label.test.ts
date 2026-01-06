import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { manageLabel } from '../gmail/labels/gmail_manage_label.js';

vi.mock('googleapis');

describe('gmail_manage_label', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new label successfully', async () => {
    const mockGmail = {
      users: {
        labels: {
          create: vi.fn().mockResolvedValue({
            data: {
              id: 'Label_123',
              name: 'Project Alpha',
              labelListVisibility: 'labelShow',
              messageListVisibility: 'show',
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await manageLabel({
      action: 'create',
      name: 'Project Alpha',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully created label');
    expect(result.content[0].text).toContain('Label_123');
    expect(result.content[0].text).toContain('Project Alpha');

    expect(mockGmail.users.labels.create).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        name: 'Project Alpha',
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
    });
  });

  it('should update an existing label successfully', async () => {
    const mockGmail = {
      users: {
        labels: {
          update: vi.fn().mockResolvedValue({
            data: {
              id: 'Label_123',
              name: 'Project Beta',
              labelListVisibility: 'labelHide',
              messageListVisibility: 'hide',
            },
          }),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await manageLabel({
      action: 'update',
      labelId: 'Label_123',
      name: 'Project Beta',
      labelListVisibility: 'labelHide',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully updated label');
    expect(result.content[0].text).toContain('Project Beta');

    expect(mockGmail.users.labels.update).toHaveBeenCalledWith({
      userId: 'me',
      id: 'Label_123',
      requestBody: {
        name: 'Project Beta',
        labelListVisibility: 'labelHide',
      },
    });
  });

  it('should delete a label successfully', async () => {
    const mockGmail = {
      users: {
        labels: {
          delete: vi.fn().mockResolvedValue({}),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await manageLabel({
      action: 'delete',
      labelId: 'Label_123',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Successfully deleted label');

    expect(mockGmail.users.labels.delete).toHaveBeenCalledWith({
      userId: 'me',
      id: 'Label_123',
    });
  });

  it('should fail create without name', async () => {
    const result = await manageLabel({
      action: 'create',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Label name is required');
  });

  it('should fail update without labelId', async () => {
    const result = await manageLabel({
      action: 'update',
      name: 'New Name',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Label ID is required');
  });

  it('should handle errors gracefully', async () => {
    const mockGmail = {
      users: {
        labels: {
          create: vi.fn().mockRejectedValue(new Error('Label already exists')),
        },
      },
    };

    vi.mocked(google.gmail).mockReturnValue(mockGmail as any);

    const result = await manageLabel({
      action: 'create',
      name: 'Duplicate',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
