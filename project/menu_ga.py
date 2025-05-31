from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator, Field
from typing import List, Optional, Dict, Any
import numpy as np
import random
import logging
from datetime import datetime
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
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
    foods: List[List[Food]]
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

class SavedMenu(BaseModel):
    userId: str
    date: str
    meals: List[SavedMeal]
    totalNutrition: dict
    createdAt: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())
    note: Optional[str] = ""

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
        """Tính điểm fitness cho một bữa ăn"""
        if not meal:
            return float('-inf')

        # Tính toán dinh dưỡng hiện tại
        current_nutrition = {
            'calories': sum(f.calories for f in meal),
            'protein': sum(f.protein for f in meal),
            'carbs': sum(f.carbs for f in meal),
            'fat': sum(f.fat for f in meal)
        }

        # Tính điểm cho từng chỉ số dinh dưỡng
        def calculate_nutrient_score(actual, target):
            if target == 0:
                return 1.0 if actual == 0 else 0.0
            ratio = actual / target
            # Cho phép sai số 15%
            if ratio < 0.85 or ratio > 1.15:
                return 0.0
            return 1.0 - abs(ratio - 1.0)

        # Tính điểm cho từng chỉ số
        calorie_score = calculate_nutrient_score(current_nutrition['calories'], target['calories'])
        protein_score = calculate_nutrient_score(current_nutrition['protein'], target['protein'])
        carbs_score = calculate_nutrient_score(current_nutrition['carbs'], target['carbs'])
        fat_score = calculate_nutrient_score(current_nutrition['fat'], target['fat'])

        # Tính điểm đa dạng món ăn
        diversity_score = len(set(f.name for f in meal)) / len(meal)

        # Tính điểm cân bằng dinh dưỡng
        balance_score = 1.0 - (
            abs(current_nutrition['protein']/current_nutrition['calories'] - target['protein']/target['calories']) +
            abs(current_nutrition['carbs']/current_nutrition['calories'] - target['carbs']/target['calories']) +
            abs(current_nutrition['fat']/current_nutrition['calories'] - target['fat']/target['calories'])
        ) / 3.0

        # Tính điểm tổng hợp với trọng số
        return (
            0.35 * calorie_score +    # Calories
            0.25 * protein_score +    # Protein
            0.20 * carbs_score +      # Carbs
            0.10 * fat_score +        # Fat
            0.05 * diversity_score +  # Đa dạng
            0.05 * balance_score      # Cân bằng
        )

    def calculate_diversity_score(self, individual):
        """Tính điểm đa dạng của thực đơn"""
        unique_foods = len(set(food.name for food in individual))
        return unique_foods / len(individual)

    def select_parents(self):
        """Chọn các cá thể làm cha mẹ với tournament selection cải tiến"""
        fitness_scores = [self.calculate_fitness(individual, self.meal_targets[i]) for i, individual in enumerate(self.population)]
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
        fitness_scores = [self.calculate_fitness(individual, self.meal_targets[i]) for i, individual in enumerate(parents)]
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
            current_best = max(self.population, key=lambda individual: self.calculate_fitness(individual, self.meal_targets[i]))
            current_best_fitness = self.calculate_fitness(current_best, self.meal_targets[i])
            
            # Lưu lịch sử
            self.generation_history.append({
                'generation': generation,
                'best_fitness': current_best_fitness,
                'average_fitness': sum(self.calculate_fitness(individual, self.meal_targets[i]) for individual in self.population) / len(self.population)
            })
            
            if current_best_fitness > self.best_fitness:
                self.best_fitness = current_best_fitness
                self.best_solution = current_best.copy()
                generations_without_improvement = 0
                # In log chênh lệch dinh dưỡng từng bữa so với mục tiêu
                if self.meal_targets:
                    print(f"\n[LOG] Generation {generation} - Nutrition gap per meal (best solution):")
                    for i, meal in enumerate(self.best_solution):
                        target = self.meal_targets[i]
                        total_calories = sum(f.calories for f in meal)
                        total_protein = sum(f.protein for f in meal)
                        total_carbs = sum(f.carbs for f in meal)
                        total_fat = sum(f.fat for f in meal)
                        print(f"  Meal {i+1}:")
                        print(f"    Calories: {total_calories:.1f} / {target['calories']:.1f} (diff: {total_calories - target['calories']:+.1f})")
                        print(f"    Protein:  {total_protein:.1f} / {target['protein']:.1f} (diff: {total_protein - target['protein']:+.1f})")
                        print(f"    Carbs:    {total_carbs:.1f} / {target['carbs']:.1f} (diff: {total_carbs - target['carbs']:+.1f})")
                        print(f"    Fat:      {total_fat:.1f} / {target['fat']:.1f} (diff: {total_fat - target['fat']:+.1f})")
            else:
                generations_without_improvement += 1
            
            # Điều chỉnh mutation_rate dựa trên tiến triển
            if generations_without_improvement > 10:
                self.mutation_rate = min(0.4, self.mutation_rate * 1.1)  # Tăng mutation_rate
            else:
                self.mutation_rate = max(0.1, self.mutation_rate * 0.95)  # Giảm mutation_rate
            
            # Dừng sớm nếu đạt điều kiện
            if self.best_fitness > 0.95 or generations_without_improvement > 20:
                break
        
        logger.info(f"Evolution completed after {generation + 1} generations with best fitness: {self.best_fitness}")
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

    def optimize_single_food_replacement(self, target_food, tolerance=0.2):
        """Tìm món thay thế đơn lẻ với dinh dưỡng tương đương"""
        suitable_foods = []
        for food in self.foods:
            if food._id == target_food._id:
                continue
            
            # Tính độ lệch dinh dưỡng
            calorie_diff = abs(food.calories - target_food.calories) / target_food.calories
            protein_diff = abs(food.protein - target_food.protein) / target_food.protein
            carbs_diff = abs(food.carbs - target_food.carbs) / target_food.carbs
            fat_diff = abs(food.fat - target_food.fat) / target_food.fat
            
            # Nếu tất cả các chỉ số đều trong khoảng tolerance
            if all(diff <= tolerance for diff in [calorie_diff, protein_diff, carbs_diff, fat_diff]):
                suitable_foods.append(food)
        
        if not suitable_foods:
            return None
        
        # Sắp xếp theo độ tương đồng dinh dưỡng
        suitable_foods.sort(key=lambda f: (
            abs(f.calories - target_food.calories) +
            abs(f.protein - target_food.protein) +
            abs(f.carbs - target_food.carbs) +
            abs(f.fat - target_food.fat)
        ))
        
        return suitable_foods[0]

    def mutate_entire_meal(self, meal, target):
        """Tạo một bữa ăn mới hoàn toàn dựa trên mục tiêu dinh dưỡng"""
        if not meal:
            return meal

        # Lấy danh sách món ăn phù hợp với loại bữa
        meal_type = meal[0].meal_type
        suitable_foods = [f for f in self.foods if f.meal_type == meal_type]

        # Sắp xếp món ăn theo độ phù hợp với mục tiêu dinh dưỡng
        def calculate_food_score(food):
            # Tính điểm phù hợp với mục tiêu dinh dưỡng
            nutrition_score = 0
            if target['protein'] > 0:
                nutrition_score += (food.protein / target['protein']) * 0.3
            if target['carbs'] > 0:
                nutrition_score += (food.carbs / target['carbs']) * 0.3
            if target['fat'] > 0:
                nutrition_score += (food.fat / target['fat']) * 0.2
            if target['calories'] > 0:
                nutrition_score += (food.calories / target['calories']) * 0.2
            return nutrition_score

        suitable_foods.sort(key=calculate_food_score, reverse=True)

        # Chọn số lượng món ăn ngẫu nhiên (2-4 món)
        num_dishes = random.randint(2, min(4, len(suitable_foods)))
        new_meal = random.sample(suitable_foods[:10], num_dishes)  # Chọn từ top 10 món phù hợp nhất

        # Điều chỉnh khối lượng các món ăn để đạt mục tiêu dinh dưỡng
        new_meal = self.adjust_food_quantities(new_meal, target)

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
        logger.info("Received optimization request")
        logger.info(f"Request data: {request.dict()}")
        # Kiểm tra dữ liệu đầu vào
        if not request.foods:
            raise HTTPException(
                status_code=400,
                detail="No foods provided in the request"
            )
        
        logger.info(f"Received optimization request with {len(request.foods)} foods")
        
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
        for food in request.foods:
            # Kiểm tra giá trị dinh dưỡng
            if any(v < 0 for v in [food.calories, food.protein, food.carbs, food.fat]):
                logger.warning(f"Invalid nutritional values for food: {food.name}")
                continue
            
            # Chỉ bỏ qua món ăn có hạn chế nghiêm trọng trùng với người dùng
            severe_restrictions = ['allergy', 'anaphylaxis']
            if any(r in severe_restrictions for r in request.user.nutritionProfile.restrictions) and \
               any(r in severe_restrictions for r in food.restrictions):
                continue
                
            filtered_foods.append(food)
        
        # Nếu không đủ món sau khi lọc, sử dụng tất cả món ăn có sẵn
        if len(filtered_foods) < 3:
            logger.warning(f"Not enough compatible foods after filtering ({len(filtered_foods)}). Using all available foods.")
            filtered_foods = request.foods
        
        meal_targets = request.mealTargets
        ga = GeneticAlgorithm(filtered_foods, request.user, meal_targets=meal_targets)
        best_menu = ga.evolve()
        
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
        
        if not best_menu:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate menu - algorithm did not converge"
            )
        
        # Lấy thống kê dinh dưỡng
        stats = ga.get_statistics(best_menu)
        if not stats:
            raise HTTPException(
                status_code=500,
                detail="Failed to calculate menu statistics"
            )
        
        return {
            "foods": best_menu,
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
        
        return {"foods": foods}
        
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
        menu_dict["createdAt"] = datetime.now()
        
        # Lưu vào collection 'saved_menus'
        result = await db.saved_menus.insert_one(menu_dict)
        
        return {
            "success": True,
            "message": "Menu đã được lưu thành công",
            "menuId": str(result.inserted_id)
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
    """Tối ưu hóa toàn bộ bữa ăn"""
    try:
        ga = GeneticAlgorithm(request.foods, request.user, meal_targets=[request.mealTarget])
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

@app.post('/api/similar-foods')
async def get_similar_foods(request: Request):
    data = await request.json()
    target = data['targetFood']
    tolerance = data.get('tolerance', 0.2)
    # Truy vấn database để lấy các món phù hợp
    foods = list(await db.foods.find({}))  # Lấy tất cả món ăn
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
        # Giả sử bạn dùng motor (async MongoDB driver)
        menu = await db.saved_menus.find_one({"userId": userId, "date": date})
        if not menu:
            return {"menu": None}
        menu["_id"] = str(menu["_id"])  # Chuyển ObjectId thành string nếu cần
        return {"menu": menu}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy thực đơn: {str(e)}")
from fastapi import Body, HTTPException

@app.post("/menu/complete-meal")
async def complete_meal(userId: str = Body(...), date: str = Body(...), mealName: str = Body(...)):
    try:
        menu = await db.saved_menus.find_one({"userId": userId, "date": date})
        if not menu:
            raise HTTPException(status_code=404, detail="Không tìm thấy thực đơn")
        updated_meals = []
        for meal in menu["meals"]:
            if meal["mealName"] == mealName:
                meal["completed"] = True
            updated_meals.append(meal)
        # Tính lại compliance
        total = len(updated_meals)
        completed = sum(1 for meal in updated_meals if meal.get("completed"))
        compliance = int(completed / total * 100) if total else 0
        await db.saved_menus.update_one(
            {"_id": menu["_id"]},
            {"$set": {"meals": updated_meals, "compliance": compliance}}
        )
        return {"success": True, "compliance": compliance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi cập nhật: {str(e)}")
# Main entry point
if __name__ == "__main__":
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
        workers=4  # Số lượng worker processes
    )
