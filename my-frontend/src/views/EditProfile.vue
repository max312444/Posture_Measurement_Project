<template>
  <div class="edit-profile">
    <h2>회원정보 수정</h2>

    <input v-model="name" placeholder="이름 입력" />
    <input v-model="phone" placeholder="전화번호 입력" />
    <input v-model="birthdate" type="date" />
    
    <select v-model="gender">
      <option value="">성별 선택</option>
      <option value="남성">남성</option>
      <option value="여성">여성</option>
      <option value="기타">기타</option>
    </select>

    <input v-model="height" type="number" placeholder="키(cm)" />

    <button @click="updateProfile">정보 수정</button>

    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: 1, // 현재 로그인한 사용자의 ID (테스트용)
      name: "",
      phone: "",
      birthdate: "",
      gender: "",
      height: "",
      successMessage: "",
      errorMessage: "",
    };
  },
  async created() {
    await this.getProfile();
  },
  methods: {
    async getProfile() {
      try {
        const response = await fetch(`http://210.101.236.158:5001/profile/${this.userId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "회원정보 불러오기 실패");

        this.name = data.name;
        this.phone = data.phone;
        this.birthdate = data.birthdate;
        this.gender = data.gender;
        this.height = data.height;
      } catch (error) {
        console.error("회원정보 불러오기 오류:", error);
        this.errorMessage = "회원정보를 불러오는 중 오류 발생!";
      }
    },

    async updateProfile() {
      try {
        const response = await fetch(`http://210.101.236.158:5001/profile/${this.userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: this.name,
            phone: this.phone,
            birthdate: this.birthdate,
            gender: this.gender,
            height: this.height,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "회원정보 수정 실패");

        this.successMessage = "회원정보가 성공적으로 수정되었습니다!";
      } catch (error) {
        console.error("회원정보 수정 오류:", error);
        this.errorMessage = "회원정보 수정 중 오류 발생!";
      }
    },
  },
};
</script>

<style scoped>
.edit-profile {
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

input, select {
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
}

button:hover {
  background-color: #0056b3;
}

.success-message {
  margin-top: 15px;
  color: green;
  font-size: 16px;
}

.error-message {
  margin-top: 15px;
  color: red;
  font-size: 16px;
}
</style>
