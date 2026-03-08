import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CalendarService } from './calendar.service';
import { environment } from '../../../environments/environment';

describe('CalendarService', () => {
  let service: CalendarService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/calendar_events.php`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CalendarService]
    });
    service = TestBed.inject(CalendarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get events by month', () => {
    const mockEvents = [
      { id: 1, title: 'Event 1', description: 'Test', event_date: '2026-03-15', start_time: '10:00', end_time: '12:00' }
    ];

    service.getEventsByMonth(2026, 3).subscribe(events => {
      expect(events.length).toBe(1);
      expect(events[0].title).toBe('Event 1');
    });

    const req = httpMock.expectOne(`${apiUrl}?action=getByMonth&year=2026&month=3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should get events by date', () => {
    const mockEvents = [
      { id: 1, title: 'Event 1', description: 'Test', event_date: '2026-03-15', start_time: '10:00', end_time: '12:00' }
    ];

    service.getEventsByDate('2026-03-15').subscribe(events => {
      expect(events.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}?action=getByDate&date=2026-03-15`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should get a specific event', () => {
    const mockEvent = { id: 1, title: 'Event 1', description: 'Test', event_date: '2026-03-15', start_time: '10:00', end_time: '12:00' };

    service.getEvent(1).subscribe(event => {
      expect(event.id).toBe(1);
      expect(event.title).toBe('Event 1');
    });

    const req = httpMock.expectOne(`${apiUrl}?action=get&id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvent);
  });

  it('should get upcoming events', () => {
    const mockEvents = [
      { id: 1, title: 'Event 1', description: 'Test', event_date: '2026-03-15', start_time: '10:00', end_time: '12:00' }
    ];

    service.getUpcomingEvents().subscribe(events => {
      expect(events.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}?action=getUpcoming`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should create an event', () => {
    const newEvent = { title: 'New Event', description: 'Test', event_date: '2026-03-20', start_time: '14:00', end_time: '16:00' };
    const mockResponse = { id: 2, ...newEvent };

    service.createEvent(newEvent).subscribe(event => {
      expect(event.id).toBe(2);
    });

    const req = httpMock.expectOne(`${apiUrl}?action=create`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update an event', () => {
    const updatedData = { title: 'Updated Event' };
    const mockResponse = { id: 1, title: 'Updated Event', description: 'Test', event_date: '2026-03-15', start_time: '10:00', end_time: '12:00' };

    service.updateEvent(1, updatedData).subscribe(event => {
      expect(event.title).toBe('Updated Event');
    });

    const req = httpMock.expectOne(`${apiUrl}?action=update&id=1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should delete an event', () => {
    service.deleteEvent(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}?action=delete&id=1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
