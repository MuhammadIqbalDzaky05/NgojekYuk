import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NavController, ViewWillEnter, ViewDidLeave } from '@ionic/angular';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false
})
export class PaymentPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidLeave {

  selectedFile: File | null = null;
  orderId: string | null = null;
  statusMessage: string = '';
  isUploading: boolean = false;
  private statusInterval: any = null; // Dibuat private agar aman

  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');
  }

  // Ionic Lifecycle: Berjalan saat halaman akan tampil
  ionViewWillEnter() {
    console.log("Halaman tampil, memulai polling status...");
    if (this.orderId) {
      this.startStatusPolling();
    }
  }

  // UBAH DI SINI: Jangan matikan polling saat pindah halaman ke home
  ionViewDidLeave() {
    console.log("Halaman ditinggalkan, polling tetap berjalan di latar belakang.");
    // code 'this.stopPolling();' dihapus agar pencarian tetap aktif di background
  }

  // Angular Lifecycle: Backup jika ionViewDidLeave tidak terpicu
  ngOnDestroy() {
    this.stopPolling();
  }

  stopPolling() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }

  onFileSelected(event: any) {
    styleUrls: ['./payment.page.scss']
    this.selectedFile = event.target.files[0];
  }

  uploadBukti() {
    if (!this.selectedFile || !this.orderId) {
      alert("Pilih gambar dan pastikan ID Pesanan valid!");
      return;
    }

    this.isUploading = true;
    this.statusMessage = 'Sedang mengunggah...';

    const formData = new FormData();
    formData.append('bukti', this.selectedFile);
    formData.append('order_id', this.orderId); 

    this.http.post(`${this.apiUrl}/payment/upload`, formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        this.statusMessage = 'Menunggu verifikasi admin...';
        alert('Bukti berhasil dikirim!');
      },
      error: (err) => {
        this.isUploading = false;
        this.statusMessage = 'Gagal mengunggah bukti.';
        alert('Gagal: ' + (err.error?.message || 'Terjadi kesalahan.'));
      }
    }); 
  }

  startStatusPolling() {
    // Pencegahan agar tidak ada interval ganda
    if (this.statusInterval) return;

    this.statusInterval = setInterval(() => {
      this.http.get(`${this.apiUrl}/pesanan/${this.orderId}`).subscribe({
        next: (res: any) => {
          if (res?.status === 'success' && res.data) {
            const currentStatus = res.data.status;
            console.log('Polling Status:', currentStatus);

            if (currentStatus === 'menunggu_driver') {
              this.statusMessage = 'Pembayaran disetujui Admin! Mencari driver...';
            } 
            else if (currentStatus === 'perjalanan' || currentStatus === 'diproses') {
              this.stopPolling();
              alert('Driver ditemukan! Perjalanan dimulai.');
              this.navCtrl.navigateForward(['/home']);
            } 
            else if (currentStatus === 'gagal_pembayaran') {
              this.stopPolling();
              alert('Maaf, bukti pembayaran Anda ditolak.');
              this.navCtrl.navigateRoot('/home');
            }
          }
        },
        error: (err) => console.error('Error Polling:', err)
      });
    }, 3000);
  }

  // FUNGSI BARU: Untuk tombol kembali ke home/dashboard secara manual di HTML
  backToHome() {
    this.navCtrl.navigateRoot('/home'); // sesuaikan dengan rute home customer Anda
  }
}