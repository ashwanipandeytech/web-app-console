/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HostProductInfooComponent } from './host-product-infoo.component';

describe('HostProductInfooComponent', () => {
  let component: HostProductInfooComponent;
  let fixture: ComponentFixture<HostProductInfooComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostProductInfooComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostProductInfooComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
