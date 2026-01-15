const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();

/* ===============================
   CORS (제일 위, 하나만)
================================ */
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

/* ===============================
   Body Parser
================================ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ===============================
   uploads 폴더 정적 제공
================================ */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

/* ===============================
   MySQL 연결
================================ */
const db = mysql.createPool({
  host: "210.101.236.158",
  user: "jwon",
  password: "Max12@max12",
  database: "my_wedpage",
  port: 3306,
});

/* ===============================
   Multer 설정
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* ===============================
   사진 업로드
================================ */
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 없습니다." });
  }

  const photoUrl = `http://210.101.236.158:5001/uploads/${req.file.filename}`;
  res.json({ photoUrl });
});

/* ===============================
   회원가입
================================ */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, birthdate, gender, height, photo } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "필수값 누락" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users 
      (name, email, password, phone, birthdate, gender, height, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, hashedPassword, phone, birthdate, gender, height, photo],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "회원가입 실패" });
        }
        res.status(201).json({ message: "회원가입 성공" });
      }
    );
  } catch (e) {
    res.status(500).json({ message: "서버 오류" });
  }
});

/* ===============================
   로그인
================================ */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ message: "로그인 실패" });
      }

      const match = await bcrypt.compare(password, results[0].password);
      if (!match) {
        return res.status(401).json({ message: "비밀번호 오류" });
      }

      const token = jwt.sign(
        { userId: results[0].id },
        "SECRET_KEY",
        { expiresIn: "1h" }
      );

      res.json({ token, user: results[0] });
    }
  );
});

/* ===============================
   프로필 조회
================================ */
app.get("/profile/:id", (req, res) => {
  db.query(
    "SELECT id,name,email,phone,birthdate,gender,height,photo FROM users WHERE id=?",
    [req.params.id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ message: "사용자 없음" });
      }
      res.json(results[0]);
    }
  );
});

/* ===============================
   회원 삭제 + 사진 삭제
================================ */
app.delete("/profile/:id", (req, res) => {
  db.query(
    "SELECT photo FROM users WHERE id=?",
    [req.params.id],
    (err, results) => {
      if (results[0]?.photo) {
        const filePath = path.join(uploadDir, path.basename(results[0].photo));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      db.query(
        "DELETE FROM users WHERE id=?",
        [req.params.id],
        () => res.json({ message: "회원 탈퇴 완료" })
      );
    }
  );
});

/* ===============================
   서버 실행
================================ */
app.listen(5001, () => {
  console.log("서버 실행 중: http://210.101.236.158:5001");
});
