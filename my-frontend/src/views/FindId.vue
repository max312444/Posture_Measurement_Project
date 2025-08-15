<template>
  <div class="find-id">
    <h2>아이디 찾기</h2>
    <input v-model="name" placeholder="이름 입력" />
    <input v-model="phone" placeholder="전화번호 입력" />
    <button @click="findID">아이디 찾기</button>
    <p v-if="foundEmail">찾은 이메일: {{ foundEmail }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return { name: "", phone: "", foundEmail: "" };
  },
  methods: {
    async findID() {
      const response = await fetch("http://210.101.236.158:5001/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: this.name, phone: this.phone }),
      });
      const data = await response.json();
      if (response.ok) this.foundEmail = data.email;
      else alert(data.error);
    },
  },
};
</script>