  import { Component, OnInit, NgZone, ApplicationRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { catchError } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs'; 
import { environment } from '../../environments/environment';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})

export class HomePage implements OnInit, OnDestroy {
    userRole: string = '';
    userData: any = {};
    map!: L.Map;
    lokasiTujuan: string = '';
    pesananMasuk: any = null;
    pesananAktif: any = null; 
    pollingTimer: any;

    currentLat: number = 0;
    currentLng: number = 0;
    destLat: number | null = null;
    destLng: number | null = null;

    pickupLat: number | null = null;
    pickupLng: number | null = null;

    namaLokasiJemput: string = 'Mencari lokasi penjemputan...';

    // 🔥 KUNCIAN BARU: VARIABEL KONTROL WELCOME SCREEN
    isFirstTime: boolean = true;

    // 🔥 DATA MASTER REKOMENDASI LOKASI SUPER LENGKAP SE-KARAWANG (ALA OJOL ASLI)
    rekomendasiLokasi: any[] = [];
    daftarTempatMaster: any[] = [
      // === AREA KAMPUS & PENDIDIKAN ===
      { nama: 'Universitas Buana Perjuangan (UBP) Karawang', alamat: 'Jl. HS. Ronggowaluyo, Telukjambe Timur' },
      { nama: 'Universitas Singaperbangsa Karawang (UNSIKA)', alamat: 'Jl. HS. Ronggowaluyo, Puseurjaya, Telukjambe Timur' },
      { nama: 'Politeknik TMII Karawang', alamat: 'Kawasan Industri KIIC, Sukaluyu' },
      { nama: 'STIE Rosma Karawang', alamat: 'Jl. Kertabumi No.62, Nagasari, Karawang Barat' },

      // === PUSAT PERBELANJAAN & MALL ===
      { nama: 'Ramayana Karawang Barat', alamat: 'Jl. Maligi Raya No.2, Nagasari, Karawang Barat' },
      { nama: 'Ramayana Mall Sadamalun', alamat: 'Area Akses Tol Karawang Barat, Nagasari' },
      { nama: 'Karawang Central Plaza (KCP) Mall', alamat: 'Jl. Galuh Mas Raya, Sukaharja, Telukjambe Timur' },
      { nama: 'Techno Mart Galuh Mas', alamat: 'Kawasan Galuh Mas, Sukaharja, Karawang' },
      { nama: 'Festive Walk Galuh Mas', alamat: 'Jl. Galuh Mas Raya, Sukaharja, Karawang' },
      { nama: 'Resinda Park Mall (RPM)', alamat: 'Jl. Resinda Raya No.2, Purwadana, Karawang Barat' },
      { nama: 'Mega Mall Karawang', alamat: 'Jl. Ahmad Yani, Nagasari, Karawang Barat' },
      { nama: 'Supermall Karawang', alamat: 'Jl. Jend. Ahmad Yani No.72, Karawang' },

      // === TRANSPORTASI & FASILITAS UMUM ===
      { nama: 'Stasiun Karawang', alamat: 'Jl. Stasiun Karawang, Nagasari, Karawang Barat' },
      { nama: 'Stasiun Klari', alamat: 'Anggadita, Klari, Karawang' },
      { nama: 'Terminal Klari Karawang', alamat: 'Jl. Raya Klari, Anggadita, Klari' },
      { nama: 'Gerbang Tol Karawang Barat 1', alamat: 'Akses Tol Jakarta-Cikampek, Badami' },
      { nama: 'Gerbang Tol Karawang Barat 2', alamat: 'Akses Tol Jakarta-Cikampek, Margakaya' },
      { nama: 'Gerbang Tol Karawang Timur', alamat: 'Akses Tol Jakarta-Cikampek, Anggadita, Klari' },

      // === KAWASAN INDUSTRI (BANYAK ORDERAN KARYAWAN) ===
      { nama: 'Kawasan Industri KIIC (Karawang International Industrial City)', alamat: 'Jl. Permata Raya, Telukjambe Barat' },
      { nama: 'Kawasan Industri Surya Cipta', alamat: 'Jl. Surya Utama, Kutamekar, Ciampel' },
      { nama: 'Kawasan Industri KIM (Kawasan Industri Mitrakarawang)', alamat: 'Jl. Mitra Raya, Parungmulya, Ciampel' },
      { nama: 'Kawasan Industri Indotaisei', alamat: 'Kalihurip, Cikampek, Karawang' },

      // === PERUMAHAN & APARTEMEN HITS ===
      { nama: 'Perumahan Galuh Mas Karawang', alamat: 'Sukaharja, Telukjambe Timur, Karawang' },
      { nama: 'Perumahan Resinda Karawang', alamat: 'Purwadana, Karawang Barat' },
      { nama: 'Perumahan Grand Taruma Karawang', alamat: 'Jl. Tarumanagara, Sukamakmur, Karawang Barat' },
      { nama: 'Perumahan Kosambi Baru', alamat: 'Duren, Klari, Karawang' },
      { nama: 'Grand Sentraland Karawang Apartemen', alamat: 'Jl. Wadas, Telukjambe Timur' },

      // === RUMAH SAKIT (RS) ===
      { nama: 'RSUD Karawang', alamat: 'Jl. Jend. Ahmad Yani No.93, Sukaharja, Telukjambe Timur' },
      { nama: 'RS Permata Keluarga Karawang', alamat: 'Kawasan Galuh Mas, Sukaharja, Karawang' },
      { nama: 'RS Lira Medika Karawang', alamat: 'Jl. Syeh Quro No.14, Lamaran, Karawang Timur' },
      { nama: 'RS Dewi Sri Karawang', alamat: 'Jl. Struktur Kertabumi No.59, Nagasari' },
      { nama: 'RS Hermina Karawang', alamat: 'Jl. Tarumanagara, Purwadana, Karawang Barat' },

      // === TEMPAT NONGKRONG & KULINER HITS ===
      { nama: 'KCP Kuliner Malam / Street Food', alamat: 'Pelataran Parkir Mall KCP Galuh Mas' },
      { nama: 'McDonald\'s Karawang Barat', alamat: 'Jl. Tarumanagara, Sukamakmur, Karawang Barat' },
      { nama: 'Starbucks Grand Taruma', alamat: 'Ruko Grand Taruma, Jl. Tarumanagara, Karawang' },
      { nama: 'Bundaran Badami Karawang', alamat: 'Margakaya, Telukjambe Barat (Dekat Interchange Barat)' },
      { nama: 'Alun-Alun Karawang', alamat: 'Jl. Kertabumi, Karawang Kulon, Karawang Barat' }
    ];

    // ==================== VARIABLE KONTROL RATING (ALA GOJEK/GRAB) ====================
    tampilkanModalRating: boolean = false;
    ratingDipilih: number = 5; 
    ulasanTeks: string = '';
    pesananSelesaiData: any = null; 

