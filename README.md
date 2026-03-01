# Smart Washer - Hệ thống Quản lý Máy giặt Tự động

Ứng dụng di động cho phép người dùng quét mã (QR/code) hoặc nhập ID máy giặt, thanh toán và sử dụng máy giặt tự động. Hệ thống tích hợp Mobile App + Backend Server + Thiết bị nhúng (ESP32), hỗ trợ quản lý máy giặt, số lượt giặt miễn phí, lịch sử giặt, thống kê và báo cáo doanh thu.

Hệ thống được thiết kế theo mô hình **Mobile + API Server + IoT**, đảm bảo giao tiếp realtime giữa app, server và thiết bị nhúng, có thể mở rộng khi thêm nhiều máy giặt.

---

## Mục tiêu dự án

- Xây dựng hệ thống quản lý máy giặt tự động theo hướng IoT (Internet of Things)
- Thiết kế pipeline xử lý: **Quét mã → Chọn máy → Thanh toán → Khởi động máy → Theo dõi trạng thái → Hoàn tất/Hoàn tiền**
- Tách biệt tầng giao diện (Mobile), tầng nghiệp vụ (API Server) và tầng thiết bị (ESP32)
- Tạo nền tảng cho ứng dụng giặt tự phục vụ tại ký túc xá, chung cư, tiệm giặt

---

## Chức năng chính

### Người dùng (User)
- **Đăng nhập / Đăng ký** – Xác thực JWT, phiên lưu AsyncStorage
- **Quét mã / Nhập ID** – Chọn máy giặt bằng QR code hoặc nhập ID/tên máy
- **Xem thông tin máy** – Tên, vị trí, trọng lượng tối đa, giá
- **Tính tiền & Bắt đầu giặt** – Nhập khối lượng (kg), tự động:
  - Ưu tiên lượt giặt miễn phí (nếu còn)
  - Tính chi phí: `(price / weight) × input_weight` khi trả phí
  - Gửi lệnh START đến server → ESP32 nhận lệnh và chạy máy
- **Theo dõi trạng thái** – Polling mỗi 5 giây; nhận thông báo realtime qua WebSocket khi hoàn tất hoặc lỗi
- **Hoàn tiền tự động** – Khi máy báo lỗi, server hoàn lượt giặt miễn phí và emit WebSocket
- **Lịch sử giặt** – Danh sách lượt giặt (thành công, miễn phí, hoàn tiền, lỗi)
- **Thống kê** – Biểu đồ lượt giặt theo tuần, cảnh báo khi vượt quá 4 lượt/tuần

### Quản trị viên (Admin)
- **Dashboard** – Truy cập nhanh: Quản lý người dùng, máy giặt, doanh thu, lượt giặt theo tháng
- **Quản lý người dùng** – CRUD user, phân vai trò (user/admin), cấp lượt giặt miễn phí, reset toàn bộ
- **Quản lý máy giặt** – CRUD máy (tên, vị trí, giá, trọng lượng, trạng thái, IP)
- **Doanh thu** – Báo cáo doanh thu theo tháng (theo user và tổng)
- **Lượt giặt theo tháng** – Thống kê lượt miễn phí/trả phí/tổng theo từng user

---

## System Architecture

Hệ thống được chia thành **3 module độc lập**:

### 1. Mobile Application Layer (SmartWasherApp)

- **Expo (React Native)** – Cross-platform iOS, Android, Web
- **expo-router** – File-based routing (Stack + Tabs)
- **React Context** – AuthProvider, quản lý phiên người dùng
- **Socket.IO client** – Nhận thông báo realtime (hoàn tiền, trạng thái giặt)

**Vai trò:**
- Giao diện người dùng: Đăng nhập, chọn máy, nhập khối lượng, thanh toán
- Gọi API REST để bắt đầu giặt, tạo lịch sử
- Lắng nghe WebSocket để cập nhật realtime

### 2. Backend API Server Layer (SmartWasherServer)

