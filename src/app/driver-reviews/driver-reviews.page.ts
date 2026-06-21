import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-driver-reviews',
  templateUrl: './driver-reviews.page.html',
  styleUrls: ['./driver-reviews.page.scss'],
  standalone: false
})
export class DriverReviewsPage implements OnInit {
  driverId: string = '';
  isLoading: boolean = false;
  
  reviewsList: any[] = [];
  averageRating: number = 0;

  private apiUrl = environment.apiBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.driverId = params['driver_id'];
      if (this.driverId) {
        this.loadReviewDriver();
      }
    });
  }

  loadReviewDriver() {
    this.isLoading = true;
    
    this.http.get(`${this.apiUrl}/driver-rating/${this.driverId}`).subscribe({
      next: (res: any) => {
        // Mengantisipasi jika response dibungkus objek { success: true, data: [...] }
        this.reviewsList = res.data || res;
        
        // Menghitung otomatis nilai rata-rata rating bintang
        if (this.reviewsList && this.reviewsList.length > 0) {
          const totalBintang = this.reviewsList.reduce((sum, item) => sum + Number(item.rating), 0);
          this.averageRating = parseFloat((totalBintang / this.reviewsList.length).toFixed(1));
        } else {
          this.averageRating = 0;
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Gagal mengambil data review driver:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Fungsi pembantu untuk membuat deretan bintang berdasarkan jumlah rating angka.
   * Contoh: rating = 4 -> menghasilkan array [0, 1, 2, 3] untuk di-loop di HTML.
   */
  getStars(rating: number): number[] {
    const starsCount = Math.min(5, Math.max(0, Math.round(rating))); // Maksimal 5, minimal 0
    return Array(starsCount).fill(0).map((x, i) => i);
  }
}