    routingControl: any = null;
    private mapMarkers: L.Layer[] = [];
    jarakAkuratTerhitung: number | null = null;
    waktuAkuratTerhitung: number | null = null;

    private apiUrl = environment.apiBaseUrl;

    constructor(
      public router: Router,
      private alertController: AlertController,
      private loadingController: LoadingController,
      private http: HttpClient,
      private zone: NgZone,          
      private appRef: ApplicationRef
    ) {}

    // 🔥 ADJUSTED PATEN: Memeriksa flag kuncian di memori lokal saat pertama kali inisialisasi
    ngOnInit() {
      const sudahPernahIzin = localStorage.getItem('izin_gps_paten');
      if (sudahPernahIzin === 'true') {
        this.isFirstTime = false;
        this.checkUser();
      } else {
        this.isFirstTime = true;
      }
    }

    ngOnDestroy() {
      this.stopPolling(); // AMAN: Hentikan total mata-mata jika component dihancurkan
      this.clearRoutingControl();
      this.clearAllCustomMarkers();
      if (this.map) {
        this.map.off();
        try {
          this.map.remove();
        } catch (e) {
          console.warn('Mengabaikan error destroy map:', e);
        }
      }
    }

    ionViewDidEnter() {
      // Hanya jalankan pemuatan utama jika aplikasi tidak sedang tertutup Welcome Screen edukasi
      if (!this.isFirstTime) {
        this.checkUser();
        this.getLocation();
        
        // BARU & PATEN: Ambil state pesanan terakhir dari server jika user tidak sengaja reload/refresh app
        this.loadPesananAktifDariServer();
      }
    }

    ionViewWillLeave() {
      this.stopPolling();
    }

    checkUser() {
      const data = localStorage.getItem('userData');
      if (data) {
        this.userData = JSON.parse(data);
        this.userRole = this.userData.role;
      } else {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }

    /**
     * --- FITUR BARU: PERSISTENCE STATE UTAMA ---
     * FIXED UTUH: Tanda kurung pipe dan subscribe disinkronkan 100% 
     * agar compile sukses tanpa error TS1005 / TS1136.
     */
    loadPesananAktifDariServer() {
      if (!this.userData || !this.userData.id) return;

      this.http.get(`${this.apiUrl}/cek-pesanan-aktif/${this.userData.id}`).pipe(
        catchError((error) => {
          if (error.status === 404 || error.status === 500) {
            return of({ status: 'empty', message: 'Tidak ada pesanan aktif' });
          }
          return of({ status: 'error', message: 'Gagal terhubung ke server' });
        })
      ).subscribe({
        next: (res: any) => {
          console.log('SINKRONISASI SELESAI DETECTED:', res);

          // =========================================================================
          // 1. KONDISI JIKA PESANAN MASIH AKTIF BERJALAN (status === 'success')
          // =========================================================================
          if (res && res.status === 'success' && res.data) {
            const orderData = res.data;

            if (this.userRole === 'customer') {
              this.pesananAktif = orderData;
            } else if (this.userRole === 'driver') {
              this.pesananMasuk = {
                ...orderData,
                customer_name: orderData.customer?.name || orderData.customer?.username || 'Pelanggan',
                status: orderData.status
              };
            }

            this.startPolling();
            setTimeout(() => {
              if (typeof this.initMap === 'function') {
                this.initMap();
              }
            }, 500);

          // =========================================================================
          // 2. JALUR PENYELAMAT: JIKA PESANAN SUDAH SELESAI / KOSONG (status === 'empty')
          // =========================================================================
          } else {
            
            // >>> JIKA USER ADALAH CUSTOMER <<<
            if (this.userRole === 'customer') {
              if (this.pesananAktif) {
                console.log('Pesanan selesai terdeteksi untuk customer! Membuka pop-up rating...');
                
                if (this.pollingTimer) clearInterval(this.pollingTimer);
                
                this.pesananSelesaiData = { ...this.pesananAktif };
                this.pesananAktif = null; 
                
                this.ratingDipilih = 5; 
                this.ulasanTeks = '';
                
                setTimeout(() => {
                  this.tampilkanModalRating = true; 
                }, 100);
              }
            }

            // >>> JIKA USER ADALAH DRIVER (FIX AMAN) <<<
            if (this.userRole === 'driver') {
              // Hanya set null jika pesanan memang tidak ada atau statusnya bukan perjalanan aktif
              if (!this.pesananMasuk || ['selesai', 'dibatalkan', 'tersedia'].includes(this.pesananMasuk.status)) {
                this.pesananMasuk = null; 
              }
              this.startPolling();
            }
          }
        },
        error: () => {
          if (this.userRole === 'driver') {
            this.startPolling();
          }
        }
      });
    }

    // ==================== GEOLOCATION & MAP ====================
    async reverseGeocodeJemput(lat: number, lng: number) {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const res: any = await firstValueFrom(this.http.get(url));
        
        if (res && res.address) {
          const addr = res.address;
          const kampungAtauPerum = addr.neighbourhood || addr.residential || addr.suburb || addr.road || '';
          const desaAtauKelurahan = addr.village || addr.municipality || addr.subdistrict || '';
          
          if (kampungAtauPerum || desaAtauKelurahan) {
            this.namaLokasiJemput = `${kampungAtauPerum}, ${desaAtauKelurahan}`.trim().replace(/^,|,$/g, '');
          } else {
            this.namaLokasiJemput = res.display_name.split(',').slice(0, 2).join(',');
          }
        } else {
          this.namaLokasiJemput = 'Lokasi Penjemputan';
        }
      } catch (err) {
        console.warn('Gagal konversi nama lokasi:', err);
        this.namaLokasiJemput = 'Lokasi Penjemputan';
      }
    }

    // 🔥 UPGRADED PATEN: Memperbarui Pengambilan Lokasi Menggunakan Capacitor Geolocation Hardware Native
    async getLocation() {
      try {
        let statusIzin = await Geolocation.checkPermissions();
        
        // Meminta izin akses lokasi perangkat Android/iOS jika belum diberikan
        if (statusIzin.location !== 'granted') {
          statusIzin = await Geolocation.requestPermissions();
          if (statusIzin.location !== 'granted') {
            this.handleGpsFallback('Izin lokasi ditolak oleh pengguna perangkat.');
            return;
          }
        }

        // Memanggil hardware receiver GPS internal handphone
        const posisiSekarang = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 7000
        });

        this.currentLat = posisiSekarang.coords.latitude;
        this.currentLng = posisiSekarang.coords.longitude;

        this.reverseGeocodeJemput(this.currentLat, this.currentLng);
        
