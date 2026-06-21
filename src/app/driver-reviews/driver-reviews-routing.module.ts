import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverReviewsPage } from './driver-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: DriverReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverReviewsPageRoutingModule {}
