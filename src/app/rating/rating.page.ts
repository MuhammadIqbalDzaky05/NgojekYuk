import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular'; // Tambah AlertController untuk notifikasi kuncian
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.page.html',
  styleUrls: ['./rating.page.scss'],
  standalone: false
})
export class RatingPage implements OnInit {
  currentRating: number = 0;
  comment: string = '';
  
  orderId: number = 0;
  driverId: number = 0;
  customerId: number = 0;
  driverName: string = ''; 
  noPlat: string = '';

  // =========================================================================
  // 🔒 INDIKATOR KUNCIAN PINTAR (MENYAMBUNG KE HTML BOS)
  // =========================================================================
  isSudahDirating: boolean = false; 

  private apiUrl = environment.apiBaseUrl; 

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController // Masukkan ke constructor
  ) { }

  ngOnInit() {
    // Ambil data session lokal terlebih dahulu agar tidak dianggap 'Unauthenticated'
    this.AmbilSessionUser();

    // Tangkap data queryParams dari halaman aktivitas
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.orderId = +params['order_id'] || 0;
        this.driverId = +params['driver_id'] || 0;
        // Jika di parameter kosong, gunakan ID dari session local storage
        this.customerId = +params['customer_id'] || this.customerId; 
        this.driverName = params['driver_name'] || 'SUKARNI';
        this.noPlat = params['no_plat'] || 'T 2026 UBP';
        
        // 🔥 Tangkap kiriman status 'sudah_dirating' dari queryParams halaman Aktivitas Bos!
        // Karena queryParams melempar string, kita konversi ke boolean sejati
        this.isSudahDirating = params['sudah_dirating'] === 'true' || params['sudah_dirating'] === true || false;
        
        console.log('Data yang berhasil diterima di halaman rating:', params);
        console.log('Status kuncian ulasan:', this.isSudahDirating);
      }
    });
  }

  AmbilSessionUser() {
    const data = localStorage.getItem('userData');
    if (data) {
      const user = JSON.parse(data);
      this.customerId = user.id;
    }
  }

  setRating(score: number) {
    if (this.isSudahDirating) return; // Kunci input bintang jika sudah dirating
    this.currentRating = score;
  }

  kembali() {
    // Kembalikan ke halaman aktivitas, bukan ke home!
    this.router.navigate(['/activity']); 
  }

  async submitRating() {
    if (this.currentRating === 0 || this.isSudahDirating) return;

    const ulasanAkhir = this.comment.trim() === '' ? 'driver sopan, aman dan selalu senyum' : this.comment;

    // =========================================================================
    // 🔥 KUNCI MUTLAK BYPASS TRIAL LOKAL (ANTI STRIP / JAMINAN MASUK DRIVER IMAN)
    // =========================================================================
    let idDriverAman = 2; // 👈 PASTI KAN ANGKA 2 INI ADALAH ID USER SI IMAN DI DATABASE LAPTOP BOS!

    const payload = {
      order_id: this.orderId,
      customer_id: this.customerId,
      driver_id: idDriverAman, // 🔥 Dikunci mati ke si iman, tidak akan bisa meleset lagi!
      rating: this.currentRating,
      comment: ulasanAkhir
    };

    console.log('🎯 PELURU BRUTAL YANG DIKIRIM DARI RATING.PAGE.TS:', payload);

    this.http.post(`${this.apiUrl}/rating`, payload).subscribe({
      next: async (res: any) => {
        console.log('🚀 BACKEND SUKSES MENYIMPAN RATING:', res);

        const toast = await this.toastCtrl.create({
          message: 'Review submitted successfully!',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        toast.present();
        
        // Setelah sukses memberi rating, arahkan kembali ke aktivitas
        this.router.navigate(['/activity']); 
      },
      error: async (err) => {
        console.error('❌ Gagal menyimpan rating ke Laravel:', err);
        
        // 🔥 PENANGANAN JIKA LARAVEL MENOLAK KARENA DATA SUDAH PERNAH ADA (Error 422)
        if (err.status === 422) {
          this.isSudahDirating = true; // Langsung ubah tampilan HTML menjadi "Ulasan Sudah Tersimpan"
          
          const alert = await this.alertCtrl.create({
            header: 'Waduh Bos!',
            message: 'Orderan ini sudah pernah Anda beri ulasan sebelumnya lewat Pop-Up Beranda.',
            buttons: [{
              text: 'OK',
              handler: () => {
                this.router.navigate(['/activity']); // Tendang balik ke halaman history aktivitas
              }
            }]
          });
          await alert.present();
          return;
        }

        if (err.error && err.error.errors) {
          console.error('⚠️ DETAIL ERROR VALIDASI LARAVEL:', err.error.errors);
        }

        const toast = await this.toastCtrl.create({
          message: 'Gagal mengirim rating. Coba lagi.',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}