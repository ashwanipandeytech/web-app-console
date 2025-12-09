import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSharedLib } from './login-shared-lib';

describe('LoginSharedLib', () => {
  let component: LoginSharedLib;
  let fixture: ComponentFixture<LoginSharedLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginSharedLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginSharedLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
