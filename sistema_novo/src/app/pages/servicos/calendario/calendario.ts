import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { PoPageModule, PoModalModule, PoModalComponent } from '@po-ui/ng-components';
import { HttpClient } from '@angular/common/http';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, PoPageModule, PoModalModule],
  template: `
    <po-page-default p-title="Calendário de Agendamentos">
      <div class="calendar-container">
        <full-calendar [options]="calendarOptions"></full-calendar>
      </div>
    </po-page-default>

    <po-modal #eventModal p-title="Detalhes do Agendamento">
       <div *ngIf="selectedEvent">
         <p><strong>Descrição:</strong> {{ selectedEvent.title }}</p>
         <p><strong>Início:</strong> {{ selectedEvent.start | date:'dd/MM/yyyy HH:mm' }}</p>
         <p><strong>Fim:</strong> {{ selectedEvent.end | date:'dd/MM/yyyy HH:mm' }}</p>
       </div>
    </po-modal>
  `,
  styles: [`
    .calendar-container {
      padding: 16px;
      background-color: var(--color-white);
      border-radius: 8px;
    }
    :host ::ng-deep .fc {
      font-family: var(--font-family);
    }
    :host ::ng-deep .fc .fc-button-primary {
      background-color: var(--color-primary-dark);
      border-color: var(--color-primary-dark);
    }
    :host ::ng-deep .fc .fc-button-primary:hover {
      background-color: var(--color-primary-medium);
      border-color: var(--color-primary-medium);
    }
  `]
})
export class Calendario implements OnInit {
  @ViewChild('eventModal') eventModal!: PoModalComponent;
  selectedEvent: any;

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'pt-br',
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia'
    },
    events: (info: any, successCallback: any, failureCallback: any) => {
      this.http.get<any>('/api/v1/agendamentos').subscribe({
        next: (res) => {
          const events = res.items.map((item: any) => ({
            id: item.id,
            title: item.descricao,
            start: item.horario_inicial,
            end: item.horario_final,
            color: item.cor,
            extendedProps: { ...item }
          }));
          successCallback(events);
        },
        error: (err) => failureCallback(err)
      });
    },
    eventClick: this.handleEventClick.bind(this),
    slotMinTime: '07:00:00',
    slotMaxTime: '23:00:00'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  handleEventClick(arg: any) {
    this.selectedEvent = {
        title: arg.event.title,
        start: arg.event.start,
        end: arg.event.end
    };
    this.eventModal.open();
  }
}