- **Node.js + Express 5** – REST API
- **MySQL** – Lưu User, Account, Washer, WashHistory
- **Socket.IO** – Push event realtime (washerRefunded, washCreated)
- **JWT** – Xác thực người dùng và admin
- **node-cron** – Reset lượt giặt miễn phí hàng tuần (mỗi thứ 2, 00:00)

**Vai trò:**
- Nhận request từ app (login, start wash, history, stats)
- Lưu trạng thái máy và lệnh điều khiển
- Cung cấp endpoint cho ESP32 polling lệnh và gửi trạng thái
- Xử lý hoàn tiền khi ESP32 báo lỗi, emit Socket.IO

### 3. IoT Embedded Layer (ESP32)

- Firmware ESP32 kết nối với server qua HTTP
- Polling `GET /api/washers/:id/command` để nhận lệnh (1, 2, 0)
- Gửi `PUT /api/washers/update-status` khi hoàn tất (10/20: success, 11/21: error)

**Thiết kế này giúp:**
- Tách biệt giao diện, nghiệp vụ và thiết bị
- App không cần trực tiếp kết nối ESP32
- Dễ mở rộng thêm máy giặt mới
- Realtime cập nhật trạng thái và hoàn tiền

---

## Kiến trúc phân tầng nội bộ

Cả **SmartWasherApp** và **SmartWasherServer** đều tổ chức theo **Layered Architecture**:

```
Controller → Service/Business Logic → Model/DAO → Database
```

### Mobile App (SmartWasherApp)
- **Screens (app/)** – Màn hình: Login, Home, WasherInfo, History, Statistics, Admin
- **Controllers** – AuthController, WasherController, HistoryController, UserController
- **Models** – User, Account, Washer, WashHistory
- **Hooks** – useAuth, DeviceEventEmitter cho cập nhật cross-screen

### Backend Server (SmartWasherServer)
- **Routes** – authRoutes, userRoutes, washerRoutes, historyRoutes
- **Controllers** – authController, userController, washerController, historyController
- **Models** – Account, User, Washer, History (thao tác MySQL)
- **Socket** – socket.js (emit washerRefunded, washCreated)

Thiết kế giúp tách biệt rõ:
- Tầng trình bày (UI / API)
- Tầng nghiệp vụ (logic giặt, thanh toán, hoàn tiền)
- Tầng truy xuất dữ liệu (DAO, MySQL)

---

## Thiết kế dữ liệu

### Các bảng chính

| Bảng           | Mô tả                                                                 |
|----------------|-----------------------------------------------------------------------|
| **account**    | Đăng nhập: id, username, password, role (user/admin)                  |
| **user**       | Profile: id, account_id, name, email, phone, total_washes, free_washes_left, last_reset |
| **washer**     | Máy giặt: id, name, location, weight, price, status (available/running/error), ip_address |
| **wash_history** | Lịch sử: id, user_id, washer_id, requested_at, start_time, end_time, cost, status, notes |

### Quan hệ

- 1 **Account** → 1 **User** (hoặc Admin)
- 1 **User** → N **WashHistory**
- 1 **Washer** → N **WashHistory**

### Cấu trúc hỗ trợ

- Truy vấn lịch sử giặt theo user
- Theo dõi trạng thái máy (available/running/error)
- Thống kê lượt giặt theo tháng
- Báo cáo doanh thu
- Reset lượt giặt miễn phí theo chu kỳ (7 ngày)

---

## Công nghệ sử dụng

### Mobile App (SmartWasherApp)

| Công nghệ              | Phiên bản | Mục đích                                   |
|------------------------|-----------|--------------------------------------------|
| Expo                   | 54        | Cross-platform React Native                |
| React Native           | 0.81      | UI Framework                               |
| expo-router            | 6.x       | File-based routing                         |
| axios                  | 1.12      | HTTP Client                                |
| AsyncStorage           | 2.2       | Lưu phiên đăng nhập                        |
| socket.io-client       | 4.8       | WebSocket realtime                         |
| react-native-chart-kit | 6.12      | Biểu đồ thống kê                           |
| TypeScript             | 5.9       | Type safety                                |

