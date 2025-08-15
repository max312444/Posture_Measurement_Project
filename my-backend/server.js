const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");  // 파일 업로드 관련 라이브러리 추가
const path = require("path");      // 경로 관리 모듈 추가
const fs = require("fs");          // 파일 시스템 모듈 추가

dotenv.config();
const app = express();

// 요청 크기 제한 추가 (이미지 업로드 허용)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// uploads 폴더를 정적 파일 경로로 설정
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS 설정
const corsOptions = {
  origin: ["http://210.101.236.158:5173", "http://localhost:5173"], // 여러 Origin 허용
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true, // 쿠키 포함 요청 허용
};
app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

// MySQL 연결 설정
const db = mysql.createPool({
  host: "210.101.236.158",
  user: "jwon",
  password: "Max12@max12",
  database: "my_wedpage",
  port: 3306,
});

// 이미지 저장 폴더 생성
const uploadDir = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // 절대 경로 사용
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });


// 회원가입 (POST /register)
app.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, birthdate, gender, height, photo } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "필수 입력값이 없습니다." });
        }

        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // DB에 저장 (MySQL 예제)
        const sql = "INSERT INTO users (name, email, password, phone, birthdate, gender, height, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [name, email, hashedPassword, phone, birthdate, gender, height, photo]; // 프로필 사진 추가

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("DB 저장 오류:", err);
                return res.status(500).json({ message: "회원가입 중 오류 발생" });
            }
            res.status(201).json({ message: "회원가입 성공!" });
        });
    } catch (error) {
        console.error("회원가입 오류:", error);
        res.status(500).json({ message: "서버 오류 발생" });
    }
});



// 사진업로드 기능
app.post('/upload', upload.single('photo'), (req, res) => {
    console.log("요청 도착!");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body); // 프론트엔드에서 `FormData`가 정상적으로 전달되는지 확인

    if (!req.file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    const photoUrl = `http://210.101.236.158:5001/uploads/${req.file.filename}`;
    res.json({ message: "사진 업로드 성공", filePath: photoUrl });
});

// 로그인 (POST /login)
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
    res.json({ message: "로그인 성공!!", token, user: results[0] });
  });
});

// 로그인한 사용자 정보 조회  (GET /profile/:id)
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

// 회원 정보 수정  (PUT /profile/:id)
app.put('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone, birthdate, gender, height } = req.body; // email과 photo 제외 (수정 안함)

    console.log("요청받은 데이터:", req.body); // 요청 데이터 확인

    if (!userId) {
      return res.status(400).json({ error: "유효한 사용자 ID가 필요합니다." });
    }

    // MySQL 업데이트 실행  (email과 photo 제외)
    const query = "UPDATE users SET name=?, phone=?, birthdate=?, gender=?, height=? WHERE id=?";
    
    try {
      await db.query(query, [name, phone, birthdate, gender, height, userId]);
      res.json({ message: "회원정보가 업데이트 되었습니다." });
    } catch (dbError) {
      console.error("데이터베이스 업데이트 오류:", dbError);
      res.status(500).json({ error: "데이터베이스 오류", details: dbError.message });
    }

  } catch (error) {
    console.error("서버 오류:", error);
    res.status(500).json({ error: "서버 내부 오류 발생" });
  }
});

// 회원 탈퇴 (DELETE /profile/:id)
app.delete("/profile/:id", (req, res) => {
  const userId = req.params.id;

  // 먼저 사용자의 프로필 사진 경로 가져오기
  const getUserSql = "SELECT photo FROM users WHERE id = ?";
  db.query(getUserSql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "데이터베이스 오류" });
    if (results.length === 0) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

    const photoUrl = results[0].photo; // 저장된 사진URL
    console.log("삭제할 사진 URL:", photoUrl);

    // URL에서 파일명만 추출
    if (photoUrl) {
      const filename = path.basename(photoUrl); // `1740708560202.jpg`
      const filePath = path.join(__dirname, "uploads", filename); // `uploads/1740708560202.jpg`
      console.log("실제 삭제할 파일 경로:", filePath);

      // 해당 사용자 삭제 전에 사진 파일 먼저 삭제
      fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("사진 삭제 오류:", err);
        } else {
          console.log("사진 삭제 완료:", filePath);
        }
      });
    }

    // MySQL에서 사용자 삭제
    const deleteUserSql = "DELETE FROM users WHERE id = ?";
    db.query(deleteUserSql, [userId], (err, result) => {
      if (err) return res.status(500).json({ error: "회원 삭제 실패: 데이터베이스 오류" });

      res.json({ message: "회원 탈퇴 및 사진 삭제 완료!" });
    });
  });
});

// 아이디 찾기 (POST /find-id)
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

// 비밀번호 찾기 (POST /find-password)
app.post("/find-password", async (req, res) => {
  const { email, name } = req.body;

  const sql = "SELECT id FROM users WHERE email = ? AND name = ?";
  db.query(sql, [email, name], async (err, results) => {
    if (err) return res.status(500).json({ error: "데이터베이스 오류" });
    if (results.length === 0) return res.status(404).json({ error: "일치하는 정보가 없습니다." });

    const userId = results[0].id;
    const tempPassword = Math.random().toString(36).slice(-8); // 8자리 랜덤 비밀번호
    const hashedPassword = await bcrypt.hash(tempPassword, 10); // 해싱 후 저장

    const updateSql = "UPDATE users SET password = ? WHERE id = ?";
    db.query(updateSql, [hashedPassword, userId], (err, result) => {
      if (err) return res.status(500).json({ error: "비밀번호 업데이트 실패" });

      console.log(`임시 비밀번호 발급: ${tempPassword}`); // 확인용 로그

      // 응답을 명확하게 JSON으로 반환
      res.json({ message: "임시 비밀번호 발급 완료", tempPassword: tempPassword });
    });
  });
});




// 서버 실행
app.listen(5001, () => {
  console.log("서버 실행 중: http://210.101.236.158:5001");
});