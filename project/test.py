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