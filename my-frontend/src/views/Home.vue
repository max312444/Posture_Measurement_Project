<template>
  <div class="home-container">
    <!-- 왼쪽 섹션 (사용자 정보, 로그아웃, 회원 탈퇴, 회원정보 수정) -->
    <div class="left-section">
      <div class="welcome-box">
        <h3>환영합니다, {{ user.name }} 님!</h3>
        <button @click="logout">로그아웃</button>
        <button @click="deleteAccount" class="delete-btn">회원 탈퇴</button>
      </div>

      <!-- 회원 정보 -->
      <div class="user-info">
        <div class="info-header">
          <h3>회원 정보</h3>
          <button v-if="!isEditing" @click="startEditing" class="edit-btn">수정</button>
          <button v-if="isEditing" @click="saveChanges" class="edit-btn">저장</button>
          <button v-if="isEditing" @click="cancelEditing" class="cancel-btn">닫기</button>
        </div>

        <p><strong>이름:</strong> 
          <span v-if="!isEditing">{{ user.name }}</span>
          <input v-else v-model="user.name" type="text" />
        </p>
        <p><strong>이메일:</strong> {{ user.email }}</p>
        <p><strong>전화번호:</strong> 
          <span v-if="!isEditing">{{ user.phone }}</span>
          <input v-else v-model="user.phone" type="text" />
        </p>
        <p><strong>생년월일:</strong> 
          <span v-if="!isEditing">{{ user.birthdate ? user.birthdate.split('T')[0] : '' }}</span>
          <input v-else v-model="user.birthdate" type="date" />
        </p>
        <p><strong>성별:</strong> 
          <span v-if="!isEditing">{{ user.gender }}</span>
          <select v-else v-model="user.gender">
            <option value="남성">남성</option>
            <option value="여성">여성</option>
            <option value="기타">기타</option>
          </select>
        </p>
        <p><strong>키(cm):</strong> 
          <span v-if="!isEditing">{{ user.height }} cm</span>
          <input v-else v-model="user.height" type="number" min="0" />
        </p>
      </div>
    </div>

    <!-- 가운데 섹션 (초기 회원 사진 + 선택한 사진) -->
    <div class="center-section">
      <div class="photo-box">
        <h3>초기 회원 사진</h3>
        <img v-if="user.photo" :src="user.photo" alt="회원 사진" class="photo" />
        <p v-else>사진이 없습니다.</p>
      </div>

      <!-- 선택한 사진 표시 -->
      <div class="photo-box selected-photo-box">
        <h3>선택한 사진</h3>
        <img v-if="selectedPhoto" :src="selectedPhoto" alt="선택한 사진" class="photo" />
        <p v-else>사진을 선택하세요.</p>
      </div>
    </div>

    <!-- 오른쪽 섹션 (사진 추가 및 목록) -->
    <div class="photo-box photo-list">
      <h3>사진 목록</h3>
      <input type="file" @change="uploadPhoto" ref="fileInput" accept="image/*" hidden />
      <button @click="triggerFileInput" class="upload-btn">📸 사진 추가</button>

      <ul>
        <li v-for="photo in photoList" :key="photo.id">
          <span @click="selectPhoto(photo.url)">{{ photo.name }}</span>
          <button @click="deletePhoto(photo.id)" class="delete-btn">❌</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user: {},
      isEditing: false,
      photoList: [],
      selectedPhoto: null,
    };
  },
  async created() {
    try {
      const userId = JSON.parse(localStorage.getItem("loggedInUser")).id;
      const response = await axios.get(`http://210.101.236.158:5001/profile/${userId}`);
      if (response.status === 200) {
        this.user = response.data;
        this.fetchPhotos();
      } else {
        this.$router.push("/");
      }
    } catch (error) {
      console.error("사용자 정보를 불러오는 중 오류 발생:", error);
      this.$router.push("/");
    }
  },
  methods: {
    async fetchPhotos() {
      try {
        const response = await axios.get(`http://210.101.236.158:5001/photos/user/${this.user.id}`);
        this.photoList = response.data.map(photo => ({
          id: photo.id,
          url: `http://210.101.236.158:5001${photo.url}`,
          name: `사진 ${photo.id}`,
        }));
      } catch (error) {
        console.error("🚨 사진 목록 불러오기 실패:", error);
      }
    },
    logout() {
      localStorage.removeItem("loggedInUser");
      alert("로그아웃되었습니다.");
      this.$router.push("/");
    },
    async deleteAccount() {
      if (confirm("정말 회원 탈퇴하시겠습니까?")) {
        const userId = this.user.id;
        await axios.delete(`http://210.101.236.158:5001/profile/${userId}`);
        localStorage.removeItem("loggedInUser");
        alert("회원 탈퇴 완료!");
        this.$router.push("/");
      }
    },
    startEditing() {
      this.isEditing = true;
    },
    async saveChanges() {
        this.userId = this.user.id; // ✅ userId를 this.user.id에서 가져오기
        console.log("🧐 수정 요청할 유저 ID:", this.userId);

        if (!this.userId) {
            console.error("❌ 오류: userId가 정의되지 않음");
            alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        const requestData = {
            name: this.user.name || "이름 없음",
            email: this.user.email || "이메일 없음",
            phone: this.user.phone || "전화번호 없음",
            birthdate: this.user.birthdate ? this.user.birthdate.substring(0, 10) : null,
            gender: this.user.gender || "기타",
            height: this.user.height || 0,
            photo: this.user.photo || "http://210.101.236.158:5001/uploads/default.jpg"
        };

        console.log("📌 보낼 데이터:", requestData);

        try {
            const response = await axios.put(`http://210.101.236.158:5001/profile/${this.userId}`, requestData);

            if (response.status === 200) {
                console.log("✅ 회원정보 수정 성공:", response.data);
                this.isEditing = false; // ✅ 수정 완료 후 편집 모드 닫기
            }
        } catch (error) {
            console.error("❌ 회원정보 수정 오류:", error);
        }
    },
    cancelEditing() {
      this.isEditing = false;
    },
    selectPhoto(photoUrl) {
      this.selectedPhoto = photoUrl;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async uploadPhoto(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("photo", file);
      formData.append("user_id", this.user.id);

      try {
        const response = await axios.post("http://210.101.236.158:5001/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.fetchPhotos();
      } catch (error) {
        console.error("🚨 사진 업로드 실패:", error);
      }
    },
    async deletePhoto(photoId) {
      try {
        await axios.delete(`http://210.101.236.158:5001/photos/${photoId}`);
        this.fetchPhotos();
      } catch (error) {
        console.error("사진 삭제 실패:", error);
      }
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

/* 회원정보 타이틀 & 수정 버튼 정렬 */
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 회원정보 수정 버튼 스타일 */
.edit-btn {
  padding: 5px 10px;
  font-size: 14px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #218838;
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