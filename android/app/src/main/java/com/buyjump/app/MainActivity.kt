package com.buyjump.app

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.ViewGroup
import android.view.Window
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import com.buyjump.app.data.repository.BuyJumpRepository
import java.io.InputStream
import java.net.URLConnection

class MainActivity : Activity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        window.statusBarColor = Color.parseColor("#0F2C59")
        window.navigationBarColor = Color.parseColor("#FFFFFF")

        val container = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0F2C59"))
        }

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                loadWithOverviewMode = true
                useWideViewPort = true
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
                setSupportMultipleWindows(false)
            }

            addJavascriptInterface(BuyJumpBridge(), "BuyJumpNative")

            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {

                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val url: Uri = request?.url ?: return false
                    val urlStr = url.toString()

                    // Handle custom deep-link scheme buyjump://auth-callback
                    if (url.scheme == "buyjump") {
                        val query = url.encodedQuery ?: "oauth_callback=1&provider=google"
                        view?.loadUrl("https://buyjump.local/index.html?oauth_callback=1&$query")
                        return true
                    }

                    // Prevent broken Firebase /__/auth/handler WebView error ("The requested action is invalid.")
                    if (urlStr.contains("/__/auth/handler") || urlStr.contains("firebaseapp.com/__/auth")) {
                        val provider = if (urlStr.contains("facebook", ignoreCase = true)) "facebook" else "google"
                        view?.loadUrl("https://buyjump.local/index.html?oauth_callback=1&provider=$provider")
                        return true
                    }

                    // Open external WhatsApp / tel / mailto intents in system apps
                    if (url.scheme == "whatsapp" || url.scheme == "tel" || url.scheme == "mailto" || urlStr.contains("wa.me/")) {
                        try {
                            startActivity(Intent(Intent.ACTION_VIEW, url))
                        } catch (_: Exception) {}
                        return true
                    }

                    return false
                }

                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    val url: Uri = request?.url ?: return null
                    if (url.host == "buyjump.local") {
                        var path = url.path ?: "/index.html"
                        if (path == "/" || path.isEmpty()) {
                            path = "/index.html"
                        }
                        val assetPath = "public" + path
                        return try {
                            val inputStream: InputStream = assets.open(assetPath)
                            val mimeType = resolveMimeType(path)
                            WebResourceResponse(mimeType, "UTF-8", inputStream)
                        } catch (_: Exception) {
                            try {
                                val fallback: InputStream = assets.open("public/index.html")
                                WebResourceResponse("text/html", "UTF-8", fallback)
                            } catch (_: Exception) {
                                null
                            }
                        }
                    }
                    return super.shouldInterceptRequest(view, request)
                }
            }
        }

        container.addView(webView)
        setContentView(container)

        val initialUrl = buildInitialUrlFromIntent(intent)
        webView.loadUrl(initialUrl)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        val data: Uri? = intent?.data
        if (data != null && data.scheme == "buyjump" && ::webView.isInitialized) {
            val query = data.encodedQuery ?: "oauth_callback=1&provider=google"
            webView.loadUrl("https://buyjump.local/index.html?oauth_callback=1&$query")
        }
    }

    private fun buildInitialUrlFromIntent(intent: Intent?): String {
        val data: Uri? = intent?.data
        if (data != null && data.scheme == "buyjump") {
            val query = data.encodedQuery ?: "oauth_callback=1&provider=google"
            return "https://buyjump.local/index.html?oauth_callback=1&$query"
        }
        return "https://buyjump.local/index.html"
    }

    private fun resolveMimeType(path: String): String {
        return when {
            path.endsWith(".html") -> "text/html"
            path.endsWith(".js") || path.endsWith(".mjs") -> "application/javascript"
            path.endsWith(".css") -> "text/css"
            path.endsWith(".json") -> "application/json"
            path.endsWith(".svg") -> "image/svg+xml"
            path.endsWith(".png") -> "image/png"
            path.endsWith(".jpg") || path.endsWith(".jpeg") -> "image/jpeg"
            path.endsWith(".webp") -> "image/webp"
            path.endsWith(".woff2") -> "font/woff2"
            else -> URLConnection.guessContentTypeFromName(path) ?: "application/octet-stream"
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && ::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    inner class BuyJumpBridge {
        @JavascriptInterface
        fun getAppVersion(): String = "1.0.0-android"

        @JavascriptInterface
        fun getProductCount(): Int = BuyJumpRepository.products.value.size

        @JavascriptInterface
        fun openExternalBrowser(url: String) {
            try {
                val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(browserIntent)
            } catch (_: Exception) {}
        }
    }
}
