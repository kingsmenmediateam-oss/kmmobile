import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  MyEventApiService,
  MyEventInfoItem,
  MyEventSummary,
} from '../../services/my-event-api.service';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-my-event',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './my-event.page.html',
  styleUrls: ['./my-event.page.scss'],
})
export class MyEventPage implements OnInit {
  events: MyEventSummary[] = [];
  selectedEvent: MyEventSummary | null = null;
  items: MyEventInfoItem[] = [];

  loadingEvents = false;
  loadingItems = false;

  constructor(private myEventApi: MyEventApiService, private app: AppComponent) {}

  tr(key: string): string {
    return this.app.tr(key);
  }

  async ngOnInit(): Promise<void> {
    await this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    this.loadingEvents = true;
    try {
      this.events = await this.myEventApi.getMyEvents();
      if (this.events.length > 0) {
        await this.selectEvent(this.events[0]);
      }
    } finally {
      this.loadingEvents = false;
    }
  }

  async selectEvent(eventItem: MyEventSummary): Promise<void> {
    if (this.selectedEvent?.id === eventItem.id) return;
    this.selectedEvent = eventItem;

    this.loadingItems = true;
    try {
      this.items = await this.myEventApi.getEventItems(eventItem.id);
    } finally {
      this.loadingItems = false;
    }
  }

  typeLabel(type: MyEventInfoItem['type']): string {
    switch (type) {
      case 'pin':  return this.tr('eventTypePin');
      case 'song': return this.tr('eventTypeSong');
      case 'file': return this.tr('eventTypeFile');
      case 'poll': return this.tr('eventTypePoll');
      default:     return this.tr('eventTypeInfo');
    }
  }

  trackByItemId(_: number, item: MyEventInfoItem): string {
    return item.id;
  }
}
