import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http'; // <-- Pastikan terimpor di sini

import { RatingPageRoutingModule } from './rating-routing.module';
import { RatingPage } from './rating.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule, // <-- Daftarkan di sini agar HTTP Request berjalan lancar
    RatingPageRoutingModule
  ],
  declarations: [RatingPage]
})
export class RatingPageModule {}