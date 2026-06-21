import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {

  userType: string = 'customer'; 
  
  // Variable untuk handle foto
  photoPreview: any = null;
  selectedFile: File | null = null;

  regData = {
    username: '', // Tetap menampung inputan dari ion-input HTML Anda
    email: '',
    phone: '',
    password: '',
    vehicle_type: '', // Murni menampung pilihan 'motor' / 'mobil' dari UI
    vehicle_name: '', // Murni menampung merek ketikan bebas dari driver
    no_plat: '', 
    no_sim: '',
    nik: ''
  };

  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() { }

  // Fungsi untuk memicu input file yang tersembunyi di HTML
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  // Fungsi saat foto dipilih dari galeri
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Membuat preview untuk ditampilkan di lingkaran foto
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async onRegister() {
    // Validasi dasar
    if (!this.regData.username || !this.regData.email || !this.regData.password) {
      this.presentToast('Nama, Email, dan Password wajib diisi!', 'warning');
      return;
    }

    // VALIDASI KHUSUS DRIVER
    if (this.userType === 'driver') {
      // 1. Validasi Pilihan Jenis Driver
      if (!this.regData.vehicle_type) {
        this.presentToast('Silakan pilih jenis driver (Motor/Mobil) terlebih dahulu!', 'warning');
        return;
      }

      // 2. Validasi Merk Kendaraan
      if (!this.regData.vehicle_name) {
        this.presentToast('Merk kendaraan wajib diisi!', 'warning');
        return;
      }
      
      // 3. Validasi Foto Profil Driver
      if (!this.selectedFile) {
        this.presentToast('Driver wajib mengunggah foto profil!', 'danger');
        return;
      }
    }

    const loading = await this.loadingCtrl.create({
      message: 'Mendaftarkan akun...',
      spinner: 'crescent'
    });
    await loading.present();

    // MENGGUNAKAN FORMDATA (Wajib karena ada file/gambar)
    const formData = new FormData();
    // 🔔 DISELARASKAN: Mengubah key 'username' menjadi 'name' agar cocok dengan database Laravel
    formData.append('name', this.regData.username); 
    formData.append('email', this.regData.email);
    formData.append('password', this.regData.password);
    formData.append('phone', this.regData.phone);
    formData.append('role', this.userType); // Mengirim 'customer' atau 'driver'

    if (this.userType === 'driver') {
      formData.append('vehicle_type', this.regData.vehicle_type); 
      formData.append('vehicle_name', this.regData.vehicle_name); 
      formData.append('no_plat', this.regData.no_plat);
      formData.append('no_sim', this.regData.no_sim);
      formData.append('nik', this.regData.nik);
      
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile); // Kirim file mentah foto profil
      }
    }

    // 🔔 DIUBAH: Menembak rute khusus mobile /register-mobile agar tidak bentrok dengan rute web Breeze
    this.http.post(`${this.apiUrl}/register-mobile`, formData).subscribe({
      next: (res: any) => {
        loading.dismiss();
        
        // Simpan data sementara ke storage
        localStorage.setItem('userData', JSON.stringify(res.user || this.regData));
        localStorage.setItem('userRole', this.userType);

        this.presentToast('Registrasi berhasil!', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        loading.dismiss();
        console.error('Error Register:', err);
        
        // Membaca pesan error detail dari Laravel (misal email sudah dipakai)
        let errorMsg = 'Gagal mendaftar. Pastikan data benar.';
        if (err.error && err.error.errors) {
          // Mengambil error validasi pertama yang dikirim Laravel
          const firstKey = Object.keys(err.error.errors)[0];
          errorMsg = err.error.errors[firstKey][0];
        } else if (err.error && err.error.message) {
          errorMsg = err.error.message;
        }

        this.presentToast(errorMsg, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}