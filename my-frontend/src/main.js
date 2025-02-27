// Vue3의 'createApp' 함수를 가져옴 (애플리케이션 인스턴스를 생성하기 위해 필요)
import { createApp } from "vue";
// 애플리케이션의 최상위 컴포넌트("App.vue")를 가져옴
import App from "./App.vue";
// Vue Router 성정 파일('router/index.js')을 가져옴 (라우팅 기능을 사용하기 위해 필요)
import router from "./router/index.js";
                       
//  Vue 애플리케이션 인스턴스 생성
const app = createApp(App);
// 생성한 Vue 애플리케이션 'router' (Vue Router) 추가 (애플리케이션에서 라우팅을 사용할 수 있도록 설정)
app.use(router);
// '#app" 요소에 Vue 애플리케이션을 마운트하여 랜더링 시작
app.mount("#app");
