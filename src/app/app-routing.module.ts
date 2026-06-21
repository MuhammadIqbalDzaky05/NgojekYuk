import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // 1. Jalur Utama (DISESUAIKAN UNTUK CEK ALUR DI APP.COMPONENT.TS)
  {
    path: '',
    redirectTo: '', // 🔥 Biarkan kosong agar app.component.ts yang menentukan tujuan lewat router.navigateByUrl
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadChildren: () => import('./splash/splash.module').then( m => m.SplashPageModule)
  },

  // 2. Grup Auth
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then( m => m.LoginPageModule )
  },
  {
    path: 'register',
    loadChildren: () => import('./auth/register/register.module').then( m => m.RegisterPageModule )
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./auth/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule )
  },

  // 3. Menu Utama
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.module').then( m => m.ActivityPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  
  // --- FIX MESSAGE PATH ---
  {
    path: 'message/:id', 
    loadChildren: () => import('./message/message.module').then( m => m.MessagePageModule)
  },

  {
    path: 'payment/:id', // <-- Tetap aman di sini & COCOK DENGAN home.page.ts
    loadChildren: () => import('./payment/payment.module').then( m => m.PaymentPageModule)
  },

  // 4. Fitur Tambahan & Rating (AMAN DI ATAS WILDCARD)
  {
    path: 'rating',
    loadChildren: () => import('./rating/rating.module').then( m => m.RatingPageModule)
  },
  {
    path: 'driver-reviews',
    loadChildren: () => import('./driver-reviews/driver-reviews.module').then( m => m.DriverReviewsPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./pages/privacy-policy/privacy-policy.module').then( m => m.PrivacyPolicyPageModule)
  },

  // 5. Jalur Penyelamat (Fallback) - BENAR-BENAR PALING BAWAH SAKRAL TANPA ADA TOLERANSI
  {
    path: '**',
    redirectTo: 'home' 
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }