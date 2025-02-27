const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");  // ✅ 파일 업로드 관련 라이브러리 추가
const path = require("path");      // ✅ 경로 관리 모듈 추가
const fs = require("fs");          // ✅ 파일 시스템 모듈 추가

dotenv.config();
const app = express();

// ✅ 요청 크기 제한 추가 (이미지 업로드 허용)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ CORS 설정
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ MySQL 연결 설정
const db = mysql.createPool({
  host: "210.101.236.158",
  user: "jwon",
  password: "Max12@max12",
  database: "my_wedpage",
  port: 3306,
});

// ✅ 이미지 저장 폴더 생성
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ✅ multer 설정 (이미지 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ 🔥 **추가된 파일 업로드 기능 (POST /upload)**
app.post("/upload", upload.single("photo"), (req, res) => {
  console.log("📌 파일 업로드 요청 도착!"); // ✅ 요청이 서버까지 도달했는지 확인

  if (!req.file) {
    console.error("❌ 파일 없음!");
    return res.status(400).json({ error: "파일이 없습니다." });
  }

  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  console.log("✅ 업로드 성공:", fileUrl); // ✅ 업로드된 파일 확인
  res.json({ url: fileUrl });
});


// ✅ 🔥 **추가된 정적 파일 제공 (업로드된 이미지 접근 가능)**
app.use("/uploads", express.static(uploadDir));

// ✅ 로그인 (POST /login)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "데이터베이스 오류" });
    if (results.length === 0) {
      return res.status(401).json({ error: "이메일이 존재하지 않습니다." });
    }

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) {
      return res.status(401).json({ error: "비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign({ userId: results[0].id }, "SECRET_KEY", { expiresIn: "1h" });
    res.json({ message: "로그인 성공!", token, user: results[0] });
  });
});

// ✅ 로그인한 사용자 정보 조회 (GET /profile/:id)
app.get("/profile/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT id, name, email, phone, birthdate, gender, height, photo FROM users WHERE id = ?";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "데이터베이스 오류" });
    if (results.length === 0) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }
    res.json(results[0]);
  });
});

// ✅ 회원 정보 수정 (PUT /profile/:id)
app.put("/profile/:id", (req, res) => {
  const { name, phone, birthdate, gender, height, photo } = req.body;
  const userId = req.params.id;
  const sql = "UPDATE users SET name = ?, phone = ?, birthdate = ?, gender = ?, height = ?, photo = ? WHERE id = ?";
  
  db.query(sql, [name, phone, birthdate, gender, height, photo, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "데이터베이스 오류" });
    res.json({ message: "회원 정보 수정 성공!" });
  });
});

// ✅ 회원 탈퇴 (DELETE /profile/:id)
app.delete("/profile/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";
  
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: "데이터베이스 오류" });
    res.json({ message: "회원 탈퇴 완료!" });
  });
});

// ✅ 아이디 찾기 (POST /find-id)
app.post("/find-id", (req, res) => {
  const { name, phone } = req.body;
  const sql = "SELECT email FROM users WHERE name = ? AND phone = ?";
  
  db.query(sql, [name, phone], (err, results) => {
    if (err) return res.status(500).json({ error: "데이터베이스 오류" });
    if (results.length === 0) {
      return res.status(404).json({ error: "일치하는 정보가 없습니다." });
    }
    res.json({ email: results[0].email });
  });
});

// ✅ 비밀번호 찾기 (POST /find-password)
app.post("/find-password", (req, res) => {
  const { email, name } = req.body;
  const sql = "SELECT password FROM users WHERE email = ? AND name = ?";

  db.query(sql, [email, name], (err, results) => {
    if (err) return res.status(500).json({ error: "데이터베이스 오류" });
    if (results.length === 0) {
      return res.status(404).json({ error: "일치하는 정보가 없습니다." });
    }
    res.json({ password: results[0].password });
  });
});


// ✅ 서버 실행
app.listen(5000, () => {
  console.log("🚀 서버 실행 중: http://localhost:5000");
});
