<template>
    <div class="home-container">
      <!-- 왼쪽 섹션 (사용자 정보, 로그아웃, 회원 탈퇴) -->
      <div class="left-section">
        <div class="welcome-box">
          <h3>환영합니다, {{ user.name }} 님!</h3>
          <button @click="logout">로그아웃</button>
          <button @click="deleteAccount" class="delete-btn">회원 탈퇴</button>
        </div>
  
        <!-- 회원 정보 -->
        <div class="user-info">
          <h3>회원 정보</h3>
          <p><strong>이름:</strong> {{ user.name }}</p>
          <p><strong>이메일:</strong> {{ user.email }}</p>
          <p><strong>전화번호:</strong> {{ user.phone }}</p>
          <p><strong>생년월일:</strong> {{ user.birthdate ? user.birthdate.split('T')[0] : '' }}</p>
          <p><strong>성별:</strong> {{ user.gender }}</p>
          <p><strong>키:</strong> {{ user.height }} cm</p>
        </div>
      </div>
  
      <!-- 가운데 섹션 (초기 회원 사진 + 선택한 사진) -->
      <div class="center-section">
        <!-- 초기 회원 사진 -->
        <div class="photo-box">
          <h3>초기 회원 사진</h3>
          <img v-if="user.photo" :src="user.photo" alt="회원 사진" class="photo" />
          <p v-else>사진이 없습니다.</p>
        </div>
  
        <!-- 선택한 사진 (가운데로 이동) -->
        <div class="photo-box selected-photo-box">
          <h3>선택한 사진</h3>
          <img v-if="selectedPhoto" :src="selectedPhoto" alt="선택한 사진" class="photo" />
          <p v-else>사진을 선택하세요.</p>
        </div>
      </div>
  
      <!-- 사진 목록 (오른쪽 끝으로 이동) -->
      <div class="photo-box photo-list">
        <h3>사진 목록</h3>
        <ul>
          <li v-for="(photo, index) in photoList" :key="index">
            <span @click="selectPhoto(photo.url)">{{ photo.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        user: {
          name: "",
          email: "",
          phone: "",
          birthdate: "",
          gender: "",
          height: "",
          photo: "",
        },
        photoList: [], // 사진 목록
        selectedPhoto: null, // 선택한 사진
      };
    },
    async created() {
      try {
        const userId = JSON.parse(localStorage.getItem("loggedInUser")).id;
        const response = await fetch(`http://localhost:5000/profile/${userId}`);
        if (response.ok) {
          this.user = await response.json();
          this.photoList = JSON.parse(localStorage.getItem(`photoList_${this.user.email}`)) || [];
        } else {
          this.$router.push("/");
        }
      } catch (error) {
        console.error("사용자 정보를 불러오는 중 오류 발생:", error);
        this.$router.push("/");
      }
    },
    methods: {
      logout() {
        localStorage.removeItem("loggedInUser");
        alert("로그아웃되었습니다.");
        this.$router.push("/");
      },
      deleteAccount() {
        if (confirm("정말 회원 탈퇴하시겠습니까?")) {
          const userId = this.user.id;
          fetch(`http://localhost:5000/profile/${userId}`, { method: "DELETE" })
            .then(() => {
              localStorage.removeItem("loggedInUser");
              alert("회원 탈퇴 완료!");
              this.$router.push("/");
            })
            .catch(error => console.error("회원 탈퇴 오류:", error));
        }
      },
      selectPhoto(photoUrl) {
        this.selectedPhoto = photoUrl;
      },
    },
  };
  </script>
  
  <style scoped>
  /* 홈 화면 컨테이너 */
  .home-container {
    display: flex;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  /* 왼쪽 섹션 */
  .left-section {
    flex: 1;
    padding: 10px;
  }
  
  /* 가운데 섹션 */
  .center-section {
    flex: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }
  
  /* 오른쪽 섹션 (사진 목록을 가장 오른쪽으로 배치) */
  .photo-list {
    flex: 1;
    order: 3; /* 사진 목록을 오른쪽 끝으로 이동 */
  }
  
  /* 공통 박스 스타일 */
  .photo-box {
    flex: 1;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    text-align: center;
  }
  
  /* 선택한 사진 박스 (가운데로 이동) */
  .selected-photo-box {
    order: 2; /* 초기 회원 사진과 사진 목록 사이 */
  }
  
  /* 사진 스타일 */
  .photo {
    width: 100%;
    max-width: 250px;
    height: auto;
    border-radius: 10px;
  }
  
  /* 환영 박스 */
  .welcome-box {
    padding: 15px;
    background-color: #f0f0f0;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 10px;
  }
  
  /* 회원 정보 */
  .user-info {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  
  /* 버튼 스타일 */
  .welcome-box button {
    margin: 5px;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    transition: background 0.3s ease;
  }
  
  /* 기본 버튼 */
  .welcome-box button {
    background-color: #007bff;
    color: white;
  }
  
  .welcome-box button:hover {
    background-color: #0056b3;
  }
  
  /* 회원 탈퇴 버튼 */
  .delete-btn {
    background-color: red;
    color: white;
  }
  
  .delete-btn:hover {
    background-color: darkred;
  }
  
  /* 사진 목록 스타일 */
  .photo-list ul {
    list-style: none;
    padding: 0;
  }
  
  .photo-list li {
    cursor: pointer;
    color: #007bff;
    text-decoration: underline;
    margin-bottom: 5px;
  }
  
  .photo-list li:hover {
    color: #0056b3;
  }
  </style>
  