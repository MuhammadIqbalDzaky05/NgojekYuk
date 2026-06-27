import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html', 
  styleUrls: ['./profile.page.scss'],
  standalone: false, // Tetap paten Boss!
})
export class ProfilePage implements OnInit {
  userData: any = {};
  userRole: string = '';
  photoPreview: string | null = null; 

  private apiUrl = environment.apiBaseUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.loadUserData();
  }

  loadUserData() {
    const data = localStorage.getItem('userData');
    
    if (data) {
      this.userData = JSON.parse(data);
      this.userRole = this.userData.role || '';
      
      // ==================== REFRESH PREVIEW ====================
      this.refreshPhotoUrl();
      
      console.log('Data Profil Berhasil Dimuat:', this.userData);
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // Fungsi pembantu untuk memproses URL foto agar mengarah ke rute bypass Laravel
  refreshPhotoUrl() {
    const fallback =
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (this.userData?.username || 'user');

    const photo = this.userData?.photo;

    if (!photo) {
      this.photoPreview = fallback;
      return;
    }

    // 1) Jika photo sudah berupa URL absolut, pakai langsung
    if (typeof photo === 'string' && /^https?:\/\//i.test(photo)) {
      this.photoPreview = photo;
      return;
    }

    // 2) Jika photo sudah mengandung '/storage/', jangan dobel 'storage/'
    if (typeof photo === 'string' && photo.includes('/storage/')) {
      this.photoPreview = this.apiUrl + photo.startsWith('/') ? photo : '/' + photo;
      return;
    }

    // 3) Jika photo sudah berupa path relatif di folder storage (umum: "users/xxx.jpg" atau "storage/users/xxx.jpg")
    if (typeof photo === 'string') {
      // Hilangkan awalan 'storage/' kalau sudah ada
      const cleaned = photo.replace(/^storage\//, '');
      this.photoPreview = `${this.apiUrl}/storage/${cleaned}`;
      return;
    }

    this.photoPreview = fallback;
  }

  onPhotoImgError() {
    // Saat gambar gagal load, fallback ke dicebear supaya tampilan tetap ada
    const seed = this.userData?.username || 'user';
    this.photoPreview = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + seed;
  }

  triggerFileInput() {
    const element = document.getElementById('profileFileInput') as HTMLInputElement;
    if (element) {
      element.click();
    }
  }

  async uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const loading = await this.loadingCtrl.create({
      message: 'Mengupload foto...',
      spinner: 'crescent'
    });
    await loading.present();

    const formData = new FormData();
    // Kunci key menjadi 'photo' agar dibaca oleh $request->hasFile('photo') di Laravel
    formData.append('photo', file);
    formData.append('email', this.userData.email); 

    this.http.post(`${this.apiUrl}/update-profile-photo`, formData).subscribe({
      next: (res: any) => {
        loading.dismiss();
        
        // Ambil photo_path dari response json Laravel
        this.userData.photo = res.photo_path; 
        localStorage.setItem('userData', JSON.stringify(this.userData));
        
        // Jalankan refresh preview realtime
        this.refreshPhotoUrl();
        
        this.presentToast('Foto profil berhasil diperbarui!', 'success');
        event.target.value = '';
      },
      error: (err) => {
        loading.dismiss();
        console.error('Upload Error:', err);
        this.presentToast('Gagal mengupload foto.', 'danger');
      }
    });
  }

  changePassword() {
    this.router.navigate(['/change-password']);
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  keHalamanReview() {
    if (this.userData && this.userData.id) {
      this.router.navigate(['/driver-reviews'], {
        queryParams: {
          driver_id: this.userData.id
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}