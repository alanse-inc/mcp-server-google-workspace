import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { queryFreeBusy } from '../calendar/freebusy/calendar_freebusy_query.js';

vi.mock('googleapis');

describe('calendar_freebusy_query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should query free/busy successfully', async () => {
    const mockCalendar = {
      freebusy: {
        query: vi.fn().mockResolvedValue({
          data: {
            timeMin: '2024-01-15T00:00:00Z',
            timeMax: '2024-01-15T23:59:59Z',
            calendars: {
              'primary': {
                busy: [
                  {
                    start: '2024-01-15T10:00:00Z',
                    end: '2024-01-15T11:00:00Z',
                  },
                  {
                    start: '2024-01-15T14:00:00Z',
                    end: '2024-01-15T15:00:00Z',
                  },
                ],
              },
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await queryFreeBusy({
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-15T23:59:59Z',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Free/Busy query results');
    expect(result.content[0].text).toContain('Busy periods (2)');

    expect(mockCalendar.freebusy.query).toHaveBeenCalledWith({
      requestBody: {
        timeMin: '2024-01-15T00:00:00Z',
        timeMax: '2024-01-15T23:59:59Z',
        timeZone: 'UTC',
        items: [{ id: 'primary' }],
      },
    });
  });

  it('should query multiple calendars', async () => {
    const mockCalendar = {
      freebusy: {
        query: vi.fn().mockResolvedValue({
          data: {
            timeMin: '2024-01-15T00:00:00Z',
            timeMax: '2024-01-15T23:59:59Z',
            calendars: {
              'primary': {
                busy: [
                  {
                    start: '2024-01-15T10:00:00Z',
                    end: '2024-01-15T11:00:00Z',
                  },
                ],
              },
              'team@example.com': {
                busy: [
                  {
                    start: '2024-01-15T14:00:00Z',
                    end: '2024-01-15T15:00:00Z',
                  },
                ],
              },
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await queryFreeBusy({
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-15T23:59:59Z',
      calendars: ['primary', 'team@example.com'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('primary');
    expect(result.content[0].text).toContain('team@example.com');

    expect(mockCalendar.freebusy.query).toHaveBeenCalledWith({
      requestBody: {
        timeMin: '2024-01-15T00:00:00Z',
        timeMax: '2024-01-15T23:59:59Z',
        timeZone: 'UTC',
        items: [{ id: 'primary' }, { id: 'team@example.com' }],
      },
    });
  });

  it('should handle completely free calendar', async () => {
    const mockCalendar = {
      freebusy: {
        query: vi.fn().mockResolvedValue({
          data: {
            timeMin: '2024-01-15T00:00:00Z',
            timeMax: '2024-01-15T23:59:59Z',
            calendars: {
              'primary': {
                busy: [],
              },
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await queryFreeBusy({
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-15T23:59:59Z',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No busy periods - calendar is free!');
  });

  it('should handle calendar with errors', async () => {
    const mockCalendar = {
      freebusy: {
        query: vi.fn().mockResolvedValue({
          data: {
            timeMin: '2024-01-15T00:00:00Z',
            timeMax: '2024-01-15T23:59:59Z',
            calendars: {
              'invalid@example.com': {
                errors: [
                  {
                    reason: 'notFound',
                    domain: 'calendar',
                  },
                ],
                busy: [],
              },
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await queryFreeBusy({
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-15T23:59:59Z',
      calendars: ['invalid@example.com'],
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Errors:');
    expect(result.content[0].text).toContain('notFound');
  });

  it('should handle custom timezone', async () => {
    const mockCalendar = {
      freebusy: {
        query: vi.fn().mockResolvedValue({
          data: {
            timeMin: '2024-01-15T00:00:00-05:00',
            timeMax: '2024-01-15T23:59:59-05:00',
            calendars: {
              'primary': {
                busy: [],
              },
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await queryFreeBusy({
      timeMin: '2024-01-15T00:00:00-05:00',
      timeMax: '2024-01-15T23:59:59-05:00',
      timeZone: 'America/New_York',
    });

    expect(result.isError).toBe(false);

    expect(mockCalendar.freebusy.query).toHaveBeenCalledWith({
      requestBody: expect.objectContaining({
        timeZone: 'America/New_York',
      }),
    });
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      freebusy: {
        query: vi.fn().mockRejectedValue(new Error('Query failed')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await queryFreeBusy({
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-15T23:59:59Z',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
