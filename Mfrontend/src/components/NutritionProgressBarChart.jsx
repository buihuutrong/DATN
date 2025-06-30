import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const NutritionProgressBarChart = ({ completedMeals, dailyTarget }) => {
    // Tính tổng dinh dưỡng đã hoàn thành
    const total = completedMeals.reduce(
        (acc, meal) => {
            meal.foods.forEach(food => {
                acc.calories += food.calories || 0;
                acc.protein += food.protein || 0;
                acc.carbs += food.carbs || 0;
                acc.fat += food.fat || 0;
            });
            return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Chuẩn bị dữ liệu cho bar chart
    const data = [
        {
            name: 'Calories',
            'Đã đạt': Math.round(total.calories),
            'Mục tiêu': Math.round(dailyTarget.calories || 0),
            unit: 'kcal'
        },
        {
            name: 'Protein',
            'Đã đạt': Math.round(total.protein),
            'Mục tiêu': Math.round(dailyTarget.protein || 0),
            unit: 'g'
        },
        {
            name: 'Carbs',
            'Đã đạt': Math.round(total.carbs),
            'Mục tiêu': Math.round(dailyTarget.carbs || 0),
            unit: 'g'
        },
        {
            name: 'Fat',
            'Đã đạt': Math.round(total.fat),
            'Mục tiêu': Math.round(dailyTarget.fat || 0),
            unit: 'g'
        }
    ];

    return (
        <div style={{ width: '100%', height: 340, background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 24 }}>
            <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Tiến độ dinh dưỡng trong ngày</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value, name, props) => {
                        const unit = data?.[props?.dataIndex]?.unit || '';
                        return [`${value} ${unit}`, name];
                    }} />
                    <Legend />
                    <Bar dataKey="Mục tiêu" fill="#e0e0e0" barSize={18} />
                    <Bar dataKey="Đã đạt" fill="#4CAF50" barSize={18}>
                        <LabelList dataKey="Đã đạt" position="right" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default NutritionProgressBarChart; 