import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SharedLib } from './shared-lib';

describe('SharedLib', () => {
  let component: SharedLib;
  let fixture: ComponentFixture<SharedLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedLib],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
