import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { insertAcl } from '../calendar/acl/calendar_acl_insert.js';

vi.mock('googleapis');

describe('calendar_acl_insert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add ACL rule for user scope', async () => {
    const mockCalendar = {
      acl: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'user:john@example.com',
            role: 'writer',
            scope: {
              type: 'user',
              value: 'john@example.com',
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertAcl({
      calendarId: 'team@example.com',
      role: 'writer',
      scopeType: 'user',
      scopeValue: 'john@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Access control rule added successfully');
    expect(result.content[0].text).toContain('team@example.com');
    expect(result.content[0].text).toContain('WRITER');
    expect(result.content[0].text).toContain('john@example.com');
    expect(result.content[0].text).toContain('Notification email sent');

    expect(mockCalendar.acl.insert).toHaveBeenCalledWith({
      calendarId: 'team@example.com',
      sendNotifications: true,
      requestBody: {
        role: 'writer',
        scope: {
          type: 'user',
          value: 'john@example.com',
        },
      },
    });
  });

  it('should add ACL rule for group scope', async () => {
    const mockCalendar = {
      acl: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'group:team@example.com',
            role: 'reader',
            scope: {
              type: 'group',
              value: 'team@example.com',
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertAcl({
      calendarId: 'shared@example.com',
      role: 'reader',
      scopeType: 'group',
      scopeValue: 'team@example.com',
      sendNotifications: false,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('READER');
    expect(result.content[0].text).toContain('group');
    expect(result.content[0].text).not.toContain('Notification email sent');

    expect(mockCalendar.acl.insert).toHaveBeenCalledWith({
      calendarId: 'shared@example.com',
      sendNotifications: false,
      requestBody: {
        role: 'reader',
        scope: {
          type: 'group',
          value: 'team@example.com',
        },
      },
    });
  });

  it('should add ACL rule for domain scope', async () => {
    const mockCalendar = {
      acl: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'domain:example.com',
            role: 'freeBusyReader',
            scope: {
              type: 'domain',
              value: 'example.com',
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertAcl({
      calendarId: 'company@example.com',
      role: 'freeBusyReader',
      scopeType: 'domain',
      scopeValue: 'example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('FREEBUSYREADER');
    expect(result.content[0].text).toContain('domain');
    expect(result.content[0].text).toContain('example.com');
  });

  it('should add ACL rule for default (public) scope', async () => {
    const mockCalendar = {
      acl: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'default',
            role: 'reader',
            scope: {
              type: 'default',
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertAcl({
      calendarId: 'public@example.com',
      role: 'reader',
      scopeType: 'default',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('default');

    expect(mockCalendar.acl.insert).toHaveBeenCalledWith({
      calendarId: 'public@example.com',
      sendNotifications: true,
      requestBody: {
        role: 'reader',
        scope: {
          type: 'default',
          value: undefined,
        },
      },
    });
  });

  it('should return error when scopeValue is missing for user/group/domain', async () => {
    const mockCalendar = {
      acl: {
        insert: vi.fn(),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertAcl({
      calendarId: 'test@example.com',
      role: 'writer',
      scopeType: 'user',
      // scopeValue is missing
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('scopeValue is required');

    expect(mockCalendar.acl.insert).not.toHaveBeenCalled();
  });
});
