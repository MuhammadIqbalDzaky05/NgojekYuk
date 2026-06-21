import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';
import { environment } from '../../../environments/environment'; // Mundur 2 tingkat sesuai folder src/app/forgot-password

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false 
})
export class ForgotPasswordPage {

  // Disamakan menggunakan 'email' agar klop dengan backend API Laravel
  resetData = {
    email: '',
  };

  // Mengambil URL dinamis dari satu pintu environment
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  async onReset() {
    if (!this.resetData.email) {
      this.presentToast('Tolong masukkan alamat email Anda!', 'warning');
      return;
    }

    // Tampilkan loading spinner biar user tahu aplikasi sedang bekerja
    const loading = await this.loadingCtrl.create({ 
      message: 'Mengirim tautan pemulihan...',
      spinner: 'crescent'
    });
    await loading.present();

    // Sesuaikan endpoint API Laravel Breeze milikmu (biasanya /forgot-password atau /password/email)
    this.http.post(`${this.apiUrl}/forgot-password`, this.resetData).subscribe({
      next: async (res: any) => {
        loading.dismiss();
        this.presentToast('Mantap! Tautan pemulihan password telah dikirim ke email Anda.', 'success');
        
        // Kembalikan user ke halaman login setelah berhasil
        this.router.navigate(['/login']);
      },
      error: (err) => {
        loading.dismiss();
        // Menangkap pesan error dari validasi Laravel jika email tidak terdaftar
        const errorMsg = err.error?.message || 'Gagal mengirim email pemulihan.';
        this.presentToast(errorMsg, 'danger');
      }
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  // Fungsi Toast Controller bawaan Ionic agar UI notifikasi terlihat profesional di HP
  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 3000, 
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}