from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator, Field
from typing import List, Optional, Dict, Any
import numpy as np
import random
import logging
from datetime import datetime, timedelta
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import json
import google.generativeai as genai
import os
import openai
from log_performance import log_performance
import time

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Kết nối MongoDB
try:
    client = AsyncIOMotorClient("mongodb://localhost:27017/")
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise HTTPException(status_code=500, detail="Database connection failed")

db = client["DOANTN"]
foods_collection = db["Food"]
menus_collection = db["Menu"]
compliance_history_collection = db["ComplianceHistory"]  # Collection mới cho lịch sử compliance
notifications_collection = db["notifications"]

# Khởi tạo ứng dụng FastAPI
app = FastAPI(title="Menu Genetic Algorithm API", version="1.0.0")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8888", "http://localhost:8686"],  # Thêm domain của frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Định nghĩa các model
class Ingredient(BaseModel):
    name: str = Field(..., min_length=1, description="Tên nguyên liệu")
    quantity: Optional[float] = Field(None, gt=0, description="Số lượng")
    unit: Optional[str] = Field(None, min_length=1, description="Đơn vị tính")
    note: Optional[str] = None

    @validator('quantity')
    def validate_quantity(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Quantity must be positive')
        return v

class FoodBase(BaseModel):
    _id: Optional[str] = None
    name: str = Field(..., min_length=1, description="Tên món ăn")
    image: str = Field(..., min_length=1, description="Đường dẫn hình ảnh")
    calories: float = Field(..., gt=0, description="Lượng calories")
    protein: float = Field(..., ge=0, description="Lượng protein (g)")
    carbs: float = Field(..., ge=0, description="Lượng carbohydrate (g)")
    fat: float = Field(..., ge=0, description="Lượng chất béo (g)")
    preferences: List[str] = Field(default_factory=list, description="Danh sách sở thích phù hợp")
    restrictions: List[str] = Field(default_factory=list, description="Danh sách hạn chế")
    context: Dict[str, Any] = Field(default_factory=dict, description="Ngữ cảnh món ăn")
    ingredients: List[Dict[str, Any]] = Field(default_factory=list, description="Danh sách nguyên liệu")
    instructions: List[str] = Field(default_factory=list, description="Cách chế biến")
    base_quantity: float = Field(100, gt=0, description="Khối lượng cơ bản (g)")
    min_quantity: float = Field(50, gt=0, description="Khối lượng tối thiểu (g)")
    max_quantity: float = Field(200, gt=0, description="Khối lượng tối đa (g)")
    quantity_unit: str = Field("g", description="Đơn vị khối lượng")

    @validator('calories', 'protein', 'carbs', 'fat')
    def validate_nutrients(cls, v):
        if v < 0:
            raise ValueError('Nutrient values cannot be negative')
        return v

    @validator('max_quantity')
    def validate_max_quantity(cls, v, values):
        if 'min_quantity' in values and v < values['min_quantity']:
            raise ValueError('max_quantity must be greater than min_quantity')
        return v

class Food(FoodBase):
    ingredients: List[Dict[str, Any]] = []

class MacroRatio(BaseModel):
    protein: float = Field(0.3, ge=0, le=1, description="Tỷ lệ protein (0-1)")
    carbs: float = Field(0.5, ge=0, le=1, description="Tỷ lệ carbohydrate (0-1)")
    fat: float = Field(0.2, ge=0, le=1, description="Tỷ lệ chất béo (0-1)")

    @validator('protein', 'carbs', 'fat')
    def validate_ratio(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('Macro ratio must be between 0 and 1')
        return v

    @validator('fat')
    def validate_total_ratio(cls, v, values):
        if 'protein' in values and 'carbs' in values:
            total = values['protein'] + values['carbs'] + v
            if not 0.99 <= total <= 1.01:  # Allow small floating point errors
                raise ValueError('Total macro ratio must equal 1.0')
        return v

class NutritionProfile(BaseModel):
    isComplete: Optional[bool] = False
    age: Optional[int]
    weight: Optional[float]
    height: Optional[float]
    gender: Optional[str]
    activityLevel: Optional[str]
    goals: Optional[str]
    medicalConditions: Optional[List[str]] = []
    preferences: Optional[List[str]] = []
    restrictions: Optional[List[str]] = []
    dailyCalorieNeeds: Optional[float]
    macroRatio: Optional[MacroRatio]
    bmr: Optional[float]
    mealsPerDay: Optional[int]
    mealDistribution: Optional[dict]

class UserProfile(BaseModel):
    email: Optional[str]
    name: Optional[str]
    role: Optional[str]
    avatar: Optional[str]
    nutritionProfile: NutritionProfile
    compliance: float = Field(100.0, ge=0, le=100, description="Mức độ tuân thủ (%)")

class OptimizationRequest(BaseModel):
    user: UserProfile
    foods: List[Food]
    mealTargets: Optional[List[Dict[str, Any]]] = None

class OptimizationResponse(BaseModel):
    foods: List[List[Dict[str, Any]]]  # Thay đổi từ List[List[Food]] thành List[List[Dict[str, Any]]]
    totalCalories: float
    totalProtein: float
    totalCarbs: float
    totalFat: float

class SuggestFoodsRequest(BaseModel):
    user: UserProfile
    context: Dict[str, Any] = Field(default_factory=dict)
    max_suggestions: int = Field(3, ge=1, le=50)

class SuggestFoodsResponse(BaseModel):
    foods: List[Food]

# Thêm model cho menu lưu trữ
class SavedMeal(BaseModel):
    mealName: str
    foods: List[dict]
    completed: bool = False
    completedAt: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None
    mealTime: Optional[str] = None

class SavedMenu(BaseModel):
    userId: str
    date: str
    meals: List[SavedMeal]
    totalNutrition: dict
    createdAt: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())
    note: Optional[str] = ""
    compliance: float = Field(100.0, ge=0, le=100)
    streak: int = Field(0, ge=0)
    lastCompletedDate: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    mealHistory: List[Dict[str, Any]] = Field(default_factory=list)

# Định nghĩa các model mới cho lịch sử compliance
class ComplianceHistory(BaseModel):
    userId: str
    date: str
    compliance: float
    meals_completed: int
    total_meals: int
    streak: int
    achievements: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())

class ComplianceGoal(BaseModel):
    userId: str
    target_compliance: float = Field(..., ge=0, le=100)
    start_date: str
    end_date: str
    notification_enabled: bool = True
    achieved: bool = False
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())

class ComplianceStats(BaseModel):
    daily_average: float
    weekly_average: float
    monthly_average: float
    current_streak: int
    best_streak: int
    total_days_tracked: int
    goal_completion_rate: float

