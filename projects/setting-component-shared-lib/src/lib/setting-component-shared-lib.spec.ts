import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingComponentSharedLib } from './setting-component-shared-lib';

describe('SettingComponentSharedLib', () => {
  let component: SettingComponentSharedLib;
  let fixture: ComponentFixture<SettingComponentSharedLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingComponentSharedLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingComponentSharedLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
