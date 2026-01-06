import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { listAcl } from '../calendar/acl/calendar_acl_list.js';

vi.mock('googleapis');

describe('calendar_acl_list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list ACL rules successfully', async () => {
    const mockCalendar = {
      acl: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'user:john@example.com',
                role: 'owner',
                scope: {
                  type: 'user',
                  value: 'john@example.com',
                },
              },
              {
                id: 'user:jane@example.com',
                role: 'writer',
                scope: {
                  type: 'user',
                  value: 'jane@example.com',
                },
              },
              {
                id: 'group:team@example.com',
                role: 'reader',
                scope: {
                  type: 'group',
                  value: 'team@example.com',
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listAcl({
      calendarId: 'team@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Calendar Access Control List');
    expect(result.content[0].text).toContain('3 rules');
    expect(result.content[0].text).toContain('OWNER');
    expect(result.content[0].text).toContain('john@example.com');
    expect(result.content[0].text).toContain('WRITER');
    expect(result.content[0].text).toContain('jane@example.com');
    expect(result.content[0].text).toContain('READER');
    expect(result.content[0].text).toContain('team@example.com');

    expect(mockCalendar.acl.list).toHaveBeenCalledWith({
      calendarId: 'team@example.com',
      maxResults: undefined,
      pageToken: undefined,
      showDeleted: undefined,
    });
  });

  it('should handle pagination', async () => {
    const mockCalendar = {
      acl: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'user:test@example.com',
                role: 'writer',
                scope: {
                  type: 'user',
                  value: 'test@example.com',
                },
              },
            ],
            nextPageToken: 'next-token-acl-123',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listAcl({
      calendarId: 'primary',
      maxResults: 10,
      pageToken: 'current-token',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('next-token-acl-123');

    expect(mockCalendar.acl.list).toHaveBeenCalledWith({
      calendarId: 'primary',
      maxResults: 10,
      pageToken: 'current-token',
      showDeleted: undefined,
    });
  });

  it('should include deleted entries when requested', async () => {
    const mockCalendar = {
      acl: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'user:active@example.com',
                role: 'reader',
                scope: {
                  type: 'user',
                  value: 'active@example.com',
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listAcl({
      calendarId: 'work@example.com',
      showDeleted: true,
    });

    expect(result.isError).toBe(false);

    expect(mockCalendar.acl.list).toHaveBeenCalledWith({
      calendarId: 'work@example.com',
      maxResults: undefined,
      pageToken: undefined,
      showDeleted: true,
    });
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      acl: {
        list: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listAcl({
      calendarId: 'forbidden@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
