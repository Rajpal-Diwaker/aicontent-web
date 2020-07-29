import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshhomeComponent } from './refreshhome.component';

describe('RefreshhomeComponent', () => {
  let component: RefreshhomeComponent;
  let fixture: ComponentFixture<RefreshhomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefreshhomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefreshhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
