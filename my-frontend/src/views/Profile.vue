<template>
  <div>
    <h2>프로필 페이지</h2>
    <div v-if="user">
      <p><strong>이름:</strong> {{ user.name }}</p>
      <p><strong>이메일:</strong> {{ user.email }}</p>
      <p><strong>전화번호:</strong> {{ user.phone }}</p>
      <p><strong>생년월일:</strong> {{ user.birthdate }}</p>
      <p><strong>성별:</strong> {{ user.gender }}</p>
      <p><strong>키:</strong> {{ user.height }} cm</p>
      <button @click="logout">로그아웃</button>
      <button @click="deleteAccount" class="delete-btn">회원 탈퇴</button>
    </div>
    <div v-else>
      <p>로그인이 필요합니다.</p>
      <router-link to="/">로그인</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null,
    };
  },
  async created() {
    try {
      const response = await fetch("http://localhost:5000/profile", { credentials: "include" });
      if (response.ok) {
        this.user = await response.json();
      } else {
        this.user = null;
      }
    } catch (error) {
      console.error("프로필 데이터를 불러오는 중 오류 발생:", error);
    }
  },
  methods: {
    logout() {
      fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" })
        .then(() => {
          this.user = null;
          this.$router.push("/");
        })
        .catch((error) => console.error("로그아웃 실패:", error));
    },
    deleteAccount() {
      if (confirm("정말 탈퇴하시겠습니까?")) {
        fetch("http://localhost:5000/delete-account", { method: "DELETE", credentials: "include" })
          .then(() => {
            this.user = null;
            this.$router.push("/");
          })
          .catch((error) => console.error("회원 탈퇴 실패:", error));
      }
    },
  },
};
</script>
