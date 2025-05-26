<template>
  <div class="container" v-if="!isLoading">
    <VideoPlayer class="video" :playback-url="liveStore.liveInfo?.playback_url" />
    <ChatBox class="chat" :currentUserId="currentUserId" :comments="liveStore.comments" :explanations="liveStore.explanations" :files="liveStore.files"
      @send-comment="sendComment" @send-explanation="sendExplanation" @send-file="sendFile" @send-error="showError"
      @load-more-comments="liveStore.loadMoreComments" @load-more-explanations="liveStore.loadMoreExplanations"
      @load-more-files="liveStore.loadMoreFiles" />

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
  <div v-else class="loading-container">
    <p>加载中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import VideoPlayer from './components/VideoPlayer.vue'
import ChatBox from './components/ChatBox.vue'
import { useRoute } from 'vue-router'
import { useLiveStore } from './store'

// 使用 route 获取直播ID
const route = useRoute()
const liveStore = useLiveStore()
const isLoading = ref(true)
const errorMessage = ref('')
let errorTimer: number | null = null

// 当前用户ID（应从用户认证服务获取）
const currentUserId = 1 // 这里应该从认证服务获取或使用全局状态

// 初始化数据
onMounted(async () => {
  const liveId = route.params.liveId as string
  if (liveId) {
    try {
      isLoading.value = true
      await liveStore.loadLiveInfo(liveId)
    } catch (error) {
      console.error('加载直播信息失败:', error)
    } finally {
      isLoading.value = false
    }
  }
})

function showError(message: string) {
  errorMessage.value = message

  // 清除之前的定时器
  if (errorTimer) {
    clearTimeout(errorTimer)
  }

  // 设置5秒后自动消失
  errorTimer = window.setTimeout(() => {
    errorMessage.value = ''
    errorTimer = null
  }, 5000)
}

// 监听路由变化，重新加载数据
watch(
  () => route.params.liveId,
  async (newLiveId) => {
    if (newLiveId) {
      try {
        isLoading.value = true
        await liveStore.loadLiveInfo(newLiveId as string)
      } catch (error) {
        console.error('加载直播信息失败:', error)
      } finally {
        isLoading.value = false
      }
    }
  }
)

// 发送评论
const sendComment = async (content: string) => {
  await liveStore.addComment(content, currentUserId)
}

// 发送讲解
const sendExplanation = async (content: string) => {
  await liveStore.addExplanation(content, currentUserId)
}

// 发送文件
const sendFile = async (fileUrl: string) => {
  await liveStore.addFile(fileUrl, currentUserId)
}

// 在组件卸载时清理资源
onUnmounted(() => {
  liveStore.reset()
  if (errorTimer) {
    clearTimeout(errorTimer)
    errorTimer = null
  }
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}

.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
  animation: fadeIn 0.5s ease, fadeOut 0.5s ease 4.5s; 
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}


@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .chat {
    width: 100%;
    height: 1600px;
  }
}

html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
  width: 100%;
}
</style>