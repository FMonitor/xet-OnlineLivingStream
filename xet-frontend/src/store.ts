import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { liveAPI } from './api';
import type { LiveStreamInfo, Comment, Explanation, File } from './api';
import { wsManager } from './services/websocket';

// 添加 API 响应类型定义
interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T[];
}

// 添加用户接口定义
interface User {
    id: number;
    name: string;
    color: string;
}

export const useLiveStore = defineStore('live', () => {
    // === 用户管理相关状态 ===
    const currentUserId = ref<number | null>(null);
    const userSelected = ref<boolean>(false);
    const availableUsers = ref<User[]>([
        { id: 1, name: '用户1', color: '#1976d2' },
        { id: 2, name: '用户2', color: '#388e3c' },
        { id: 3, name: '用户3', color: '#f57c00' }
    ]);

    // 计算属性：获取当前用户信息
    const currentUser = computed(() => {
        if (!currentUserId.value) return null;
        return availableUsers.value.find(user => user.id === currentUserId.value) || null;
    });

    // 检查是否需要显示用户选择弹窗
    const shouldShowUserSelector = computed(() => !userSelected.value);

    // === 直播相关状态（保持原有逻辑）===
    const currentLiveId = ref<number | null>(null);
    const liveInfo = ref<LiveStreamInfo | null>(null);
    const comments = reactive<Comment[]>([]);
    const explanations = reactive<Explanation[]>([]);
    const files = reactive<File[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const playback_url = ref<string | null>(null);

    const liveTitle = ref<string>('');
    const liveCoverUrl = ref<string>('');
    const isLiving = ref<boolean>(false);
    const commentRoomUrl = ref<string>('');
    const explanationRoomUrl = ref<string>('');
    const broadcastRoomUrl = ref<string>('');

    const hasMoreComments = computed(() => commentPage.value > 0);
    const hasMoreExplanations = computed(() => explanationPage.value > 0);
    const hasMoreFiles = computed(() => filePage.value > 0);
    const isLoadingComments = ref(false);
    const isLoadingExplanations = ref(false);
    const isLoadingFiles = ref(false);

    // 页码管理
    const commentPage = ref(1);
    const explanationPage = ref(1);
    const filePage = ref(1);

    // === 用户管理方法 ===
    function setCurrentUserId(userId: number) {
        currentUserId.value = userId;
        userSelected.value = true;

        // 持久化到localStorage
        localStorage.setItem('selectedUserId', userId.toString());

        console.log(`用户已切换为: ${userId}`);
    }

    function restoreUserFromStorage(): boolean {
        const savedUserId = localStorage.getItem('selectedUserId');
        if (savedUserId) {
            const userId = parseInt(savedUserId);
            if (availableUsers.value.some(user => user.id === userId)) {
                currentUserId.value = userId;
                userSelected.value = true;
                console.log(`从缓存恢复用户: ${userId}`);
                return true;
            }
        }
        return false;
    }

    function resetUserSelection() {
        currentUserId.value = null;
        userSelected.value = false;
        localStorage.removeItem('selectedUserId');
    }

    // === 直播业务方法（保持原有逻辑）===
    // 修正数据转换函数
    function transformComment(comment: Comment): Comment {
        console.log('转换评论数据:', comment);

        // 不要覆盖已有的正确数据，直接返回原始数据
        const transformedComment = {
            ...comment,
            // 确保 creator_user_id 是正确的，优先使用原始数据
            creator_user_id: comment.creator_user_id || comment.user_id || 0,
            living_stream_id: comment.living_stream_id || currentLiveId.value || 0
        };

        console.log('转换后的评论数据:', transformedComment);
        return transformedComment;
    }

    function transformExplanation(explanation: Explanation): Explanation {
        console.log('转换讲解数据:', explanation);

        // 不要覆盖已有的正确数据
        const transformedExplanation = {
            ...explanation,
            // 确保 ID 字段正确
            expla_id: explanation.expla_id || explanation.explanation_id || 0,
            // 确保 creator_user_id 是正确的
            creator_user_id: explanation.creator_user_id || explanation.user_id || 0,
            living_stream_id: explanation.living_stream_id || currentLiveId.value || 0
        };

        console.log('转换后的讲解数据:', transformedExplanation);
        return transformedExplanation;
    }

    function transformFile(file: File): File {
        console.log('转换文件数据:', file);

        const transformedFile = {
            ...file,
            creator_user_id: file.creator_user_id || file.user_id || 0,
            living_stream_id: file.living_stream_id || currentLiveId.value || 0
        };

        console.log('转换后的文件数据:', transformedFile);
        return transformedFile;
    }

    // 加载直播信息（包含初始评论、讲解、文件）
    async function loadLiveInfo(liveId: number | string) {
        isLoading.value = true;
        error.value = null;
        currentLiveId.value = Number(liveId);
        playback_url.value = null;

        try {
            const apiResponse = await liveAPI.fetchLiveInfo(liveId);

            // 使用正确的字段名检查响应
            if (apiResponse.statusCode !== 200) {
                throw new Error(apiResponse.message || '获取直播信息失败');
            }

            if (!apiResponse.data || !apiResponse.data.length) {
                throw new Error('未找到直播信息');
            }

            liveInfo.value = apiResponse.data[0];
            console.log('设置liveInfo:', liveInfo.value);

            // 更新状态变量 - 使用实际字段名
            liveTitle.value = liveInfo.value.description || `直播间 ${liveId}`;
            liveCoverUrl.value = ''; // 实际响应中没有封面URL
            isLiving.value = liveInfo.value.living_stream_url !== "0";
            commentRoomUrl.value = liveInfo.value.living_comment_room_url;
            explanationRoomUrl.value = liveInfo.value.living_expla_room_url;
            broadcastRoomUrl.value = liveInfo.value.living_broadcast_room_url;

            // 设置播放地址
            if (liveInfo.value.living_stream_url && liveInfo.value.living_stream_url !== "0") {
                playback_url.value = liveInfo.value.living_stream_url;
            }

            // 初始化数据 - 使用正确的字段名
            if (liveInfo.value.comments && Array.isArray(liveInfo.value.comments)) {
                comments.length = 0;
                console.log('加载评论数据:', liveInfo.value.comments.length, '条');
                const transformedComments = liveInfo.value.comments.map(transformComment);
                comments.push(...transformedComments);
            }

            if (liveInfo.value.explanations && Array.isArray(liveInfo.value.explanations)) {
                explanations.length = 0;
                console.log('加载讲解数据:', liveInfo.value.explanations.length, '条');
                const transformedExplanations = liveInfo.value.explanations.map(transformExplanation);
                explanations.push(...transformedExplanations);
            }

            if (liveInfo.value.files && Array.isArray(liveInfo.value.files)) {
                files.length = 0;
                console.log('加载文件数据:', liveInfo.value.files.length, '条');
                const transformedFiles = liveInfo.value.files.map(transformFile);
                files.push(...transformedFiles);
            }

            // 使用实际的页数信息
            commentPage.value = liveInfo.value.page_count_comment || 0;
            explanationPage.value = liveInfo.value.page_count_explanation || 0;
            filePage.value = liveInfo.value.page_count_file || 0;

            console.log('数据加载完成 - 评论:', comments.length, '讲解:', explanations.length, '文件:', files.length);

        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载直播信息失败';
            console.error('加载直播信息失败:', e);
        } finally {
            isLoading.value = false;
        }
    }

    // 连接到直播间聊天室
    async function connectToChat(liveId: string | number, userId: number) {
        try {
            await wsManager.connect(liveId, userId);
            console.log('成功连接到聊天室');
            return true;
        } catch (error) {
            console.error('连接聊天室失败:', error);
            return false;
        }
    }

    function disconnectFromChat() {
        wsManager.disconnect();
    }

    // WebSocket连接状态
    const wsConnectionStatus = computed(() => wsManager.connectionStatus);
    const isWsConnected = computed(() => wsManager.isConnected);

    // 发送消息方法 - 使用当前用户ID
    async function sendComment(content: string): Promise<boolean> {
        if (!currentLiveId.value || !currentUserId.value) return false;

        try {
            await wsManager.sendMessage('comment', content);
            const response = await liveAPI.addComment(currentLiveId.value, content, currentUserId.value);
            return response.statusCode === 200;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '添加评论失败';
            throw e;
        }
    }

    async function sendExplanation(content: string): Promise<boolean> {
        if (!currentLiveId.value || !currentUserId.value) return false;

        try {
            await wsManager.sendMessage('explanation', content);
            const response = await liveAPI.addExplanation(currentLiveId.value, content, currentUserId.value);
            return response.statusCode === 200;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '添加讲解失败';
            throw e;
        }
    }

    async function sendFile(fileUrl: string) {
        if (!currentLiveId.value || !currentUserId.value) return;

        try {
            const addResponse = await liveAPI.addFile(currentLiveId.value, fileUrl, currentUserId.value);

            if (addResponse.statusCode !== 200) {
                throw new Error(addResponse.message || '添加文件失败');
            }

            const response = await liveAPI.fetchFilesByPage(currentLiveId.value, 1);

            if (response.statusCode !== 200) {
                throw new Error(response.message || '刷新文件列表失败');
            }

            filePage.value = 1;
            files.length = 0;
            const transformedFiles = (response.data || []).map(transformFile);
            files.push(...transformedFiles);
        } catch (e) {
            error.value = e instanceof Error ? e.message : '添加文件失败';
        }
    }

    // 加载更多数据方法 - 适配新的响应格式
    async function loadMoreComments() {
        if (!currentLiveId.value || commentPage.value <= 0) return;
        isLoadingComments.value = true;
        try {
            const response = await liveAPI.fetchCommentsByPage(currentLiveId.value, commentPage.value);

            if (response.statusCode !== 200) {
                throw new Error(response.message || '获取评论失败');
            }

            const newComments = (response.data || []).map(transformComment);
            comments.unshift(...newComments);
            commentPage.value--;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载更多评论失败';
        } finally {
            isLoadingComments.value = false;
        }
    }

    async function loadMoreExplanations() {
        if (!currentLiveId.value || explanationPage.value <= 0) return;
        isLoadingExplanations.value = true;
        try {
            const response = await liveAPI.fetchExplanationsByPage(currentLiveId.value, explanationPage.value);

            if (response.statusCode !== 200) {
                throw new Error(response.message || '获取讲解失败');
            }

            const newExplanations = (response.data || []).map(transformExplanation);
            explanations.unshift(...newExplanations);
            explanationPage.value--;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载更多讲解失败';
        } finally {
            isLoadingExplanations.value = false;
        }
    }

    async function loadMoreFiles() {
        if (!currentLiveId.value || filePage.value <= 0) return;
        isLoadingFiles.value = true;
        try {
            const response = await liveAPI.fetchFilesByPage(currentLiveId.value, filePage.value);

            if (response.statusCode !== 200) {
                throw new Error(response.message || '获取文件失败');
            }

            const newFiles = (response.data || []).map(transformFile);
            files.unshift(...newFiles);
            filePage.value--;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载更多文件失败';
        } finally {
            isLoadingFiles.value = false;
        }
    }

    // 重置数据
    function reset() {
        currentLiveId.value = null;
        liveInfo.value = null;
        comments.length = 0;
        explanations.length = 0;
        files.length = 0;
        error.value = null;
        commentPage.value = 1;
        explanationPage.value = 1;
        filePage.value = 1;

        liveTitle.value = '';
        liveCoverUrl.value = '';
        isLiving.value = false;
        commentRoomUrl.value = '';
        explanationRoomUrl.value = '';
        broadcastRoomUrl.value = '';

        disconnectFromChat();
    }

    return {
        // 用户管理相关
        currentUserId,
        userSelected,
        availableUsers,
        currentUser,
        shouldShowUserSelector,
        setCurrentUserId,
        restoreUserFromStorage,
        resetUserSelection,

        // 直播相关状态
        currentLiveId,
        liveInfo,
        comments,
        explanations,
        files,
        isLoading,
        error,
        playback_url,
        liveTitle,
        liveCoverUrl,
        isLiving,
        commentRoomUrl,
        explanationRoomUrl,
        broadcastRoomUrl,

        // 加载状态
        hasMoreComments,
        hasMoreExplanations,
        hasMoreFiles,
        isLoadingComments,
        isLoadingExplanations,
        isLoadingFiles,

        // WebSocket相关
        wsConnectionStatus,
        isWsConnected,

        // 方法
        loadLiveInfo,
        loadMoreComments,
        loadMoreExplanations,
        loadMoreFiles,
        sendComment,
        sendExplanation,
        sendFile,
        connectToChat,
        disconnectFromChat,
        reset
    };
});