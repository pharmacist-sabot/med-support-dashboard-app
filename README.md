# Dashboard รายงานมูลค่ายาสนับสนุน

โปรเจกต์นี้คือเว็บแอปพลิเคชันสำหรับแสดงผลและสรุปข้อมูล (Dashboard) ที่ถูกบันทึกมาจาก **"ระบบบันทึกมูลค่ายาสนับสนุน"** โดยทำหน้าที่ดึงข้อมูลจากฐานข้อมูล Supabase มาแสดงผลในรูปแบบของ KPI Cards, ตาราง, และกราฟที่เข้าใจง่าย เพื่อใช้ในการติดตามและสรุปผลภาพรวมอย่างมีประสิทธิภาพ

## 🎉 คุณสมบัติหลัก (Key Features)

- **การ์ดสรุปผล (KPI Cards):** แสดงข้อมูลภาพรวมที่สำคัญ เช่น มูลค่ายาสะสม และยอดรวมตามไตรมาส
- **ตารางข้อมูลล่าสุด:** แสดงรายการข้อมูลล่าสุดที่ถูกบันทึกเข้ามา
- **กราฟสรุปข้อมูล (Data Visualization):** แสดงผลข้อมูลในรูปแบบกราฟวงกลมเพื่อให้เห็นสัดส่วนมูลค่ายาสนับสนุนในแต่ละประเภท
- **Responsive Design:** รองรับการแสดงผลบนหน้าจอ Desktop และ Tablet เพื่อการดูข้อมูลที่สะดวก

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** HTML5, CSS3 (Grid Layout, Flexbox), JavaScript (ES6+)
- **Data Fetching:** เชื่อมต่อและดึงข้อมูลจาก [Supabase](https://supabase.io/)
- **Charting Library:** [Chart.js](https://www.chartjs.org/)
- **Deployment:** [Firebase Hosting](https://firebase.google.com/docs/hosting)

## 🏁 การติดตั้งเพื่อพัฒนาต่อ (Getting Started)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pharmacist-sabot/med-support-dashboard-app.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd med-support-dashboard-app
    ```

3.  **ตั้งค่า Supabase:**
    - โปรเจกต์นี้จำเป็นต้องเชื่อมต่อกับฐานข้อมูล Supabase ที่มีโครงสร้างตารางข้อมูลเหมือนกับโปรเจกต์ `med-support-record-app`
    - นำ `SUPABASE_URL` และ `SUPABASE_KEY` ของคุณมาใส่ในไฟล์ JavaScript ที่รับผิดชอบการดึงข้อมูล

4.  **เปิดไฟล์ `index.html` บนเบราว์เซอร์เพื่อเริ่มต้นใช้งาน**

## ✍️ ผู้พัฒนา (Author)

- ภก.สุรเดช ประถมศักดิ์ เภสัชกรชำนาญการ โรงพยาบาลสระโบสถ์

## 📄 สัญญาอนุญาต (License)

This project is licensed under the MIT License.
