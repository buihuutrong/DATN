import React, { useState, useEffect } from 'react';
import { getUser, updateProfile, suggestFoods, optimizeMenu, saveMenu, getSavedMenus, getSimilarFoodsFromServer } from '../../../services/api';
import './MenuSection.css';
import axios from 'axios';

const BACKEND_URL = "http://localhost:8686";

const MenuSection = ({ user }) => {
    console.log('MenuSection received user:', user);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [weeklyMenu, setWeeklyMenu] = useState(() => {
        // Khôi phục thực đơn từ localStorage khi component mount
        const savedMenu = localStorage.getItem('weeklyMenu');
        return savedMenu ? JSON.parse(savedMenu) : {};
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [menuType, setMenuType] = useState('weekly'); // 'daily' hoặc 'weekly'
    const [generationProgress, setGenerationProgress] = useState(0);
    const [suggestedFoods, setSuggestedFoods] = useState([]);
    const [availableFoods, setAvailableFoods] = useState([]);
    const [menuStats, setMenuStats] = useState(null);
    const [evolutionHistory, setEvolutionHistory] = useState([]);
    const [loadingStates, setLoadingStates] = useState({
        generating: false,
        suggesting: false,
        saving: false,
        editing: false
    });
    const [errorStates, setErrorStates] = useState({
        generation: null,
        suggestion: null,
        saving: null,
        editing: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isServerConnected, setIsServerConnected] = useState(true);
    const [mealsPerDay, setMealsPerDay] = useState(3);
    const [mealTargets, setMealTargets] = useState(null);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isReplacingFood, setIsReplacingFood] = useState(false);
    const [replacementFoods, setReplacementFoods] = useState([]);
    const [currentMealTarget, setCurrentMealTarget] = useState(null);
    const [selectedMealForReplacement, setSelectedMealForReplacement] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const mealNames = [
        'Bữa sáng',
        'Bữa phụ 1',
        'Bữa trưa',
        'Bữa phụ 2',
        'Bữa tối',
        'Bữa phụ 3'
    ];

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const meals = ['Bữa sáng', 'Bữa trưa', 'Bữa tối'];

    const getDateString = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setSelectedMeal(null);
    };

    const handleMealClick = (meal) => {
        setSelectedMeal(meal);
    };

    // Hàm lấy danh sách foods có sẵn
    const fetchAvailableFoods = async () => {
        if (isLoading) {
            console.log('Already loading, skipping fetch');
            return;
        }

        if (!isServerConnected) {
            setError('Không thể kết nối đến server');
            return;
        }

        try {
            setIsLoading(true);
            // Kiểm tra chi tiết hơn
            if (!user?.nutritionProfile?.isComplete) {
                setError('Vui lòng hoàn thành thông tin dinh dưỡng trong hồ sơ');
                return;
            }
            if (!user?.nutritionProfile?.dailyCalorieNeeds) {
                setError('Bạn cần hoàn thành hồ sơ dinh dưỡng để hệ thống tính toán lượng calo cần thiết mỗi ngày.');
                setIsLoading(false);
                return;
            }

            // Tạo requestPayload đúng cấu trúc
            const requestPayload = {
                user: {
                    nutritionProfile: {
                        dailyCalorieNeeds: user.nutritionProfile.dailyCalorieNeeds,
                        macroRatio: {
                            protein: user.nutritionProfile.macroRatio?.protein ?? 0.3,
                            carbs: user.nutritionProfile.macroRatio?.carbs ?? 0.5,
                            fat: user.nutritionProfile.macroRatio?.fat ?? 0.2,
                        },
                        preferences: user.nutritionProfile.preferences ?? [],
                        restrictions: user.nutritionProfile.restrictions ?? [],
                        medicalConditions: user.nutritionProfile.medicalConditions ?? ["none"],
                        isComplete: user.nutritionProfile.isComplete ?? false,
                        mealsPerDay: user.nutritionProfile.mealsPerDay ?? 3,
                        mealDistribution: user.nutritionProfile.mealDistribution ?? {},
                        age: user.nutritionProfile.age,
                        weight: user.nutritionProfile.weight,
                        height: user.nutritionProfile.height,
                        gender: user.nutritionProfile.gender,
                        activityLevel: user.nutritionProfile.activityLevel,
                        goals: user.nutritionProfile.goals,
                        bmr: user.nutritionProfile.bmr,
                    },
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    compliance: user.compliance ?? 100,
                },
                context: {
                    mealTime: selectedMeal || 'all',
                    season: 'all',
                    weather: 'all'
                },
                max_suggestions: 10
            };
            console.log('Payload gửi lên:', requestPayload);
            const response = await suggestFoods(requestPayload);

            if (response?.foods) {
                console.log('Received foods:', response.foods);
                setAvailableFoods(response.foods);
                setError(null);
            } else {
                throw new Error('Không nhận được danh sách món ăn từ server');
            }
        } catch (error) {
            console.error('Error fetching foods:', error);
            setError(error.response?.data?.detail || 'Không thể lấy danh sách món ăn');
            setAvailableFoods([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm tạo thực đơn bằng GA
    const handleGenerateMenu = async () => {
        setLoading(true);
        setError(null);
        setGenerationProgress(0);

        try {
            if (!user?.nutritionProfile) {
                throw new Error('Vui lòng cập nhật hồ sơ dinh dưỡng trước khi tạo thực đơn');
            }
            if (!user.nutritionProfile.isComplete) {
                throw new Error('Vui lòng hoàn thành thông tin dinh dưỡng trong hồ sơ');
            }
            if (!user.nutritionProfile.dailyCalorieNeeds) {
                throw new Error('Bạn cần hoàn thành hồ sơ dinh dưỡng để hệ thống tính toán lượng calo cần thiết mỗi ngày.');
            }
            if (!availableFoods || availableFoods.length === 0) {
                await fetchAvailableFoods();
                if (!availableFoods || availableFoods.length === 0) {
                    throw new Error('Không thể lấy danh sách món ăn');
                }
            }
            // Tạo mealTargets dựa trên số bữa/ngày
            const mealTargetsLocal = allocateMealMacros(
                user.nutritionProfile.dailyCalorieNeeds,
                user.nutritionProfile.macroRatio,
                user.nutritionProfile.weight,
                mealsPerDay
            );
            setMealTargets(mealTargetsLocal);
            // Gọi API tạo thực đơn với mealTargets
            const response = await optimizeMenu({
                user: {
                    ...user,
                    nutritionProfile: {
                        ...user.nutritionProfile,
                        mealsPerDay: mealsPerDay
                    }
                },
                foods: availableFoods.map(f => ({
                    _id: f._id ? f._id.toString() : undefined,
                    name: f.name,
                    image: f.image,
                    calories: f.calories,
                    protein: f.protein,
                    carbs: f.carbs,
                    fat: f.fat,
                    preferences: f.preferences || [],
                    restrictions: f.restrictions || [],
                    context: f.context || {},
                    ingredients: f.ingredients || [],
                    instructions: f.instructions || []
                })),
                mealTargets: mealTargetsLocal
            });

            if (!response || !response.foods) {
                throw new Error('Không nhận được thực đơn từ server');
            }

            // Cập nhật state với thực đơn mới
            const formattedMenu = {};
            const dynamicMealNames = getMealNames();
            response.foods.forEach((mealFoods, mealIdx) => {
                const date = new Date();
                date.setDate(date.getDate() + Math.floor(mealIdx / mealsPerDay));
                const dateString = date.toISOString().split('T')[0];
                const mealIndex = mealIdx % mealsPerDay;
                let mealName = dynamicMealNames[mealIndex];
                if (!formattedMenu[dateString]) {
                    formattedMenu[dateString] = {};
                }
                formattedMenu[dateString][mealName] = mealFoods.map(food => ({
                    name: food.name,
                    image: food.image,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                    ingredients: food.ingredients || []
                }));
            });

            setWeeklyMenu(formattedMenu);
            setError(null);

        } catch (err) {
            console.error('Error generating menu:', err);
            setError(err.message || 'Có lỗi xảy ra khi tạo thực đơn');
            setWeeklyMenu({});
        } finally {
            setLoading(false);
            setGenerationProgress(0);
        }
    };

    // Hàm gợi ý món ăn
    const handleSuggestFoods = async (mealTime) => {
        if (!user?.nutritionProfile) {
            setError('Vui lòng cập nhật hồ sơ dinh dưỡng trước khi xem gợi ý');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await suggestFoods(user, {
                mealTime,
                season: 'all', // TODO: Thêm chọn mùa
                weather: 'all', // TODO: Thêm chọn thời tiết
                maxSuggestions: 5
            });

            setSuggestedFoods(response.foods || []);
        } catch (err) {
            console.error('Error suggesting foods:', err);
            setError(err.response?.data?.detail || 'Có lỗi xảy ra khi gợi ý món ăn');
        } finally {
            setLoading(false);
        }
    };

    // Hàm lưu thực đơn
    const handleSaveMenu = async () => {
        try {
            const dateString = getDateString(selectedDate);
            const menuData = weeklyMenu[dateString];
            if (!menuData) {
                setError('Không có thực đơn để lưu');
                return;
            }
            // Chuẩn hóa dữ liệu gửi lên backend
            const meals = Object.entries(menuData).map(([mealName, foods]) => ({
                mealName,
                foods
            }));
            // Tính tổng dinh dưỡng
            const totalNutrition = meals.reduce((acc, meal) => {
                meal.foods.forEach(food => {
                    acc.calories += food.calories || 0;
                    acc.protein += food.protein || 0;
                    acc.carbs += food.carbs || 0;
                    acc.fat += food.fat || 0;
                });
                return acc;
            }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
            // Gọi API chuẩn hóa
            const res = await saveMenu({
                userId: user._id || user.id || user.email,
                date: dateString,
                meals,
                totalNutrition,
                note: ''
            });
            if (res.menuId) {
                alert('Lưu thực đơn thành công!');
            } else {
                setError(res.error || 'Lưu thực đơn thất bại');
            }
        } catch (err) {
            setError('Lỗi khi lưu thực đơn: ' + err.message);
        }
    };

    // Hàm chia sẻ thực đơn
    const handleShareMenu = () => {
        // Implement sharing functionality
        console.log('Sharing menu:', weeklyMenu);
    };

    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    const closeErrorModal = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

    // Thêm các hàm GA vào trước handleEditMeal
    const calculateFitness = (mealCombination, target) => {
        // Kiểm tra và lọc bỏ các món undefined
        const validCombination = mealCombination.filter(food => food && typeof food === 'object');
        if (validCombination.length === 0) {
            return Infinity;
        }

        const totalNutrition = validCombination.reduce((acc, food) => ({
            calories: acc.calories + (food?.calories || 0),
            protein: acc.protein + (food?.protein || 0),
            carbs: acc.carbs + (food?.carbs || 0),
            fat: acc.fat + (food?.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // Tính độ lệch so với target
        const calorieDiff = Math.abs(totalNutrition.calories - target.calories) / target.calories;
        const proteinDiff = Math.abs(totalNutrition.protein - target.protein) / target.protein;
        const carbsDiff = Math.abs(totalNutrition.carbs - target.carbs) / target.carbs;
        const fatDiff = Math.abs(totalNutrition.fat - target.fat) / target.fat;

        // Tính fitness score (càng thấp càng tốt)
        return (calorieDiff + proteinDiff + carbsDiff + fatDiff) / 4;
    };

    const createInitialPopulation = (availableFoods, target, populationSize = 50) => {
        const population = [];
        for (let i = 0; i < populationSize; i++) {
            // Tạo một tổ hợp món ăn ngẫu nhiên (2-4 món)
            const numFoods = Math.floor(Math.random() * 3) + 2;
            const mealCombination = [];
            let currentNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

            for (let j = 0; j < numFoods; j++) {
                const remainingNutrition = {
                    calories: target.calories - currentNutrition.calories,
                    protein: target.protein - currentNutrition.protein,
                    carbs: target.carbs - currentNutrition.carbs,
                    fat: target.fat - currentNutrition.fat
                };

                // Lọc các món phù hợp với phần dinh dưỡng còn thiếu
                const suitableFoods = availableFoods.filter(food =>
                    food.calories <= remainingNutrition.calories * 1.2 &&
                    food.protein <= remainingNutrition.protein * 1.2 &&
                    food.carbs <= remainingNutrition.carbs * 1.2 &&
                    food.fat <= remainingNutrition.fat * 1.2
                );

                if (suitableFoods.length === 0) break;

                // Chọn ngẫu nhiên một món
                const randomFood = suitableFoods[Math.floor(Math.random() * suitableFoods.length)];
                mealCombination.push(randomFood);
                currentNutrition.calories += randomFood.calories;
                currentNutrition.protein += randomFood.protein;
                currentNutrition.carbs += randomFood.carbs;
                currentNutrition.fat += randomFood.fat;
            }

            if (mealCombination.length > 0) {
                population.push(mealCombination);
            }
        }
        return population;
    };

    const crossover = (parent1, parent2) => {
        const child = [];
        const minLength = Math.min(parent1.length, parent2.length);
        const maxLength = Math.max(parent1.length, parent2.length);

        // Lấy một số món từ parent1
        const numFromParent1 = Math.floor(Math.random() * minLength) + 1;
        for (let i = 0; i < numFromParent1; i++) {
            child.push(parent1[i]);
        }

        // Lấy một số món từ parent2
        const numFromParent2 = Math.floor(Math.random() * (maxLength - numFromParent1)) + 1;
        for (let i = 0; i < numFromParent2; i++) {
            if (!child.includes(parent2[i])) {
                child.push(parent2[i]);
            }
        }

        return child;
    };

    const mutate = (mealCombination, availableFoods, target) => {
        // Kiểm tra và lọc bỏ các món undefined
        const validCombination = mealCombination.filter(food => food && typeof food === 'object');
        const mutated = [...validCombination];
        const mutationType = Math.random();

        if (mutationType < 0.3 && mutated.length > 1) {
            // Xóa một món
            const indexToRemove = Math.floor(Math.random() * mutated.length);
            mutated.splice(indexToRemove, 1);
        } else if (mutationType < 0.6) {
            // Thay thế một món
            const indexToReplace = Math.floor(Math.random() * mutated.length);
            const currentFood = mutated[indexToReplace];

            // Tính toán dinh dưỡng còn lại
            const remainingNutrition = {
                calories: target.calories - mutated.reduce((sum, food) => sum + (food?.calories || 0), 0) + (currentFood?.calories || 0),
                protein: target.protein - mutated.reduce((sum, food) => sum + (food?.protein || 0), 0) + (currentFood?.protein || 0),
                carbs: target.carbs - mutated.reduce((sum, food) => sum + (food?.carbs || 0), 0) + (currentFood?.carbs || 0),
                fat: target.fat - mutated.reduce((sum, food) => sum + (food?.fat || 0), 0) + (currentFood?.fat || 0)
            };

            // Lọc các món phù hợp
            const suitableFoods = availableFoods.filter(food =>
                food && typeof food === 'object' &&
                food.calories <= remainingNutrition.calories * 1.2 &&
                food.protein <= remainingNutrition.protein * 1.2 &&
                food.carbs <= remainingNutrition.carbs * 1.2 &&
                food.fat <= remainingNutrition.fat * 1.2
            );

            if (suitableFoods.length > 0) {
                const newFood = suitableFoods[Math.floor(Math.random() * suitableFoods.length)];
                mutated[indexToReplace] = newFood;
            }
        } else if (mutationType < 0.9) {
            // Thêm một món mới
            const remainingNutrition = {
                calories: target.calories - mutated.reduce((sum, food) => sum + (food?.calories || 0), 0),
                protein: target.protein - mutated.reduce((sum, food) => sum + (food?.protein || 0), 0),
                carbs: target.carbs - mutated.reduce((sum, food) => sum + (food?.carbs || 0), 0),
                fat: target.fat - mutated.reduce((sum, food) => sum + (food?.fat || 0), 0)
            };

            // Lọc các món phù hợp
            const suitableFoods = availableFoods.filter(food =>
                food && typeof food === 'object' &&
                food.calories <= remainingNutrition.calories * 1.2 &&
                food.protein <= remainingNutrition.protein * 1.2 &&
                food.carbs <= remainingNutrition.carbs * 1.2 &&
                food.fat <= remainingNutrition.fat * 1.2
            );

            if (suitableFoods.length > 0) {
                const newFood = suitableFoods[Math.floor(Math.random() * suitableFoods.length)];
                mutated.push(newFood);
            }
        }

        return mutated;
    };

    const optimizeMealCombination = (availableFoods, target, maxGenerations = 50) => {
        // Kiểm tra và lọc bỏ các món undefined
        const validFoods = availableFoods.filter(food => food && typeof food === 'object');
        if (validFoods.length === 0) {
            return null;
        }

        let population = createInitialPopulation(validFoods, target);
        let bestSolution = null;
        let bestFitness = Infinity;

        for (let generation = 0; generation < maxGenerations; generation++) {
            // Đánh giá fitness cho mỗi tổ hợp
            const fitnessScores = population.map(combination => ({
                combination: combination.filter(food => food && typeof food === 'object'),
                fitness: calculateFitness(combination.filter(food => food && typeof food === 'object'), target)
            }));

            // Cập nhật giải pháp tốt nhất
            const currentBest = fitnessScores.reduce((best, current) =>
                current.fitness < best.fitness ? current : best
            );

            if (currentBest.fitness < bestFitness) {
                bestFitness = currentBest.fitness;
                bestSolution = currentBest.combination;
            }

            // Tạo thế hệ mới
            const newPopulation = [];

            // Giữ lại 20% tổ hợp tốt nhất
            const eliteCount = Math.floor(population.length * 0.2);
            const elites = fitnessScores
                .sort((a, b) => a.fitness - b.fitness)
                .slice(0, eliteCount)
                .map(item => item.combination);

            newPopulation.push(...elites);

            // Tạo các tổ hợp mới thông qua crossover và mutation
            while (newPopulation.length < population.length) {
                // Chọn parents
                const parent1 = population[Math.floor(Math.random() * population.length)];
                const parent2 = population[Math.floor(Math.random() * population.length)];

                // Tạo child thông qua crossover
                let child = crossover(parent1, parent2);

                // Áp dụng mutation
                if (Math.random() < 0.3) {
                    child = mutate(child, validFoods, target);
                }

                newPopulation.push(child);
            }

            population = newPopulation;
        }

        return bestSolution;
    };

    // Thêm hàm mới để tối ưu món thay thế đơn lẻ
    const optimizeSingleFoodReplacement = (availableFoods, targetFood, maxGenerations = 30) => {
        // Lọc bỏ chính món hiện tại
        const validFoods = availableFoods.filter(food =>
            food && typeof food === 'object' &&
            food._id !== targetFood._id // Loại bỏ món hiện tại
        );

        if (validFoods.length === 0) return null;

        // Tạo quần thể ban đầu với các món đơn lẻ
        let population = validFoods.map(food => [food]);
        let bestSolution = null;
        let bestFitness = Infinity;

        for (let generation = 0; generation < maxGenerations; generation++) {
            // Đánh giá fitness cho mỗi món
            const fitnessScores = population.map(foodArr => ({
                food: foodArr[0],
                fitness: calculateSingleFoodFitness(foodArr[0], targetFood)
            }));

            // Tìm món tốt nhất
            const currentBest = fitnessScores.reduce((best, current) =>
                current.fitness < best.fitness ? current : best
            );

            if (currentBest.fitness < bestFitness) {
                bestFitness = currentBest.fitness;
                bestSolution = currentBest.food;
            }

            // Tạo thế hệ mới (đơn giản hóa: chọn ngẫu nhiên)
            const newPopulation = [];
            const eliteCount = Math.floor(population.length * 0.2);
            const elites = fitnessScores
                .sort((a, b) => a.fitness - b.fitness)
                .slice(0, eliteCount)
                .map(item => [item.food]);
            newPopulation.push(...elites);

            while (newPopulation.length < population.length) {
                const parent = population[Math.floor(Math.random() * population.length)][0];
                // Đột biến: chọn món ngẫu nhiên gần giống
                const similarFoods = validFoods.filter(food =>
                    Math.abs(food.calories - parent.calories) <= parent.calories * 0.2 &&
                    Math.abs(food.protein - parent.protein) <= parent.protein * 0.2 &&
                    Math.abs(food.carbs - parent.carbs) <= parent.carbs * 0.2 &&
                    Math.abs(food.fat - parent.fat) <= parent.fat * 0.2
                );
                if (similarFoods.length > 0) {
                    const newFood = similarFoods[Math.floor(Math.random() * similarFoods.length)];
                    newPopulation.push([newFood]);
                } else {
                    newPopulation.push([parent]);
                }
            }
            population = newPopulation;
        }
        return bestSolution;
    };

    const calculateSingleFoodFitness = (food, targetFood) => {
        if (!food || !targetFood) return Infinity;
        const calorieDiff = Math.abs(food.calories - targetFood.calories) / targetFood.calories;
        const proteinDiff = Math.abs(food.protein - targetFood.protein) / targetFood.protein;
        const carbsDiff = Math.abs(food.carbs - targetFood.carbs) / targetFood.carbs;
        const fatDiff = Math.abs(food.fat - targetFood.fat) / targetFood.fat;
        return (calorieDiff + proteinDiff + carbsDiff + fatDiff) / 4;
    };

    // Hàm lọc các món có dinh dưỡng gần giống (lệch < 20%)
    const getSimilarFoods = (availableFoods, targetFood, tolerance = 0.2) => {
        const result = availableFoods.filter(food =>
            food && typeof food === 'object' &&
            food._id !== targetFood._id &&
            Math.abs(food.calories - targetFood.calories) <= targetFood.calories * tolerance &&
            Math.abs(food.protein - targetFood.protein) <= targetFood.protein * tolerance &&
            Math.abs(food.carbs - targetFood.carbs) <= targetFood.carbs * tolerance &&
            Math.abs(food.fat - targetFood.fat) <= targetFood.fat * tolerance
        );
        console.log('Các món phù hợp (lệch < 20% so với', targetFood.name, '):', result);
        return result;
    };

    const handleEditMeal = async (date, meal, foodIndex = null) => {
        try {
            setLoading(true);
            setError(null);

            // Kiểm tra xem có mealTargets không
            if (!mealTargets) {
                console.log('No mealTargets, calculating new ones');
                if (!user?.nutritionProfile) {
                    showError('Vui lòng cập nhật hồ sơ dinh dưỡng trước khi thay đổi món');
                    return;
                }
                const newMealTargets = allocateMealMacros(
                    user.nutritionProfile.dailyCalorieNeeds,
                    user.nutritionProfile.macroRatio,
                    user.nutritionProfile.weight,
                    mealsPerDay
                );
                setMealTargets(newMealTargets);
                console.log('New mealTargets:', newMealTargets);
            }

            // Lấy thông tin dinh dưỡng mục tiêu của bữa ăn
            const mealNames = getMealNames();
            const mealIndex = mealNames.indexOf(meal);
            console.log('Meal index:', mealIndex, 'for meal:', meal);

            if (mealIndex === -1) {
                showError('Không tìm thấy thông tin bữa ăn');
                return;
            }

            const mealTarget = mealTargets[mealIndex];
            console.log('Meal target:', mealTarget);

            if (!mealTarget) {
                showError('Không tìm thấy thông tin dinh dưỡng mục tiêu cho bữa này');
                return;
            }

            // Nếu đang thay đổi một món cụ thể
            if (foodIndex !== null) {
                const currentMeal = weeklyMenu[date][meal];
                const targetFood = currentMeal[foodIndex];
                if (!targetFood) {
                    showError('Không tìm thấy món ăn cần thay đổi');
                    setLoading(false);
                    return;
                }
                try {
                    // Gọi API backend để lấy danh sách món phù hợp
                    const res = await getSimilarFoodsFromServer(targetFood, 0.2);
                    const similarFoods = res.foods || [];
                    if (!similarFoods.length) {
                        showError('Không tìm thấy món ăn phù hợp để thay thế. Vui lòng thử lại sau.');
                        setLoading(false);
                        return;
                    }
                    setReplacementFoods(similarFoods);
                    setIsReplacingFood(true);
                    setSelectedMealForReplacement({ date, meal, foodIndex });
                    setCurrentMealTarget(targetFood);
                } catch (err) {
                    showError('Không thể lấy danh sách món ăn phù hợp');
                } finally {
                    setLoading(false);
                }
                return;
            } else {
                // Nếu đang thay đổi toàn bộ bữa ăn
                // Lọc các món ăn có thể phù hợp với bữa này
                const suitableFoods = availableFoods.filter(food => {
                    return food.calories <= mealTarget.calories * 1.5 &&
                        food.protein <= mealTarget.protein * 1.5 &&
                        food.carbs <= mealTarget.carbs * 1.5 &&
                        food.fat <= mealTarget.fat * 1.5;
                });

                if (suitableFoods.length === 0) {
                    showError('Không tìm thấy món ăn phù hợp với hàm lượng dinh dưỡng của bữa này');
                    return;
                }

                // Sử dụng GA để tìm tổ hợp món ăn tối ưu
                const optimizedMeal = optimizeMealCombination(suitableFoods, mealTarget);

                if (!optimizedMeal || optimizedMeal.length === 0) {
                    showError('Không thể tạo được bữa ăn phù hợp với yêu cầu dinh dưỡng');
                    return;
                }

                // Cập nhật thực đơn với tổ hợp món ăn mới
                const updatedMenu = { ...weeklyMenu };
                if (!updatedMenu[date]) {
                    updatedMenu[date] = {};
                }
                updatedMenu[date][meal] = optimizedMeal;
                setWeeklyMenu(updatedMenu);
            }
        } catch (err) {
            console.error('Error in handleEditMeal:', err);
            showError('Có lỗi xảy ra khi thay đổi món ăn');
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceFood = (newFood) => {
        if (!selectedMealForReplacement || !newFood) return;

        try {
            const { date, meal, foodIndex } = selectedMealForReplacement;
            const updatedMenu = { ...weeklyMenu };

            // Kiểm tra xem ngày và bữa ăn có tồn tại trong thực đơn không
            if (!updatedMenu[date]) {
                updatedMenu[date] = {};
            }
            if (!updatedMenu[date][meal]) {
                updatedMenu[date][meal] = [];
            }

            // Nếu foodIndex được chỉ định, thay thế món cụ thể
            if (foodIndex !== null) {
                updatedMenu[date][meal][foodIndex] = newFood;
            } else {
                // Nếu không, thay thế toàn bộ bữa ăn
                updatedMenu[date][meal] = [newFood];
            }

            // Cập nhật state
            setWeeklyMenu(updatedMenu);
            setIsReplacingFood(false);
            setSelectedMealForReplacement(null);
            setReplacementFoods([]);
            setCurrentMealTarget(null);
        } catch (err) {
            console.error('Error in handleReplaceFood:', err);
            showError('Lỗi khi thay đổi món: ' + err.message);
        }
    };

    const handleExportMenu = () => {
        const menuData = {
            weeklyMenu,
            stats: menuStats,
            userPreferences: user.preferences,
            generatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(menuData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu-${getDateString(selectedDate)}.json`;
        a.click();
    };

    const validateMenuGeneration = () => {
        if (!user?.nutritionProfile) {
            setError('Vui lòng cập nhật hồ sơ dinh dưỡng trước khi tạo thực đơn');
            return false;
        }

        if (availableFoods.length < 3) {
            setError('Cần ít nhất 3 món ăn để tạo thực đơn');
            return false;
        }

        return true;
    };

    const renderWeeklyCalendar = () => {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        return (
            <div className="weekly-calendar">
                <div className="calendar-header">
                    {days.map((day, index) => (
                        <div key={day} className="calendar-day-header">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="calendar-body">
                    {days.map((_, index) => {
                        const date = new Date(weekStart);
                        date.setDate(weekStart.getDate() + index);
                        const dateString = getDateString(date);
                        const isSelected = getDateString(selectedDate) === dateString;
                        const hasMenu = weeklyMenu[dateString];

                        return (
                            <div
                                key={dateString}
                                className={`calendar-day ${isSelected ? 'selected' : ''} ${hasMenu ? 'has-menu' : ''}`}
                                onClick={() => handleDateClick(date)}
                            >
                                <span className="date-number">{date.getDate()}</span>
                                {hasMenu && <span className="menu-indicator"></span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSuggestedFoodsScroll = () => {
        if (!availableFoods || availableFoods.length === 0) return null;
        return (
            <div className="suggested-foods-wrapper">
                <h3 className="suggested-foods-title">Gợi ý món ăn cho bạn</h3>
                <div className="suggested-foods-scroll">
                    {availableFoods.map((food, idx) => (
                        <div className="suggested-food-card" key={food._id || idx}>
                            <img
                                src={food.image?.startsWith('http') ? food.image : `${BACKEND_URL}${food.image}`}
                                alt={food.name}
                                className="suggested-food-image"
                            />
                            <div className="suggested-food-name">{food.name}</div>
                            <div className="suggested-food-macros">
                                <span>{food.calories} kcal</span>
                                <span>P: {food.protein}g</span>
                                <span>C: {food.carbs}g</span>
                                <span>F: {food.fat}g</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Thêm hàm kiểm tra đã tạo thực đơn cho ngày hiện tại chưa
    const isMenuCreatedForSelectedDate = () => {
        const dateString = getDateString(selectedDate);
        return weeklyMenu[dateString] && Object.keys(weeklyMenu[dateString]).length > 0;
    };

    // Hàm lấy tên bữa ăn động theo số bữa/ngày (chuẩn hóa theo yêu cầu)
    const getMealNames = () => {
        if (mealsPerDay === 2) return ['Bữa trưa', 'Bữa tối'];
        if (mealsPerDay === 3) return ['Bữa sáng', 'Bữa trưa', 'Bữa tối'];
        if (mealsPerDay === 4) return ['Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Bữa phụ tối'];
        if (mealsPerDay === 5) return ['Bữa sáng', 'Bữa phụ sáng', 'Bữa trưa', 'Bữa tối', 'Bữa phụ tối'];
        if (mealsPerDay === 6) return ['Bữa sáng', 'Bữa phụ sáng', 'Bữa trưa', 'Bữa phụ chiều', 'Bữa tối', 'Bữa phụ tối'];
        return mealNames.slice(0, mealsPerDay);
    };

    // Sửa renderMealList để dùng getMealNames()
    const renderMealList = () => {
        if (!isMenuCreatedForSelectedDate()) {
            return null;
        }
        const dateString = getDateString(selectedDate);
        const dayMenu = weeklyMenu[dateString] || {};
        const dynamicMealNames = getMealNames();
        return (
            <div className="meal-list">
                {dynamicMealNames.map((meal, idx) => {
                    const mealData = dayMenu[meal];
                    const isSelected = selectedMeal === meal;
                    return (
                        <div
                            key={meal}
                            className={`meal-item ${isSelected ? 'selected' : ''} ${mealData ? 'has-data' : ''}`}
                            onClick={() => handleMealClick(meal)}
                        >
                            <div className="meal-header">
                                <h3>{meal}</h3>
                                <div className="meal-header-actions">
                                    {mealData && (
                                        <>
                                            <span className="meal-calories">
                                                {mealData.reduce((sum, f) => sum + f.calories, 0)} kcal
                                            </span>
                                            <button
                                                className="edit-meal-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditMeal(dateString, meal);
                                                }}
                                            >
                                                <i className="fas fa-exchange-alt"></i>
                                                Thay đổi
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            {mealData && mealData.length > 0 && (
                                <div className="meal-details">
                                    {mealData.map((food, i) => (
                                        <div key={i} className="meal-food-block">
                                            <div className="meal-food-name">{food.name}</div>
                                            <div className="meal-food-image">
                                                <img
                                                    src={food.image.startsWith('http') ? food.image : `${BACKEND_URL}${food.image}`}
                                                    alt={food.name}
                                                    className="meal-food-image clickable"
                                                    onClick={() => setSelectedFood(food)}
                                                />
                                            </div>
                                            <div className="meal-macros">
                                                <span>P: {food.protein}g</span>
                                                <span>C: {food.carbs}g</span>
                                                <span>F: {food.fat}g</span>
                                            </div>
                                            <button
                                                className="edit-food-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditMeal(dateString, meal, i);
                                                }}
                                            >
                                                <i className="fas fa-exchange-alt"></i>
                                                Thay đổi
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderFoodDetailModal = () => {
        if (!selectedFood) return null;
        return (
            <div className="meal-detail-modal">
                <div className="modal-content meal-detail-modern">
                    <h2 className="meal-detail-title">{selectedFood.name}</h2>
                    <button className="close-modal" onClick={() => setSelectedFood(null)}>
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="meal-detail-food-block-vertical">
                        <div className="meal-detail-food-header">
                            <div className="meal-detail-image-col">
                                {selectedFood.image && (
                                    <img
                                        src={selectedFood.image.startsWith('http') ? selectedFood.image : `${BACKEND_URL}${selectedFood.image}`}
                                        alt={selectedFood.name}
                                        className="meal-detail-image"
                                    />
                                )}
                            </div>
                            <div className="meal-detail-nutrition-col">
                                <div className="meal-detail-nutrition-grid">
                                    <div className="nutrition-card">
                                        <div className="nutrition-label">Calories</div>
                                        <div className="nutrition-value highlight">{selectedFood.calories} kcal</div>
                                    </div>
                                    <div className="nutrition-card">
                                        <div className="nutrition-label">Protein</div>
                                        <div className="nutrition-value highlight">{selectedFood.protein}g</div>
                                    </div>
                                    <div className="nutrition-card">
                                        <div className="nutrition-label">Carbs</div>
                                        <div className="nutrition-value highlight">{selectedFood.carbs}g</div>
                                    </div>
                                    <div className="nutrition-card">
                                        <div className="nutrition-label">Fat</div>
                                        <div className="nutrition-value highlight">{selectedFood.fat}g</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="meal-detail-food-body">
                            <div className="meal-detail-section meal-detail-ingredients">
                                <div className="section-title">Nguyên liệu</div>
                                <ul>
                                    {selectedFood.ingredients && selectedFood.ingredients.length > 0 ? (
                                        selectedFood.ingredients.map((ing, idx2) => (
                                            <li key={idx2} className="ingredient-item">
                                                {ing.name} {ing.quantity}{ing.unit}
                                            </li>
                                        ))
                                    ) : (
                                        <li>Không có dữ liệu nguyên liệu.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="meal-detail-section meal-detail-instructions">
                                <div className="section-title">Cách chế biến</div>
                                {selectedFood.instructions && selectedFood.instructions.length > 0 ? (
                                    <ol>
                                        {selectedFood.instructions.map((step, idx3) => (
                                            <li key={idx3} className="instruction-step">{step}</li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p>Chưa có hướng dẫn chế biến.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderFoodReplacementModal = () => {
        if (!isReplacingFood || !selectedMealForReplacement) return null;

        return (
            <div className="food-replacement-modal">
                <div className="food-replacement-content">
                    <div className="food-replacement-header">
                        <h2 className="food-replacement-title">
                            Thay đổi món cho {selectedMealForReplacement.meal}
                        </h2>
                        <button className="close-modal" onClick={() => setIsReplacingFood(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {currentMealTarget && (
                        <div className="meal-nutrition-info">
                            <h4>Hàm lượng dinh dưỡng mục tiêu:</h4>
                            <div className="meal-nutrition-values">
                                <span>Calories: {currentMealTarget.calories} kcal</span>
                                <span>Protein: {currentMealTarget.protein}g</span>
                                <span>Carbs: {currentMealTarget.carbs}g</span>
                                <span>Fat: {currentMealTarget.fat}g</span>
                            </div>
                        </div>
                    )}

                    <div className="food-replacement-grid">
                        {replacementFoods.map((food) => (
                            <div
                                key={food._id}
                                className="food-replacement-card"
                                onClick={() => handleReplaceFood(food)}
                            >
                                <img
                                    src={food.image?.startsWith('http') ? food.image : `${BACKEND_URL}${food.image}`}
                                    alt={food.name}
                                    className="food-replacement-image"
                                />
                                <div className="food-replacement-name">{food.name}</div>
                                <div className="food-replacement-macros">
                                    <span>{food.calories} kcal</span>
                                    <span>P: {food.protein}g</span>
                                    <span>C: {food.carbs}g</span>
                                    <span>F: {food.fat}g</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Hàm phân bổ macro cho từng bữa ăn
    const allocateMealMacros = (totalCalories, macroRatio, weight, numMeals, customRatios = null) => {
        const mealMacros = [];
        let mealRatios, mealTypes;

        // Tỷ lệ mặc định dựa trên nhịp sinh học
        const defaultRatios = {
            2: [0.5, 0.5],
            3: [0.3, 0.4, 0.3],
            4: [0.25, 0.35, 0.3, 0.1],
            5: [0.2, 0.3, 0.25, 0.15, 0.1],
            6: [0.2, 0.2, 0.2, 0.15, 0.15, 0.1]
        };

        // Loại bữa ăn mặc định
        const defaultMealTypes = {
            2: ['lunch', 'dinner'],
            3: ['breakfast', 'lunch', 'dinner'],
            4: ['breakfast', 'lunch', 'dinner', 'snack'],
            5: ['breakfast', 'midmorning', 'lunch', 'afternoon', 'dinner'],
            6: ['breakfast', 'midmorning', 'lunch', 'afternoon', 'dinner', 'evening']
        };

        // Sử dụng tỷ lệ tùy chỉnh nếu có, nếu không dùng mặc định
        mealRatios = customRatios || defaultRatios[numMeals] || defaultRatios[4];
        mealTypes = defaultMealTypes[numMeals] || defaultMealTypes[4];

        // Kiểm tra tổng tỷ lệ
        const sumRatios = mealRatios.reduce((sum, ratio) => sum + ratio, 0);
        if (Math.abs(sumRatios - 1) > 0.01) {
            mealRatios = mealRatios.map(ratio => ratio / sumRatios); // Chuẩn hóa tổng về 1
        }

        for (let i = 0; i < numMeals; i++) {
            const mealCalories = totalCalories * mealRatios[i];
            let proteinGrams = Math.round((macroRatio.protein * mealCalories) / 4);
            let carbsGrams = Math.round((macroRatio.carbs * mealCalories) / 4);
            let fatGrams = Math.round((macroRatio.fat * mealCalories) / 9);

            // Điều chỉnh macro theo loại bữa ăn
            if (mealTypes[i] === 'breakfast') {
                carbsGrams = Math.min(carbsGrams * 1.2, mealCalories * 0.65 / 4);
                fatGrams = Math.max(fatGrams * 0.8, mealCalories * 0.15 / 9);
            } else if (mealTypes[i] === 'lunch') {
                proteinGrams = Math.max(proteinGrams, mealCalories * 0.2 / 4);
            } else if (mealTypes[i] === 'dinner') {
                proteinGrams = Math.max(proteinGrams * 1.2, mealCalories * 0.2 / 4);
                carbsGrams = Math.min(carbsGrams * 0.8, mealCalories * 0.45 / 4);
            } else if (['midmorning', 'afternoon', 'evening', 'snack'].includes(mealTypes[i])) {
                fatGrams = Math.min(fatGrams * 1.2, mealCalories * 0.4 / 9);
                proteinGrams = Math.max(proteinGrams * 1.1, mealCalories * 0.2 / 4);
            }

            // Giới hạn protein (1.6-2.2g/kg tổng/ngày, phân bổ đều)
            const minProtein = (weight * 1.6) * mealRatios[i];
            const maxProtein = (weight * 2.2) * mealRatios[i];
            proteinGrams = Math.min(Math.max(proteinGrams, minProtein), maxProtein);

            // Giới hạn carbs (45-65% calo/bữa)
            const minCarbsCalories = mealCalories * 0.45;
            const maxCarbsCalories = mealCalories * 0.65;
            const carbsCalories = Math.min(Math.max(carbsGrams * 4, minCarbsCalories), maxCarbsCalories);
            carbsGrams = Math.round(carbsCalories / 4);

            // Giới hạn fat (20-35% calo/bữa)
            const minFatCalories = mealCalories * 0.2;
            const maxFatCalories = mealCalories * 0.35;
            const fatCalories = Math.min(Math.max(fatGrams * 9, minFatCalories), maxFatCalories);
            fatGrams = Math.round(fatCalories / 9);

            // Điều chỉnh calo khớp với mealCalories
            const currentCalories = proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9;
            if (Math.abs(currentCalories - mealCalories) > 10) {
                const diff = mealCalories - (proteinGrams * 4 + fatGrams * 9);
                carbsGrams = Math.max(Math.round(diff / 4), Math.round(minCarbsCalories / 4));
            }

            mealMacros.push({
                type: mealTypes[i],
                calories: mealCalories,
                protein: proteinGrams,
                carbs: carbsGrams,
                fat: fatGrams,
                percentageProtein: Math.round((proteinGrams * 4 / mealCalories) * 1000) / 10,
                percentageCarbs: Math.round((carbsGrams * 4 / mealCalories) * 1000) / 10,
                percentageFat: Math.round((fatGrams * 9 / mealCalories) * 1000) / 10
            });
        }
        return mealMacros;
    };

    // Hàm chuyển tên bữa sang tiếng Việt, theo yêu cầu mới
    const mealTypeToVietnamese = (type, index = 0, total = 3) => {
        if (total === 2) {
            if (index === 0) return 'Bữa trưa';
            if (index === 1) return 'Bữa tối';
        }
        switch (type) {
            case 'breakfast': return 'Bữa sáng';
            case 'lunch': return 'Bữa trưa';
            case 'dinner': return 'Bữa tối';
            case 'snack':
            case 'midmorning': return 'Bữa phụ sáng';
            case 'afternoon': return 'Bữa phụ chiều';
            case 'evening': return 'Bữa phụ tối';
            default: return `Bữa phụ ${index + 1}`;
        }
    };

    // Thêm useEffect để lưu thực đơn vào localStorage khi có thay đổi
    useEffect(() => {
        if (Object.keys(weeklyMenu).length > 0) {
            localStorage.setItem('weeklyMenu', JSON.stringify(weeklyMenu));
        }
    }, [weeklyMenu]);

    // Thêm useEffect để lưu mealTargets
    useEffect(() => {
        if (mealTargets) {
            localStorage.setItem('mealTargets', JSON.stringify(mealTargets));
        }
    }, [mealTargets]);

    // Thêm useEffect để khôi phục mealTargets khi component mount
    useEffect(() => {
        const savedMealTargets = localStorage.getItem('mealTargets');
        if (savedMealTargets) {
            setMealTargets(JSON.parse(savedMealTargets));
        }
    }, []);

    useEffect(() => {
        // Chỉ log 1 lần khi user thay đổi thực sự
        console.log('MenuSection received user:', user);
        // Chỉ fetch khi user._id thay đổi và đã có nutritionProfile hoàn chỉnh
        if (user?._id && user.nutritionProfile?.isComplete) {
            fetchAvailableFoods();
        }
        // eslint-disable-next-line
    }, [user?._id]); // Chỉ phụ thuộc vào user._id

    // Thêm hàm render modal lỗi
    const renderErrorModal = () => {
        if (!showErrorModal) return null;

        return (
            <div className="error-modal-overlay">
                <div className="error-modal">
                    <div className="error-modal-header">
                        <h3>Thông báo</h3>
                        <button className="close-modal" onClick={closeErrorModal}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="error-modal-content">
                        <i className="fas fa-exclamation-circle error-icon"></i>
                        <p>{errorMessage}</p>
                    </div>
                    <div className="error-modal-footer">
                        <button className="error-modal-button" onClick={closeErrorModal}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleReplaceAll = async (mealIndex) => {
        try {
            const mealTarget = mealTargets[mealIndex];
            const currentMeal = weeklyMenu[getDateString(selectedDate)][getMealNames()[mealIndex]];

            const response = await axios.post('/api/optimize-meal', {
                user: user,
                foods: availableFoods,
                mealTarget: mealTarget,
                currentMeal: currentMeal  // Thêm currentMeal vào request
            });

            if (response.data) {
                // Cập nhật menu với bữa ăn mới
                const newMenu = { ...weeklyMenu };
                newMenu[getDateString(selectedDate)][getMealNames()[mealIndex]] = response.data;
                setWeeklyMenu(newMenu);
            }
        } catch (error) {
            console.error('Error replacing all foods:', error);
            // Xử lý lỗi
        }
    };

    return (
        <div className="menu-section">
            <div className="menu-header">
                <h2>Thực đơn của bạn</h2>
                <div className="menu-actions">
                    <label style={{ marginRight: 12 }}>
                        Số bữa/ngày:
                        <input
                            type="number"
                            min={2}
                            max={6}
                            value={mealsPerDay}
                            onChange={e => setMealsPerDay(Math.max(2, Math.min(6, Number(e.target.value))))}
                            style={{ width: 50, marginLeft: 8, marginRight: 16 }}
                        />
                    </label>
                    <select
                        value={menuType}
                        onChange={(e) => setMenuType(e.target.value)}
                        className="menu-type-select"
                    >
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                    </select>
                    <button
                        onClick={handleGenerateMenu}
                        disabled={loading}
                        className="generate-button"
                    >
                        {loading ? 'Đang tạo...' : 'Tạo thực đơn mới'}
                    </button>
                    <button
                        onClick={handleSaveMenu}
                        disabled={loading || Object.keys(weeklyMenu).length === 0}
                        className="save-button"
                    >
                        Lưu thực đơn
                    </button>
                    <button
                        onClick={handleShareMenu}
                        disabled={Object.keys(weeklyMenu).length === 0}
                        className="share-button"
                    >
                        Chia sẻ
                    </button>
                    <button
                        onClick={handleExportMenu}
                        disabled={Object.keys(weeklyMenu).length === 0}
                        className="export-button"
                    >
                        Xuất thực đơn
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">
                        {generationProgress > 0
                            ? `Đang tạo thực đơn... ${generationProgress}%`
                            : 'Đang xử lý...'}
                    </div>
                </div>
            )}

            {renderWeeklyCalendar()}
            {renderSuggestedFoodsScroll()}
            {renderMealList()}
            {selectedFood && renderFoodDetailModal()}
            {renderFoodReplacementModal()}
            {renderErrorModal()}
        </div>
    );
};

// Thêm CSS cho modal lỗi
const styles = `
.error-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.error-modal {
    background: white;
    border-radius: 8px;
    padding: 20px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.error-modal-header h3 {
    margin: 0;
    color: #333;
}

.error-modal-content {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.error-icon {
    color: #ff4d4f;
    font-size: 24px;
}

.error-modal-content p {
    margin: 0;
    color: #333;
    font-size: 16px;
}

.error-modal-footer {
    display: flex;
    justify-content: flex-end;
}

.error-modal-button {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.error-modal-button:hover {
    background-color: #40a9ff;
}

.close-modal {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #999;
}

.close-modal:hover {
    color: #666;
}
`;

// Thêm style vào document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default MenuSection; 