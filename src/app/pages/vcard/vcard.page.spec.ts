import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VcardPagePage } from './vcard.page';

describe('VcardPagePage', () => {
  let component: VcardPagePage;
  let fixture: ComponentFixture<VcardPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VcardPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
