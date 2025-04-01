import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastoPage } from './gasto.page';

describe('GastoPage', () => {
  let component: GastoPage;
  let fixture: ComponentFixture<GastoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GastoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
