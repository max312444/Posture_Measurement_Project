// 이 import는 Vue Router를 설정하고 웹사이트에서 페이지를 이동할 수 있게함
// createWedHistory를 사용하면 뒤로가기 같은 기능이 정상 작동함
// 페이지의 경로를 설정하는 역할임
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Profile from '@/views/Profile.vue';
import FindID from '@/views/FindID.vue';
import FindPassword from '@/views/FindPassword.vue';

const routes = [
  { path: '/home', component: Home },
  { path: '/', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile },
  { path: '/find-id', component: FindID },
  { path: '/find-password', component: FindPassword },
];

const router = createRouter({ // Vue Router를 생성하는 함수
  history: createWebHistory(), // 브라우저의 주소를 관리하는 방법 설정
  routes, // 페이지 경로(라우트) 목록을 지정
});

export default router; // router를 다른 파일에서 사용할 수 있도록 내보냄