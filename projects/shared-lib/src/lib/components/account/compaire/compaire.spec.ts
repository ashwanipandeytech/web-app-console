import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Compaire } from './compaire';

describe('Compaire', () => {
  let component: Compaire;
  let fixture: ComponentFixture<Compaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Compaire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Compaire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
