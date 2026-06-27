import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'; 
import { IonContent, ToastController } from '@ionic/angular'; 
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
  standalone: false,
})
export class MessagePage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  messages: any[] = [];
  newMessage: string = '';
  
  orderId: any = null; 
  userRole: string = ''; 
  
  chatInterval: any;
  private apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController
  ) { }


  ngOnInit() {
    // 1. Ambil Identitas User
    const data = localStorage.getItem('userData');
    if (data) {
      const userData = JSON.parse(data);
      this.userRole = userData.role; 
    } else {
      this.router.navigate(['/login']); 
      return;
    }


    // 2. Ambil order_id dari parameter rute
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (!idParam || idParam === 'null' || idParam === 'undefined') {
      console.error("ID Pesanan tidak valid!");
      this.toastCtrl.create({
        message: 'Sesi chat tidak valid atau pesanan sudah berakhir.',
        duration: 2500,
        color: 'danger',
        position: 'top',
      }).then(t => t.present());
      this.router.navigate(['/home']); 
      return;
    }

    this.orderId = idParam;
    console.log("Chat Room ID:", this.orderId);

    // 3. Load data pertama kali
    this.getChatMessages();

    // 4. Polling: cek pesan baru setiap 3 detik
    this.startPolling();
  }

  // Pengaman agar interval tidak tumpang tindih
  startPolling() {
    this.stopPolling();
    this.chatInterval = setInterval(() => {
      this.getChatMessages();
    }, 3000);
  }

  stopPolling() {
    if (this.chatInterval) {
      clearInterval(this.chatInterval);
      this.chatInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  getChatMessages() {
    if (!this.orderId || this.orderId === 'null') return;

    this.http.get(`${this.apiUrl}/get-messages/${this.orderId}`)
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            // Hanya update & scroll jika ada jumlah pesan yang berubah
            if (this.messages.length !== res.data.length) {
              this.messages = res.data;
              this.scrollToBottom();
            }
          }
        },
        error: (err) => {
          console.warn('Koneksi backend bermasalah saat ambil chat.');
        }
      });
  }

  sendMessage() {
    const trimmedMsg = this.newMessage.trim();
    if (trimmedMsg === '') return;
    
    if (!this.orderId || !this.userRole) {
      this.toastCtrl.create({
        message: 'Error: Sesi tidak valid.',
        duration: 2500,
        color: 'danger',
        position: 'top',
      }).then(t => t.present());
      return;
    }


    const payload = {
      order_id: this.orderId,
      sender: this.userRole,
      message: trimmedMsg
    };

    // Langsung kosongkan input biar user merasa responsif
    this.newMessage = ''; 

    this.http.post(`${this.apiUrl}/send-message`, payload)
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.getChatMessages(); // Refresh chat setelah kirim
            this.scrollToBottom(); 
          }
        },
        error: (error) => {
          console.error("Gagal kirim:", error.error);
          this.toastCtrl.create({
            message: error.error?.message || 'Gagal mengirim pesan!',
            duration: 2500,
            color: 'danger',
            position: 'top',
          }).then(t => t.present());
          // Jika gagal, kembalikan teksnya biar user tidak capek ngetik ulang
          this.newMessage = trimmedMsg; 
        }
      });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, 200); 
  }
}