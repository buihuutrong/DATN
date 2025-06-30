import axios from 'axios';

// Tạo instance axios với baseURL đúng cho user API
const API = axios.create({
    baseURL: 'http://localhost:8686/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Tạo instance axios mới cho menu API
const MenuAPI = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

// Handle token expiration and other response errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url
        });

        const isChangePassword = error.config.url.includes('/change-password');

        // Chỉ xử lý 401 cho các route được bảo vệ, không xử lý cho route login và change-password
        if (error.response?.status === 401 && !error.config.url.includes('/login') && !isChangePassword) {
            localStorage.removeItem('token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export const register = async (data) => {
    try {
        console.log('API: Starting registration process...');

        // Validate input data
        if (!data.email || !data.password || !data.name) {
            console.error('API: Missing required registration data');
            throw new Error('Vui lòng cung cấp đầy đủ thông tin đăng ký');
        }

        // Log registration attempt (without sensitive data)
        console.log('API: Registration attempt:', {
            email: data.email,
            name: data.name,
            passwordLength: data.password.length
        });

        // Send request to backend
        console.log('API: Sending registration request to:', `${API.defaults.baseURL}/register`);
        const response = await API.post('/user/register', {
            email: data.email.trim(),
            password: data.password,
            name: data.name.trim()
        });

        // Log successful response
        console.log('API: Registration response received:', {
            status: response.status,
            message: response.data.message
        });

        // Chỉ cần trả về message, không cần token/user
        if (response.data.message) {
            return response.data;
        } else {
            throw new Error('Đăng ký không thành công - thiếu thông báo từ server');
        }
    } catch (error) {
        console.error('API: Registration error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
            method: error.config?.method
        });

        // Handle specific error cases
        if (error.response?.status === 409) {
            throw new Error('Email này đã được sử dụng');
        } else if (error.response?.status === 400) {
            const details = error.response.data.details || [];
            const message = error.response.data.message || 'Dữ liệu đăng ký không hợp lệ';
            throw new Error(details.length > 0 ? details.join(', ') : message);
        } else if (!error.response) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }

        throw error;
    }
};

export const login = async (data) => {
    try {
        console.log('Attempting login with:', { email: data.email });
        const response = await API.post('/user/login', data);
        console.log('Login response:', response.data);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        } else {
            throw new Error('No token received from server');
        }

        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
};

export const getUser = async () => {
    try {
        console.log('Fetching user data...');
        const response = await API.get('/user/me');
        console.log('Get user response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Get user error:', error.response?.data || error.message);
        throw error;
    }
};

