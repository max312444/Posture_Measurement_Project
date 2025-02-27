<template>
  <div class="login-container">
    <h2>로그인</h2>

    <!-- 로그인 폼 -->
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="이메일 입력" required />
      <input type="password" v-model="password" placeholder="비밀번호 입력" required />
      <button type="submit">로그인</button>
    </form>

    <!-- 오류 메시지 표시 -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- 회원가입 / 아이디 찾기 / 비밀번호 찾기 링크 -->
    <div class="links">
      <p>계정이 없으신가요? <router-link to="/register">회원가입</router-link></p>
      <p><a href="#" @click="showFindID = true">아이디 찾기</a></p>
      <p><a href="#" @click="showFindPassword = true">비밀번호 찾기</a></p>
    </div>

    <!-- 🔥 아이디 찾기 모달 -->
    <div v-if="showFindID" class="modal">
      <div class="modal-content">
        <h3>아이디 찾기</h3>
        <input v-model="findIDName" placeholder="이름 입력" />
        <input v-model="findIDPhone" placeholder="전화번호 입력" />
        <button @click="findID">찾기</button>
        <p v-if="foundEmail">📧 찾은 아이디: {{ foundEmail }}</p>
        <button @click="showFindID = false">닫기</button>
      </div>
    </div>

    <!-- 🔥 비밀번호 찾기 모달 -->
    <div v-if="showFindPassword" class="modal">
      <div class="modal-content">
        <h3>비밀번호 찾기</h3>
        <input v-model="findPWEmail" placeholder="이메일 입력" />
        <input v-model="findPWName" placeholder="이름 입력" />
        <button @click="findPassword">찾기</button>
        <p v-if="foundPassword">🔑 찾은 비밀번호: {{ foundPassword }}</p>
        <button @click="showFindPassword = false">닫기</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",

      // 🔥 아이디/비밀번호 찾기 팝업 관리
      showFindID: false,
      showFindPassword: false,

      // 🔥 아이디 찾기 입력 데이터
      findIDName: "",
      findIDPhone: "",
      foundEmail: "",

      // 🔥 비밀번호 찾기 입력 데이터
      findPWEmail: "",
      findPWName: "",
      foundPassword: "",
    };
  },
  methods: {
    async login() {
      console.log("🔥 로그인 요청:", this.email, this.password);
      try {
        const response = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "로그인 실패");
        }

        localStorage.setItem("token", result.token);
        localStorage.setItem("loggedInUser", JSON.stringify(result.user));

        alert("로그인 성공!");
        this.$router.push("/home");
      } catch (error) {
        this.errorMessage = error.message || "로그인 실패! 이메일과 비밀번호를 확인하세요.";
      }
    },

    // 🔥 아이디 찾기 기능
    async findID() {
      try {
        const response = await fetch("http://localhost:5000/find-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: this.findIDName, phone: this.findIDPhone }),
        });

        const data = await response.json();
        if (response.ok) {
          this.foundEmail = data.email;
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("아이디 찾기 오류:", error);
      }
    },

    // 🔥 비밀번호 찾기 기능
    async findPassword() {
      try {
        const response = await fetch("http://localhost:5000/find-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.findPWEmail,
            name: this.findPWName,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          this.foundPassword = data.password;
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("비밀번호 찾기 오류:", error);
      }
    },
  },
};
</script>


<style scoped>
/* 로그인 컨테이너 */
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
}

/* 입력 필드 스타일 */
input {
  width: 95%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* 버튼 사이 간격 추가 */
button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 10px; /* 버튼 간격 추가 */
}

button:hover {
  background-color: #0056b3;
}


/* 에러 메시지 스타일 */
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

/* 링크 스타일 */
.links {
  margin-top: 15px;
}

.links a {
  color: #007bff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
