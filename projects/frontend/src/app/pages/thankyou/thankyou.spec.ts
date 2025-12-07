import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Thankyou } from './thankyou';

describe('Thankyou', () => {
  let component: Thankyou;
  let fixture: ComponentFixture<Thankyou>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Thankyou]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Thankyou);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
