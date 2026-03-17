import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledPaymentList } from './cancelled-payment-list';

describe('CancelledPaymentList', () => {
  let component: CancelledPaymentList;
  let fixture: ComponentFixture<CancelledPaymentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelledPaymentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelledPaymentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
