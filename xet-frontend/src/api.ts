import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

// 配置 axios 默认设置
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://lcmonitor.dynv6.net', // 从环境变量获取基础URL
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器：添加认证信息、日志记录等
apiClient.interceptors.request.use(
    (config) => {
        // 获取存储在本地的 token
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }

        // 记录请求信息（开发环境）
        if (import.meta.env.DEV) {
            console.log(`API 请求: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器：统一错误处理、数据转换等
apiClient.interceptors.response.use(
    (response) => {
        // 可以在这里处理通用的响应逻辑
        return response
    },
    (error: AxiosError) => {
        // 统一错误处理
        if (error.response) {
            // 服务器返回了错误状态码
            const status = error.response.status

            switch (status) {
                case 401:
                    // 未授权，可能需要重新登录
                    console.error('未授权访问，请重新登录')
                    // 可以触发重定向到登录页面
                    // router.push('/login')
                    break
                case 403:
                    console.error('无权限访问此资源')
                    break
                case 404:
                    console.error('请求的资源不存在')
                    break
                case 500:
                    console.error('服务器内部错误')
                    break
                default:
                    console.error(`未处理的错误状态码: ${status}`)
            }
        } else if (error.request) {
            // 请求已经发出，但没有收到响应
            console.error('网络错误，无法连接到服务器')
        } else {
            // 请求配置出错
            console.error('请求配置错误:', error.message)
        }

        return Promise.reject(error)
    }
)

export interface ApiResponse<T> {
    statusCode: number;
    message: string;     // 改为 message，与实际响应一致
    data: T[];
}

// 修改直播信息接口 - 适配实际响应格式
export interface LiveStreamInfo {
    living_stream_id: number;
    creator_user_id: number;
    description: string;                   // 实际响应中的字段
    living_stream_url: string;
    living_comment_room_url: string;
    living_expla_room_url: string;
    living_broadcast_room_url: string;
    page_count_comment: number;
    page_count_explanation: number;
    page_count_file: number;
    comments: Comment[];                   // 实际响应中使用这个字段名
    explanations: Explanation[];           // 实际响应中使用这个字段名
    files: File[];                         // 实际响应中使用这个字段名
}

// 修改评论接口 - 适配实际响应格式
export interface Comment {
    comment_id: number;
    living_stream_id: number;
    creator_user_id: number;               // 实际响应中使用这个字段名
    created_at: string;
    content: string;
    sending?: boolean;
    error?: boolean;
    // 兼容字段
    user_id?: number;
}

// 修改讲解接口 - 适配实际响应格式
export interface Explanation {
    expla_id: number;                      // 实际响应中使用这个字段名
    living_stream_id: number;
    creator_user_id: number;               // 实际响应中使用这个字段名
    created_at: string;
    content: string;
    sending?: boolean;
    error?: boolean;
    // 兼容字段
    explanation_id?: number;
    user_id?: number;
}

// 修改文件接口 - 适配实际响应格式
export interface File {
    file_id: number;
    living_stream_id: number;
    creator_user_id: number;               // 实际响应中使用这个字段名
    created_at: string;
    file_url: string;
    file_size?: number;
    sending?: boolean;
    error?: boolean;
    // 兼容字段
    user_id?: number;
}


// 用户信息接口
export interface User {
    id: number;
    name: string;
    avatar_url?: string; // 头像URL
}

// API 方法
export const liveAPI = {
    // 获取直播信息
    fetchLiveInfo: async (liveId: number | string): Promise<ApiResponse<LiveStreamInfo>> => {
        try {
            const response = await apiClient.get(`/home/live/${liveId}`);
            console.log('获取到直播信息:', response.data);
            
            // 验证响应格式
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '获取直播信息失败');
            }
            
            return response.data;
        } catch (error) {
            console.error('获取直播信息失败:', error);
            throw error;
        }
    },

    // 开始直播
    startLive: async (liveId: number | string): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient.post(`/home/live/${liveId}/start`);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '开始直播失败');
            }
            
            return response.data;
        } catch (error) {
            // console.error('开始直播失败:', error);
            throw error;
        }
    },

    // 结束直播
    endLive: async (liveId: number | string): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient.post(`/home/live/${liveId}/end`);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '结束直播失败');
            }
            
            return response.data;
        } catch (error) {
            // console.error('结束直播失败:', error);
            throw error;
        }
    },

    // 分页获取评论 - 更新响应处理
    fetchCommentsByPage: async (liveId: number | string, page: number): Promise<ApiResponse<Comment>> => {
        try {
            const response = await apiClient.get(`/home/live/${liveId}/comment/${page}`);
            
            // 验证响应格式
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '获取评论失败');
            }
            
            return response.data;
        } catch (error) {
            console.error('获取评论失败:', error);
            throw error;
        }
    },

    // 分页获取讲解 - 更新响应处理
    fetchExplanationsByPage: async (liveId: number | string, page: number): Promise<ApiResponse<Explanation>> => {
        try {
            const response = await apiClient.get(`/home/live/${liveId}/expla/${page}`);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '获取讲解失败');
            }
            
            return response.data;
        } catch (error) {
            console.error('获取讲解失败:', error);
            throw error;
        }
    },

    // 分页获取文件 - 更新响应处理
    fetchFilesByPage: async (liveId: number | string, page: number): Promise<ApiResponse<File>> => {
        try {
            const response = await apiClient.get(`/home/live/${liveId}/file/${page}`);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '获取文件失败');
            }
            
            return response.data;
        } catch (error) {
            console.error('获取文件失败:', error);
            throw error;
        }
    },

    // 添加评论 - 更新响应处理
    addComment: async (liveId: number | string, content: string, userId: number): Promise<ApiResponse<any>> => {
        try {
            const data = {
                living_stream_id: liveId,
                creator_user_id: userId,
                content: content,
                created_at: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
            };
            const response = await apiClient.post(`/home/live/${liveId}/comment`, data);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '添加评论失败');
            }
            
            return response.data;
        } catch (error) {
            console.error('添加评论失败:', error);
            throw error;
        }
    },

    // 添加讲解 - 更新响应处理
    addExplanation: async (liveId: number | string, content: string, userId: number): Promise<ApiResponse<any>> => {
        try {
            const data = {
                living_stream_id: liveId,
                creator_user_id: userId,
                content: content,
                created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
            };
            const response = await apiClient.post(`/home/live/${liveId}/expla`, data);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '添加讲解失败');
            }
            
            return response.data;
        } catch (error) {
            console.error('添加讲解失败:', error);
            throw error;
        }
    },

    // 添加文件 - 更新响应处理
    addFile: async (liveId: number | string, fileUrl: string, userId: number): Promise<ApiResponse<any>> => {
        try {
            const data = {
                living_stream_id: liveId,
                creator_user_id: userId,
                file_url: fileUrl,
                created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
            };
            const response = await apiClient.post(`/home/live/${liveId}/file`, data);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || '添加文件失败');
            }
            
            return response.data;
        } catch (error) {
            console.error('添加文件失败:', error);
            throw error;
        }
    }
};

// 用户相关的API
export const userAPI = {
    // 获取用户信息
    fetchUserInfo: async (userId: number): Promise<ApiResponse<User>> => {
        try {
            const response = await apiClient.get(`/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            throw error;
        }
    },
    
    // 获取用户头像
    fetchUserAvatar: async (userId: number): Promise<string> => {
        try {
            // 先尝试获取用户信息，看是否包含头像URL
            const response = await apiClient.get(`/user/${userId}`);
            const userData = response.data.data[0] as User;
            
            // 如果用户信息中包含头像URL，则返回该URL
            if (userData && userData.avatar_url) {
                return userData.avatar_url;
            }
            
            // 如果用户信息中没有头像URL，则返回默认的头像URL格式
            // 这里假设后端提供了获取头像的统一路径
            return `${apiClient.defaults.baseURL}/file/avatar/${userId}.svg`;
        } catch (error) {
            console.error('获取用户头像失败:', error);
            // 发生错误时返回默认头像URL
            return `${apiClient.defaults.baseURL}/file/avatar/default.svg`;
        }
    }
};

// 导出默认配置的 axios 实例
export default apiClient