### Backend Server (SmartWasherServer)

| Công nghệ  | Phiên bản | Mục đích                    |
|------------|-----------|------------------------------|
| Node.js    | ES Modules| Runtime                      |
| Express    | 5.1       | Web Framework                |
| MySQL2     | 3.15      | MySQL driver (Promise API)   |
| Socket.IO  | 4.8       | Real-time events             |
| jsonwebtoken | 9.0     | JWT authentication           |
| node-cron  | 4.2       | Scheduled tasks (reset washes)|
| dotenv     | 17.2      | Biến môi trường              |

---

## Ví dụ luồng xử lý

### Luồng bắt đầu giặt (Success)

1. User đăng nhập → App lưu JWT, hiển thị Home
2. User nhập ID máy hoặc quét QR → Navigate đến WasherInfo
3. User nhập khối lượng (kg) → Tap "Tính tiền & Bắt đầu giặt"
4. App gọi `PUT /api/washers/:id/start` → Server cập nhật status = `running`
5. App gọi `POST /api/history` → Lưu lịch sử (cost = 0 nếu dùng lượt miễn phí)
6. ESP32 polling `GET /api/washers/:id/command` → Nhận lệnh "1" hoặc "2"
7. ESP32 chạy chu trình giặt
8. ESP32 gửi `PUT /api/washers/update-status` với `status: "10"` (success)
9. Server cập nhật washer status = `available`, cập nhật wash_history
10. App polling phát hiện status = `available` → Hiển thị "Giặt xong!"

### Luồng lỗi và hoàn tiền

1. Bước 1–6 giống như trên
2. ESP32 gặp lỗi → Gửi `PUT /api/washers/update-status` với `status: "11"` (error)
3. Server:
   - Cập nhật washer status = `available`
   - Nếu cost = 0 (giặt miễn phí) → Tăng `free_washes_left` cho user
   - Cập nhật wash_history.status = `refunded`
   - Emit Socket.IO `washerRefunded` đến user
4. App nhận event → Cập nhật user, hiển thị thông báo hoàn tiền

---

## Kiến thức & kỹ năng áp dụng

- **Thiết kế hệ thống IoT** – Phân tách Mobile App, API Server, thiết bị nhúng
- **Giao tiếp realtime** – WebSocket (Socket.IO) cho thông báo hoàn tiền, trạng thái
- **RESTful API** – Thiết kế endpoint cho app và ESP32
- **JWT Authentication** – Xác thực và phân quyền user/admin
- **Cross-platform Mobile** – Expo, React Native (iOS, Android, Web)
- **Quản lý state** – React Context, DeviceEventEmitter
- **Lập lịch tác vụ** – node-cron (reset lượt giặt hàng tuần)
- **Thiết kế kiến trúc phân tầng** – Controller → Service → Model → Database
- **Tích hợp thiết bị nhúng** – Protocol HTTP polling cho ESP32

---

## Cấu trúc dự án

```
SmartWasherApp/
├── SmartWasherApp/           # Mobile App (Expo)
│   ├── app/                  # Màn hình (expo-router)
│   │   ├── (tabs)/           # Home, History, Statistics
│   │   └── admin/            # Admin dashboard
│   ├── components/
│   ├── controllers/
│   ├── models/
│   ├── constants/
│   └── utils/
│
└── SmartWasherServer/        # Backend API
    ├── server.js             # HTTP + Socket.IO
    ├── app.js                # Express routes, cron
    ├── controllers/
    ├── models/
    ├── routes/
    └── socket.js
```

---

## Chạy dự án

### Backend Server

```bash
cd SmartWasherServer
npm install
cp .env.example .env    # Cấu hình DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET
npm start               # Chạy trên port 5000
```

### Mobile App

```bash
cd SmartWasherApp
npm install
# Cập nhật API_BASE_URL trong constants/api.ts nếu cần
npx expo start           # Chạy Expo (iOS / Android / Web)
```

---

*Dự án phù hợp để đưa vào CV với vai trò Full-stack / Mobile + IoT.*
