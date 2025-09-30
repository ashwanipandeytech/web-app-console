import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostOutletComponent } from './host.component';

describe('HostOutletComponent', () => {
  let component: HostOutletComponent;
  let fixture: ComponentFixture<HostOutletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostOutletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
