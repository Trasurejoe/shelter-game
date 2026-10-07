package com.shelter.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

/**
 * Hosts the unchanged Shelter web game from the APK's assets, offline.
 * The game is served from https://appassets.androidplatform.net so localStorage (saves)
 * has a stable, persistent origin and the Web Audio and Gamepad APIs behave as in a browser.
 */
public class MainActivity extends Activity {
    private static final String START_URL = "https://appassets.androidplatform.net/game/www/index.html";
    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/game/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web = new WebView(this);
        web.setBackgroundColor(0xFF15201D);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);            // localStorage = persistent saves
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setBuiltInZoomControls(false);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                return loader.shouldInterceptRequest(r.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("appassets.androidplatform.net".equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });

        setContentView(web);
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        web.requestFocus();   // keyboard and gamepad events reach the game
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START_URL);
        hideSystemBars();
    }

    private void hideSystemBars() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    /**
     * Back button: on a sub-screen (Journey, Settings, Multiplayer) press the game's own Back button.
     * In a level, ask before returning to the title screen (progress is saved). On the title screen, exit.
     */
    @Override
    public void onBackPressed() {
        final String js = "(function(){var b=document.querySelector('#bk');if(b){b.click();return 'sub';}"
                + "if(document.querySelector('#menu'))return 'game';return 'title';})()";
        web.evaluateJavascript(js, value -> {
            String v = value == null ? "" : value.replace("\"", "");
            if ("sub".equals(v)) return;
            if ("game".equals(v)) {
                new AlertDialog.Builder(MainActivity.this)
                        .setMessage("Return to the title screen? Your progress is saved.")
                        .setPositiveButton("Title screen", (d, w) ->
                                web.evaluateJavascript("document.querySelector('#menu')&&document.querySelector('#menu').click()", null))
                        .setNegativeButton("Keep playing", null)
                        .show();
            } else {
                finish();
            }
        });
    }

    @Override
    protected void onPause() {
        // Ask the game to save, then pause timers and audio.
        web.evaluateJavascript("try{SHELTER.bus.emit('save:requested',{})}catch(e){}", null);
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        web.requestFocus();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }
}
