// FloatingWindowService.java - Android Service untuk floating overlay
// Lokasi: android/app/src/main/java/com/floatingliveoverlay/FloatingWindowService.java

package com.floatingliveoverlay;

import android.app.Service;
import android.content.Intent;
import android.content.Context;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.Nullable;

public class FloatingWindowService extends Service {

    private WindowManager mWindowManager;
    private View mFloatingView;
    private int LAYOUT_TYPE;

    @Override
    public void onCreate() {
        super.onCreate();
        mWindowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        
        // Determine overlay type based on Android version
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            LAYOUT_TYPE = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            LAYOUT_TYPE = WindowManager.LayoutParams.TYPE_PHONE;
        }

        // Create floating view
        createFloatingView();
    }

    private void createFloatingView() {
        // Main container
        mFloatingView = new FrameLayout(this);
        
        // Floating bubble
        FrameLayout floatingBubble = new FrameLayout(this);
        floatingBubble.setBackgroundColor(0xFFFF6B35); // Orange color
        floatingBubble.setElevation(8);
        
        // Stats TextView
        TextView statsText = new TextView(this);
        statsText.setText("12.5K");
        statsText.setTextColor(0xFFFFFFFF);
        statsText.setTextSize(16);
        statsText.setGravity(Gravity.CENTER);
        floatingBubble.addView(statsText, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        mFloatingView.addView(floatingBubble, new FrameLayout.LayoutParams(
            70, 70, Gravity.CENTER
        ));

        // WindowManager params
        final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            LAYOUT_TYPE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE 
                | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.RIGHT;
        params.x = 0;
        params.y = 100;

        // Add dragging capability
        mFloatingView.setOnTouchListener(new FloatingOnTouchListener(params));

        mWindowManager.addView(mFloatingView, params);
    }

    private class FloatingOnTouchListener implements View.OnTouchListener {
        private int lastAction;
        private float lastX, lastY;
        private float lastXDelta, lastYDelta;
        private WindowManager.LayoutParams params;

        FloatingOnTouchListener(WindowManager.LayoutParams params) {
            this.params = params;
        }

        @Override
        public boolean onTouch(View v, MotionEvent event) {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    lastAction = MotionEvent.ACTION_DOWN;
                    lastX = event.getRawX();
                    lastY = event.getRawY();
                    lastXDelta = event.getRawX() - params.x;
                    lastYDelta = event.getRawY() - params.y;
                    return true;

                case MotionEvent.ACTION_MOVE:
                    if (lastAction == MotionEvent.ACTION_DOWN) {
                        lastAction = MotionEvent.ACTION_MOVE;
                    }
                    if (lastAction == MotionEvent.ACTION_MOVE) {
                        params.x = Math.round(event.getRawX() - lastXDelta);
                        params.y = Math.round(event.getRawY() - lastYDelta);
                        mWindowManager.updateViewLayout(mFloatingView, params);
                    }
                    return true;

                case MotionEvent.ACTION_UP:
                    if (lastAction == MotionEvent.ACTION_DOWN) {
                        // Single tap detected - toggle expanded view
                        toggleExpandedView();
                    }
                    return true;

                default:
                    return false;
            }
        }
    }

    private void toggleExpandedView() {
        // Trigger expanded view in React Native
        Intent broadcastIntent = new Intent("com.floatingliveoverlay.TOGGLE_EXPANDED");
        sendBroadcast(broadcastIntent);
    }

    public static void updateStats(String viewerCount) {
        // Static method untuk update stats dari React Native
        // TODO: Implement WebSocket atau event emitter
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mFloatingView != null) {
            mWindowManager.removeView(mFloatingView);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
