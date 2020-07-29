import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CnfrmPwdComponent } from './cnfrm-pwd.component';

describe('CnfrmPwdComponent', () => {
  let component: CnfrmPwdComponent;
  let fixture: ComponentFixture<CnfrmPwdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CnfrmPwdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CnfrmPwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
