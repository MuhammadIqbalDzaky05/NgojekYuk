import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Cukup gunakan ini saja, tanpa /dist/loader
import '@codetrix-studio/capacitor-google-auth';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));