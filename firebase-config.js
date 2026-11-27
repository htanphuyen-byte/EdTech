// ============================================================================
// CẤU HÌNH FIREBASE (ĐỂ ĐỒNG BỘ ONLINE GIỮA ADMIN VÀ HỌC SINH)
// ============================================================================
// Hướng dẫn:
// 1. Vào https://console.firebase.google.com/ -> Tạo project mới (miễn phí).
// 2. Vào "Build" -> "Firestore Database" -> "Create database" -> chọn "Start in test mode".
// 3. Vào Project Settings (bánh răng) -> "Your apps" -> chọn icon Web (</>) -> đặt tên app.
// 4. Copy đoạn firebaseConfig và dán các giá trị vào bên dưới rồi lưu file lại.
//
// Lưu ý: Nếu để trống projectId, ứng dụng sẽ tự động chạy ở chế độ Offline (localStorage).

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDU6IqRcYzXQ9PW7tUdZwl6IJ5vt6Dh-10",
  authDomain: "edtech-a720e.firebaseapp.com",
  projectId: "edtech-a720e",
  storageBucket: "edtech-a720e.firebasestorage.app",
  messagingSenderId: "980601456789",
  appId: "1:980601456789:web:78d49c0bb91f24addfb39c",
  measurementId: "G-F5JK815T0Y"
};
