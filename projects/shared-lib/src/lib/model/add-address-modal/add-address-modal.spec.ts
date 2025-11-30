import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddressModal } from './add-address-modal';

describe('AddAddressModal', () => {
  let component: AddAddressModal;
  let fixture: ComponentFixture<AddAddressModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAddressModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAddressModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
