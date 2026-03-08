import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

export type ChatRoom = {
  id: string;
  name: string;
  description?: string;
  unreadCount?: number;
};

export type ChatUser = {
  id: string;
  displayName: string;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  text: string;
  createdAt: string; // ISO string
  author?: ChatUser;

  // UI helpers
  isMine?: boolean;
  status?: 'sending' | 'sent' | 'failed';
};

type GetMessagesOptions = {
  limit?: number;
  before?: string; // ISO or message id / cursor, selon ton backend
};

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  // adapte si tu as déjà baseUrl ailleurs
  private readonly baseUrl = 'https://carecode.be/kmmobile/api';


  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   * Construit des headers JSON + Authorization Bearer
   */
  private async buildHeaders(): Promise<HttpHeaders> {
    // Important pour certains serveurs qui renvoient du HTML si Accept non JSON
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    // On essaie plusieurs méthodes possibles sans casser ton code
    const token =
      (this.auth as any).getAccessToken ? await (this.auth as any).getAccessToken()
      : (this.auth as any).getToken ? await (this.auth as any).getToken()
      : null;

    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  /**
   * GET /chat/rooms
   */
  async getRooms(): Promise<ChatRoom[]> {
    const headers = await this.buildHeaders();

    const raw = await firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/chat_rooms.php`, { headers })
    );

    // Supporte soit un array direct, soit { data: [...] }
    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return (list as any[]).map(this.mapRoom);
  }

  /**
   * GET /chat/rooms/{roomId}/messages?limit=50&before=...
   */
  async getMessages(roomId: string, opts: GetMessagesOptions = {}): Promise<ChatMessage[]> {
    const headers = await this.buildHeaders();

    let params = new HttpParams().set('roomId', String(roomId));
    if (opts.limit) params = params.set('limit', String(opts.limit));
    if (opts.before) params = params.set('before', opts.before);

    const raw = await firstValueFrom(
      this.http.get<any>(
        `${this.baseUrl}/chat_messages.php`,
        { headers, params }
      )
    );

    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return (list as any[]).map((m) => this.mapMessage(m, roomId));
  }

  /**
   * POST /chat/rooms/{roomId}/messages  body: { text }
   */
  async sendMessage(roomId: string, text: string): Promise<ChatMessage> {
    const headers = await this.buildHeaders();

    const raw = await firstValueFrom(
      this.http.post<any>(
        `${this.baseUrl}/chat_post_message.php?roomId=${encodeURIComponent(roomId)}`,
        { text },
        { headers }
      )
    );

    // Supporte soit message direct, soit { data: message }
    const msg = raw?.data ?? raw;
    const mapped = this.mapMessage(msg, roomId);

    // par défaut, on considère que c'est "sent" si le backend répond OK
    mapped.status = 'sent';
    return mapped;
  }

  // -------------------------
  // Mapping tolérant (backend PHP souvent en snake_case)
  // -------------------------

  private mapRoom = (r: any): ChatRoom => {
    return {
      id: String(r.id ?? r.room_id ?? r.slug ?? ''),
      name: String(r.name ?? r.title ?? r.label ?? 'Room'),
      description: r.description ?? r.desc ?? undefined,
      unreadCount: this.toNumberOrUndefined(r.unreadCount ?? r.unread_count),
    };
  };

  private mapMessage = (m: any, fallbackRoomId: string): ChatMessage => {
    const authorId = m.author?.id ?? m.author_id ?? m.user_id ?? m.sender_id ?? null;
    const authorName =
      m.author?.displayName ?? m.author?.name ?? m.author_name ?? m.username ?? m.sender_name ?? null;

    return {
      id: String(m.id ?? m.message_id ?? m.uuid ?? ''),
      roomId: String(m.roomId ?? m.room_id ?? fallbackRoomId),
      text: String(m.text ?? m.message ?? m.body ?? ''),
      createdAt: String(m.createdAt ?? m.created_at ?? m.date ?? new Date().toISOString()),
      author: (authorId || authorName)
        ? { id: String(authorId ?? ''), displayName: String(authorName ?? 'Unknown') }
        : undefined,

      // si le backend te renvoie déjà "isMine", on le respecte
      isMine: typeof m.isMine === 'boolean'
        ? m.isMine
        : (typeof m.is_mine === 'boolean' ? m.is_mine : undefined),

      status: m.status ?? undefined,
    };
  };

  private toNumberOrUndefined(v: any): number | undefined {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
}
