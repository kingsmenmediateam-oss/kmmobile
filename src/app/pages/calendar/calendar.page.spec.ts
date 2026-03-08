import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarPage } from './calendar.page';
import { CalendarService } from '../../services/calendar.service';
import { of } from 'rxjs';

describe('CalendarPage', () => {
  let component: CalendarPage;
  let fixture: ComponentFixture<CalendarPage>;
  let calendarService: jasmine.SpyObj<CalendarService>;

  beforeEach(async () => {
    const calendarServiceSpy = jasmine.createSpyObj('CalendarService', ['getEventsByMonth']);

    await TestBed.configureTestingModule({
      imports: [CalendarPage],
      providers: [{ provide: CalendarService, useValue: calendarServiceSpy }]
    }).compileComponents();

    calendarService = TestBed.inject(CalendarService) as jasmine.SpyObj<CalendarService>;
    fixture = TestBed.createComponent(CalendarPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load calendar on init', () => {
    calendarService.getEventsByMonth.and.returnValue(of([]));
    fixture.detectChanges();
    expect(calendarService.getEventsByMonth).toHaveBeenCalled();
  });

  it('should generate calendar days', () => {
    component.generateCalendar();
    expect(component.calendarDays.length).toBe(42); // 6 weeks * 7 days
  });

  it('should navigate to previous month', () => {
    calendarService.getEventsByMonth.and.returnValue(of([]));
    const initialMonth = component.currentDate.getMonth();
    component.previousMonth();
    expect(component.currentDate.getMonth()).toBe(initialMonth - 1);
  });

  it('should navigate to next month', () => {
    calendarService.getEventsByMonth.and.returnValue(of([]));
    const initialMonth = component.currentDate.getMonth();
    component.nextMonth();
    expect(component.currentDate.getMonth()).toBe(initialMonth + 1);
  });

  it('should identify today correctly', () => {
    const today = new Date();
    expect(component.isToday(today)).toBe(true);
  });
});
