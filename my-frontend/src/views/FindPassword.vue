<template>
  <div class="find-password">
    <h2>비밀번호 찾기</h2>
    
    <input v-model="email" placeholder="이메일 입력" />
    <input v-model="name" placeholder="이름 입력" />
    
    <button @click="findPassword" :disabled="isLoading">
      {{ isLoading ? "처리 중..." : "비밀번호 찾기" }}
    </button>
    
    <!-- ✅ 오류 메시지 표시 -->
    <p v-if="errorMessage" class="error-message">❌ {{ errorMessage }}</p>

    <!-- ✅ 임시 비밀번호 표시 -->
    <div v-if="tempPassword" class="password-box">
      <p>🔑 임시 비밀번호:</p>
      <strong class="password">{{ tempPassword }}</strong>
      <p class="info-text">로그인 후 반드시 변경하세요.</p>
    </div>

    <button v-if="tempPassword" @click="close">닫기</button>
  </div>
</template>

<script>
export default {
  data() {
    return { 
      email: "", 
      name: "", 
      tempPassword: "",  // ✅ 서버에서 받은 임시 비밀번호 저장
      errorMessage: "",  // ✅ 오류 메시지 저장
      isLoading: false   // ✅ 요청 진행 중 상태
    };
  },
  methods: {
    async findPassword() {
      this.errorMessage = "";
      this.tempPassword = "";
      this.isLoading = true; // ✅ 요청 시작

      try {
        console.log("📌 비밀번호 찾기 요청 전송:", this.email, this.name); // ✅ 요청 로그

        const response = await fetch("http://210.101.236.158:5000/find-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, name: this.name }),
        });

        console.log("📌 응답 상태 코드:", response.status); // ✅ 응답 코드 확인
        const data = await response.json();
        console.log("📌 서버 응답 데이터:", data); // ✅ 서버 응답 확인

        if (!response.ok || !data.tempPassword) throw new Error(data.error || "비밀번호 찾기 실패");

        // ✅ 서버에서 받은 임시 비밀번호 저장
        this.tempPassword = data.tempPassword;
        console.log("✅ 화면에 표시할 임시 비밀번호:", this.tempPassword);

      } catch (error) {
        console.error("❌ 비밀번호 찾기 오류:", error);
        this.errorMessage = error.message || "비밀번호 찾기 중 오류 발생!";
      } finally {
        this.isLoading = false; // ✅ 요청 종료
      }
    },
    close() {
      this.resetFields();
    },
    resetFields() {
      this.email = "";
      this.name = "";
      this.tempPassword = "";
      this.errorMessage = "";
    }
  }
};
</script>

<style scoped>
.find-password {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 22px;
  margin-bottom: 15px;
}

input {
  width: 90%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

button {
  width: 90%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover {
  background-color: #0056b3;
}

.password-box {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.password {
  display: block;
  font-size: 20px;
  color: #ff0000;
  margin-top: 5px;
}

.info-text {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.error-message {
  margin-top: 10px;
  color: red;
  font-size: 14px;
  font-weight: bold;
}
</style>