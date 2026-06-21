import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DriverReviewsPage } from './driver-reviews.page';

describe('DriverReviewsPage', () => {
  let component: DriverReviewsPage;
  let fixture: ComponentFixture<DriverReviewsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverReviewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
