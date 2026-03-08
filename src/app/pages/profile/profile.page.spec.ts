import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PofilePagePage } from './profile.page';

describe('PofilePagePage', () => {
  let component: PofilePagePage;
  let fixture: ComponentFixture<PofilePagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PofilePagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
