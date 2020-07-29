import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserqueryComponent } from './userquery.component';

describe('UserqueryComponent', () => {
  let component: UserqueryComponent;
  let fixture: ComponentFixture<UserqueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserqueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserqueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
