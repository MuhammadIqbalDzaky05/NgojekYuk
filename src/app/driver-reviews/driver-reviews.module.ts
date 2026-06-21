import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverReviewsPageRoutingModule } from './driver-reviews-routing.module';

import { DriverReviewsPage } from './driver-reviews.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverReviewsPageRoutingModule
  ],
  declarations: [DriverReviewsPage]
})
export class DriverReviewsPageModule {}
