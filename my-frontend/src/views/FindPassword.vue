<template>
    <div class="find-password">
      <h2>비밀번호 찾기</h2>
      <input v-model="email" placeholder="이메일 입력" />
      <input v-model="name" placeholder="이름 입력" />
      <button @click="findPassword">비밀번호 찾기</button>
      <p v-if="foundPassword">🔑 찾은 비밀번호: {{ foundPassword }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return { email: "", name: "", foundPassword: "" };
    },
    methods: {
      async findPassword() {
        const response = await fetch("http://localhost:5000/find-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, name: this.name }),
        });
        const data = await response.json();
        if (response.ok) this.foundPassword = data.password;
        else alert(data.error);
      },
    },
  };
  </script>
  