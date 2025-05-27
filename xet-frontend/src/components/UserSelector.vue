<!-- src/components/UserSelector.vue -->
<template>
    <div v-if="shouldShow" class="user-selector-overlay">
        <div class="user-selector-modal">
            <div class="modal-header">
                <h2>选择用户身份</h2>
                <p>请选择一个用户身份来模拟多用户环境</p>
            </div>

            <div class="user-options">
                <div v-for="user in liveStore.availableUsers" :key="user.id" class="user-option"
                    :style="{ borderColor: user.color }" @click="selectUser(user.id)">
                    <div class="user-avatar" :style="{ backgroundColor: user.color }">
                        {{ user.id }}
                    </div>
                    <div class="user-info">
                        <h3>{{ user.name }}</h3>
                        <p>ID: {{ user.id }}</p>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <p class="tip">💡 选择后将自动保存，下次访问会记住您的选择</p>
                <button v-if="liveStore.currentUserId" class="reset-btn" @click="resetSelection">
                    重新选择
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLiveStore } from '../store' // 使用统一的store

const liveStore = useLiveStore()

// 控制弹窗显示
const shouldShow = computed(() => liveStore.shouldShowUserSelector)

// 选择用户
function selectUser(userId: number) {
    liveStore.setCurrentUserId(userId)
}

// 重置选择
function resetSelection() {
    liveStore.resetUserSelection()
}
</script>

<style scoped>
.user-selector-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
}

.user-selector-modal {
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalEnter 0.3s ease;
}

@keyframes modalEnter {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    text-align: center;
    margin-bottom: 32px;
}

.modal-header h2 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
}

.modal-header p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

.user-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.user-option {
    display: flex;
    align-items: center;
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #fafafa;
}

.user-option:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 20px;
    margin-right: 16px;
    flex-shrink: 0;
}

.user-info h3 {
    margin: 0 0 4px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
}

.user-info p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

.modal-footer {
    text-align: center;
    border-top: 1px solid #e0e0e0;
    padding-top: 20px;
}

.tip {
    margin: 0 0 16px 0;
    color: #666;
    font-size: 13px;
}

.reset-btn {
    background: #f44336;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
}

.reset-btn:hover {
    background: #d32f2f;
}

/* 移动端优化 */
@media (max-width: 768px) {
    .user-selector-modal {
        margin: 20px;
        padding: 24px;
    }

    .user-option {
        padding: 16px;
    }

    .modal-header h2 {
        font-size: 20px;
    }
}
</style>