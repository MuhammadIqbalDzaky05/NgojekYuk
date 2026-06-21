import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false
})
export class SplashPage implements OnInit, OnDestroy {
  splashTimer: any;

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    // Memberikan waktu 3 detik untuk tampilan gambar statis yang elegan
    this.splashTimer = setTimeout(() => {
      this.handleNavigation();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.splashTimer) clearTimeout(this.splashTimer);
  }

  async handleNavigation() {
    try {
      const { value } = await Preferences.get({ key: 'has_accepted_privacy' });
      if (value === 'true') {
        this.navCtrl.navigateRoot('/login');
      } else {
        this.navCtrl.navigateRoot('/privacy-policy');
      }
    } catch (error) {
      this.navCtrl.navigateRoot('/privacy-policy');
    }
  }
}