import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: false,
})
export class ActivityPage implements OnInit {
  selectedSegment: string = 'riwayat';
  userRole: string = '';
  userData: any = {};
  
  riwayatList: any[] = [];
  newsList: any[] = [];
  isLoading: boolean = false;

  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkUser();
  }

  // Refresh data otomatis dari backend Laravel setiap kali customer kembali 
  // atau masuk ke dalam tab Aktivitas
  ionViewWillEnter() {
    this.checkUser();
    this.loadData();
  }

  checkUser() {
    const data = localStorage.getItem('userData');
    if (data) {
      const user = JSON.parse(data);
      this.userData = user;
      this.userRole = this.userData.role; // Mendapatkan role ('customer' atau 'driver')
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  loadData() {
    if (!this.userData || !this.userData.id) return;

    this.isLoading = true;

    // Menarik Riwayat dari Database via Laravel Controller
    this.http.get(`${this.apiUrl}/riwayat-pesanan/${this.userData.id}`).subscribe({
      next: (res: any) => {
        const dataPesanan = res.data || res; 
        
        if (dataPesanan && dataPesanan.length > 0) {
          this.riwayatList = dataPesanan;
          // Menyimpan salinan lokal untuk mendukung fitur caching offline
          localStorage.setItem('riwayatList', JSON.stringify(this.riwayatList));
        } else {
          this.loadFromLocal();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Koneksi bermasalah, memuat offline cache data:', err);
        this.loadFromLocal();
        this.isLoading = false;
      }
    });

    // Konten Promosi & Update Berita Kampus
    this.newsList = [
      {
        title: 'Diskon UTS UBP!',
        desc: 'Gunakan kode promo UBP2026 untuk diskon perjalanan ke kampus.',
        image: 'https://images.unsplash.com/photo-1625217527288-93919c99650a?q=80&w=400&h=200&auto=format&fit=crop',
        time: 'Baru saja'
      },
      {
        title: 'Update Cuaca Karawang',
        desc: 'Sedia payung sebelum ngojek, pantauan mendung di area Galuh Mas.',
        image: 'https://images.unsplash.com/photo-1519692938321-5f3e1488c480?q=80&w=400&h=200&auto=format&fit=crop',
        time: '1 jam yang lalu'
      }
    ];
  }

  loadFromLocal() {
    const storedRiwayat = localStorage.getItem('riwayatList');
    this.riwayatList = storedRiwayat ? JSON.parse(storedRiwayat) : [];
  }

  /**
   * Menavigasikan customer ke halaman review serta membawa parameter orderan
   * PERBAIKAN: Meloloskan variabel 'sudah_dirating' ke queryParams halaman rating induk
   */
  keHalamanRating(item: any) {
    console.log('Membuka halaman rating untuk pesanan ID:', item.id);
    
    if (!item) return;

    this.router.navigate(['/rating'], {
      queryParams: {
        order_id: item.id, // ID data transaksi orders dari Laravel
        driver_id: item.driver_id,
        customer_id: this.userData.id,
        // Antisipasi penamaan properti nama driver & no plat di backend-mu
        driver_name: item.driver?.name || item.driver_name || '', 
        no_plat: item.driver?.no_plat || item.no_plat || '',
        
        // 🔥 PELURU KUNCIAN UTAMA BIAR DI HALAMAN RATING KEBACA REALTIME, BOS!
        sudah_dirating: item.sudah_dirating
      }
    });
  }
}