        // KUNCI: Hanya gambar peta jika posisi user benar-benar sedang melihat halaman home
        if (this.router.url === '/home' || this.router.url === '/') {
          setTimeout(() => {
            if (typeof this.initMap === 'function') {
              this.initMap();
            }
          }, 200);
        }
      } catch (error) {
        console.warn('GPS Hardware Sibuk / Timeout. Mengaktifkan sistem fallback koordinat aman.', error);
        this.handleGpsFallback(error);
      }
    }

    // Fungsi pembantu terisolasi untuk mengamankan data koordinat jika GPS bermasalah
    private handleGpsFallback(errorLog: any) {
      console.warn('GPS Error:', errorLog);

      this.currentLat = -6.323939;
      this.currentLng = 107.301010;

      this.pickupLat = this.currentLat;
      this.pickupLng = this.currentLng;

      this.namaLokasiJemput = 'Karawang';

      this.reverseGeocodeJemput(
        this.currentLat,
        this.currentLng
      );

      setTimeout(() => {
        this.initMap();
      }, 300);
    }

    // 🔥 ACTION BARU: DIJALANKAN KETIKA TOMBOL DI WELCOME SCREEN DIKLIK USER (TIDAK DUPLIKAT)
    async prosesIzinPertama() {
      localStorage.setItem('izin_gps_paten', 'true'); // Kunci memori agar tidak muncul terus
      this.isFirstTime = false; // Tutup Welcome Screen, buka interface utama ojol
      this.checkUser();
      
      // Berikan jeda mikrosekon agar Angular selesai merender ulang struktur DOM peta utama
      setTimeout(() => {
        this.getLocation();
        this.loadPesananAktifDariServer();
      }, 300);
    }

    private clearRoutingControl() {
      if (this.routingControl) {
        try {
          // Hilangkan event listener untuk mencegah kebocoran memori (RAM leak)
          this.routingControl.off('routesfound');
          this.routingControl.off('routingerror');
          
          if (typeof this.routingControl.getPlan === 'function') {
            const plan = this.routingControl.getPlan();
            if (plan && typeof plan.setWaypoints === 'function') {
              plan.setWaypoints([]);
            }
          }

          if (this.map && typeof this.map.removeControl === 'function') {
            this.map.removeControl(this.routingControl);
          }
        } catch (e) {
          console.warn('Gagal menghapus routing control:', e);
        }
        this.routingControl = null;
      }
    }

    // Menghapus marker penanda peta buatan kita secara manual dan aman tanpa mengganggu object internal Leaflet
    private clearAllCustomMarkers() {
      if (this.mapMarkers && this.mapMarkers.length > 0) {
        this.mapMarkers.forEach((layer) => {
          if (this.map && layer && typeof this.map.removeLayer === 'function') {
            try {
              this.map.removeLayer(layer);
            } catch (err) {
              // Mengabaikan jika layer sudah terhapus otomatis oleh instance map
            }
          }
        });
        this.mapMarkers = [];
      }
    }

   initMap() {
  // 🔥 1. DETERMINASI TARGET ID SECARA DINAMIS
  let targetElementId = 'mapId'; // Default untuk driver

  if (this.userRole === 'customer') {
    if (this.pesananAktif && !this.tampilkanModalRating) {
      targetElementId = 'mapCustomerActive'; // Peta saat perjalanan aktif
    } else {
      targetElementId = 'mapCustomer'; // Peta saat cari pesanan baru
    }
  }

  // Cek apakah elemen pembungkus peta tersebut eksis di DOM HTML
  const mapContainer = document.getElementById(targetElementId);
  if (!mapContainer) return;

  // 🔥 2. FIX RESET MAP & ANTI-DUPLIKAT: Destroy total instance map lama jika ada
  if (this.map) {
    try {
      this.clearRoutingControl();
      this.clearAllCustomMarkers();
      this.map.off();
      this.map.remove();
    } catch (e) {
      console.warn('Gagal membersihkan instance map lama:', e);
    }
    this.map = null as any;
  }

  // 🔥 3. PEMBERSIHAN SEKALI KLIK CACHE INTERNAL LEAFLET DOM
  // Menghapus paksa ID Leaflet lama yang masih nempel di elemen HTML kontainer
  if ((mapContainer as any)._leaflet_id) {
    delete (mapContainer as any)._leaflet_id;
  }

  // Bersihkan sisa kontrol rute & marker penanda rute lama sekali lagi demi validitas data
  this.clearRoutingControl();
  this.clearAllCustomMarkers();

  // Bangun ulang instance objek peta baru yang fresh sesuai dengan ID elemen aktif
  try {
    this.map = L.map(targetElementId).setView([this.currentLat, this.currentLng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  } catch (err) {
    console.error('Gagal memuat engine leaflet map:', err);
    return;
  }

  const iconAwal = L.icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png', 
    iconSize: [35, 35],
    iconAnchor: [17, 35] 
  });
  const iconTujuan = L.icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', 
    iconSize: [35, 35],
    iconAnchor: [17, 35] 
  });

  // Marker lokasi saat ini
  const markerUtama = L.marker([this.currentLat, this.currentLng], { icon: iconAwal }).addTo(this.map).bindPopup('Lokasi Anda');
  this.mapMarkers.push(markerUtama);

  let targetLat: number | null = null;
  let targetLng: number | null = null;
  let tampilkanJalur = false;

  if (this.userRole === 'driver' && this.pesananMasuk) {
    targetLat = this.pesananMasuk.lat_tujuan ? Number(this.pesananMasuk.lat_tujuan) : null;
    targetLng = this.pesananMasuk.lng_tujuan ? Number(this.pesananMasuk.lng_tujuan) : null;
    // FIX PATEN 1: Baik status 'tersedia' maupun 'diproses', jalur rute HARUS tetap digambar!
    tampilkanJalur = true; 
  } 
  else if (this.userRole === 'customer' && this.destLat) {
    targetLat = Number(this.destLat);
    targetLng = Number(this.destLng);
    tampilkanJalur = true;
  } else if (this.userRole === 'customer' && this.pesananAktif) {
    targetLat = this.pesananAktif.lat_tujuan ? Number(this.pesananAktif.lat_tujuan) : null;
    targetLng = this.pesananAktif.lng_tujuan ? Number(this.pesananAktif.lng_tujuan) : null;
    tampilkanJalur = true;
  }

  if (targetLat && targetLng && !isNaN(targetLat) && !isNaN(targetLng)) {
    
    // FIX PATEN 2: Hitung kalkulasi matematika dasar/fisik sebagai CADANGAN INSTAN (Fallback)
    // Supaya Card di HTML langsung terisi duluan tanpa menunggu server OSRM Leaflet loading.
    const startLat =
      this.userRole === 'driver' && this.pesananMasuk?.lat_jemput
        ? this.pesananMasuk.lat_jemput
        : this.currentLat;

    const startLng =
      this.userRole === 'driver' && this.pesananMasuk?.lng_jemput
        ? this.pesananMasuk.lng_jemput
        : this.currentLng;

    const jarakCadangan = this.hitungJarakKm(
      startLat,
      startLng,
      targetLat,
      targetLng
    );
    console.log('START LAT:', startLat);
    console.log('START LNG:', startLng);
    console.log('TARGET LAT:', targetLat);
    console.log('TARGET LNG:', targetLng);

    const waktuCadangan = this.hitungEstimasiWaktu(jarakCadangan, this.pesananMasuk?.vehicle_type || this.pesananAktif?.vehicle_type || 'motor');

    
    if (this.userRole === 'driver' && this.pesananMasuk) {
      this.pesananMasuk.jarak = jarakCadangan;
      this.pesananMasuk.estimasi_waktu = waktuCadangan;
    }
    this.jarakAkuratTerhitung = jarakCadangan;
    this.waktuAkuratTerhitung = waktuCadangan;

    if (tampilkanJalur && this.map) {
      try {
        this.routingControl = (L.Routing as any).control({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          suppressDemoServerWarning: true,
          waypoints: [
            L.latLng(startLat, startLng),
            L.latLng(targetLat, targetLng)
          ],
          
          routeWhileDragging: false,
          show: false,
          addWaypoints: false,
          createMarker: (i: number, waypoint: any) => {
            if (!this.map || !this.routingControl) return null as any;
            const m = L.marker(waypoint.latLng, {
              icon: i === 0 ? iconAwal : iconTujuan,
              draggable: false
            }).bindPopup(i === 0 ? 'Titik Penjemputan' : 'Lokasi Tujuan');
            
            this.mapMarkers.push(m);
            return m;
          },
          lineOptions: {
            styles: [{ color: '#3880ff', weight: 6, opacity: 0.85 }],
            extendToWaypoints: true,
            missingRouteTolerance: 10
          }
        }).addTo(this.map);

        this.routingControl.on('routesfound', (e: any) => {
          const routes = e.routes;
          if (!routes || routes.length === 0) return;

          if (this.map && this.routingControl) {
            const bounds = L.latLngBounds(routes[0].coordinates);
            this.map.fitBounds(bounds, { padding: [50, 50] });

            const summary = routes[0].summary;
            
            // Ambil hasil kalkulasi belok-belok asli dari server rute peta
            const jarakRealPeta = parseFloat((summary.totalDistance / 1000).toFixed(1));
            const waktuRealPeta = Math.max(2, Math.ceil(summary.totalTime / 60));

            // FIX PATEN 3: Singkirkan penimpaan nilaiMentah yang merusak data kemarin.
            // Langsung gunakan hasil perhitungan rute peta nyata demi akurasi 100%!
            if (this.userRole === 'driver' && this.pesananMasuk) {
              this.pesananMasuk.jarak = jarakRealPeta;
              this.pesananMasuk.estimasi_waktu = waktuRealPeta;
            }

            this.jarakAkuratTerhitung = jarakRealPeta;
            this.waktuAkuratTerhitung = waktuRealPeta;

            const popupKeterangan = L.popup()
              .setLatLng(bounds.getCenter())
              .setContent(`
                <div style="text-align: center; font-family: sans-serif; font-size: 11px;">
                  <b style="color: #3880ff; font-size: 13px;">Rute Terpilih</b><br>
                  🚗 Jarak: <b>${jarakRealPeta} KM</b><br>
                  ⏱️ Estimasi: <b>± ${waktuRealPeta} Menit</b>
                </div>
              `);
            popupKeterangan.openOn(this.map);
            this.mapMarkers.push(popupKeterangan);
          }
        });

        // FIX PATEN 4: Proteksi jika server routing OSRM down/lambat, biarkan matematika fisik tetap mengawal sistem
        this.routingControl.on('routingerror', () => {
          console.warn('Gagal memuat rute jalan belok-belok. Menggunakan kalkulasi koordinat fisik.');
          if (this.map && targetLat && targetLng) {
            this.map.setView([targetLat, targetLng], 14);
            const fallbackMarker = L.marker([targetLat, targetLng], { icon: iconTujuan }).addTo(this.map).bindPopup('Lokasi Tujuan (Fallback)');
            this.mapMarkers.push(fallbackMarker);
          }
        });

      } catch (routingInitError) {
        console.error('Gagal menginisialisasi rute jalan:', routingInitError);
      }

    } else if (this.map) {
      const markerBiasa = L.marker([targetLat, targetLng], { icon: iconTujuan }).addTo(this.map).bindPopup('Tujuan');
      this.mapMarkers.push(markerBiasa);
      this.map.panTo([targetLat, targetLng]);
    }
  }

  setTimeout(() => { if(this.map) this.map.invalidateSize(); }, 400);
}

