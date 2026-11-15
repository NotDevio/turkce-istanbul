package com.turkce.istanbul

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.Toast
import androidx.core.content.FileProvider
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

/**
 * Türkçe İstanbul: the web app inside a WebView, plus what Chrome cannot give an installed web app:
 *  - real Android microphone permission (shows up in Settings > Apps > Türkçe İstanbul > Permissions)
 *  - native speech recognition (android.speech.SpeechRecognizer, tr-TR)
 *  - native Turkish text-to-speech
 *  - update check + one-tap install of a new APK from your own server
 * The web content itself always comes live from your server, so lessons / features update without reinstalling.
 */
class MainActivity : Activity(), TextToSpeech.OnInitListener {
    private lateinit var web: WebView
    private lateinit var prefs: SharedPreferences
    private var recognizer: SpeechRecognizer? = null
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var ttsTurkish = false
    private var updateChecked = false
    private val reqMic = 11

    private fun server(): String = (prefs.getString("url", null) ?: BuildConfig.SERVER_URL).trim().trimEnd('/')
    private fun micGranted(): Boolean = checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
    private fun js(code: String) { web.evaluateJavascript(code, null) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = getSharedPreferences("cfg", MODE_PRIVATE)
        web = WebView(this)
        setContentView(web)
        tts = TextToSpeech(this, this)
        setupWeb()
        if (!micGranted()) requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), reqMic)   // Android asks right away on first launch
        if (server().isEmpty()) askServer() else load()
    }

    private fun setupWeb() {
        val s = web.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.mediaPlaybackRequiresUserGesture = false
        s.userAgentString = s.userAgentString + " TurkceApp/" + BuildConfig.VERSION_NAME
        CookieManager.getInstance().setAcceptCookie(true)
        web.addJavascriptInterface(Bridge(), "AndroidApp")
        web.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) view.loadUrl("file:///android_asset/offline.html")
            }
            override fun onPageFinished(view: WebView, url: String) {
                if (!updateChecked && !url.startsWith("file:")) { updateChecked = true; doCheckUpdate(false) }
            }
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val u = request.url.toString()
                if (u.startsWith(server()) || u.startsWith("file:")) return false
                startActivity(Intent(Intent.ACTION_VIEW, request.url))
                return true
            }
        }
        web.webChromeClient = object : WebChromeClient() {
            // only your own server's pages are ever loaded here, so its microphone requests are allowed
            override fun onPermissionRequest(request: PermissionRequest) { runOnUiThread { request.grant(request.resources) } }
        }
    }

    private fun load() { web.loadUrl(server()) }

    private fun askServer() {
        val input = EditText(this)
        input.hint = "https://your-server:3000"
        input.setText(server())
        AlertDialog.Builder(this)
            .setTitle("Server address")
            .setMessage("Where is the Türkçe İstanbul server? (the address you open in the browser)")
            .setView(input)
            .setCancelable(server().isNotEmpty())
            .setPositiveButton("Open") { _, _ ->
                var u = input.text.toString().trim().trimEnd('/')
                if (u.isNotEmpty() && !u.startsWith("http")) u = "https://$u"
                prefs.edit().putString("url", u).apply()
                updateChecked = false
                if (u.isNotEmpty()) load()
            }
            .show()
    }

    /* ---------- text to speech (Turkish only) ---------- */
    override fun onInit(status: Int) {
        ttsReady = status == TextToSpeech.SUCCESS
        if (ttsReady) {
            val r = tts?.setLanguage(Locale("tr", "TR"))
            ttsTurkish = r != null && r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED
            tts?.setSpeechRate(0.85f)
        }
    }

    /* ---------- speech recognition ---------- */
    private fun errName(e: Int): String = when (e) {
        SpeechRecognizer.ERROR_SPEECH_TIMEOUT, SpeechRecognizer.ERROR_NO_MATCH -> "no-speech"
        SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "not-allowed"
        SpeechRecognizer.ERROR_CLIENT, SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "aborted"
        SpeechRecognizer.ERROR_AUDIO -> "audio-capture"
        SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "network"
        else -> "error"
    }

    private fun speechError(name: String) { js("window.__speechDone&&window.__speechDone('$name',null)") }

    private fun listen() {
        if (!micGranted()) { speechError("not-allowed"); return }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { speechError("service-not-allowed"); return }
        recognizer?.destroy()
        val r = SpeechRecognizer.createSpeechRecognizer(this)
        recognizer = r
        r.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
            override fun onError(error: Int) { speechError(errName(error)) }
            override fun onResults(results: Bundle?) {
                val list = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (list == null || list.isEmpty()) { speechError("no-speech"); return }
                js("window.__speechDone&&window.__speechDone(null," + JSONObject.quote(JSONArray(list).toString()) + ")")
            }
        })
        val i = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "tr-TR")
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "tr-TR")
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
        i.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, packageName)
        r.startListening(i)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == reqMic) {
            val ok = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
            js("window.__micCb&&window.__micCb($ok)")
        }
    }

    /* ---------- updates: new APK from <server>/app/latest.apk, described by <server>/app/version.json ---------- */
    private fun doCheckUpdate(manual: Boolean) {
        Thread {
            try {
                val c = URL(server() + "/app/version.json").openConnection() as HttpURLConnection
                c.connectTimeout = 8000
                c.readTimeout = 8000
                if (c.responseCode != 200) throw Exception("no version file")
                val j = JSONObject(c.inputStream.bufferedReader().readText())
                val code = j.getInt("versionCode")
                runOnUiThread {
                    if (code > BuildConfig.VERSION_CODE) offerUpdate(j.optString("versionName"), j.optString("notes"))
                    else if (manual) Toast.makeText(this, "You have the latest version", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                if (manual) runOnUiThread { Toast.makeText(this, "No app update found", Toast.LENGTH_SHORT).show() }
            }
        }.start()
    }

    private fun offerUpdate(name: String, notes: String) {
        AlertDialog.Builder(this)
            .setTitle("Update available $name")
            .setMessage(if (notes.isEmpty()) "A new version of the app is ready." else notes)
            .setPositiveButton("Update now") { _, _ -> downloadAndInstall() }
            .setNegativeButton("Later", null)
            .show()
    }

    private fun downloadAndInstall() {
        if (!packageManager.canRequestPackageInstalls()) {
            Toast.makeText(this, "Allow installing from this app, then tap Update again", Toast.LENGTH_LONG).show()
            startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:$packageName")))
            return
        }
        Toast.makeText(this, "Downloading update…", Toast.LENGTH_SHORT).show()
        Thread {
            try {
                val dir = File(cacheDir, "update")
                dir.mkdirs()
                val f = File(dir, "app.apk")
                val c = URL(server() + "/app/latest.apk").openConnection() as HttpURLConnection
                c.connectTimeout = 15000
                c.readTimeout = 60000
                c.inputStream.use { i -> f.outputStream().use { o -> i.copyTo(o) } }
                runOnUiThread {
                    val uri = FileProvider.getUriForFile(this, "$packageName.files", f)
                    val install = Intent(Intent.ACTION_VIEW)
                    install.setDataAndType(uri, "application/vnd.android.package-archive")
                    install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
                    startActivity(install)
                }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this, "Download failed", Toast.LENGTH_LONG).show() }
            }
        }.start()
    }

    /* ---------- what the web page can call: window.AndroidApp.* ---------- */
    inner class Bridge {
        @JavascriptInterface fun micGranted(): Boolean = this@MainActivity.micGranted()
        @JavascriptInterface fun ensureMic() = runOnUiThread {
            if (micGranted()) js("window.__micCb&&window.__micCb(true)")
            else requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), reqMic)
        }
        @JavascriptInterface fun startListening() = runOnUiThread { listen() }
        @JavascriptInterface fun stopListening() = runOnUiThread { recognizer?.cancel() }
        @JavascriptInterface fun speak(text: String) = runOnUiThread {
            if (ttsReady) tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "u")
        }
        @JavascriptInterface fun ttsAvailable(): Boolean = ttsReady && ttsTurkish
        @JavascriptInterface fun version(): String = BuildConfig.VERSION_NAME + " (" + BuildConfig.VERSION_CODE + ")"
        @JavascriptInterface fun checkUpdate() = doCheckUpdate(true)
        @JavascriptInterface fun retry() = runOnUiThread { load() }
        @JavascriptInterface fun changeServer() = runOnUiThread { askServer() }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        // the web app has its own back arrow inside lessons; otherwise leave the app
        web.evaluateJavascript("(function(){var b=document.getElementById('back');if(document.body.classList.contains('focus')&&b){b.click();return 1}return 0})()") { r ->
            if (r != "1") moveTaskToBack(true)
        }
    }

    override fun onPause() { super.onPause(); web.onPause() }
    override fun onResume() { super.onResume(); web.onResume() }
    override fun onDestroy() {
        recognizer?.destroy()
        tts?.shutdown()
        web.destroy()
        super.onDestroy()
    }
}
