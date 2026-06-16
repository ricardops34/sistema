import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PersonUpdateRequestComponent } from './person-update-request.component';
import { PoNotificationService } from '@po-ui/ng-components';

describe('PersonUpdateRequestComponent', () => {
  let component: PersonUpdateRequestComponent;
  let httpMock: HttpTestingController;
  const notificationSpy = { success: jasmine.createSpy(), error: jasmine.createSpy() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonUpdateRequestComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: PoNotificationService, useValue: notificationSpy }],
    }).compileComponents();

    const fixture = TestBed.createComponent(PersonUpdateRequestComponent);
    component = fixture.componentInstance;
    component.personId = 'test-person-id';
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('submits update request form', () => {
    const api = { createRequest: jasmine.createSpy() };
    component.payload = { nameLegal: 'Novo Nome', nameSocial: '', notes: '' };
    component.submit();

    const req = httpMock.expectOne('/api/people-requests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.personId).toBe('test-person-id');
    req.flush({ id: 'req-1', status: 'pending' });

    expect(notificationSpy.success).toHaveBeenCalled();
  });
});