export const updateProfile = async (data) => {
    try {
        console.log('Sending update profile request with data:', data);
        const response = await API.put('/user/profile', data);
        console.log('Update profile response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error.response?.data || error.message);
        throw error;
    }
};

// Menu API functions
export const suggestFoods = async (requestData) => {
    try {
        console.log('=== Suggest Foods API Call ===');
        console.log('Request data:', JSON.stringify(requestData, null, 2));

        // Validate request data
        if (!requestData?.user) {
            throw new Error('Missing user data in request');
        }

        const { user } = requestData;
        const np = user.nutritionProfile;
        if (!np?.dailyCalorieNeeds) {
            throw new Error('Missing dailyCalorieNeeds in user data');
        }
        if (!np?.macroRatio) {
            throw new Error('Missing macroRatio in user data');
        }

        // Ensure all required fields are present
        const validatedRequest = {
            user: {
                ...user,
                nutritionProfile: {
                    ...np,
                    dailyCalorieNeeds: Number(np.dailyCalorieNeeds),
                    macroRatio: {
                        protein: Number(np.macroRatio.protein || 0.3),
                        carbs: Number(np.macroRatio.carbs || 0.5),
                        fat: Number(np.macroRatio.fat || 0.2)
                    },
                    preferences: Array.isArray(np.preferences) ? np.preferences : [],
                    restrictions: Array.isArray(np.restrictions) ? np.restrictions : [],
                    medicalConditions: Array.isArray(np.medicalConditions) ? np.medicalConditions : ["none"],
                    isComplete: np.isComplete ?? false,
                    mealsPerDay: np.mealsPerDay ?? 3,
                    mealDistribution: np.mealDistribution ?? {},
                }
            },
            context: {
                mealTime: requestData.context?.mealTime || 'all',
                season: requestData.context?.season || 'all',
                weather: requestData.context?.weather || 'all'
            },
            max_suggestions: Number(requestData.max_suggestions || 10)
        };

        console.log('Sending validated request:', validatedRequest);
        const response = await MenuAPI.post('/suggest-foods', validatedRequest);
        return response.data;
    } catch (error) {
        console.error('Suggest foods error:', {
            message: error.message,
            requestData: requestData,
            status: error.response?.status,
            url: error.config?.url
        });
        throw error;
    }
};

export const optimizeMenu = async (requestData) => {
    try {
        console.log('=== Optimize Menu API Call ===');
        console.log('Request data:', JSON.stringify(requestData, null, 2));

        // Validate request data
        if (!requestData?.user?.nutritionProfile) {
            throw new Error('Missing nutrition profile in request data');
        }

        const { user, foods = [], mealTargets } = requestData;
        const np = user.nutritionProfile;

        // Validate required fields
        if (!np.dailyCalorieNeeds) {
            throw new Error('Missing dailyCalorieNeeds in nutrition profile');
        }

        if (!np.macroRatio) {
            throw new Error('Missing macroRatio in nutrition profile');
        }

        // Ensure all required fields are present
        const validatedRequest = {
            user: {
                ...user,
                nutritionProfile: {
                    ...np,
                    dailyCalorieNeeds: Number(np.dailyCalorieNeeds),
                    macroRatio: {
                        protein: Number(np.macroRatio.protein || 0.3),
                        carbs: Number(np.macroRatio.carbs || 0.5),
                        fat: Number(np.macroRatio.fat || 0.2)
                    },
                    preferences: Array.isArray(np.preferences) ? np.preferences : [],
                    restrictions: Array.isArray(np.restrictions) ? np.restrictions : [],
                    medicalConditions: Array.isArray(np.medicalConditions) ? np.medicalConditions : ["none"],
                    isComplete: np.isComplete ?? false,
                    mealsPerDay: np.mealsPerDay ?? 3,
                    mealDistribution: np.mealDistribution ?? {},
                }
            },
            foods: foods,
            mealTargets: mealTargets
        };

        console.log('Sending validated optimize menu request:', validatedRequest);
        const response = await MenuAPI.post('/optimize-menu', validatedRequest);
        return response.data;
    } catch (error) {
        console.error('Optimize menu error:', {
            message: error.message,
            requestData: requestData,
            status: error.response?.status,
            url: error.config?.url
        });
        throw error;
    }
};

export const saveMenu = async (menuData) => {
    try {
        // Gửi request lưu thực đơn
        const response = await MenuAPI.post('/save-menu', menuData);
        return response.data;
    } catch (error) {
        console.error('Save menu error:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data
        });
        throw error;
    }
};

export const getSavedMenus = async (userId) => {
    const response = await MenuAPI.get('/saved-menus', { params: { userId } });
    return response.data;
};

export const getSimilarFood = async (targetFood, tolerance = 0.2) => {
    try {
        const response = await MenuAPI.post('/replace-food', {
            targetFood,
            tolerance
        });
        return response.data;
    } catch (error) {
        // Nếu backend trả về lỗi, lấy message phù hợp
        if (error.response && error.response.data && error.response.data.detail) {
            throw new Error(error.response.data.detail);
        }
        throw error;
    }
};

// Lấy thực đơn theo ngày
export const getMenuByDate = async (userId, date) => {
    const res = await MenuAPI.get(`/menu/by-date?userId=${userId}&date=${date}`);
    return res.data.menu;
};

