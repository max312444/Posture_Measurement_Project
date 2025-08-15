<template>
  <div class="register-container">
    <h2>회원가입</h2>
    <form @submit.prevent="register">
      <input type="text" v-model="name" placeholder="이름 입력" required />
      <input type="email" v-model="email" placeholder="이메일 입력" required />
      <input type="password" v-model="password" placeholder="비밀번호 입력" required />
      <input type="text" v-model="phone" placeholder="전화번호 입력 (예: 01012345678)" required />
      <input type="date" v-model="birthdate" required />
      <select v-model="gender" required>
        <option value="">성별 선택</option>
        <option value="남성">남성</option>
        <option value="여성">여성</option>
        <option value="기타">기타</option>
      </select>
      <input type="number" v-model="height" placeholder="키(cm)" required />

      <!-- 사진 업로드 -->
      <div class="photo-upload">
        <label>프로필 사진 업로드</label>
        <input type="file" accept="image/*" @change="uploadPhoto" />
        <img v-if="photoPreview" :src="photoPreview" alt="사진 미리보기" class="photo-preview" />
      </div>

      <div class="button-group">
        <button type="submit">가입하기</button>
        <button type="button" class="cancel-btn" @click="cancel">취소</button>
      </div>
    </form>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      phone: "",
      birthdate: "",
      gender: "",
      height: "",
      photo: "", // 서버에서 받은 이미지 URL 저장
      photoPreview: "", // 사진 미리보기
      errorMessage: "",
    };
  },
  methods: {
    // 사진 업로드 기능 추가
    async uploadPhoto(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("photo", file);

        try {
            const response = await fetch("http://210.101.236.158:5001/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("사진 업로드 실패");

            const result = await response.json();
            console.log("업로드된 파일 URL:", result.filePath);

            this.photo = result.filePath; // 백엔드에서 받은 URL 저장
            this.photoPreview = result.filePath; // 미리보기 이미지 설정
        } catch (error) {
            console.error("사진 업로드 오류:", error);
            this.errorMessage = "사진 업로드 중 오류 발생!";
        }
    },

    async register() {
      if (!this.name || !this.email || !this.password || !this.phone || !this.birthdate || !this.gender || !this.height) {
        this.errorMessage = "모든 정보를 입력해주세요.";
        return;
      }

      try {
        const response = await fetch("http://210.101.236.158:5001/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password,
            phone: this.phone,
            birthdate: this.birthdate,
            gender: this.gender,
            height: parseInt(this.height),
            photo: this.photoPreview, // 서버에서 받은 사진 URL을 전송
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "회원가입 실패");

        alert("회원가입 성공!");
        this.$router.push("/");
      } catch (error) {
        console.error("회원가입 오류:", error);
        this.errorMessage = "회원가입 중 오류 발생!";
      }
    },

    cancel() {
      this.$router.push("/");
    },
  },
};
</script>


<style scoped>
/* 전체 컨테이너 스타일 */
.register-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

/* 제목 스타일 */
h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

/* 입력 필드 스타일 */
input, select {
  width: 90%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  gap: 10px;
}

/* 기본 버튼 스타일 */
button {
  flex: 1;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

/* 취소 버튼 스타일 */
.cancel-btn {
  background-color: #dc3545;
}

.cancel-btn:hover {
  background-color: #b22234;
}

/* 사진 업로드 섹션 */
.photo-upload {
  margin-top: 15px;
}

.photo-preview {
  width: 100px;  /* 미리보기 크기 */
  height: 100px; /* 미리보기 크기 */
  object-fit: cover;
  border-radius: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
}

/* 에러 메시지 스타일 */
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

/* 반응형 스타일 */
@media (max-width: 480px) {
  .register-container {
    max-width: 90%;
    padding: 15px;
  }

  input, select {
    width: 100%;
    font-size: 14px;
  }

  button {
    font-size: 16px;
  }
}
</style>