# Xóa danh sách món ăn mẫu và thay thế bằng hàm truy xuất từ database
async def get_foods_from_db(
    preferences: List[str] = None,
    restrictions: List[str] = None,
    meal_time: str = None,
    season: str = None,
    weather: str = None,
    limit: int = 50
) -> List[Food]:
    """
    Truy xuất danh sách món ăn từ database với các bộ lọc tùy chọn
    """
    try:
        # Xây dựng query
        query = {}
        
        # Lọc theo preferences
        if preferences:
            query["preferences"] = {"$in": preferences}
            
        # Lọc theo restrictions (loại trừ các món có restrictions trùng)
        if restrictions:
            query["restrictions"] = {"$nin": restrictions}
            
        # Lọc theo context
        if meal_time or season or weather:
            context_query = {}
            if meal_time:
                context_query["mealTime"] = {"$in": [meal_time, "all"]}
            if season:
                context_query["season"] = {"$in": [season, "all"]}
            if weather:
                context_query["weather"] = {"$in": [weather, "all"]}
            if context_query:
                query["context"] = context_query
        
        # Truy xuất dữ liệu
        cursor = foods_collection.find(query).limit(limit)
        foods = []
        async for doc in cursor:
            # Chuyển đổi _id từ ObjectId sang string
            doc["_id"] = str(doc["_id"])
            foods.append(Food(**doc))
            
        return foods
        
    except Exception as e:
        logger.error(f"Error fetching foods from database: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

# Thuật toán GA
class GeneticAlgorithm:
    def __init__(self, foods, user_profile, meal_targets=None, meals_per_day=3, max_foods_per_meal=5):
        self.foods = foods
        self.user_profile = user_profile
        self.meal_targets = meal_targets
        self.meals_per_day = len(meal_targets) if meal_targets else meals_per_day
        self.max_foods_per_meal = max_foods_per_meal  # Giữ lại làm giới hạn trên
        self.population_size = 50
        self.generations = 100
        self.mutation_rate = 0.2
        self.elite_size = 5
        self.population = []
        self.best_solution = None
        self.best_fitness = 0
        self.generation_history = []

    def initialize_population(self):
        self.population = []
        for _ in range(self.population_size):
            individual = []
            for i in range(self.meals_per_day):
                # Khởi tạo với số lượng món ngẫu nhiên từ 1 đến max_foods_per_meal
                n_foods = random.randint(1, self.max_foods_per_meal)
                meal = []
                for _ in range(n_foods):
                    food = random.choice(self.foods)
                    meal.append(food)
                individual.append(meal)
            self.population.append(individual)

    def calculate_fitness(self, meal, target):
        """
        Tính toán fitness cho một bữa ăn
        meal: List[Food] - danh sách món ăn trong bữa
        target: dict - mục tiêu dinh dưỡng của bữa
        """
        if not meal:
            return float('-inf')
            
        # Tính toán dinh dưỡng hiện tại của bữa
        current_nutrition = {
            'calories': sum(f.calories for f in meal),
            'protein': sum(f.protein for f in meal),
            'carbs': sum(f.carbs for f in meal),
            'fat': sum(f.fat for f in meal)
        }
        
        # Log thông tin dinh dưỡng
        logger.debug(f"Current nutrition: {current_nutrition}")
        logger.debug(f"Target nutrition: {target}")
        
        # Tính điểm cho từng chỉ số dinh dưỡng
        def calculate_nutrient_score(actual, target):
            if target == 0:
                return 1.0 if actual == 0 else 0.0
            ratio = actual / target
            # Cho phép sai số 10%
            if ratio < 0.9 or ratio > 1.1:
                return 0.0
            return 1.0 - abs(ratio - 1.0)
        
        # Tính điểm cho từng chỉ số với trọng số
        calorie_score = calculate_nutrient_score(current_nutrition['calories'], target['calories']) * 0.4
        protein_score = calculate_nutrient_score(current_nutrition['protein'], target['protein']) * 0.3
        carbs_score = calculate_nutrient_score(current_nutrition['carbs'], target['carbs']) * 0.2
        fat_score = calculate_nutrient_score(current_nutrition['fat'], target['fat']) * 0.1
        
        # Tính điểm đa dạng món ăn
        diversity_score = len(set(f.name for f in meal)) / len(meal) * 0.05
        
        # Tính điểm cân bằng dinh dưỡng trong bữa
        balance_score = 1.0 - (
            abs(current_nutrition['protein']/current_nutrition['calories'] - target['protein']/target['calories']) +
            abs(current_nutrition['carbs']/current_nutrition['calories'] - target['carbs']/target['calories']) +
            abs(current_nutrition['fat']/current_nutrition['calories'] - target['fat']/target['calories'])
        ) / 3.0 * 0.05
        
        # Tính điểm tổng hợp (đảm bảo nằm trong khoảng 0-1)
        total_score = calorie_score + protein_score + carbs_score + fat_score + diversity_score + balance_score
        
        # Log điểm chi tiết
        logger.debug(f"Scores - Calories: {calorie_score:.3f}, Protein: {protein_score:.3f}, "
                    f"Carbs: {carbs_score:.3f}, Fat: {fat_score:.3f}, "
                    f"Diversity: {diversity_score:.3f}, Balance: {balance_score:.3f}")
        logger.debug(f"Total score: {total_score:.3f}")
        
        return total_score

    def calculate_diversity_score(self, individual):
        """Tính điểm đa dạng của thực đơn"""
        unique_foods = len(set(food.name for food in individual))
        return unique_foods / len(individual)

    def select_parents(self):
        """Chọn các cá thể làm cha mẹ với tournament selection cải tiến"""
        # Tính fitness cho từng cá thể (thực đơn cả ngày)
        fitness_scores = [
            sum(
                self.calculate_fitness(meal, self.meal_targets[j])
                for j, meal in enumerate(individual)
                if j < len(self.meal_targets)
            )
            for individual in self.population
        ]
        parents = []
        # Giữ lại elite
        elite_indices = sorted(range(len(fitness_scores)), key=lambda i: fitness_scores[i], reverse=True)[:self.elite_size]
        elites = [self.population[i] for i in elite_indices]
        parents.extend(elites)
        # Tournament selection với kích thước tournament động
        while len(parents) < self.population_size:
            tournament_size = max(3, int(len(self.population) * 0.1))
            tournament_indices = random.sample(range(len(self.population)), tournament_size)
            tournament_fitness = [fitness_scores[i] for i in tournament_indices]
            winner_idx = tournament_indices[tournament_fitness.index(max(tournament_fitness))]
            parents.append(self.population[winner_idx])
        return parents
    
    def crossover(self, parents):
        """Lai ghép với nhiều chiến lược"""
        offspring = []
        
        # Giữ lại elite
        fitness_scores = [
            sum(
                self.calculate_fitness(meal, self.meal_targets[j])
                for j, meal in enumerate(individual)
                if j < len(self.meal_targets)
            )
            for individual in parents
        ]
        elite_indices = sorted(range(len(fitness_scores)), key=lambda i: fitness_scores[i], reverse=True)[:self.elite_size]
        elites = [parents[i] for i in elite_indices]
        offspring.extend(elites)
        
        # Lai ghép cho phần còn lại
        while len(offspring) < self.population_size:
            parent1 = random.choice(parents)
            parent2 = random.choice(parents)
            
            if random.random() < 0.5:  # 50% cơ hội sử dụng uniform crossover
                child = []
                for i in range(len(parent1)):
                    if random.random() < 0.5:
                        child.append(list(parent1[i]))  # Ensure list conversion
                    else:
                        child.append(list(parent2[i]))  # Ensure list conversion
                offspring.append(child)
            else:  # 50% cơ hội sử dụng single-point crossover
                if len(parent1) > 1 and len(parent2) > 1:
                    crossover_point = random.randint(1, min(len(parent1), len(parent2)) - 1)
                    child = [list(meal) for meal in parent1[:crossover_point]] + [list(meal) for meal in parent2[crossover_point:]]
                    offspring.append(child)
                else:
                    offspring.append([list(meal) for meal in parent1])
        
        return offspring
    
    def mutate(self, offspring):
        for i in range(self.elite_size, len(offspring)):
            for j in range(len(offspring[i])):
                if random.random() < self.mutation_rate:
                    if self.meal_targets:
                        target = self.meal_targets[j]
                        current_meal = offspring[i][j]
                        
                        # Có 20% cơ hội thay đổi toàn bộ bữa ăn
                        if random.random() < 0.2:
                            new_meal = []
                            num_foods = random.randint(1, self.max_foods_per_meal)
                            suitable_foods = []
                            
                            # Tìm các món phù hợp với mục tiêu dinh dưỡng
                            for food in self.foods:
                                if (food.calories <= target['calories'] * 1.2 and
                                    food.protein <= target['protein'] * 1.2 and
                                    food.carbs <= target['carbs'] * 1.2 and
                                    food.fat <= target['fat'] * 1.2):
                                    suitable_foods.append(food)
                        
                            if suitable_foods:
                                # Sắp xếp theo độ phù hợp với mục tiêu
                                suitable_foods.sort(key=lambda f: (
                                    abs(f.calories - target['calories']/num_foods) +
                                    abs(f.protein - target['protein']/num_foods) +
                                    abs(f.carbs - target['carbs']/num_foods) +
                                    abs(f.fat - target['fat']/num_foods)
                                ))
                                
                                # Chọn các món phù hợp nhất
                                for _ in range(num_foods):
                                    if suitable_foods:
                                        new_meal.append(suitable_foods.pop(0))
                            
                            offspring[i][j] = new_meal
                        else:
                            # Logic thay đổi từng món như cũ
                            current_nutrition = {
                                'calories': sum(f.calories for f in current_meal),
                                'protein': sum(f.protein for f in current_meal),
                                'carbs': sum(f.carbs for f in current_meal),
                                'fat': sum(f.fat for f in current_meal)
                            }
                            
                            remaining_nutrition = {
                                'calories': target['calories'] - current_nutrition['calories'],
                                'protein': target['protein'] - current_nutrition['protein'],
                                'carbs': target['carbs'] - current_nutrition['carbs'],
                                'fat': target['fat'] - current_nutrition['fat']
                            }
                            
                            suitable_foods = []
                            for food in self.foods:
                                if (food.calories <= remaining_nutrition['calories'] * 1.2 and
                                    food.protein <= remaining_nutrition['protein'] * 1.2 and
                                    food.carbs <= remaining_nutrition['carbs'] * 1.2 and
                                    food.fat <= remaining_nutrition['fat'] * 1.2):
                                    suitable_foods.append(food)
                            
                            if suitable_foods:
                                suitable_foods.sort(key=lambda f: (
                                    abs(f.calories - remaining_nutrition['calories']) +
                                    abs(f.protein - remaining_nutrition['protein']) +
                                    abs(f.carbs - remaining_nutrition['carbs']) +
                                    abs(f.fat - remaining_nutrition['fat'])
                                ))
                                
                                if len(current_meal) < self.max_foods_per_meal:
                                    current_meal.append(suitable_foods[0])
                                else:
                                    worst_idx = 0
                                    worst_score = float('inf')
                                    for idx, food in enumerate(current_meal):
                                        score = (
                                            abs(food.calories - target['calories']/len(current_meal)) +
                                            abs(food.protein - target['protein']/len(current_meal)) +
                                            abs(food.carbs - target['carbs']/len(current_meal)) +
                                           abs(food.fat - target['fat']/len(current_meal))
                                        )
                                        if score < worst_score:
                                           worst_score = score
                                           worst_idx = idx
                                    current_meal[worst_idx] = suitable_foods[0]
                                offspring[i][j] = current_meal
                    else:
                        # Xử lý trường hợp không có meal_targets
                        if random.random() < 0.2:  # 20% cơ hội thay đổi toàn bộ bữa
                            new_meal = []
                            num_foods = random.randint(1, self.max_foods_per_meal)
                            for _ in range(num_foods):
                                new_food = random.choice(self.foods)
                                new_meal.append(new_food)
                            offspring[i][j] = new_meal
                        else:
                            # Thay đổi từng món như cũ
                            if random.random() < 0.5 and len(offspring[i][j]) < self.max_foods_per_meal:
                                offspring[i][j].append(random.choice(self.foods))
                            elif offspring[i][j]:
                                idx = random.randrange(len(offspring[i][j]))
                                offspring[i][j][idx] = random.choice(self.foods)
        return offspring
    
    def evolve(self):
        """Chạy thuật toán di truyền với cải tiến"""
        self.initialize_population()
        generations_without_improvement = 0
        
        for generation in range(self.generations):
            # Chọn cha mẹ
            parents = self.select_parents()
            
            # Lai ghép
            offspring = self.crossover(parents)
            
            # Đột biến
            offspring = self.mutate(offspring)
            
            # Cập nhật quần thể
            self.population = offspring
            
            # Theo dõi giải pháp tốt nhất
            current_best = max(
                self.population,
                key=lambda individual: sum(
                    self.calculate_fitness(meal, self.meal_targets[j])
                    for j, meal in enumerate(individual)
                    if j < len(self.meal_targets)
                )
            )
            current_best_fitness = sum(
                self.calculate_fitness(meal, self.meal_targets[j])
                for j, meal in enumerate(current_best)
                if j < len(self.meal_targets)
            )
            
            # Log thông tin thế hệ
            logger.info(f"Generation {generation + 1}: Best fitness = {current_best_fitness:.3f}")
            
            # Lưu lịch sử
            self.generation_history.append({
                'generation': generation,
                'best_fitness': current_best_fitness,
                "average_fitness": (
                    sum(
                        sum(
                            self.calculate_fitness(meal, self.meal_targets[j])
                            for j, meal in enumerate(individual)
                            if j < len(self.meal_targets)
                        )
                        for individual in self.population
                    ) / len(self.population)
                )
            })
            
            if current_best_fitness > self.best_fitness:
                self.best_fitness = current_best_fitness
                self.best_solution = current_best.copy()
                generations_without_improvement = 0
                logger.info(f"New best solution found with fitness: {self.best_fitness:.3f}")
            else:
                generations_without_improvement += 1
            
            # Điều chỉnh mutation_rate dựa trên tiến triển
            if generations_without_improvement > 10:
                self.mutation_rate = min(0.4, self.mutation_rate * 1.1)
            else:
                self.mutation_rate = max(0.1, self.mutation_rate * 0.95)
            
            # Dừng sớm nếu đạt điều kiện (max_possible_fitness * 0.95)
            max_possible_fitness = len(self.meal_targets) * 1.1 if self.meal_targets else self.meals_per_day * 1.1
            if self.best_fitness > (self.meals_per_day * 1.1 * 0.95) or generations_without_improvement > 20:
                logger.info(f"Stopping early at generation {generation + 1}")
                break
        
        logger.info(f"Evolution completed after {generation + 1} generations with best fitness: {self.best_fitness:.3f}")
        return self.best_solution
    
    def get_statistics(self, menu=None):
        """Lấy thống kê chi tiết về thực đơn"""
        if menu is None:
            menu = self.best_solution
            
        if not menu:
            return None
            
        # Convert any tuples to lists
        menu = [list(meal) if isinstance(meal, tuple) else meal for meal in menu]
            
        # Tính toán thống kê cơ bản
        total_calories = sum(food.calories for meal in menu for food in meal)
        total_protein = sum(food.protein for meal in menu for food in meal)
        total_carbs = sum(food.carbs for meal in menu for food in meal)
        total_fat = sum(food.fat for meal in menu for food in meal)
        
        # Tính toán thống kê chi tiết
        stats = {
            "totalCalories": total_calories,
            "totalProtein": total_protein,
            "totalCarbs": total_carbs,
            "totalFat": total_fat,
            "caloriesPerMeal": [sum(food.calories for food in meal) for meal in menu],
            "proteinPerMeal": [sum(food.protein for food in meal) for meal in menu],
            "carbsPerMeal": [sum(food.carbs for food in meal) for meal in menu],
            "fatPerMeal": [sum(food.fat for food in meal) for meal in menu],
            "macroRatios": {
                "protein": (total_protein * 4) / (total_protein * 4 + total_carbs * 4 + total_fat * 9),
                "carbs": (total_carbs * 4) / (total_protein * 4 + total_carbs * 4 + total_fat * 9),
                "fat": (total_fat * 9) / (total_protein * 4 + total_carbs * 4 + total_fat * 9)
            },
            "evolutionHistory": self.generation_history
        }
        
        return stats

    def optimize_single_food_replacement(self, target_food, tolerance=0.3):
        print(f"=== [LOG] BẮT ĐẦU TÌM MÓN THAY THẾ ===")
        print(f"Target food: {target_food.name} | Calories: {target_food.calories}, Protein: {target_food.protein}, Carbs: {target_food.carbs}, Fat: {target_food.fat}")
        print(f"Tolerance: {tolerance}")
        suitable_foods = []
        skip_count = 0
        # In giá trị dinh dưỡng của từng món
        print("--- [LOG] GIÁ TRỊ DINH DƯỠNG CỦA TỪNG MÓN ---")
        for food in self.foods:
            print(f"{food.name}: calories={food.calories}, protein={food.protein}, carbs={food.carbs}, fat={food.fat}")
        print("--- [LOG] BẮT ĐẦU SO SÁNH ---")
        for food in self.foods:
            if food._id == target_food._id:
                continue
            try:
                if any([
                    food.calories is None or food.calories == 0,
                    food.protein is None or food.protein == 0,
                    food.carbs is None or food.carbs == 0,
                    food.fat is None or food.fat == 0,
                    target_food.calories is None or target_food.calories == 0,
                    target_food.protein is None or target_food.protein == 0,
                    target_food.carbs is None or target_food.carbs == 0,
                    target_food.fat is None or target_food.fat == 0,
                ]):
                    print(f"[SKIP] {food.name} hoặc targetFood có giá trị dinh dưỡng bằng 0/None")
                    skip_count += 1
                    continue

                calorie_diff = abs(food.calories - target_food.calories) / target_food.calories
                protein_diff = abs(food.protein - target_food.protein) / target_food.protein
                carbs_diff = abs(food.carbs - target_food.carbs) / target_food.carbs
                fat_diff = abs(food.fat - target_food.fat) / target_food.fat

                print(f"[CHECK] {food.name}: cal_diff={calorie_diff:.2f}, pro_diff={protein_diff:.2f}, carb_diff={carbs_diff:.2f}, fat_diff={fat_diff:.2f}")

                num_criteria = sum(diff <= tolerance for diff in [calorie_diff, protein_diff, carbs_diff, fat_diff])
                if num_criteria >= 1:
                    print(f"==> [SUITABLE - {num_criteria}/4] {food.name}")
                    suitable_foods.append(food)
            except Exception as e:
                print(f"[ERROR] {food.name}: {e}")

        print(f"=== [LOG] SỐ MÓN BỊ SKIP: {skip_count} ===")
        print(f"=== [LOG] SỐ MÓN PHÙ HỢP TÌM ĐƯỢC: {len(suitable_foods)} ===")
        if not suitable_foods:
            print("[LOG] Không tìm thấy món ăn phù hợp để thay thế.")
            return None

        suitable_foods.sort(key=lambda f: (
            abs(f.calories - target_food.calories) +
            abs(f.protein - target_food.protein) +
            abs(f.carbs - target_food.carbs) +
            abs(f.fat - target_food.fat)
        ))
        print(f"[LOG] Món phù hợp nhất: {suitable_foods[0].name}")
        return suitable_foods[0]

    def mutate_entire_meal(self, meal, target):
        """Tạo một bữa ăn mới hoàn toàn dựa trên mục tiêu dinh dưỡng, random mạnh và tránh lặp lại món ăn"""
        if not meal:
            return meal

        meal_time = target.get('mealTime', 'all')
        suitable_foods = []
        for food in self.foods:
            if meal_time in food.context.get('mealTime', ['all']):
                if not any(r in self.user_profile.nutritionProfile.restrictions for r in food.restrictions):
                    if not self.user_profile.nutritionProfile.preferences or \
                       any(p in food.preferences for p in self.user_profile.nutritionProfile.preferences):
                        suitable_foods.append(food)

        if not suitable_foods:
            return meal

        def calculate_food_score(food):
            nutrition_score = 0
            if target['protein'] > 0:
                protein_ratio = food.protein / target['protein']
                nutrition_score += (1 - abs(1 - protein_ratio)) * 0.3
            if target['carbs'] > 0:
                carbs_ratio = food.carbs / target['carbs']
                nutrition_score += (1 - abs(1 - carbs_ratio)) * 0.3
            if target['fat'] > 0:
                fat_ratio = food.fat / target['fat']
                nutrition_score += (1 - abs(1 - fat_ratio)) * 0.2
            if target['calories'] > 0:
                calorie_ratio = food.calories / target['calories']
                nutrition_score += (1 - abs(1 - calorie_ratio)) * 0.2
            return nutrition_score

        # Sắp xếp theo điểm phù hợp
        suitable_foods.sort(key=calculate_food_score, reverse=True)
        top_n = min(10, len(suitable_foods))
        top_foods = suitable_foods[:top_n]
        import random
        random.shuffle(top_foods)

        num_dishes = min(5, len(top_foods))
        selected_foods = []
        remaining_nutrition = target.copy()

        for i in range(num_dishes):
            # Loại trừ các món đã chọn trong bữa này
            available_foods = [f for f in top_foods if f not in selected_foods]
            if not available_foods:
                break
            # Tính điểm cho các món còn lại
            scored_foods = []
            for food in available_foods:
                score = calculate_food_score(food)
                if remaining_nutrition['protein'] > 0:
                    score += (food.protein / remaining_nutrition['protein']) * 0.3
                if remaining_nutrition['carbs'] > 0:
                    score += (food.carbs / remaining_nutrition['carbs']) * 0.3
                if remaining_nutrition['fat'] > 0:
                    score += (food.fat / remaining_nutrition['fat']) * 0.2
                if remaining_nutrition['calories'] > 0:
                    score += (food.calories / remaining_nutrition['calories']) * 0.2
                scored_foods.append((food, score))
            # Sắp xếp và random trong top 3
            scored_foods.sort(key=lambda x: x[1], reverse=True)
            top_3 = scored_foods[:min(3, len(scored_foods))]
            selected_food = random.choice(top_3)[0]
            selected_foods.append(selected_food)
            remaining_nutrition['protein'] -= selected_food.protein
            remaining_nutrition['carbs'] -= selected_food.carbs
            remaining_nutrition['fat'] -= selected_food.fat
            remaining_nutrition['calories'] -= selected_food.calories

        new_meal = self.adjust_food_quantities(selected_foods, target)
        return new_meal

    def adjust_food_quantities(self, meal, target):
        """Điều chỉnh khối lượng các món ăn để đạt mục tiêu dinh dưỡng"""
        if not meal:
            return meal

        # Tính toán dinh dưỡng hiện tại
        current_nutrition = {
            'calories': sum(f.calories for f in meal),
            'protein': sum(f.protein for f in meal),
            'carbs': sum(f.carbs for f in meal),
            'fat': sum(f.fat for f in meal)
        }
        
        # Tính toán chênh lệch
        gaps = {
            'calories': target['calories'] - current_nutrition['calories'],
            'protein': target['protein'] - current_nutrition['protein'],
            'carbs': target['carbs'] - current_nutrition['carbs'],
            'fat': target['fat'] - current_nutrition['fat']
        }

        # Nếu chênh lệch quá lớn, thử điều chỉnh khối lượng
        if any(abs(gap) > target[nutrient] * 0.15 for nutrient, gap in gaps.items()):
            # Tính toán tỷ lệ điều chỉnh cho từng món
            adjustment_factors = []
            for food in meal:
                # Tính điểm ảnh hưởng của món ăn đến các chỉ số dinh dưỡng
                impact_scores = {
                    'calories': food.calories / current_nutrition['calories'],
                    'protein': food.protein / current_nutrition['protein'],
                    'carbs': food.carbs / current_nutrition['carbs'],
                    'fat': food.fat / current_nutrition['fat']
                }
                
                # Tính tổng điểm ảnh hưởng
                total_impact = sum(impact_scores.values())
                adjustment_factors.append(total_impact)

            # Chuẩn hóa tỷ lệ điều chỉnh
            total_impact = sum(adjustment_factors)
            adjustment_factors = [f/total_impact for f in adjustment_factors]

            # Điều chỉnh khối lượng từng món
            for i, food in enumerate(meal):
                # Tính tỷ lệ điều chỉnh dựa trên chênh lệch dinh dưỡng
                adjustment_ratio = 1.0
                for nutrient, gap in gaps.items():
                    if abs(gap) > target[nutrient] * 0.15:
                        nutrient_ratio = 1.0 + (gap / target[nutrient]) * adjustment_factors[i]
                        adjustment_ratio = min(adjustment_ratio, nutrient_ratio)
        
                # Giới hạn tỷ lệ điều chỉnh trong khoảng cho phép
                min_ratio = food.min_quantity / food.base_quantity
                max_ratio = food.max_quantity / food.base_quantity
                adjustment_ratio = max(min_ratio, min(max_ratio, adjustment_ratio))

                # Cập nhật khối lượng và dinh dưỡng
                new_quantity = food.base_quantity * adjustment_ratio
                quantity_ratio = new_quantity / food.base_quantity

                # Cập nhật dinh dưỡng theo tỷ lệ khối lượng mới
                food.calories *= quantity_ratio
                food.protein *= quantity_ratio
                food.carbs *= quantity_ratio
                food.fat *= quantity_ratio

                # Cập nhật lại dinh dưỡng hiện tại
        current_nutrition = {
            'calories': sum(f.calories for f in meal),
            'protein': sum(f.protein for f in meal),
            'carbs': sum(f.carbs for f in meal),
            'fat': sum(f.fat for f in meal)
        }
        
                # Cập nhật lại gaps
        gaps = {
            'calories': target['calories'] - current_nutrition['calories'],
            'protein': target['protein'] - current_nutrition['protein'],
            'carbs': target['carbs'] - current_nutrition['carbs'],
            'fat': target['fat'] - current_nutrition['fat']
        }

        return meal

# API Endpoints
@app.get("/")
async def root():
    """API root endpoint cung cấp thông tin về phiên bản và trạng thái"""
    return {
        "message": "Menu Optimization API is running",
        "version": "1.0.0",
        "status": "active",
        "documentation": "/docs"
    }

@app.post("/optimize-menu", response_model=OptimizationResponse)
async def optimize_menu(request: OptimizationRequest):
    try:
        import time
        start_time = time.time()
        logger.info("Received optimization request")
        logger.debug(f"Request data: {request.dict()}")
        # Lấy toàn bộ món ăn từ database
        foods = []
        async for doc in foods_collection.find({}):
            doc["_id"] = str(doc["_id"])
            foods.append(Food(**doc))
        logger.info(f"Loaded {len(foods)} foods from database")
        if not foods:
            raise HTTPException(
                status_code=400,
                detail="No foods found in the database"
            )
        # Validate user profile
        if request.user.nutritionProfile.dailyCalorieNeeds <= 0:
            raise HTTPException(
                status_code=400,
                detail="Daily calorie needs must be positive"
            )
        # Validate macro ratios
        macro_sum = (request.user.nutritionProfile.macroRatio.protein + 
                    request.user.nutritionProfile.macroRatio.carbs + 
                    request.user.nutritionProfile.macroRatio.fat)
        if not 0.99 <= macro_sum <= 1.01:
            raise HTTPException(
                status_code=400,
                detail="Macro ratios must sum to 1.0"
            )
        # Lọc món ăn dựa trên chế độ ăn kiêng với điều kiện nới lỏng hơn
        filtered_foods = []
        for food in foods:
            if any(v < 0 for v in [food.calories, food.protein, food.carbs, food.fat]):
                logger.warning(f"Invalid nutritional values for food: {food.name}")
                continue
            severe_restrictions = ['allergy', 'anaphylaxis']
            if any(r in severe_restrictions for r in request.user.nutritionProfile.restrictions) and \
               any(r in severe_restrictions for r in food.restrictions):
                continue
            filtered_foods.append(food)
        if len(filtered_foods) < 3:
            logger.warning(f"Not enough compatible foods after filtering ({len(filtered_foods)}). Using all available foods.")
            filtered_foods = foods
        meal_targets = request.mealTargets
        ga = GeneticAlgorithm(filtered_foods, request.user, meal_targets=meal_targets)
        best_menu = ga.evolve()
        if not best_menu:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate menu - algorithm did not converge"
            )
        stats = ga.get_statistics(best_menu)
        if not stats:
            raise HTTPException(
                status_code=500,
                detail="Failed to calculate menu statistics"
            )
        # Log tên món ăn cho từng bữa
        if best_menu and meal_targets:
            for i, meal in enumerate(best_menu):
                meal_name = meal_targets[i].get('type', f'Meal {i+1}')
                logger.info(f"Bữa {i+1} ({meal_name}):")
                for food in meal:
                    logger.info(f"  - {food.name} - {food.calories} kcal, P:{food.protein}g C:{food.carbs}g F:{food.fat}g")
        elif best_menu:
            for i, meal in enumerate(best_menu):
                logger.info(f"Bữa {i+1}:")
                for food in meal:
                    logger.info(f"  - {food.name} - {food.calories} kcal, P:{food.protein}g C:{food.carbs}g F:{food.fat}g")
        
        # Ghi log hiệu suất thực tế
        execution_time = time.time() - start_time
        log_performance(
            user_id=request.user.email if hasattr(request.user, 'email') and request.user.email else "unknown",
            execution_time=execution_time,
            actual_calories=stats["totalCalories"],
            target_calories=request.user.nutritionProfile.dailyCalorieNeeds,
            generations_used=len(ga.generation_history)
        )
        
        # Chuyển đổi best_menu thành dict để có thể serialize
        from bson import ObjectId
        def convert_objectid_to_str(obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            elif isinstance(obj, list):
                return [convert_objectid_to_str(item) for item in obj]
            elif isinstance(obj, dict):
                return {k: convert_objectid_to_str(v) for k, v in obj.items()}
            else:
                return obj
        
        # Chuyển đổi từng bữa ăn thành list các dict
        serialized_menu = []
        for meal in best_menu:
            meal_dict = []
            for food in meal:
                food_dict = food.dict()
                # Đảm bảo _id là string
                if '_id' in food_dict and not isinstance(food_dict['_id'], str):
                    food_dict['_id'] = str(food_dict['_id'])
                # Xử lý ingredients nếu có
                if 'ingredients' in food_dict:
                    food_dict['ingredients'] = convert_objectid_to_str(food_dict['ingredients'])
                meal_dict.append(food_dict)
            serialized_menu.append(meal_dict)
        
        return {
            "foods": serialized_menu,
            "totalCalories": stats["totalCalories"],
            "totalProtein": stats["totalProtein"],
            "totalCarbs": stats["totalCarbs"],
            "totalFat": stats["totalFat"]
        }
        
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in optimize_menu: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint để kiểm tra trạng thái hoạt động của API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/supported-preferences")
async def get_supported_preferences():
    """Trả về danh sách các sở thích được hỗ trợ"""
    return {
        "preferences": [
            "vegetarian",
            "vegan",
            "low_carb",
            "low_fat",
            "high_protein",
            "gluten_free",
            "dairy_free",
            "spicy",
            "mild"
        ]
    }

@app.get("/supported-restrictions")
async def get_supported_restrictions():
    """Trả về danh sách các hạn chế được hỗ trợ"""
    return {
        "restrictions": [
            "gluten",
            "dairy",
            "nuts",
            "shellfish",
            "eggs",
            "soy",
            "fish",
            "pork",
            "beef"
        ]
    }

@app.get("/supported-medical-conditions")
async def get_supported_medical_conditions():
    """Trả về danh sách các tình trạng y tế được hỗ trợ"""
    return {
        "conditions": [
            "none",
            "diabetes",
            "heart_disease",
            "hypertension",
            "celiac",
            "lactose_intolerance"
        ]
    }

@app.post("/suggest-foods", response_model=SuggestFoodsResponse)
async def suggest_foods(request: SuggestFoodsRequest):
    """
    Gợi ý danh sách món ăn phù hợp với người dùng dựa trên:
    - Sở thích và hạn chế
    - Thời gian bữa ăn
    - Mùa và thời tiết
    """
    try:
        # Lấy context từ request
        meal_time = request.context.get('mealTime', 'all')
        season = request.context.get('season', 'all')
        weather = request.context.get('weather', 'all')
        
        # Truy xuất món ăn từ database
        foods = await get_foods_from_db(
            preferences=request.user.nutritionProfile.preferences,
            restrictions=request.user.nutritionProfile.restrictions,
            meal_time=meal_time,
            season=season,
            weather=weather,
            limit=request.max_suggestions
        )
        
        # Nếu không đủ món, lấy thêm món ngẫu nhiên
        if len(foods) < request.max_suggestions:
            remaining = request.max_suggestions - len(foods)
            random_foods = await get_foods_from_db(limit=remaining * 2)  # Lấy gấp đôi để tránh trùng
            random_foods = [f for f in random_foods if f not in foods][:remaining]
            foods.extend(random_foods)
        
        # Log chi tiết từng trường của từng Food
        for idx, food in enumerate(foods):
            logger.debug(f"[DEBUG] Food index {idx} type: {type(food)}")
            for field in food.__fields__:
                value = getattr(food, field, None)
                logger.debug(f"[DEBUG] Food index {idx} field '{{field}}': type={{type(value)}}, value={{value}}")
            if hasattr(food, '_id') and not isinstance(food._id, str):
                food._id = str(food._id)
                logger.debug(f"[DEBUG] Converted _id to str for food index {idx}: {food._id}")
        logger.debug(f"[DEBUG] About to return {len(foods)} foods from suggest_foods")
        
        import json
        from bson import ObjectId
        def default_serializer(obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            return str(obj)
        try:
            foods_dict = [food.dict() for food in foods]
            logger.debug(f"[DEBUG] foods_dict before return: {json.dumps(foods_dict, default=default_serializer)}")
        except Exception as e:
            logger.error(f"[DEBUG] Error serializing foods_dict: {e}")
            for idx, food in enumerate(foods):
                try:
                    logger.debug(f"[DEBUG] Food {idx} as dict: {food.dict()}")
                except Exception as e2:
                    logger.error(f"[DEBUG] Error serializing food {idx}: {e2}")
        logger.debug(f"[DEBUG] About to return {len(foods)} foods from suggest_foods (after dict log)")
        
        def convert_objectid_to_str(obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            elif isinstance(obj, list):
                return [convert_objectid_to_str(item) for item in obj]
            elif isinstance(obj, dict):
                return {k: convert_objectid_to_str(v) for k, v in obj.items()}
            else:
                return obj
        # Đảm bảo mọi _id là str (phòng trường hợp get_foods_from_db trả về Food có _id là ObjectId)
        for idx, food in enumerate(foods):
            if hasattr(food, '_id') and not isinstance(food._id, str):
                food._id = str(food._id)
            # Chuyển _id của từng ingredient thành str nếu cần
            if hasattr(food, 'ingredients'):
                for ingredient in food.ingredients:
                    if isinstance(ingredient, dict) and '_id' in ingredient and not isinstance(ingredient['_id'], str):
                        ingredient['_id'] = str(ingredient['_id'])
        # Chuyển toàn bộ foods sang dict và xử lý ObjectId ở mọi cấp
        foods_dict = [food.dict() for food in foods]
        foods_dict = convert_objectid_to_str(foods_dict)
        return {"foods": foods_dict}
        
    except Exception as e:
        logger.error(f"Error in suggest_foods: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error suggesting foods: {str(e)}"
        )

@app.post("/save-menu")
async def save_menu(menu: SavedMenu):
    try:
        # Chuyển đổi menu thành dict để lưu vào MongoDB
        menu_dict = menu.dict()
        
        # Đảm bảo ngày được lưu đúng
        # Kiểm tra và validate ngày
        try:
            # Parse ngày để đảm bảo format đúng
            parsed_date = datetime.strptime(menu_dict["date"], "%Y-%m-%d")
            # Lấy ngày hiện tại theo múi giờ địa phương
            current_date = datetime.now().strftime("%Y-%m-%d")
            
            # Log để debug
            print(f"[DEBUG] Ngày được gửi từ frontend: {menu_dict['date']}")
            print(f"[DEBUG] Ngày hiện tại: {current_date}")
            print(f"[DEBUG] Ngày được parse: {parsed_date.strftime('%Y-%m-%d')}")
            
            # Nếu ngày được gửi khác với ngày hiện tại, có thể có vấn đề
            if menu_dict["date"] != current_date:
                print(f"[WARNING] Ngày được gửi ({menu_dict['date']}) khác với ngày hiện tại ({current_date})")
                
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Ngày không đúng định dạng: {menu_dict['date']}. Định dạng yêu cầu: YYYY-MM-DD"
            )
        
        # Sử dụng thời gian hiện tại cho createdAt
        menu_dict["createdAt"] = datetime.now()
        
        # Giữ lại trạng thái completed của các meal trùng tên nếu đã có menu cũ
        old_menu = await db.saved_menus.find_one({"userId": menu_dict["userId"], "date": menu_dict["date"]}, sort=[("createdAt", -1)])
        if old_menu:
            for new_meal in menu_dict["meals"]:
                for old_meal in old_menu["meals"]:
                    if new_meal["mealName"].strip().lower() == old_meal["mealName"].strip().lower():
                        new_meal["completed"] = old_meal.get("completed", False)
                        new_meal["completedAt"] = old_meal.get("completedAt")
        
        # Lưu vào collection 'saved_menus'
        result = await db.saved_menus.insert_one(menu_dict)
        
        print(f"[DEBUG] Đã lưu thực đơn cho ngày: {menu_dict['date']}, ID: {result.inserted_id}")
        
        return {
            "success": True,
            "message": "Menu đã được lưu thành công",
            "menuId": str(result.inserted_id),
            "savedDate": menu_dict["date"],
            "currentDate": current_date
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi lưu menu: {str(e)}"
        )

@app.get("/saved-menus")
async def get_saved_menus(userId: str):
    menus = []
    async for menu in db.saved_menus.find({"userId": userId}):
        menu["_id"] = str(menu["_id"])
        menus.append(menu)
    return {"menus": menus}

class SingleFoodReplacementRequest(BaseModel):
    user: UserProfile
    foods: List[Food]
    targetFood: Food
    tolerance: float = 0.2

class MealOptimizationRequest(BaseModel):
    user: UserProfile
    foods: List[Food]
    mealTarget: Dict[str, Any]
    maxFoods: int = 5

@app.post("/optimize-single-food", response_model=Food)
async def optimize_single_food(request: SingleFoodReplacementRequest):
    
    """Tìm món thay thế đơn lẻ với dinh dưỡng tương đương"""
    try:
        ga = GeneticAlgorithm(request.foods, request.user)
        replacement = ga.optimize_single_food_replacement(request.targetFood, request.tolerance)
        
        if not replacement:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy món ăn phù hợp để thay thế"
            )
            
        return replacement
        
    except Exception as e:
        logger.error(f"Error in optimize_single_food: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize-meal", response_model=List[Food])
async def optimize_meal(request: MealOptimizationRequest):
    try:
        # Lấy toàn bộ món ăn từ database
        foods = []
        async for doc in foods_collection.find({}):
            doc["_id"] = str(doc["_id"])
            foods.append(Food(**doc))
        # Thêm log số lượng và tên món ăn
        logger.info(f"Loaded {len(foods)} foods from database for optimize_meal")
        logger.info(f"Food names: {[food.name for food in foods]}")
        if not foods:
            raise HTTPException(status_code=400, detail="No foods found in the database")
        ga = GeneticAlgorithm(foods, request.user, meal_targets=[request.mealTarget])
        optimized_meal = ga.evolve()
        if not optimized_meal or not optimized_meal[0]:
            raise HTTPException(
                status_code=404,
                detail="Không thể tạo được bữa ăn phù hợp với yêu cầu dinh dưỡng"
            )
        return optimized_meal[0]
    except Exception as e:
        logger.error(f"Error in optimize_meal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/similar-foods')
async def get_similar_foods(request: Request):
    data = await request.json()
    target = data['targetFood']
    tolerance = data.get('tolerance', 0.2)
    # Sửa lỗi truy xuất dữ liệu MongoDB
    foods = [food async for food in db.foods.find({})]
    result = []
    for food in foods:
        if food['_id'] == target['_id']:
            continue
        if (abs(food['calories'] - target['calories']) <= target['calories'] * tolerance and
            abs(food['protein'] - target['protein']) <= target['protein'] * tolerance and
            abs(food['carbs'] - target['carbs']) <= target['carbs'] * tolerance and
            abs(food['fat'] - target['fat']) <= target['fat'] * tolerance):
            result.append(food)
    return {'foods': result}

@app.get("/menu/by-date")
async def get_menu_by_date(userId: str, date: str):
    try:
        # Lấy thực đơn mới nhất của ngày đó
        menu = await db.saved_menus.find_one(
            {"userId": userId, "date": date},
            sort=[("createdAt", -1)]  # Sắp xếp theo createdAt giảm dần
        )
        if not menu:
            return {"menu": None}
        menu["_id"] = str(menu["_id"])
        return {"menu": menu}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy thực đơn: {str(e)}")

@app.post("/menu/complete-meal")
async def complete_meal(userId: str = Body(...), date: str = Body(...), mealName: str = Body(...)):
    try:
        # Lấy thực đơn mới nhất của ngày đó
        menu = await db.saved_menus.find_one(
            {"userId": userId, "date": date},
            sort=[("createdAt", -1)]  # Sắp xếp theo createdAt giảm dần để lấy mới nhất
        )
        if not menu:
            raise HTTPException(status_code=404, detail="Không tìm thấy thực đơn")
            
        
        updated_meals = []
        for meal in menu["meals"]:
            # So sánh mealName không phân biệt hoa thường và loại bỏ khoảng trắng
            if meal["mealName"].strip().lower() == mealName.strip().lower():
                meal["completed"] = True
                meal["completedAt"] = datetime.now().isoformat()
            updated_meals.append(meal)
        print("[DEBUG] Sau khi update:", updated_meals)
        
        # Tính lại compliance
        total = len(updated_meals)
        completed = sum(1 for meal in updated_meals if meal.get("completed"))
        compliance = int(completed / total * 100) if total else 0
        
        # Cập nhật menu
        await db.saved_menus.update_one(
            {"_id": menu["_id"]},
            {"$set": {"meals": updated_meals, "compliance": compliance}}
        )
        
        # Lưu lịch sử compliance
        compliance_history = ComplianceHistory(
            userId=userId,
            date=date,
            compliance=compliance,
            meals_completed=completed,
            total_meals=total,
            streak=menu.get("streak", 0),
            achievements=menu.get("achievements", [])
        )
        
        await compliance_history_collection.insert_one(compliance_history.dict())
        
        # Kiểm tra và tạo thông báo nếu đạt mục tiêu
        active_goals = []
        async for goal in db.compliance_goals.find({
            "userId": userId,
            "notification_enabled": True,
            "achieved": False,
            "start_date": {"$lte": date},
            "end_date": {"$gte": date}
        }):
            current_compliance = await calculate_current_compliance(userId, goal)
            if current_compliance >= goal["target_compliance"]:
                await db.compliance_goals.update_one(
                    {"_id": goal["_id"]},
                    {"$set": {"achieved": True}}
                )
                active_goals.append(goal)
        
        return {
            "success": True,
            "compliance": compliance,
            "goals_achieved": [str(goal["_id"]) for goal in active_goals]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi cập nhật: {str(e)}")

@app.post("/menu/rate-meal")
async def rate_meal(
    userId: str = Body(...),
    date: str = Body(...),
    mealName: str = Body(...),
    rating: int = Body(..., ge=1, le=5),
    feedback: Optional[str] = Body(None)
):
    try:
        # Lấy thực đơn mới nhất của ngày đó
        menu = await db.saved_menus.find_one(
            {"userId": userId, "date": date},
            sort=[("createdAt", -1)]  # Sắp xếp theo createdAt giảm dần để lấy mới nhất
        )
        if not menu:
            raise HTTPException(status_code=404, detail="Không tìm thấy thực đơn")
            
        # Cập nhật đánh giá cho bữa ăn
        updated_meals = []
        for meal in menu["meals"]:
            if meal["mealName"] == mealName:
                meal["rating"] = rating
                meal["feedback"] = feedback
            updated_meals.append(meal)
            
        # Tính toán compliance mới dựa trên cả số lượng và chất lượng
        total_meals = len(updated_meals)
        completed_meals = sum(1 for meal in updated_meals if meal.get("completed"))
        avg_rating = sum(meal.get("rating", 0) for meal in updated_meals if meal.get("completed")) / completed_meals if completed_meals > 0 else 0
        
        # Compliance = (số bữa hoàn thành / tổng số bữa) * (trung bình rating / 5) * 100
        new_compliance = (completed_meals / total_meals) * (avg_rating / 5) * 100 if total_meals > 0 else 0
        
        # Cập nhật streak
        current_date = datetime.strptime(date, "%Y-%m-%d")
        last_completed = datetime.strptime(menu.get("lastCompletedDate", date), "%Y-%m-%d") if menu.get("lastCompletedDate") else None
        
        new_streak = menu.get("streak", 0)
        if last_completed and (current_date - last_completed).days == 1:
            new_streak += 1
        elif not last_completed or (current_date - last_completed).days > 1:
            new_streak = 1
            
        # Kiểm tra achievements
        achievements = menu.get("achievements", [])
        if new_streak >= 7 and "week_streak" not in achievements:
            achievements.append("week_streak")
        if new_streak >= 30 and "month_streak" not in achievements:
            achievements.append("month_streak")
        if new_compliance >= 90 and "high_compliance" not in achievements:
            achievements.append("high_compliance")
            
        # Cập nhật menu
        await db.saved_menus.update_one(
            {"_id": menu["_id"]},
            {
                "$set": {
                    "meals": updated_meals,
                    "compliance": new_compliance,
                    "streak": new_streak,
                    "lastCompletedDate": date,
                    "achievements": achievements,
                    "mealHistory": menu.get("mealHistory", []) + [{
                        "date": date,
                        "mealName": mealName,
                        "rating": rating,
                        "feedback": feedback
                    }]
                }
            }
        )
        
        return {
            "success": True,
            "compliance": new_compliance,
            "streak": new_streak,
            "achievements": achievements
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi cập nhật đánh giá: {str(e)}")

@app.get("/menu/progress")
async def get_progress(userId: str, start_date: str, end_date: str):
    try:
        # Lấy thực đơn mới nhất cho mỗi ngày trong khoảng thời gian
        menus = []
        
        # Tạo pipeline để lấy thực đơn mới nhất cho mỗi ngày
        pipeline = [
            {
                "$match": {
                    "userId": userId,
                    "date": {
                        "$gte": start_date,
                        "$lte": end_date
                    }
                }
            },
            {
                "$sort": {"createdAt": -1}  # Sắp xếp theo createdAt giảm dần
            },
            {
                "$group": {
                    "_id": "$date",
                    "menu": {"$first": "$$ROOT"}  # Lấy thực đơn đầu tiên (mới nhất) cho mỗi ngày
                }
            },
            {
                "$replaceRoot": {"newRoot": "$menu"}
            },
            {
                "$sort": {"date": 1}  # Sắp xếp theo ngày tăng dần
            }
        ]
        
        async for menu in db.saved_menus.aggregate(pipeline):
            menu["_id"] = str(menu["_id"])
            menus.append(menu)
            
        if not menus:
            return {
                "progress": [],
                "stats": {
                    "average_compliance": 0,
                    "current_streak": 0,
                    "best_streak": 0,
                    "achievements": []
                }
            }
            
        # Tính toán thống kê
        progress_data = []
        total_compliance = 0
        current_streak = menus[-1].get("streak", 0)
        best_streak = max(menu.get("streak", 0) for menu in menus)
        all_achievements = set()
        
        for menu in menus:
            # Tính toán thông tin cho từng bữa ăn
            meals_info = []
            for meal in menu["meals"]:
                meals_info.append({
                    "mealName": meal["mealName"],
                    "completed": meal.get("completed", False),
                    "completedAt": meal.get("completedAt"),
                    "rating": meal.get("rating"),
                    "mealTime": meal.get("mealTime", ""),  # Thêm thông tin mealTime
                    "foods": meal["foods"]
                })
            
            progress_data.append({
                "date": menu["date"],
                "compliance": menu.get("compliance", 0),
                "meals_completed": sum(1 for meal in menu["meals"] if meal.get("completed")),
                "total_meals": len(menu["meals"]),
                "average_rating": sum(meal.get("rating", 0) for meal in menu["meals"] if meal.get("completed")) / 
                                sum(1 for meal in menu["meals"] if meal.get("completed")) if sum(1 for meal in menu["meals"] if meal.get("completed")) > 0 else 0,
                "meals": meals_info  # Thêm thông tin chi tiết về các bữa ăn
            })
            total_compliance += menu.get("compliance", 0)
            all_achievements.update(menu.get("achievements", []))
            
        return {
            "progress": progress_data,
            "stats": {
                "average_compliance": total_compliance / len(menus),
                "current_streak": current_streak,
                "best_streak": best_streak,
                "achievements": list(all_achievements)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy dữ liệu tiến độ: {str(e)}")

@app.get("/menu/achievements")
async def get_achievements(userId: str):
    try:
        # Lấy tất cả achievements của user
        all_achievements = set()
        async for menu in db.saved_menus.find({"userId": userId}):
            all_achievements.update(menu.get("achievements", []))
            
        # Định nghĩa các achievements có thể đạt được
        available_achievements = {
            "week_streak": "Duy trì streak 7 ngày liên tiếp",
            "month_streak": "Duy trì streak 30 ngày liên tiếp",
            "high_compliance": "Đạt compliance trên 90%",
            "perfect_day": "Hoàn thành tất cả bữa ăn trong ngày",
            "consistent": "Duy trì compliance trên 80% trong 7 ngày liên tiếp",
            "master_chef": "Đạt rating trung bình 4.5/5 trong 7 ngày"
        }
        
        return {
            "achieved": list(all_achievements),
            "available": available_achievements
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy achievements: {str(e)}")

@app.post("/compliance/goal")
async def create_compliance_goal(goal: ComplianceGoal):
    try:
        # Kiểm tra xem đã có mục tiêu trong khoảng thời gian này chưa
        existing_goal = await db.compliance_goals.find_one({
            "userId": goal.userId,
            "start_date": {"$lte": goal.end_date},
            "end_date": {"$gte": goal.start_date}
        })
        
        if existing_goal:
            raise HTTPException(
                status_code=400,
                detail="Đã tồn tại mục tiêu trong khoảng thời gian này"
            )
            
        # Lưu mục tiêu mới
        result = await db.compliance_goals.insert_one(goal.dict())
        
        return {
            "success": True,
            "goalId": str(result.inserted_id),
            "message": "Đã tạo mục tiêu mới thành công"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/compliance/history")
async def get_compliance_history(
    userId: str,
    start_date: str,
    end_date: str,
    group_by: str = "day"  # day, week, month
):
    try:
        # Lấy lịch sử compliance
        history = []
        async for doc in compliance_history_collection.find({
            "userId": userId,
            "date": {
                "$gte": start_date,
                "$lte": end_date
            }
        }).sort("date", 1):
            doc["_id"] = str(doc["_id"])
            history.append(doc)
            
        if not history:
            return {
                "history": [],
                "stats": {
                    "daily_average": 0,
                    "weekly_average": 0,
                    "monthly_average": 0,
                    "current_streak": 0,
                    "best_streak": 0,
                    "total_days_tracked": 0
                }
            }
            
        # Tính toán thống kê
        stats = calculate_compliance_stats(history)
        
        # Nhóm dữ liệu theo yêu cầu
        grouped_data = group_compliance_data(history, group_by)
        
        return {
            "history": grouped_data,
            "stats": stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/compliance/goals")
async def get_compliance_goals(userId: str):
    try:
        goals = []
        async for goal in db.compliance_goals.find({"userId": userId}):
            goal["_id"] = str(goal["_id"])
            goals.append(goal)
        return {"goals": goals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/compliance/notifications")
async def get_compliance_notifications(userId: str):
    try:
        # Lấy các mục tiêu đang theo dõi
        active_goals = []
        async for goal in db.compliance_goals.find({
            "userId": userId,
            "notification_enabled": True,
            "achieved": False,
            "end_date": {"$gte": datetime.now().strftime("%Y-%m-%d")}
        }):
            goal["_id"] = str(goal["_id"])
            active_goals.append(goal)
            
        notifications = []
        for goal in active_goals:
            # Tính toán tiến độ hiện tại
            current_compliance = await calculate_current_compliance(userId, goal)
            
            # Tạo thông báo nếu cần
            if current_compliance >= goal["target_compliance"]:
                notifications.append({
                    "type": "goal_achieved",
                    "message": f"Chúc mừng! Bạn đã đạt được mục tiêu compliance {goal['target_compliance']}%",
                    "goal": goal
                })
            elif current_compliance < goal["target_compliance"] * 0.5:
                notifications.append({
                    "type": "goal_warning",
                    "message": f"Cảnh báo: Bạn đang ở dưới 50% mục tiêu compliance",
                    "goal": goal,
                    "current_compliance": current_compliance
                })
                
        return {"notifications": notifications}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def calculate_compliance_stats(history: List[dict]) -> dict:
    """Tính toán thống kê từ lịch sử compliance"""
    if not history:
        return {
            "daily_average": 0,
            "weekly_average": 0,
            "monthly_average": 0,
            "current_streak": 0,
            "best_streak": 0,
            "total_days_tracked": 0
        }
        
    # Tính trung bình ngày
    daily_average = sum(day["compliance"] for day in history) / len(history)
    
    # Tính trung bình tuần
    weekly_data = group_compliance_data(history, "week")
    weekly_average = sum(week["compliance"] for week in weekly_data) / len(weekly_data) if weekly_data else 0
    
    # Tính trung bình tháng
    monthly_data = group_compliance_data(history, "month")
    monthly_average = sum(month["compliance"] for month in monthly_data) / len(monthly_data) if monthly_data else 0
    
    # Tính streak
    current_streak = history[-1]["streak"] if history else 0
    best_streak = max(day["streak"] for day in history)
    
    return {
        "daily_average": daily_average,
        "weekly_average": weekly_average,
        "monthly_average": monthly_average,
        "current_streak": current_streak,
        "best_streak": best_streak,
        "total_days_tracked": len(history)
    }

def group_compliance_data(history: List[dict], group_by: str) -> List[dict]:
    """Nhóm dữ liệu compliance theo ngày/tuần/tháng"""
    if not history:
        return []
        
    grouped = {}
    
    for day in history:
        date = datetime.strptime(day["date"], "%Y-%m-%d")
        
        if group_by == "day":
            key = day["date"]
        elif group_by == "week":
            # Lấy ngày đầu tiên của tuần
            key = (date - timedelta(days=date.weekday())).strftime("%Y-%m-%d")
        else:  # month
            key = date.strftime("%Y-%m")
            
        if key not in grouped:
            grouped[key] = {
                "date": key,
                "compliance": 0,
                "meals_completed": 0,
                "total_meals": 0,
                "days_count": 0
            }
            
        grouped[key]["compliance"] += day["compliance"]
        grouped[key]["meals_completed"] += day["meals_completed"]
        grouped[key]["total_meals"] += day["total_meals"]
        grouped[key]["days_count"] += 1
        
    # Tính trung bình cho mỗi nhóm
    result = []
    for key, data in grouped.items():
        result.append({
            "date": key,
            "compliance": data["compliance"] / data["days_count"],
            "meals_completed": data["meals_completed"],
            "total_meals": data["total_meals"],
            "completion_rate": data["meals_completed"] / data["total_meals"] if data["total_meals"] > 0 else 0
        })
        
    return sorted(result, key=lambda x: x["date"])

async def calculate_current_compliance(userId: str, goal: dict) -> float:
    """Tính toán compliance hiện tại cho một mục tiêu"""
    start_date = goal["start_date"]
    end_date = datetime.now().strftime("%Y-%m-%d")
    
    history = []
    async for doc in compliance_history_collection.find({
        "userId": userId,
        "date": {
            "$gte": start_date,
            "date": {
                "$lte": end_date
            }
        }
    }).sort("date", 1):
        history.append(doc)
        
    if not history:
        return 0.0
        
    return sum(day["compliance"] for day in history) / len(history)

# Cấu hình mail (ví dụ với Gmail SMTP, cần thay bằng thông tin thực tế)
conf = ConnectionConfig(
    MAIL_USERNAME="buihuutrong369@gmail.com",  # Email của bạn
    MAIL_PASSWORD="adaa kvvo part sspu",               # Mật khẩu của bạn
    MAIL_FROM="buihuutrong369@gmail.com",     # Email của bạn
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)
fm = FastMail(conf)

# Khởi tạo collection notifications nếu chưa tồn tại
async def init_notifications_collection():
    try:
        # Kiểm tra xem collection đã tồn tại chưa
        collections = await db.list_collection_names()
        if "notifications" not in collections:
            logger.info("Creating notifications collection")
            await db.create_collection("notifications")
            # Tạo index cho userId và createdAt
            await db.notifications.create_index([("userId", 1)])
            await db.notifications.create_index([("createdAt", -1)])
            logger.info("Notifications collection created successfully")
        else:
            logger.info("Notifications collection already exists")
    except Exception as e:
        logger.error(f"Error initializing notifications collection: {e}")

def time_str_to_minutes(t):
    try:
        h, m = map(int, t.split(":"))
        return h * 60 + m
    except Exception:
        return -1

async def send_reminder_notifications():
    try:
        logger.info(">>> [DEBUG] Đã vào send_reminder_notifications")
        now = datetime.now()
        now_str = now.strftime("%H:%M")
        now_minutes = time_str_to_minutes(now_str)
        today = now.strftime("%Y-%m-%d")
        logger.info(f"[DEBUG] Current time: {now_str}, Today: {today}")

        menu_count = await db.saved_menus.count_documents({"date": today})
        logger.info(f"[DEBUG] Found {menu_count} menus for today")

        async for menu in db.saved_menus.find({"date": today}):
            userId = menu["userId"]
            logger.info(f"[DEBUG] Checking menu for user {userId}")
            for meal in menu["meals"]:
                meal_time = meal.get("mealTime")
                meal_minutes = time_str_to_minutes(meal_time) if meal_time else -1
                logger.info(f"[DEBUG] Checking meal {meal['mealName']} at {meal_time}, completed={meal.get('completed', False)}")
                if meal_time and meal_minutes != -1 and meal_minutes <= now_minutes and not meal.get("completed", False):
                    logger.info(f"[DEBUG] Found incomplete meal: {meal['mealName']} at {meal_time}")
                    existing = await db.notifications.find_one({
                        "userId": userId,
                        "type": "reminder",
                        "date": today,
                        "mealName": meal["mealName"]
                    })
                    if not existing:
                        logger.info(f"[DEBUG] Creating new notification for meal {meal['mealName']}")
                        await db.notifications.insert_one({
                            "userId": userId,
                            "type": "reminder",
                            "title": f"Đến giờ ăn {meal['mealName']}!",
                            "content": f"Bạn chưa hoàn thành {meal['mealName']} lúc {meal_time}. Hãy ăn đúng giờ nhé!",
                            "createdAt": now.isoformat(),
                            "read": False,
                            "date": today,
                            "mealName": meal["mealName"]
                        })
                        user = await db.users.find_one({"_id": userId})
                        if user and user.get("email"):
                            logger.info(f"[DEBUG] Chuẩn bị gửi email tới: {user['email']} với tiêu đề: Nhắc nhở: Đến giờ ăn {meal['mealName']} và nội dung: Bạn chưa hoàn thành {meal['mealName']} lúc {meal_time}. Hãy ăn đúng giờ nhé!")
                            message = MessageSchema(
                                subject=f"Nhắc nhở: Đến giờ ăn {meal['mealName']}",
                                recipients=[user["email"]],
                                body=f"Bạn chưa hoàn thành {meal['mealName']} lúc {meal_time}. Hãy ăn đúng giờ nhé!",
                                subtype="plain"
                            )
                            try:
                                await fm.send_message(message)
                                logger.info(f"[DEBUG] Đã gửi email thành công tới: {user['email']}")
                            except Exception as e:
                                logger.error(f"[DEBUG] Lỗi khi gửi mail tới {user['email']}: {e}")
                    else:
                        logger.info(f"[DEBUG] Notification already exists for meal {meal['mealName']}")
                else:
                    logger.info(f"[DEBUG] Meal {meal['mealName']} is either completed or not due yet")
    except Exception as e:
        logger.error(f"[DEBUG] Error in send_reminder_notifications: {e}")

# Đăng ký scheduler
scheduler = AsyncIOScheduler()

async def start_scheduler():
    logger.info(">>> [DEBUG] Đã vào event startup")
    try:
        logger.info(">>> [DEBUG] Bắt đầu khởi tạo notifications collection")
        await init_notifications_collection()
        logger.info(">>> [DEBUG] Đã khởi tạo notifications collection")
        scheduler.add_job(send_reminder_notifications, 'interval', minutes=1)
        logger.info(">>> [DEBUG] Đã add job cho scheduler")
        scheduler.start()
        logger.info(">>> [DEBUG] Scheduler started successfully")
    except Exception as e:
        logger.error(f">>> [DEBUG] Error starting scheduler: {e}")

@app.get("/notifications")
async def get_notifications(userId: str):
    try:
        notifs = []
        async for n in db.notifications.find({"userId": userId}).sort("createdAt", -1):
            n["_id"] = str(n["_id"])
            notifs.append(n)
        return {"notifications": notifs}
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class SearchFoodsRequest(BaseModel):
    query: Optional[str] = None  # Từ khóa tìm kiếm
    preferences: Optional[List[str]] = None  # Sở thích
    restrictions: Optional[List[str]] = None  # Hạn chế
    min_calories: Optional[float] = None  # Calories tối thiểu
    max_calories: Optional[float] = None  # Calories tối đa
    min_protein: Optional[float] = None  # Protein tối thiểu
    max_protein: Optional[float] = None  # Protein tối đa
    min_carbs: Optional[float] = None  # Carbs tối thiểu
    max_carbs: Optional[float] = None  # Carbs tối đa
    min_fat: Optional[float] = None  # Fat tối thiểu
    max_fat: Optional[float] = None  # Fat tối đa
    meal_time: Optional[str] = None  # Thời gian bữa ăn
    season: Optional[str] = None  # Mùa
    weather: Optional[str] = None  # Thời tiết
    limit: int = 20  # Số lượng kết quả tối đa
    page: int = 1  # Trang kết quả

    @validator('min_calories', 'max_calories', 'min_protein', 'max_protein', 'min_carbs', 'max_carbs', 'min_fat', 'max_fat', pre=True)
    def empty_str_to_none(cls, v):
        if v == '':
            return None
        return v

class SearchFoodsResponse(BaseModel):
    foods: List[Food]
    total: int
    page: int
    total_pages: int

@app.post("/search-foods", response_model=SearchFoodsResponse)
async def search_foods(request: SearchFoodsRequest):
    """
    Tìm kiếm món ăn với nhiều tiêu chí khác nhau
    """
    try:
        # Xây dựng query MongoDB
        query = {}
        
        # Tìm kiếm theo tên món ăn (case-insensitive)
        if request.query:
            query["name"] = {"$regex": request.query, "$options": "i"}
            
        # Lọc theo preferences
        if request.preferences:
            query["preferences"] = {"$in": request.preferences}
            
        # Lọc theo restrictions (loại trừ các món có restrictions trùng)
        if request.restrictions:
            query["restrictions"] = {"$nin": request.restrictions}
            
        # Lọc theo calories
        if request.min_calories is not None or request.max_calories is not None:
            query["calories"] = {}
            if request.min_calories is not None:
                query["calories"]["$gte"] = request.min_calories
            if request.max_calories is not None:
                query["calories"]["$lte"] = request.max_calories
                
        # Lọc theo protein
        if request.min_protein is not None or request.max_protein is not None:
            query["protein"] = {}
            if request.min_protein is not None:
                query["protein"]["$gte"] = request.min_protein
            if request.max_protein is not None:
                query["protein"]["$lte"] = request.max_protein
                
        # Lọc theo carbs
        if request.min_carbs is not None or request.max_carbs is not None:
            query["carbs"] = {}
            if request.min_carbs is not None:
                query["carbs"]["$gte"] = request.min_carbs
            if request.max_carbs is not None:
                query["carbs"]["$lte"] = request.max_carbs
                
        # Lọc theo fat
        if request.min_fat is not None or request.max_fat is not None:
            query["fat"] = {}
            if request.min_fat is not None:
                query["fat"]["$gte"] = request.min_fat
            if request.max_fat is not None:
                query["fat"]["$lte"] = request.max_fat
                
        # Lọc theo context (meal_time, season, weather)
        if request.meal_time or request.season or request.weather:
            query["context"] = {}
            if request.meal_time:
                query["context"]["mealTime"] = {"$in": [request.meal_time, "all"]}
            if request.season:
                query["context"]["season"] = {"$in": [request.season, "all"]}
            if request.weather:
                query["context"]["weather"] = {"$in": [request.weather, "all"]}
        
        # Tính toán skip và limit cho phân trang
        skip = (request.page - 1) * request.limit
        
        # Đếm tổng số kết quả
        total = await foods_collection.count_documents(query)
        
        # Helper function to convert ObjectId recursively
        from bson import ObjectId
        def convert_objectid_to_str(obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            elif isinstance(obj, list):
                return [convert_objectid_to_str(item) for item in obj]
            elif isinstance(obj, dict):
                return {k: convert_objectid_to_str(v) for k, v in obj.items()}
            else:
                return obj

        # Truy xuất dữ liệu với phân trang
        cursor = foods_collection.find(query).skip(skip).limit(request.limit)
        foods = []
        async for doc in cursor:
            clean_doc = convert_objectid_to_str(doc)
            foods.append(Food(**clean_doc))
            
        # Tính tổng số trang
        total_pages = (total + request.limit - 1) // request.limit
        
        return {
            "foods": foods,
            "total": total,
            "page": request.page,
            "total_pages": total_pages
        }
        
    except Exception as e:
        logger.error(f"Error in search_foods: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching foods: {str(e)}"
        )

def aggregate_ingredients(menus: List[SavedMenu]) -> List[Dict[str, Any]]:
   
    # Dictionary để lưu trữ tổng số lượng của từng nguyên liệu
    ingredients_dict = {}
    
    # Duyệt qua từng thực đơn
    for menu in menus:
        # Duyệt qua từng bữa ăn
        for meal in menu.meals:
            # Duyệt qua từng món ăn
            for food in meal.foods:
                # Duyệt qua từng nguyên liệu
                for ingredient in food.get('ingredients', []):
                    name = ingredient.get('name')
                    quantity = ingredient.get('quantity', 0)
                    unit = ingredient.get('unit')
                    
                    if name and quantity and unit:
                        # Tạo key duy nhất cho mỗi nguyên liệu (tên + đơn vị)
                        key = f"{name}_{unit}"
                        
                        if key in ingredients_dict:
                            # Cộng dồn số lượng nếu đã có nguyên liệu này
                            ingredients_dict[key]['total_quantity'] += quantity
                        else:
                            # Thêm mới nếu chưa có
                            ingredients_dict[key] = {
                                'name': name,
                                'total_quantity': quantity,
                                'unit': unit
                            }
    
    # Chuyển dictionary thành list và sắp xếp theo tên
    aggregated_ingredients = list(ingredients_dict.values())
    aggregated_ingredients.sort(key=lambda x: x['name'])
    
    return aggregated_ingredients

class ShoppingListResponse(BaseModel):
    ingredients: List[Dict[str, Any]]
    total_items: int
    date_range: Dict[str, str]

@app.get("/shopping-list", response_model=ShoppingListResponse)
async def get_shopping_list(userId: str, start_date: str, end_date: str):
    """
    Lấy danh sách nguyên liệu đã tổng hợp từ thực đơn trong khoảng thời gian.
    
    Args:
        userId: ID của người dùng
        start_date: Ngày bắt đầu (format: YYYY-MM-DD)
        end_date: Ngày kết thúc (format: YYYY-MM-DD)
        
    Returns:
        ShoppingListResponse: Danh sách nguyên liệu đã tổng hợp
    """
    try:
        # Lấy danh sách thực đơn từ database trong khoảng thời gian
        menus = await db.saved_menus.find({
            "userId": userId,
            "date": {
                "$gte": start_date,
                "$lte": end_date
            }
        }).to_list(length=None)
        
        if not menus:
            return {
                "ingredients": [],
                "total_items": 0,
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date
                }
            }
        from datetime import datetime
        for menu in menus:
            for key, value in menu.items():
                if isinstance(value, datetime):
                    menu[key] = value.isoformat()
        # Chuyển đổi thành SavedMenu objects
        saved_menus = [SavedMenu(**menu) for menu in menus]
        
        # Tổng hợp nguyên liệu
        ingredients = aggregate_ingredients(saved_menus)
        
        return {
            "ingredients": ingredients,
            "total_items": len(ingredients),
            "date_range": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting shopping list: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi lấy danh sách mua sắm: {str(e)}"
        )

# Main entry point
if __name__ == "__main__":
    print(">>> [DEBUG] Đã vào __main__")
    import uvicorn
    
    # Cấu hình logging chi tiết hơn
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Chạy ứng dụng với cấu hình production
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        workers=1  # Số lượng worker processes
    )



client = openai.OpenAI(api_key="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")

def ask_openai(message: str) -> str:
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": message}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[AI Error]: {str(e)}"

@app.post("/ai-chat")
async def ai_chat(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    if not messages or not isinstance(messages, list):
        return {"response": "Bạn chưa nhập nội dung câu hỏi!"}
    ai_response = ask_openai(messages)
    return {"response": ai_response}

def find_similar_food(target_food, foods, tolerance=0.5):
    candidates = []
    print(f"Target food: {target_food}")
    for food in foods:
        print(f"Checking food: {food['name']} (id: {food['_id']})")
        if str(food['_id']) == str(target_food['_id']):
            print("  -> Bỏ qua chính nó")
            continue

        def percent_diff(a, b):
            if b == 0:
                return 1  # Nếu b = 0 thì coi như khác biệt hoàn toàn
            return abs(a - b) / b

        cal_diff = percent_diff(food['calories'], target_food['calories'])
        pro_diff = percent_diff(food['protein'], target_food['protein'])
        carb_diff = percent_diff(food['carbs'], target_food['carbs'])
        fat_diff = percent_diff(food['fat'], target_food['fat'])

        print(f"  cal_diff={cal_diff}, pro_diff={pro_diff}, carb_diff={carb_diff}, fat_diff={fat_diff}")

        if (
            cal_diff <= tolerance and
            pro_diff <= tolerance and
            carb_diff <= tolerance and
            fat_diff <= tolerance
        ):
            print("  -> Thêm vào candidates")
            candidates.append(food)
        else:
            print("  -> Không phù hợp")

    if candidates:
        def total_diff(food):
            return (
                abs(food['calories'] - target_food['calories']) +
                abs(food['protein'] - target_food['protein']) +
                abs(food['carbs'] - target_food['carbs']) +
                abs(food['fat'] - target_food['fat'])
            )
        return min(candidates, key=total_diff)
    print("Không tìm thấy món thay thế phù hợp")
    return None
@app.post("/replace-food")
async def replace_food(request: Request):
    data = await request.json()
    target_food = data['targetFood']
    tolerance = data.get('tolerance', 0.2)

    # Thêm log để biết món ăn frontend yêu cầu thay đổi
    import logging
    logger = logging.getLogger("uvicorn")
    logger.info(f"Yêu cầu thay đổi món: {target_food.get('name', target_food)}")
    logger.info(f"ID của món ăn yêu cầu thay đổi: {target_food.get('_id', 'Không có _id')}")

    # Lấy tất cả món ăn từ database
    foods = [food async for food in db.foods.find({})]

    similar_food = find_similar_food(target_food, foods, tolerance)
    if not similar_food:
        raise HTTPException(status_code=404, detail="Không tìm thấy món thay thế phù hợp")
    return similar_food

@app.get("/menu/debug-by-date")
async def debug_menu_by_date(userId: str, date: str):
    """
    API debug để kiểm tra tất cả thực đơn của một ngày cụ thể
    """
    try:
        # Lấy tất cả thực đơn của ngày đó, sắp xếp theo thời gian tạo
        menus = []
        async for menu in db.saved_menus.find(
            {"userId": userId, "date": date}
        ).sort("createdAt", -1):  # Sắp xếp theo createdAt giảm dần
            menu["_id"] = str(menu["_id"])
            # Chuyển đổi datetime thành string để có thể serialize
            if "createdAt" in menu and isinstance(menu["createdAt"], datetime):
                menu["createdAt"] = menu["createdAt"].isoformat()
            menus.append(menu)
            
        return {
            "date": date,
            "userId": userId,
            "total_menus": len(menus),
            "menus": menus,
            "latest_menu": menus[0] if menus else None,
            "oldest_menu": menus[-1] if menus else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi debug thực đơn: {str(e)}")

@app.get("/menu/check-date-issue")
async def check_date_issue(userId: str):
    """
    API để kiểm tra vấn đề với ngày của thực đơn
    """
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Kiểm tra thực đơn của hôm nay
        today_menus = []
        async for menu in db.saved_menus.find({"userId": userId, "date": today}).sort("createdAt", -1):
            menu["_id"] = str(menu["_id"])
            if "createdAt" in menu and isinstance(menu["createdAt"], datetime):
                menu["createdAt"] = menu["createdAt"].isoformat()
            today_menus.append(menu)
        
        # Kiểm tra thực đơn của hôm qua
        yesterday_menus = []
        async for menu in db.saved_menus.find({"userId": userId, "date": yesterday}).sort("createdAt", -1):
            menu["_id"] = str(menu["_id"])
            if "createdAt" in menu and isinstance(menu["createdAt"], datetime):
                menu["createdAt"] = menu["createdAt"].isoformat()
            yesterday_menus.append(menu)
        
        # Kiểm tra thực đơn của ngày mai
        tomorrow_menus = []
        async for menu in db.saved_menus.find({"userId": userId, "date": tomorrow}).sort("createdAt", -1):
            menu["_id"] = str(menu["_id"])
            if "createdAt" in menu and isinstance(menu["createdAt"], datetime):
                menu["createdAt"] = menu["createdAt"].isoformat()
            tomorrow_menus.append(menu)
        
        return {
            "current_date": today,
            "yesterday": yesterday,
            "tomorrow": tomorrow,
            "today_menus": {
                "count": len(today_menus),
                "menus": today_menus
            },
            "yesterday_menus": {
                "count": len(yesterday_menus),
                "menus": yesterday_menus
            },
            "tomorrow_menus": {
                "count": len(tomorrow_menus),
                "menus": tomorrow_menus
            },
            "issue_detected": len(tomorrow_menus) > 0  # Nếu có thực đơn cho ngày mai, có vấn đề
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi kiểm tra vấn đề ngày: {str(e)}")

@app.post("/menu/fix-date-issue")
async def fix_date_issue(userId: str, from_date: str, to_date: str):
    """
    API để sửa lại ngày của thực đơn
    """
    try:
        # Tìm tất cả thực đơn có ngày sai
        menus_to_fix = []
        async for menu in db.saved_menus.find({"userId": userId, "date": from_date}):
            menus_to_fix.append(menu)
        
        if not menus_to_fix:
            return {
                "success": True,
                "message": f"Không có thực đơn nào cần sửa từ {from_date} sang {to_date}",
                "fixed_count": 0
            }
        
        # Cập nhật ngày cho tất cả thực đơn
        fixed_count = 0
        for menu in menus_to_fix:
            result = await db.saved_menus.update_one(
                {"_id": menu["_id"]},
                {"$set": {"date": to_date}}
            )
            if result.modified_count > 0:
                fixed_count += 1
        
        return {
            "success": True,
            "message": f"Đã sửa {fixed_count} thực đơn từ {from_date} sang {to_date}",
            "fixed_count": fixed_count,
            "total_menus": len(menus_to_fix)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi sửa vấn đề ngày: {str(e)}")