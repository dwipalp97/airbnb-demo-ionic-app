import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaceBookingsPage } from './place-bookings.page';

describe('PlaceBookingsPage', () => {
  let component: PlaceBookingsPage;
  let fixture: ComponentFixture<PlaceBookingsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PlaceBookingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
