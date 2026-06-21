import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: false, // Paten Boss!
})
export class ChangePasswordPage implements OnInit {
  // Properti tetap paten sesuai request
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  private apiUrl = environment.apiBaseUrl;

  // Mesinnya (Constructor) harus dipasang di sini Boss
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    // Memastikan user sudah login
    const data = localStorage.getItem('userData');
    if (!data) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // --- LOGIKA UTAMA (TETAP PATEN) ---
  async updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.presentToast('Password baru tidak cocok, Boss!', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({ 
      message: 'Mengecek data...',
      spinner: 'crescent'
    });
    await loading.present();

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    const body = {
      email: userData.email,
      old_password: this.oldPassword, // Kirim password lama untuk dicek Laravel
      new_password: this.newPassword
    };

    this.http.post(`${this.apiUrl}/change-password`, body).subscribe({
      next: async (res: any) => {
        loading.dismiss();
        this.presentToast('Mantap! Password berhasil diganti.', 'success');
        
        localStorage.clear();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        loading.dismiss();
        // Laravel akan kirim pesan error jika password lama salah
        const errorMsg = err.error?.message || 'Gagal ganti password.';
        this.presentToast(errorMsg, 'danger');
      }
    });
  }

  // Fungsi Toast paten Boss
  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2500, 
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}