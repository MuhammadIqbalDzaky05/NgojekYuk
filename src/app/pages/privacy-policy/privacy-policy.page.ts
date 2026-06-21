import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
  standalone: false,
})
export class PrivacyPolicyPage {
  isCentang: boolean = false;

  constructor(private router: Router) { }

  async setujuiPrivasi() {
    if (!this.isCentang) return;

    await Preferences.set({
      key: 'has_accepted_privacy',
      value: 'true'
    });

    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}