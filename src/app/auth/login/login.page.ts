import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { Preferences } from '@capacitor/preferences'; // 🔥 Tambahkan impor ini agar klop dengan app.component
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  loginData = {
    identity: '', 
    password: ''
  };

  private apiUrl = environment.apiBaseUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private platform: Platform
  ) { }

  async ngOnInit() {
    // 🔥 AUTO-LOGIN INTEGRASI: Cek Preferences handphone
    const loginStatus = await Preferences.get({ key: 'user_logged_in' });
    const savedUser = localStorage.getItem('userData');
    
    if (loginStatus.value === 'true' && savedUser) {
      this.cekRouting();
    }
  }

  async onLogin() {
    if (!this.loginData.identity || !this.loginData.password) {
      this.presentToast('Username dan Password wajib diisi!', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Mohon tunggu...',
      spinner: 'crescent'
    });
    await loading.present();

    this.http.post(`${this.apiUrl}/login`, this.loginData).subscribe({
      next: async (res: any) => { // Tambahkan async di sini untuk proses simpan Preferences
        loading.dismiss();

        const nameToShow = res.user?.name || 'User';
        this.presentToast('Selamat Datang, ' + nameToShow, 'success');

        // 1. Simpan data user & token ke LocalStorage (Paten milik Anda)
        localStorage.setItem('userData', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);

        // 🔥 2. KUNCI JALUR: Tandai di Preferences handphone bahwa user resmi login
        await Preferences.set({
          key: 'user_logged_in',
          value: 'true'
        });

        // 3. Jalankan navigasi
        this.cekRouting();
      },
      error: (err) => {
        loading.dismiss();
        console.error('Login Error:', err);
        
        let msg = err.error?.message || 'Gagal login. Cek koneksi server.';
        
        if (msg.includes(', Saori.')) {
          msg = msg.replace(', Saori.', '.');
        } else if (msg.includes('Saori')) {
          msg = msg.replace('Saori', '');
        }

        this.presentToast(msg, 'danger');
      }
    });
  }

  cekRouting() {
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  async loginWithGoogle() {
    if (!this.platform.is('capacitor')) {
    this.presentToast('Login Google hanya bisa di HP asli.', 'warning');
    console.warn('Google Auth tidak tersedia di browser.');
    return;
  }

    try {
      const user = await GoogleAuth.signIn(); 

      // Setelah berhasil login Google, Anda mungkin perlu mengirim 
      // idToken user ke backend Laravel Anda untuk diverifikasi/registrasi
      
      const loading = await this.loadingCtrl.create({
        message: 'Sedang memproses login Google...',
        spinner: 'crescent'
      });
      await loading.present();

      // Contoh: Kirim token ke API Anda
      // this.http.post(`${this.apiUrl}/login-google`, { token: user.authentication.idToken }).subscribe(...)
      
      const formatUserGoogle = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.imageUrl, 
        role: 'customer' // Set default role ke driver agar Driver Panel (/home) bisa terbuka dengan benar
      };

      // 1. Simpan tanda login aktif ke Preferences
      await Preferences.set({ key: 'user_logged_in', value: 'true' });
      
      // 2. Simpan tiruan data user dengan struktur yang dikenali oleh halaman /home
      localStorage.setItem('userData', JSON.stringify(formatUserGoogle));
      
      // 3. Simpan token Google sebagai pengganti token API Laravel untuk sementara
      localStorage.setItem('token', user.authentication.idToken); 
      
      await loading.dismiss();
      this.cekRouting(); // Sekarang rute ke /home akan terbuka dengan aman!

    } catch (err: any) {
      // 🔥 TAMBAHAN: Cek apakah error karena user membatalkan login (klik di luar pop-up)
      // Kode 'cancelled' sering muncul jika user menutup pop-up Google
      if (err === 'cancelled' || err?.message === 'cancelled') {
        console.log('User membatalkan login');
        return; 
      }
      
      console.error('Google Login Error:', err);
      this.presentToast('Login gagal. Pastikan koneksi internet stabil.', 'danger');
    } 
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }

  goToRegister() { 
    this.router.navigate(['/register']); 
  }

  goToForgot() {
    this.router.navigate(['/forgot-password']);
  }
}