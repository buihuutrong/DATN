import axios from 'axios';

// Tạo instance axios với baseURL đúng cho user API
const API = axios.create({
    baseURL: 'http://localhost:8686/api/user',
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

        // Chỉ xử lý 401 cho các route được bảo vệ, không xử lý cho route login
        if (error.response?.status === 401 && !error.config.url.includes('/login')) {
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
        const response = await API.post('/register', {
            email: data.email.trim(),
            password: data.password,
            name: data.name.trim()
        });

        // Log successful response
        console.log('API: Registration response received:', {
            status: response.status,
            hasToken: !!response.data.token,
            hasUser: !!response.data.user,
            message: response.data.message
        });

        // Validate response data
        if (!response.data.token || !response.data.user) {
            console.error('API: Invalid registration response - missing token or user data');
            throw new Error('Đăng ký không thành công - thiếu dữ liệu quan trọng');
        }

        // Store token if registration is successful
        localStorage.setItem('token', response.data.token);
        console.log('API: Registration token stored in localStorage');

        return response.data;
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
        const response = await API.post('/login', data);
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
    window.location.href = '/auth';
};

export const getUser = async () => {
    try {
        console.log('Fetching user data...');
        const response = await API.get('/me');
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
        const response = await API.put('/profile', data);
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

export const getSimilarFoodsFromServer = async (targetFood, tolerance = 0.2) => {
    try {
        console.log('Getting similar foods for:', targetFood);
        const response = await API.post('/similar-foods', { targetFood, tolerance });
        if (!response.data || !response.data.foods) {
            throw new Error('Không nhận được dữ liệu hợp lệ từ server');
        }
        return response.data;
    } catch (error) {
        console.error('Error getting similar foods:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách món ăn phù hợp');
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
