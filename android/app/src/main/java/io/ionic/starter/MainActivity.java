package com.ngojekyuk.app;

import android.os.Bundle;
import android.content.pm.ActivityInfo;
import android.webkit.WebSettings;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 1. Memaksa aplikasi selalu dalam mode Portrait
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        
        // 2. Konfigurasi agar WebView otomatis mengikuti Dark Mode sistem
        if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
            WebSettingsCompat.setForceDark(getBridge().getWebView().getSettings(), WebSettingsCompat.FORCE_DARK_AUTO);
        }
    }
}