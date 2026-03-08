import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { IonContent } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { happyOutline, sendOutline } from 'ionicons/icons';

import { ChatApiService, ChatMessage, ChatRoom } from '../../services/chat-api.service';

type ReplyReference = {
  author: string;
  snippet: string;
};

type UiChatMessage = ChatMessage & {
  replyTo: ReplyReference | null;
  bodyText: string;
};

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  rooms: ChatRoom[] = [];
  selectedRoom: ChatRoom | null = null;
  messages: UiChatMessage[] = [];

  loadingRooms = false;
  loadingMessages = false;
  sending = false;
  draft = '';
  replyTarget: UiChatMessage | null = null;
  emojiPickerOpen = false;
  readonly quickEmojis: string[] = [
    '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎',
    '🤝', '👏', '🙏', '👍', '👎', '❤️', '🔥', '🎉',
  ];
  private requestedRoomId: string | null = null;

  private pollingSub?: Subscription;

  constructor(
    private chatApi: ChatApiService,
    private route: ActivatedRoute
  ) {
    addIcons({ happyOutline, sendOutline });
  }

  async ngOnInit() {
    this.requestedRoomId = this.route.snapshot.queryParamMap.get('roomId');
    await this.loadRooms();
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  async loadRooms() {
    this.loadingRooms = true;
    try {
      this.rooms = await this.chatApi.getRooms();
      if (!this.selectedRoom && this.rooms.length > 0) {
        if (this.requestedRoomId) {
          const room = this.rooms.find((r) => String(r.id) === String(this.requestedRoomId));
          if (room) {
            await this.selectRoom(room);
            return;
          }
        }
        await this.selectRoom(this.rooms[0]);
      }
    } finally {
      this.loadingRooms = false;
    }
  }

  async selectRoom(room: ChatRoom) {
    if (this.selectedRoom?.id === room.id) return;

    this.selectedRoom = room;
    await this.loadMessages(true);

    this.pollingSub?.unsubscribe();
    this.pollingSub = interval(5000)
      .pipe(switchMap(() => this.chatApi.getMessages(room.id, { limit: 50 })))
      .subscribe(msgs => {
        void this.setMessages(msgs);
      });
  }

  async loadMessages(scrollBottom = false) {
    if (!this.selectedRoom) return;
    this.loadingMessages = true;
    try {
      const msgs = await this.chatApi.getMessages(this.selectedRoom.id, { limit: 50 });
      await this.setMessages(msgs, scrollBottom);
    } finally {
      this.loadingMessages = false;
    }
  }

  async send() {
    const plainText = this.draft.trim();
    if (!plainText || !this.selectedRoom || this.sending) return;

    this.sending = true;
    const messageText = this.composeOutgoingText(plainText);
    this.draft = '';
    this.emojiPickerOpen = false;
    this.replyTarget = null;

    const temp: ChatMessage = {
      id: `tmp_${Date.now()}`,
      roomId: this.selectedRoom.id,
      text: messageText,
      createdAt: new Date().toISOString(),
      isMine: true,
      status: 'sending',
      author: { id: 'me', displayName: 'Me' },
    };

    await this.setMessages([...this.messages, temp], true);

    try {
      const saved = await this.chatApi.sendMessage(this.selectedRoom.id, messageText);
      await this.setMessages(this.messages.map(m => (m.id === temp.id ? saved : m)));
    } catch {
      temp.status = 'failed';
      // optionnel: forcer refresh
    } finally {
      this.sending = false;
    }
  }

  private async scrollToBottom() { 
    try {
      await this.content.scrollToBottom(250);
    } catch {}
  }

  toggleEmojiPicker(): void {
    this.emojiPickerOpen = !this.emojiPickerOpen;
  }

  appendEmoji(emoji: string): void {
    this.draft = `${this.draft}${emoji}`;
  }

  startReply(message: UiChatMessage): void {
    this.replyTarget = message;
    this.emojiPickerOpen = false;
  }

  cancelReply(): void {
    this.replyTarget = null;
  }

  private composeOutgoingText(text: string): string {
    if (!this.replyTarget) return text;

    const author = this.replyTarget.author?.displayName?.trim() || 'Utilisateur';
    const snippet = this.formatReplySnippet(this.replyTarget.bodyText || this.replyTarget.text);
    return `Reponse a ${author}: ${snippet}\n${text}`;
  }

  private formatReplySnippet(text: string, maxLength = 80): string {
    const compact = text.replace(/\s+/g, ' ').trim();
    if (compact.length <= maxLength) return compact;
    return `${compact.slice(0, maxLength - 3)}...`;
  }

  private parseReply(text: string): { replyTo: ReplyReference | null; bodyText: string } {
    const match = text.match(/^Reponse a\s+(.+?):\s+(.+)\n([\s\S]*)$/);
    if (!match) {
      return { replyTo: null, bodyText: text };
    }

    const author = match[1].trim();
    const snippet = match[2].trim();
    const bodyText = match[3].trimStart();
    return {
      replyTo: { author, snippet },
      bodyText: bodyText || text,
    };
  }

  private toUiMessage(message: ChatMessage | UiChatMessage): UiChatMessage {
    const parsed = this.parseReply(message.text);
    return {
      ...message,
      replyTo: parsed.replyTo,
      bodyText: parsed.bodyText,
    };
  }

  private async setMessages(nextMessages: Array<ChatMessage | UiChatMessage>, forceScroll = false): Promise<void> {
    const previousLength = this.messages.length;
    const previousLastId = this.messages[previousLength - 1]?.id ?? null;
    const shouldStickToBottom = forceScroll || await this.isNearBottom();

    this.messages = nextMessages.map((message) => this.toUiMessage(message));

    const nextLength = this.messages.length;
    const nextLastId = this.messages[nextLength - 1]?.id ?? null;
    const hasNewTailMessage =
      nextLength > previousLength ||
      (nextLastId !== null && nextLastId !== previousLastId);

    if (forceScroll || (hasNewTailMessage && shouldStickToBottom)) {
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  private async isNearBottom(thresholdPx = 120): Promise<boolean> {
    try {
      if (!this.content) return true;
      const el = await this.content.getScrollElement();
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      return remaining <= thresholdPx;
    } catch {
      return true;
    }
  }
}
