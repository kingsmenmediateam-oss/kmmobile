import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonButtons, IonMenuButton, IonModal } from '@ionic/angular/standalone';
import { CalendarService } from '../../services/calendar.service';
import { addIcons } from 'ionicons';
import { chevronBack, chevronForward } from 'ionicons/icons';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
}

interface CalendarDay {
  date: Date;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonMenuButton,
    IonModal,
    // IonGrid, IonRow, IonCol are not used in the template so they were removed
  ],
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  events: CalendarEvent[] = [];
  monthName: string = '';
  weekDays: string[] = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  isLoading: boolean = false;
  selectedEvent: CalendarEvent | null = null;
  swipeFeedbackClass: 'swipe-feedback-left' | 'swipe-feedback-right' | '' = '';
  private touchStartX: number | null = null;
  private touchStartY: number | null = null;
  private readonly swipeThresholdPx = 50;
  private swipeFeedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private calendarService: CalendarService) {
    addIcons({ chevronBack, chevronForward });
  }

  ngOnInit(): void {
    this.loadCalendar();
  }

  loadCalendar(): void {
    this.isLoading = true;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.calendarService.getEventsByMonth(year, month + 1).subscribe({
      next: (events: CalendarEvent[]) => {
        this.events = events;
        this.generateCalendar();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading calendar events:', error);
        this.generateCalendar();
        this.isLoading = false;
      }
    });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Update month name
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    this.monthName = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0

    this.calendarDays = [];

    // Add days from previous month
    const previousMonth = new Date(year, month, 0);
    const daysInPreviousMonth = previousMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPreviousMonth - i;
      this.calendarDays.push({
        date: new Date(year, month - 1, day),
        day,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
        events: []
      });
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = this.formatDateForComparison(date);
      const dayEvents = this.events.filter(event => 
        this.formatDateForComparison(new Date(event.event_date)) === dateString
      );

      this.calendarDays.push({
        date,
        day: i,
        month,
        year,
        isCurrentMonth: true,
        events: dayEvents
      });
    }

    // Add days from next month
    const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: new Date(year, month + 1, i),
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
        events: []
      });
    }
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.loadCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.loadCalendar();
  }

  onTouchStart(event: TouchEvent): void {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches?.[0];
    if (!touch || this.touchStartX === null || this.touchStartY === null) return;

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    this.touchStartX = null;
    this.touchStartY = null;

    // Prioritize horizontal gestures and ignore short swipes.
    if (Math.abs(deltaX) < this.swipeThresholdPx || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      this.triggerSwipeFeedback('left');
      this.nextMonth();
      return;
    }

    this.triggerSwipeFeedback('right');
    this.previousMonth();
  }

  private triggerSwipeFeedback(direction: 'left' | 'right'): void {
    if (this.swipeFeedbackTimeout) {
      clearTimeout(this.swipeFeedbackTimeout);
      this.swipeFeedbackTimeout = null;
    }

    this.swipeFeedbackClass = '';
    requestAnimationFrame(() => {
      this.swipeFeedbackClass = direction === 'left'
        ? 'swipe-feedback-left'
        : 'swipe-feedback-right';
      this.swipeFeedbackTimeout = setTimeout(() => {
        this.swipeFeedbackClass = '';
        this.swipeFeedbackTimeout = null;
      }, 220);
    });
  }

  private formatDateForComparison(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  openEventPopup(event: CalendarEvent): void {
    this.selectedEvent = event;
  }

  closeEventPopup(): void {
    this.selectedEvent = null;
  }
}
