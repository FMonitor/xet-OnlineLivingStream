import './assets/main.css'

import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlay, faPause, faSmile } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createPinia } from 'pinia';
import 'emoji-picker-element';

import App from './App.vue'
import router from './router.js'

// 添加图标到库
library.add(faPlay, faPause, faSmile);

const app = createApp(App)

// 注册全局组件
app.component('font-awesome-icon', FontAwesomeIcon);

// 挂载应用
app.use(router)
app.use(createPinia())
app.mount('#app')
