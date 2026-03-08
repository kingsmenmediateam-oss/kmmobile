import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// relative path corrected: service sits in app/services so two levels up to reach environments
import { environment } from '../../environments/environment';

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/calendar_events.php`;

  constructor(private http: HttpClient) { }

  /**
   * Get all events for a specific month
   * @param year The year (e.g., 2026)
   * @param month The month (1-12)
   * @returns Observable of CalendarEvent array
   */
  getEventsByMonth(year: number, month: number): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(
      `${this.apiUrl}?action=getByMonth&year=${year}&month=${month}`
    );
  }

  /**
   * Get all events for a specific date
   * @param date The date in format YYYY-MM-DD
   * @returns Observable of CalendarEvent array
   */
  getEventsByDate(date: string): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(
      `${this.apiUrl}?action=getByDate&date=${date}`
    );
  }

  /**
   * Get a specific event by ID
   * @param id The event ID
   * @returns Observable of CalendarEvent
   */
  getEvent(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(
      `${this.apiUrl}?action=get&id=${id}`
    );
  }

  /**
   * Get all upcoming events
   * @returns Observable of CalendarEvent array
   */
  getUpcomingEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(
      `${this.apiUrl}?action=getUpcoming`
    );
  }

  /**
   * Create a new event
   * @param event The event data to create
   * @returns Observable of the created event
   */
  createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(
      `${this.apiUrl}?action=create`,
      event
    );
  }

  /**
   * Update an existing event
   * @param id The event ID
   * @param event The updated event data
   * @returns Observable of the updated event
   */
  updateEvent(id: number, event: Partial<CalendarEvent>): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(
      `${this.apiUrl}?action=update&id=${id}`,
      event
    );
  }

  /**
   * Delete an event
   * @param id The event ID
   * @returns Observable of the response
   */
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}?action=delete&id=${id}`
    );
  }
}