// Đánh dấu hoàn thành bữa ăn
export const completeMeal = async (userId, date, mealName) => {
    const res = await MenuAPI.post('/menu/complete-meal', { userId, date, mealName });
    return res.data;
};

// Compliance API functions
export const getComplianceHistory = async (userId, startDate, endDate, groupBy = 'day') => {
    try {
        const response = await MenuAPI.get('/compliance/history', {
            params: {
                userId,
                start_date: startDate,
                end_date: endDate,
                group_by: groupBy
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get compliance history error:', error.response?.data || error.message);
        throw error;
    }
};

export const getComplianceGoals = async (userId) => {
    try {
        const response = await MenuAPI.get('/compliance/goals', {
            params: { userId }
        });
        return response.data.goals;
    } catch (error) {
        console.error('Get compliance goals error:', error.response?.data || error.message);
        throw error;
    }
};

export const getComplianceNotifications = async (userId) => {
    try {
        const response = await MenuAPI.get('/compliance/notifications', {
            params: { userId }
        });
        return response.data.notifications;
    } catch (error) {
        console.error('Get compliance notifications error:', error.response?.data || error.message);
        throw error;
    }
};

export const createComplianceGoal = async (goalData) => {
    try {
        const response = await MenuAPI.post('/compliance/goal', goalData);
        return response.data;
    } catch (error) {
        console.error('Create compliance goal error:', error.response?.data || error.message);
        throw error;
    }
};

export const updateComplianceGoal = async (goalId, goalData) => {
    try {
        const response = await MenuAPI.put(`/compliance/goal/${goalId}`, goalData);
        return response.data;
    } catch (error) {
        console.error('Update compliance goal error:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteComplianceGoal = async (goalId) => {
    try {
        const response = await MenuAPI.delete(`/compliance/goal/${goalId}`);
        return response.data;
    } catch (error) {
        console.error('Delete compliance goal error:', error.response?.data || error.message);
        throw error;
    }
};

export const getComplianceStats = async (userId) => {
    try {
        const response = await MenuAPI.get('/compliance/stats', {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Get compliance stats error:', error.response?.data || error.message);
        throw error;
    }
};

// Lấy thông báo nhắc nhở bữa ăn cho user
export const getNotifications = async (userId) => {
    try {
        // Gọi API backend để lấy notifications
        const response = await MenuAPI.get('/notifications', { params: { userId } });
        // Trả về mảng notifications
        return response.data.notifications;
    } catch (error) {
        console.error('Get notifications error:', error.response?.data || error.message);
        throw error;
    }
};

export const searchFoods = async (searchParams) => {
    try {
        console.log('=== Search Foods API Call ===');
        console.log('Original search params:', JSON.stringify(searchParams, null, 2));

        // Chỉ giữ lại các tham số có giá trị.
        const cleanedParams = {};
        for (const key in searchParams) {
            const value = searchParams[key];

            // Bỏ qua null, undefined, chuỗi rỗng, và mảng rỗng.
            if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                continue;
            }

            // Đối với các trường số, đảm bảo chúng là số.
            if (['min_calories', 'max_calories', 'min_protein', 'max_protein', 'min_carbs', 'max_carbs', 'min_fat', 'max_fat'].includes(key)) {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    cleanedParams[key] = numValue;
                }
            } else {
                cleanedParams[key] = value;
            }
        }


        console.log('Cleaned params to be sent:', JSON.stringify(cleanedParams, null, 2));

        const response = await MenuAPI.post('/search-foods', cleanedParams);
        return response.data;
    } catch (error) {
        console.error('Search foods error:', {
            message: error.message,
            searchParams: searchParams,
            status: error.response?.status,
            url: error.config?.url,
            errorData: error.response?.data // Thêm log chi tiết từ backend
        });
        throw error;
    }
};

// Lấy tổng số lượng tài khoản user (không phải admin)
export const getTotalUsers = async () => {
    try {
        const response = await API.get('user/total');
        console.log('[API] Response getTotalUsers:', response.data);
        // Sửa lại dòng này cho đúng với backend
        return response.data.data.totalUsers;
    } catch (error) {
        console.error('Get total users error:', error.response?.data || error.message);
        throw error;
    }
};

// Lấy chi tiết món ăn theo id
export const getFoodDetail = async (id) => {
    try {
        const response = await API.get(`/foods/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Get food detail error:', error.response?.data || error.message);
        throw error;
    }
};

// Lấy danh sách tất cả món ăn
export const getAllFoods = async () => {
    try {
        const response = await API.get('/foods/');
        return response.data.data;
    } catch (error) {
        console.error('Get all foods error:', error.response?.data || error.message);
        throw error;
    }
};

// Cập nhật món ăn theo id (có upload ảnh)
export const updateFood = async (id, data, imageFile = null) => {
    try {
        console.log('[API] Updating food with ID:', id);
        console.log('[API] Update data:', data);

        const formData = new FormData();

        // Add image file if provided
        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Add all other data as JSON string
        const dataToSend = { ...data };

        // Remove image field from data if we're uploading a new image
        if (imageFile) {
            delete dataToSend.image;
        }

        formData.append('data', JSON.stringify(dataToSend));

        const response = await API.put(`/foods/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('[API] Update food response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[API] Update food error:', error.response?.data || error.message);
        throw error;
    }
};

// Xóa món ăn theo ID
export const deleteFood = async (id) => {
    try {
        console.log(`[API] Deleting food with ID: ${id}`);
        const response = await API.delete(`/foods/${id}`);
        console.log('[API] Delete food response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[API] Delete food error:', error.response?.data || error.message);
        throw error;
    }
};

// Lấy danh sách tất cả người dùng (cho admin)
export const getUsers = async () => {
    try {
        console.log('[API] Fetching all users...');
        const response = await API.get('/admin/users');
        console.log('[API] Get users response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[API] Get users error:', error.response?.data || error.message);
        throw error;
    }
};

export const createFood = async (data, imageFile = null) => {
    try {
        console.log('[API] Creating new food with data:', data);
        console.log('[API] Image file:', imageFile);

        const formData = new FormData();

        // Add image file if provided
        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Add all other data as JSON string
        const dataToSend = { ...data };

        // Remove image field from data if we're uploading a new image
        if (imageFile) {
            delete dataToSend.image;
        }

        formData.append('data', JSON.stringify(dataToSend));

        console.log('[API] FormData contents for create:');
        for (let [key, value] of formData.entries()) {
            console.log(`[API] ${key}:`, value);
        }

        const response = await API.post('/foods', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('[API] Create food response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[API] Create food error:', error.response?.data || error.message);
        throw error;
    }
};

export const getShoppingList = async (userId, startDate, endDate) => {
    const response = await MenuAPI.get('/shopping-list', {
        params: {
            userId,
            start_date: startDate,
            end_date: endDate
        }
    });
    return response.data;
};

export const chatWithAI = async (messages, userProfile = null) => {
    const res = await MenuAPI.post('/ai-chat', {
        messages, // gửi toàn bộ lịch sử chat
        user_profile: userProfile
    });
    return res.data.response;
};

export const forgotPassword = async (email) => {
    return await API.post('/user/forgot-password', { email });
};

export const resetPassword = async (token, newPassword) => {
    return await API.post('/user/reset-password', { token, password: newPassword });
};

export const changePassword = async ({ currentPassword, newPassword }) => {
    return await API.put('/user/change-password', { currentPassword, newPassword });
};

// Lấy chi tiết người dùng theo ID (cho admin)
export const getUserById = async (id) => {
    try {
        console.log(`[API] Fetching user by ID: ${id}`);
        const response = await API.get(`/admin/users/${id}`);
        console.log('[API] Get user by ID response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`[API] Get user by ID error for ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Cập nhật người dùng bởi admin
export const updateUser = async (id, data) => {
    try {
        console.log(`[API] Updating user ${id} with data:`, data);
        const response = await API.put(`/admin/users/${id}`, data);
        console.log('[API] Update user response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`[API] Update user error for ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};
