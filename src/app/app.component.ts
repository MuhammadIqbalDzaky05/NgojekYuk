import { Component, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, IonRouterOutlet, ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  lastBackPress = 0;
  timePeriodToExit = 2000;
  
  constructor(
    private router: Router,
    private platform: Platform,
    private toastController: ToastController,
    @Optional() private routerOutlet: IonRouterOutlet
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(async () => {

      GoogleAuth.initialize();
      
      // 🔥 1. TAMPILKAN SPLASH SCREEN SELAMA 2 DETIK UNTUK BRANDING NGOJEKYUK
      setTimeout(async () => {
        await SplashScreen.hide(); // Sembunyikan splash screen native setelah 2 detik
        this.checkPrivacyStatus(); // Jalankan pengecekan alur setelah splash hilang
      }, 2000);

      // 2. Inisialisasi Tombol Back Global (Paten Milik Anda)
      this.platform.backButton.subscribeWithPriority(10, () => {
        const currentUrl = this.router.url;

        // Daftar halaman utama yang memicu aksi keluar aplikasi
        const exitRoutes = ['/login', '/home', '/splash', '/privacy-policy', '/dashboard-customer'];

        if (exitRoutes.includes(currentUrl)) {
          this.handleExitAction();
        } 
        else if (this.routerOutlet && this.routerOutlet.canGoBack()) {
          this.routerOutlet.pop();
        } 
        else {
          this.handleExitAction();
        }
      });
    });
  }

  async checkPrivacyStatus() {
    try {
      // Cek status persetujuan privasi dan login dari storage handphone
      const privacy = await Preferences.get({ key: 'has_accepted_privacy' });
      const loginStatus = await Preferences.get({ key: 'user_logged_in' });

      if (privacy.value === 'true') {
        // 🔥 JALUR FIX: Jika sudah setuju privasi, cek status loginnya
        if (loginStatus.value === 'true') {
          this.router.navigateByUrl('/home', { replaceUrl: true }); // Langsung ke Beranda (Minta GPS)
        } else {
          this.router.navigateByUrl('/login', { replaceUrl: true }); // Belum login? Lempar ke Login
        }
      } else {
        // Jika pertama kali download/buka, WAJIB hukumnya baca Privacy Policy dulu
        this.router.navigateByUrl('/privacy-policy', { replaceUrl: true });
      }

    } catch (error) {
      console.error('Gagal mengecek status Preferences:', error);
      // Fallback aman jika storage bermasalah, lempar ke login
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  async handleExitAction() {
    if (new Date().getTime() - this.lastBackPress < this.timePeriodToExit) {
      App.exitApp();
    } else {
      const toast = await this.toastController.create({
        message: 'Tekan sekali lagi untuk keluar aplikasi.',
        duration: 2000,
        position: 'bottom',
        color: 'dark'
      });
      toast.present();
      this.lastBackPress = new Date().getTime();
    }
  }
}