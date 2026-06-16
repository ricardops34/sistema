import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PeopleListComponent } from './people-list.component';

describe('PeopleListComponent', () => {
  let component: PeopleListComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeopleListComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(PeopleListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('renders returned people in po-table', () => {
    const mockPeople = [
      { id: '1', internalCode: 'P001', nameLegal: 'Maria', tenantId: 'abc' },
      { id: '2', internalCode: 'P002', nameLegal: 'João', tenantId: 'abc' },
    ];

    const req = httpMock.expectOne('/api/people');
    req.flush({ items: mockPeople, total: 2 });

    expect(component.items.length).toBe(2);
  });
});
