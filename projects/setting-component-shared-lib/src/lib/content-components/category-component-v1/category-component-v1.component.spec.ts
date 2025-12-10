/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CategoryComponentV1Component } from './category-component-v1.component';

describe('CategoryComponentV1Component', () => {
  let component: CategoryComponentV1Component;
  let fixture: ComponentFixture<CategoryComponentV1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryComponentV1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryComponentV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