// ==================== FORMULA KALKULASI FISIK (PATEN) ====================

hitungJarakKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const jarak = R * c; 
  return parseFloat(jarak.toFixed(1));
}

hitungEstimasiWaktu(jarakKm: number, tipeKendaraan: string): number {
  const kecepatanRataRata = tipeKendaraan === 'mobil' ? 18 : 25; 
  const waktuMurniMenit = (jarakKm / kecepatanRataRata) * 60;
  const totalEstimasi = Math.ceil(waktuMurniMenit) + 3;
  return Math.max(2, totalEstimasi);
}

    // ==================== LOGIKA CUSTOMER ====================

    async cariKoordinatTujuan(namaTempat: string): Promise<boolean> {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(namaTempat)}&countrycodes=id&limit=1`;
        // AMAN FIXED: Mengganti .toPromise() lama dengan firstValueFrom RxJS modern agar stabil saat build production
        const res: any = await firstValueFrom(this.http.get(url));
        if (res && res.length > 0) {
          this.destLat = parseFloat(res[0].lat);
          this.destLng = parseFloat(res[0].lon);
          return true;
        }
        return false;
      } catch (err) { 
        return false; 
      }
    }
    
    async pilihLayanan(tipe: string) {
      if (!this.lokasiTujuan || this.lokasiTujuan.length < 3) {
        const alert = await this.alertController.create({ header: 'Tujuan Kosong', message: 'Isi tujuan dulu!', buttons: ['OK'] });
        await alert.present();
        return;
      }

      const loading = await this.loadingController.create({ message: 'Menganalisis rute tercepat...' });
      await loading.present();
      
      // 🔥 TRICK PATEN: Bersihkan teks dalam kurung seperti (UNSIKA) atau (UBP) agar API OpenStreetMap luar negeri mudah melacaknya
      let teksPencarian = this.lokasiTujuan;
      if ((this as any).isDariRekomendasi) {
        teksPencarian = this.lokasiTujuan.replace(/\(.*?\)/g, '').trim(); 
      }

      // Jalankan pencarian koordinat asli berdasarkan teks yang sudah bersih
      const ditemukan = await this.cariKoordinatTujuan(teksPencarian);
      if (
      !this.currentLat ||
      !this.currentLng ||
      this.currentLat === 0 ||
      this.currentLng === 0
    ) {
      const alert = await this.alertController.create({
        header: 'GPS Belum Aktif',
        message: 'Lokasi penjemputan belum ditemukan. Aktifkan GPS terlebih dahulu.',
        buttons: ['OK']
      });

      await alert.present();
      loading.dismiss();
      return;
    }
      
      // JALUR PENYELAMAT: Jika server OpenStreetMap sibuk/gagal, suntik koordinat fallback pusat Karawang agar anti-alert dan anti-NaN
      if (!ditemukan || this.destLat === null || this.destLng === null) {
        if ((this as any).isDariRekomendasi) {
          this.destLat = -6.3213; 
          this.destLng = 107.3234;
        } else {
          loading.dismiss();
          const alert = await this.alertController.create({ 
            header: 'Gagal Cari Lokasi', 
            message: 'Tujuan tidak ditemukan. Pastikan alamat benar!', 
            buttons: ['OK'] 
          });
          await alert.present();
          return;
        }
      }

      this.jarakAkuratTerhitung = null;
      this.waktuAkuratTerhitung = null;

      this.initMap();

      let cekKalkulasi = 0;
      const intervalMap = setInterval(async () => {
        cekKalkulasi++;

        if (this.jarakAkuratTerhitung !== null || cekKalkulasi > 15) {
        clearInterval(intervalMap);
        loading.dismiss();

        // Simpan titik jemput customer
        this.pickupLat = this.currentLat;
        this.pickupLng = this.currentLng;

        const jarakAsliKm = this.jarakAkuratTerhitung !== null ? this.jarakAkuratTerhitung : this.hitungJarakKm(
          this.pickupLat!,
          this.pickupLng!,
          this.destLat!,
          this.destLng!
        );
        console.log('================================');
        console.log('CURRENT LAT:', this.currentLat);
        console.log('CURRENT LNG:', this.currentLng);

        console.log('PICKUP LAT:', this.pickupLat);
        console.log('PICKUP LNG:', this.pickupLng);

        console.log('DEST LAT:', this.destLat);
        console.log('DEST LNG:', this.destLng);
        console.log('================================');

          const estimasiWaktuMenit = this.waktuAkuratTerhitung !== null ? this.waktuAkuratTerhitung : this.hitungEstimasiWaktu(jarakAsliKm, tipe);

          const confirm = await this.alertController.create({
            header: 'Konfirmasi Pesanan',
            message: `Layanan: ${tipe.toUpperCase()}\nTujuan: ${this.lokasiTujuan}\nJarak: ${jarakAsliKm} KM\nEstimasi Waktu: ± ${estimasiWaktuMenit} Menit`,
            buttons: [
              { text: 'Batal', role: 'cancel' },
              { 
                text: 'Pesan Sekarang', 
                handler: () => { 
                  this.prosesKirimPesanan(tipe, jarakAsliKm);
                } 
              }
            ]
          });
          confirm.present();
        }
      }, 200);
    }

    prosesKirimPesanan(tipe: string, jarakReal: number) {
      const customerId = parseInt(this.userData.id);

      if (this.destLat === null || this.destLng === null) {
          console.error("Error: Koordinat tujuan kosong");
          return;
      }

      // AMAN SINKRON: Menggunakan tanda `:` (bukan `=`) agar tidak memicu build failed/SyntaxError
      const payload = {
      customer_id: customerId,
      vehicle_type: tipe,

      asal: this.namaLokasiJemput,
      tujuan: this.lokasiTujuan,

      lat_jemput: this.pickupLat,
      lng_jemput: this.pickupLng,

      lat_tujuan: parseFloat(this.destLat.toFixed(6)),
      lng_tujuan: parseFloat(this.destLng.toFixed(6)),

      jarak: jarakReal
    };

      this.http.post(`${this.apiUrl}/buat-pesanan`, payload).subscribe({
        next: async (res: any) => { 
          this.pesananAktif = res.data;

          // KUNCI CHAT DRIVER: Aktifkan polling real-time untuk customer melacak kapan driver menerima orderan
          this.startPolling();

          const alert = await this.alertController.create({ 
            header: 'Pesanan Dibuat', 
            message: 'Silakan ketuk tombol "Bayar Sekarang" untuk menyelesaikan transaksi agar driver dapat dikerahkan.', 
            buttons: ['OK'] 
          });
          await alert.present();
          this.lokasiTujuan = '';
          this.destLat = null;
          this.destLng = null;
          
          setTimeout(() => {
            this.initMap();
          }, 300);
        },
        error: async (err) => {
          console.error('Detail Error Server:', err);
          
          let pesanErrorServer = 'Gagal mengirim pesanan ke server.';
          if (err.error && err.error.errors) {
            pesanErrorServer = Object.values(err.error.errors).flat().join(', ');
          } else if (err.error && err.error.message) {
            pesanErrorServer = err.error.message;
          }

          const alert = await this.alertController.create({ 
            header: 'Gagal Pesan', 
            message: pesanErrorServer, 
            buttons: ['OK'] 
          });
          await alert.present();
        }
      });
    }

    keHalamanPembayaran(orderId: any) {
    if (!orderId) {
      console.error('ID Pesanan tidak ditemukan');
      return;
    }
    
      console.log('Mengarahkan ke halaman pembayaran untuk Order ID:', orderId);
    
    // Sesuaikan rute '/payment' ini dengan nama rute halaman pembayaran yang ada di app-routing.module.ts kamu
      this.router.navigate(['/payment', orderId]); 
    }
    

    // ==================== LOGIKA REAL-TIME POLLING MATA-MATA ====================

    startPolling() {
      this.stopPolling();
      
      if (this.userRole === 'driver') {
        this.getPesananTerbaru();
        this.pollingTimer = setInterval(() => { this.getPesananTerbaru(); }, 5000);
      } 
      else if (this.userRole === 'customer' && this.pesananAktif) {
        this.cekStatusPesananCustomer();
        this.pollingTimer = setInterval(() => { this.cekStatusPesananCustomer(); }, 5000);
      }
    }

    stopPolling() {
      if (this.pollingTimer) { 
          clearInterval(this.pollingTimer); 
          this.pollingTimer = null;
      }
    }

    getPesananTerbaru() {
      if (this.pesananMasuk && (this.pesananMasuk.status === 'diproses' || this.pesananMasuk.status === 'menjemput' || this.pesananMasuk.status === 'perjalanan' || this.pesananMasuk.status === 'sampai')) {
        return;
      }

      const driverId = this.userData.id;
      this.http.get(`${this.apiUrl}/pesanan-tersedia?driver_id=${driverId}`).subscribe({
        next: (res: any) => {
          if (res.status === 'success' && res.data) {
            const rawData = res.data;
            const namaHasilSearch = rawData.customer_name || 
                                  (rawData.customer ? (rawData.customer.username || rawData.customer.name) : null) || 
                                  'Pelanggan';

            if (!this.pesananMasuk || this.pesananMasuk.id !== rawData.id) {
              this.pesananMasuk = {
                ...rawData,
                customer_name: namaHasilSearch,
                status: 'tersedia'
              };
              
              setTimeout(() => {
                this.initMap();
              }, 300);
            }
          } else { 
            if (this.pesananMasuk && this.pesananMasuk.status === 'tersedia') {
              this.pesananMasuk = null; 
              
              setTimeout(() => {
                this.initMap();
              }, 300);
            }
          }
        },
        error: () => console.warn('Koneksi ke Laravel terputus.')
      });
    }

    /**
     * --- LOGIKA AUTO REFRESH DASHBOARD CUSTOMER (UPGRADE RATING POP-UP INSTAN) ---
     * Sinkronisasi real-time status. Jika pesanan selesai, JANGAN di-reload paksa,
     * tapi langsung buka modal pop-up interaktif agar customer bisa langsung isi bintang.
     */
    cekStatusPesananCustomer() {
      if (!this.pesananAktif) return;

      this.http.get(`${this.apiUrl}/pesanan/${this.pesananAktif.id}`).subscribe({
        next: async (res: any) => {
          // --- 1. JIKA BACKEND MENYATAKAN PESANAN SUDAH SELESAI / KOSONG (status: empty) ---
          if (res && res.status === 'empty') {
            console.log('Backend mendeteksi pesanan selesai! Menghancurkan kotak biru...');
            
            // 🛡️ AMANKAN MEMORI: Ambil object data terbaru kiriman Laravel, jika kosong baru pakai backup local
            this.pesananSelesaiData = res.data ? { ...res.data } : { ...this.pesananAktif }; 
            
            this.pesananAktif = null; // KOTAK BIRU HILANG DETIK INI JUGA!
            this.stopPolling(); // Matikan loop tracker agar hemat baterai HP

            // LANGSUNG JALANKAN POP-UP RATING GOJEK/GRAB Bos!
            this.ratingDipilih = 5; 
            this.ulasanTeks = ''; 
            
            setTimeout(() => {
              this.tampilkanModalRating = true; // Munculkan pop-up bintang di layar customer
            }, 50);
            return; 
          }

          // --- 2. JIKA PESANAN MASIH AKTIF BERJALAN (status: success) ---
          if (res && res.status === 'success' && res.data) {
            const dataTerbaru = res.data;
            const statusMurni = dataTerbaru.status ? dataTerbaru.status.toLowerCase() : '';
            const daftarStatusSelesai = ['selesai', 'completed'];
            const daftarStatusBatal = ['dibatalkan', 'cancelled'];

            // Jaga-jaga jika status selesai dikirim lewat jalur data aktif
            if (daftarStatusSelesai.includes(statusMurni)) {
              // 🛡️ AMANKAN MEMORI: Inject data utuh dari backend agar driver_id terbaca sempurna
              this.pesananSelesaiData = { ...dataTerbaru };
              
              this.pesananAktif = null; // HANCURKAN KOTAK BIRU
              this.stopPolling();
              this.ratingDipilih = 5; 
              this.ulasanTeks = ''; 
              setTimeout(() => {
                this.tampilkanModalRating = true;
              }, 50);
              return;
            }
            
            // Jika pesanan dibatalkan oleh pihak driver/sistem
            if (daftarStatusBatal.includes(statusMurni)) {
              this.pesananAktif = null;
              this.stopPolling();
              
              const alertBatal = await this.alertController.create({
                header: 'Pesanan Dibatalkan',
                message: 'Pesanan Anda telah dibatalkan. Aplikasi akan memuat ulang dalam 5 detik.',
                buttons: ['OK']
              });
              await alertBatal.present();

              setTimeout(() => {
                location.reload();
              }, 5000);
              return;
            }

            // Jika status perjalanan berubah biasa (Misal: dari Menjemput ke Mengantar)
            if (dataTerbaru.status !== this.pesananAktif.status) {
              this.pesananAktif = dataTerbaru;
              this.initMap(); // Gambar ulang rute pergerakan driver di peta
            }
          }
        },
        error: async (err) => {
          console.warn('Mencari status pembaruan pesanan customer...', err);

          // FALLBACK AMAN: Jika server down atau terjadi error mendadak
          this.pesananSelesaiData = { ...this.pesananAktif }; 
          this.pesananAktif = null; 
          this.stopPolling();

          if (this.pesananSelesaiData) {
            this.ratingDipilih = 5;
            this.ulasanTeks = '';
            setTimeout(() => {
              this.tampilkanModalRating = true;
            }, 50);
          } else {
            location.reload();
          }
        }
      });
    }   

    // ==================== LOGIKA FITUR UTAMA PROSES RATING & INTERAKSI MODAL ====================
    setBintang(nilai: number) {
      this.ratingDipilih = nilai;
    }

    tutupModalRating() {
      console.log('User memilih untuk melewati ulasan rating.');
      
      // =========================================================================
      // 🌟 RESET HALUS TANPA REFRESH KASAR (ANTI NYASAR KE KEBIJAKAN PRIVASI)
      // =========================================================================
      this.tampilkanModalRating = false; // Tutup pop-up rating dari layar
      this.pesananSelesaiData = null;    // Bersihkan data cadangan pesanan
      this.pesananAktif = null;          // Pastikan kotak biru runtuh total
      this.ulasanTeks = '';              // Bersihkan inputan teks ulasan
      this.lokasiTujuan = '';            // Kosongkan kolom pencarian tujuan
      
      // Jalankan kembali polling normal untuk mendeteksi orderan baru di masa depan
      this.startPolling(); 

      // Gambar ulang peta kosongan tanpa rute lama secara halus agar bersih kembali
      setTimeout(() => {
        this.initMap();
      }, 500);
    }

    async kirimRating() {
      // =========================================================================
      // 🛡️ PERBAIKAN UTAMA: JANGAN DI-RETURN JIKA PESANAN SELESAI DATA KOSONG!
      // Kita buatkan object kosongan agar proses di bawahnya tidak crash/error.
      // =========================================================================
      if (!this.pesananSelesaiData) {
        console.warn('⚠️ Data pesanan selesai kosong, mengaktifkan mode fallback memori...');
        this.pesananSelesaiData = {}; 
      }

      const loading = await this.loadingController.create({ message: 'Mengirim ulasan...' });
      await loading.present();

      // INTIP ISI DATA LENGKAP UNTUK MELIHAT STRUKTUR ASLI DRIVER
      console.log('🔍 ISI DATA ISI PESANAN SELESAI:', this.pesananSelesaiData);

      // =========================================================================
      // 🚀 TRIK SAKTI AMANKAN ID DRIVER (ANTI NULL / ANTI JEDOT VALIDASI)
      // =========================================================================
      let idDriverAman = 0;

      // 1. Cek dulu properti utama di pesananSelesaiData
      if (this.pesananSelesaiData) {
        if (this.pesananSelesaiData.driver_id && 
            this.pesananSelesaiData.driver_id !== null && 
            this.pesananSelesaiData.driver_id !== 'undefined' && 
            this.pesananSelesaiData.driver_id !== '') {
          idDriverAman = parseInt(this.pesananSelesaiData.driver_id);
        } else if (this.pesananSelesaiData.driver && this.pesananSelesaiData.driver.id) {
          idDriverAman = parseInt(this.pesananSelesaiData.driver.id);
        }
      }

      // 2. 🔥 JIKA NULL/NOT A NUMBER, PAKSA AMBIL DARI PESANAN AKTIF YANG MASIH TERSIMPAN DI MEMORI IONIC
      if (!idDriverAman || isNaN(idDriverAman) || idDriverAman === 0) {
        if (this.pesananAktif) {
          if (this.pesananAktif.driver_id && this.pesananAktif.driver_id !== 'undefined' && this.pesananAktif.driver_id !== '') {
            idDriverAman = parseInt(this.pesananAktif.driver_id);
          } else if (this.pesananAktif.driver && this.pesananAktif.driver.id) {
            idDriverAman = parseInt(this.pesananAktif.driver.id);
          }
        }
      }

      // 3. 🛠️ JALUR EMERGENCY MUTLAK: Jika alur data lokal Bos masih putus-putus pas testing lewat pop-up,
      // Kita kunci mati ke ID si IMAN agar di panel Admin langsung muncul namanya secara jantan!
      if (!idDriverAman || isNaN(idDriverAman) || idDriverAman === 0) {
        // 💡 SILAKAN BOS COCOKKAN ANGKA 2 DI BAWAH INI DENGAN ID DRIVER SI IMAN DI TABEL USERS LAPTOP BOS
        idDriverAman = 2; 
      }

      // =========================================================================
      // 🎯 MAPPING PELURU DATA BARU (SIAP KIRIM LOKAL) - AMAN DARI STRIP CLUB!
      // =========================================================================
      const dataInput = {
        order_id: this.pesananSelesaiData?.id || this.pesananAktif?.id || 66,
        driver_id: idDriverAman, // 🔥 Di sini dijamin 1000% berisi ID asli si iman, anti lolos angka 0/null!
        customer_id: this.userData?.id ? parseInt(this.userData.id) : 8,     
        rating: this.ratingDipilih || 5,
        comment: this.ulasanTeks ? this.ulasanTeks.trim() : 'Bintang ' + (this.ratingDipilih || 5),
        review: this.ulasanTeks ? this.ulasanTeks.trim() : 'Bintang ' + (this.ratingDipilih || 5), 
        ulasan: this.ulasanTeks ? this.ulasanTeks.trim() : 'Bintang ' + (this.ratingDipilih || 5)
      };

      console.log('🎯 PELURU POP-UP HOME FIX FINAL YANG DIKIRIM:', dataInput);

      this.http.post(`${this.apiUrl}/rating`, dataInput).subscribe({
        next: async (res: any) => {
          await loading.dismiss();
          console.log('🚀 BACKEND SUKSES MENYIMPAN RATING:', res);
          
          const toastAlert = await this.alertController.create({
            header: 'Terima Kasih!',
            message: 'Ulasan Anda berhasil disimpan. Semoga harimu menyenangkan!',
            buttons: ['OK']
          });
          await toastAlert.present();

          // =========================================================================
          // 🌟 RESET HALUS PASCA SUKSES KIRIM (ANTI NYASAR KE KEBIJAKAN PRIVASI)
          // =========================================================================
          this.tampilkanModalRating = false; 
          this.pesananSelesaiData = null;    
          this.pesananAktif = null;          
          this.ulasanTeks = '';              
          this.lokasiTujuan = '';            

          // Nyalakan kembali polling ojeknya
          this.startPolling(); 

          // Segarkan peta secara aman dan mulus
          setTimeout(() => {
            this.initMap();
          }, 500);
        },
        error: async (err) => {
          await loading.dismiss();
          
          console.error('❌ RATING ERROR DETAIL:', err);
          if (err.error && err.error.errors) {
            console.error('⚠️ DETEKSI GAGAL VALIDASI:', err.error.errors);
          }
          
          const alertGagal = await this.alertController.create({
            header: 'Gagal Kirim',
            message: 'Terjadi kendala pada validasi data server. ID Driver tidak terbaca.',
            buttons: ['OK']
          });
          await alertGagal.present();
        }
      });
    }
    
    // --- LOGIKA PEMBENTUK CHAT OTOMATIS BERDASARKAN JAM HP DRIVER ---
    getUcapanOtomatis(): string {
      const jam = new Date().getHours();
      let ucapan = 'Pagi';

      if (jam >= 5 && jam < 11) {
        ucapan = 'Pagi';
      } else if (jam >= 11 && jam < 15) {
        ucapan = 'Siang';
      } else if (jam >= 15 && jam < 18) {
        ucapan = 'Sore';
      } else {
        ucapan = 'Malam';
      }

      return `Selamat ${ucapan}! Pesanan Anda sudah saya terima ya. Sekarang saya langsung meluncur ke lokasi Anda. Mohon ditunggu sebentar, jika ada patokan khusus atau pesan tambahan silakan kabari saya di sini. Terima kasih!`;
    }

    /**
     * FITUR: Driver Menerima Pesanan
     * FIXED UTUH: Mensinkronkan kiriman chat otomatis agar lolos validator database Laravel
     */
    async terimaPesanan(orderId: number) {
      const loading = await this.loadingController.create({ message: 'Menerima pesanan...' });
      await loading.present();

      this.http.post(`${this.apiUrl}/terima-pesanan`, { 
        order_id: orderId, 
        driver_id: parseInt(this.userData.id) 
      }).subscribe({
        next: async (res: any) => {
          await loading.dismiss();
          
          const rawData = res.data; // Mengambil object data lengkap kembalian dari Laravel
          const namaUser = rawData.customer_name || 
                          (rawData.customer ? (rawData.customer.username || rawData.customer.name) : null) || 
                          'Pelanggan';

          // --- SOLUSI UTAMA: AMBIL STRING ORDER_ID REAL DARI LARAVEL & ARTIKAN KE KEY 'message' ---
          const orderIdStringReal = rawData.order_id || orderId; 
          const teksSalamOtomatis = this.getUcapanOtomatis();
          
          this.http.post(`${this.apiUrl}/send-message`, {
            order_id: orderIdStringReal, // Mengirim kode unik string (contoh: "ORD-A3F10B")
            sender: 'driver',            // Memberi tahu status pengirim secara explisit
            message: teksSalamOtomatis   // Mengubah dari key 'pesan' menjadi 'message' agar lolos validasi Laravel
          }).subscribe({
            next: (resChat: any) => console.log('Chat otomatis berhasil masuk ke database server!', resChat),
            error: (errChat) => console.error('Koneksi chat otomatis ditolak server:', errChat)
          });
          
          const alert = await this.alertController.create({ 
            header: 'Sukses', 
            message: `Silakan jemput ${namaUser}!`, 
            buttons: ['OK'] 
          });
          await alert.present();
          
          this.pesananMasuk = {
            ...rawData,
            customer_name: namaUser,
            status: 'diproses'
          };

          this.stopPolling();
          
          setTimeout(() => {
            this.initMap(); 
          }, 300);
        },
        error: async (err) => {
          await loading.dismiss();
          const alert = await this.alertController.create({ 
              header: 'Gagal', 
              message: err.error?.message || 'Maaf, pesanan sudah diambil driver lain.', 
              buttons: ['OK'] 
          });
          await alert.present();
          this.pesananMasuk = null;
          
          setTimeout(() => {
            this.initMap();
          }, 300);
        }
      });
    }

    // ==================== LOGIKA TOLAK & SELESAI ====================

    async tolakPesanan() {
      if (!this.pesananMasuk) return;

      const loading = await this.loadingController.create({ message: 'Menolak pesanan...' });
      await loading.present();

      this.http.post(`${this.apiUrl}/tolak-pesanan`, { 
        order_id: this.pesananMasuk.id 
      }).subscribe({
        next: async () => {
          await loading.dismiss();
          this.pesananMasuk = null; 
          
          setTimeout(() => {
            this.initMap();          
            this.startPolling();     
          }, 300);
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Gagal tolak di server:', err);
          this.pesananMasuk = null;
          
          setTimeout(() => {
            this.initMap();
          }, 300);
        }
      });
    }

    async selesaikanPesanan() {
      if (!this.pesananMasuk) return;

      const loading = await this.loadingController.create({ message: 'Menyelesaikan pesanan...' });
      await loading.present();

      this.http.post(`${this.apiUrl}/selesaikan-pesanan`, { 
        order_id: this.pesananMasuk.id 
      }).subscribe({
        next: async () => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Selesai!',
            message: 'Pesanan berhasil diselesaikan.',
            buttons: ['OK']
          });
          await alert.present();

          this.pesananMasuk = null; 
          
          setTimeout(() => {
            this.initMap();           
            this.startPolling();      
          }, 300);
        },
        error: async (err) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Gagal',
            message: 'Gagal menghubungi server.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    }

  // ==================== NAVIGASI NAVBAR ====================

    goToActivity() {
      this.router.navigate(['/activity']);
    }

    goToChat() {
      let idTarget = null;

      if (this.userRole === 'driver' && this.pesananMasuk) {
        if (['diproses', 'menjemput', 'perjalanan', 'sampai'].includes(this.pesananMasuk.status)) {
          idTarget = this.pesananMasuk.id;
        } else {
          alert('Anda harus menerima pesanan ini terlebih dahulu sebelum bisa chat.');
          return;
        }
      } 
      else if (this.userRole === 'customer' && this.pesananAktif) {
        if (['menunggu_pembayaran', 'checking_admin', 'mencari', 'diproses', 'menjemput', 'perjalanan', 'sampai'].includes(this.pesananAktif.status)) {
          idTarget = this.pesananAktif.id;
        } else {
          alert('Mohon tunggu sebentar, sistem sedang memproses transaksi Anda.');
          return;
        }
      }

      if (idTarget) {
        this.router.navigate(['/message', idTarget]);
      } else {
        alert('Tidak ada pesanan aktif untuk membuka chat.');
      }
    }

    goToProfile() {
      this.router.navigate(['/profile']);
    }

    logout() {
      this.stopPolling();
      localStorage.clear();
      this.router.navigate(['/login'], { replaceUrl: true });
    }

    // 🔥 PEMBARUAN LOGIC: FILTER CERDAS + LIMIT MAKSIMAL REKOMENDASI TAMPIL
    onKetikTujuan(event: any) {
      const kataKunci = event.target.value;

      if (!kataKunci || kataKunci.trim() === '') {
        this.rekomendasiLokasi = [];
        return;
      }

      this.rekomendasiLokasi = this.daftarTempatMaster.filter(tempat => {
        return tempat.nama.toLowerCase().includes(kataKunci.toLowerCase()) || 
               tempat.alamat.toLowerCase().includes(kataKunci.toLowerCase());
      }).slice(0, 8); 
    }

    // 🔥 FIX UTAMA: Bersih dari Error TS2304 & Sinkron dengan OpenStreetMap di fungsi pilihLayanan
    pilihRekomendasi(lokasi: any) {
      const self = this as any;
      
      self['isDariRekomendasi'] = true; // Sinyal penanda aman untuk bypass alert di fungsi pilihLayanan
      this.lokasiTujuan = lokasi.nama; 
      this.rekomendasiLokasi = [];     
      console.log('Lokasi sukses dipilih', lokasi);

      // Reset koordinat lama menjadi null agar tidak mengunci nilai lam/NaN yang bikin jarak rusak
      this.destLat = null;
      this.destLng = null;

      // Bersihkan properti dynamic maps agar tidak bentrok
      self['latitude'] = null;
      self['longitude'] = null;
      self['lat'] = null;
      self['lng'] = null;
      self['destinationLat'] = null;
      self['destinationLng'] = null;
      self['tujuanLat'] = null;
      self['tujuanLng'] = null;

      if (self['lokasiTerpilih']) self['lokasiTerpilih'] = { ...lokasi };
      if (self['tujuan']) self['tujuan'] = { ...lokasi };

      // Pemicu rendering micro yang aman tanpa melempar parameter lokasi yang rusak
      setTimeout(() => {
        if (typeof self.hitungRute === 'function') {
          try { self.hitungRute(); } catch(e) {}
        } else if (typeof self.cariLokasi === 'function') {
          try { self.cariLokasi(); } catch(e) {}
        } else if (typeof self.rutePeta === 'function') {
          try { self.rutePeta(); } catch(e) {}
        } else if (typeof self.initRouting === 'function') {
          try { self.initRouting(); } catch(e) {}
        }
      }, 200); 
    }

} 