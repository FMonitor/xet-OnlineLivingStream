import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { liveAPI } from './api';
import type { LiveStreamInfo, Comment, Explanation, File } from './api';

// 添加 API 响应类型定义
interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T[];
}

export const useLiveStore = defineStore('live', () => {
    // 状态
    const currentLiveId = ref<number | null>(null);
    const liveInfo = ref<LiveStreamInfo | null>(null);
    const comments = reactive<Comment[]>([]);
    const explanations = reactive<Explanation[]>([]);
    const files = reactive<File[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const playback_url = ref<string | null>(null);
    const userId = ref<number | null>(null); // 用户 ID
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

    // 加载直播信息（包含初始评论、讲解、文件）
    async function loadLiveInfo(liveId: number | string) {
        isLoading.value = true;
        error.value = null;
        currentLiveId.value = Number(liveId);
        playback_url.value = null;

        try {
            // 获取 API 响应
            const apiResponse = await liveAPI.fetchLiveInfo(liveId);

            // 检查响应状态码
            if (apiResponse.statusCode !== 200) {
                throw new Error(apiResponse.message || '获取直播信息失败');
            }

            // 从数组中获取第一个直播信息对象
            if (!apiResponse.data || !apiResponse.data.length) {
                throw new Error('未找到直播信息');
            }

            // 提取数组中的第一个元素作为直播信息
            liveInfo.value = apiResponse.data[0];

            if (liveInfo.value.playback_url) {
                playback_url.value = liveInfo.value.playback_url;
            }

            // 初始化评论、讲解和文件数据
            if (liveInfo.value.comments) {
                comments.length = 0;
                comments.push(...liveInfo.value.comments);
            }

            if (liveInfo.value.explanations) {
                explanations.length = 0;
                explanations.push(...liveInfo.value.explanations);
            }

            if (liveInfo.value.files) {
                files.length = 0;
                files.push(...liveInfo.value.files);
            }

            // 设置页码为总页数 - 1
            // 因为初始数据已经包含了最新的一页
            commentPage.value = liveInfo.value.page_count_comment > 0 ? liveInfo.value.page_count_comment - 1 : 0;
            explanationPage.value = liveInfo.value.page_count_explanation > 0 ? liveInfo.value.page_count_explanation - 1 : 0;
            filePage.value = liveInfo.value.page_count_file > 0 ? liveInfo.value.page_count_file - 1 : 0;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载直播信息失败';
            console.error('加载直播信息失败:', e);
        } finally {
            isLoading.value = false;
        }
    }

    // 加载更多评论
    async function loadMoreComments() {
        if (!currentLiveId.value || commentPage.value <= 0) return;
        isLoadingComments.value = true;
        try {
            // 此处发送当前页码，稍后页码再递减
            const response = await liveAPI.fetchCommentsByPage(currentLiveId.value, commentPage.value);

            // 检查响应状态码
            if (response.statusCode !== 200) {
                throw new Error(response.message || '获取评论失败');
            }

            // 从响应中提取数据
            const newComments = response.data || [];

            // 将新数据添加到数组前面（而不是后面）
            comments.unshift(...newComments);

            // 成功加载后递减页码，准备加载更早的数据
            commentPage.value--;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载更多评论失败';
        } finally {
            isLoadingComments.value = false;
        }
    }

    // 加载更多讲解
    async function loadMoreExplanations() {
        if (!currentLiveId.value || explanationPage.value <= 0) return;
        isLoadingExplanations.value = true;
        try {
            // 发送当前页码
            const response = await liveAPI.fetchExplanationsByPage(
                currentLiveId.value,
                explanationPage.value
            );

            // 检查响应状态码
            if (response.statusCode !== 200) {
                throw new Error(response.message || '获取讲解失败');
            }

            // 从响应中提取数据
            const newExplanations = response.data || [];

            // 将新数据添加到数组前面
            explanations.unshift(...newExplanations);

            // 递减页码
            explanationPage.value--;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载更多讲解失败';
        } finally {
            isLoadingExplanations.value = false;
        }
    }

    // 加载更多文件
    async function loadMoreFiles() {
        if (!currentLiveId.value || filePage.value <= 0) return;
        isLoadingFiles.value = true;
        try {
            // 发送当前页码
            const response = await liveAPI.fetchFilesByPage(
                currentLiveId.value,
                filePage.value
            );

            // 检查响应状态码
            if (response.statusCode !== 200) {
                throw new Error(response.message || '获取文件失败');
            }

            // 从响应中提取数据
            const newFiles = response.data || [];

            // 将新数据添加到数组前面
            files.unshift(...newFiles);

            // 递减页码
            filePage.value--;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载更多文件失败';
        } finally {
            isLoadingFiles.value = false;
        }
    }

    // 添加评论
    async function addComment(content: string, userId: number): Promise<boolean> {
        if (!currentLiveId.value) return false;

        try {
            // 调用API发送消息
            const response = await liveAPI.addComment(currentLiveId.value, content, userId);

            // 根据HTTP状态码判断是否成功
            return response.statusCode === 200;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '添加评论失败';
            throw e;
        }
    }

    // 添加讲解
    async function addExplanation(content: string, userId: number): Promise<boolean> {
        if (!currentLiveId.value) return false;

        try {
            const response = await liveAPI.addExplanation(currentLiveId.value, content, userId);

            // 仅通过状态码判断成功与否
            return response.statusCode === 200;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '添加讲解失败';
            throw e;
        }
    }

    // 添加文件
    async function addFile(fileUrl: string, userId: number) {
        if (!currentLiveId.value) return;

        try {
            const addResponse = await liveAPI.addFile(currentLiveId.value, fileUrl, userId);

            if (addResponse.statusCode !== 200) {
                throw new Error(addResponse.message || '添加文件失败');
            }

            // 添加成功后刷新文件列表
            const response = await liveAPI.fetchFilesByPage(currentLiveId.value, 1);

            if (response.statusCode !== 200) {
                throw new Error(response.message || '刷新文件列表失败');
            }

            filePage.value = 1;
            files.length = 0;
            files.push(...(response.data || []));
        } catch (e) {
            error.value = e instanceof Error ? e.message : '添加文件失败';
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
    }

    return {
        // 状态
        currentLiveId,
        liveInfo,
        comments,
        explanations,
        files,
        isLoading,
        error,
        playback_url,

        // 是否有更多数据的标志
        hasMoreComments,
        hasMoreExplanations,
        hasMoreFiles,
        isLoadingComments,
        isLoadingExplanations,
        isLoadingFiles,

        // 方法
        loadLiveInfo,
        loadMoreComments,
        loadMoreExplanations,
        loadMoreFiles,
        addComment,
        addExplanation,
        addFile,
        reset
    };
});