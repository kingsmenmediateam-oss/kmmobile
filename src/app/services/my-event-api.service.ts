import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type MyEventSummary = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  role?: string;
};

export type MyEventInfoType = 'pin' | 'song' | 'file' | 'poll';

export type MyEventInfoItem = {
  id: string;
  eventId: string;
  type: MyEventInfoType;
  title: string;
  body: string;
  fileUrl: string | null;
  pollOptions: string[];
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class MyEventApiService {
  private readonly baseUrl = 'https://carecode.be/kmmobile/api';

  constructor(private http: HttpClient) {}

  async getMyEvents(): Promise<MyEventSummary[]> {
    const raw = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/my_events.php`));
    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return (list as any[]).map((eventItem: any) => ({
      id: String(eventItem.id ?? ''),
      name: String(eventItem.name ?? 'Event'),
      startsAt: String(eventItem.startsAt ?? eventItem.starts_at ?? ''),
      endsAt: String(eventItem.endsAt ?? eventItem.ends_at ?? ''),
      role: eventItem.role ? String(eventItem.role) : undefined,
    }));
  }

  async getEventItems(eventId: string): Promise<MyEventInfoItem[]> {
    const raw = await firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/my_event_items.php?eventId=${encodeURIComponent(eventId)}`)
    );

    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return (list as any[]).map((item: any) => ({
      id: String(item.id ?? ''),
      eventId: String(item.eventId ?? item.event_id ?? eventId),
      type: this.toType(item.type ?? item.item_type),
      title: String(item.title ?? 'Information'),
      body: String(item.body ?? ''),
      fileUrl: item.fileUrl ?? item.file_url ?? null,
      pollOptions: Array.isArray(item.pollOptions ?? item.poll_options)
        ? (item.pollOptions ?? item.poll_options).map((option: unknown) => String(option))
        : [],
      createdAt: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
    }));
  }

  private toType(input: unknown): MyEventInfoType {
    const value = String(input ?? '').toLowerCase();
    if (value === 'song' || value === 'file' || value === 'poll') return value;
    return 'pin';
  }
}
