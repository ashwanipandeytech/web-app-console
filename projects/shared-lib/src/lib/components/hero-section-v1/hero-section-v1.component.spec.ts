/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HeroSectionV1Component } from './hero-section-v1.component';

describe('HeroSectionV1Component', () => {
  let component: HeroSectionV1Component;
  let fixture: ComponentFixture<HeroSectionV1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeroSectionV1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroSectionV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
