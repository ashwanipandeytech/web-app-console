import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomEditor } from './custom-editor';

describe('CustomEditor', () => {
  let component: CustomEditor;
  let fixture: ComponentFixture<CustomEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
