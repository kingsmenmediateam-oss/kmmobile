package international.kingsmen.app.mobile;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setSoftInputMode(
            WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
        );

        configureBridgeWebView();
    }

    private void configureBridgeWebView() {
        if (getBridge() == null) return;

        final WebView webView = getBridge().getWebView();
        if (webView == null) return;

        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.setClickable(true);
        webView.setLongClickable(true);

        webView.post(() -> {
            webView.requestFocus();
            webView.requestFocusFromTouch();
        });
    }
}
