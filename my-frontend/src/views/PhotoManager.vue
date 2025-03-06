<template>
  <div class="photo-manager">
    <!-- 사진 추가 버튼 -->
    <input type="file" @change="uploadPhoto" ref="fileInput" accept="image/*" hidden />
    <button @click="triggerFileInput" class="upload-btn">📸 사진 추가</button>

    <!-- 사진 목록 -->
    <div class="photo-list">
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="photo-item"
        :class="{ selected: selectedPhoto === photo }"
        @click="selectPhoto(photo)"
      >
        <img :src="photo.url" />
        <button @click.stop="deletePhoto(photo.id)" class="delete-btn">❌</button>
      </div>
    </div>

    <!-- 선택한 사진 블록 -->
    <div class="photo-preview" v-if="selectedPhoto">
      <h3>선택한 사진</h3>
      <img :src="selectedPhoto.url" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const photos = ref([]);
    const selectedPhoto = ref(null);
    const fileInput = ref(null);

    // 서버에서 사진 목록 가져오기
    const fetchPhotos = async () => {
      const response = await axios.get("http://210.101.236.158:5001/photos");
      photos.value = response.data.map((photo) => ({
        id: photo.id,
        url: `http://210.101.236.158:5001${photo.url}`,
      }));
    };

    // 파일 선택창 열기
    const triggerFileInput = () => {
      fileInput.value.click();
    };

    // 사진 업로드
    const uploadPhoto = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("photo", file);

      const response = await axios.post("http://210.101.236.158:5001/upload-photo", formData);
      photos.value.unshift({
        id: response.data.id,
        url: `http://210.101.236.158:5001${response.data.url}`,
      });
    };

    // 사진 삭제
    const deletePhoto = async (photoId) => {
      await axios.delete(`http://210.101.236.158:5001/photos/${photoId}`);
      photos.value = photos.value.filter((photo) => photo.id !== photoId);
      if (selectedPhoto.value?.id === photoId) {
        selectedPhoto.value = null;
      }
    };

    // 사진 선택
    const selectPhoto = (photo) => {
      selectedPhoto.value = photo;
    };

    onMounted(fetchPhotos);

    return {
      photos,
      selectedPhoto,
      fileInput,
      triggerFileInput,
      uploadPhoto,
      deletePhoto,
      selectPhoto,
    };
  },
};
</script>
