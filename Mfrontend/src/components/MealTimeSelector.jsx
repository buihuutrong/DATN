import React from 'react';

const IDEAL_MEAL_TIMES = {
    2: [
        { name: 'Bữa trưa', key: 'lunch', range: '12:00 - 14:00', optimal: '12:30', desc: 'Nạp năng lượng chính giữa ngày.' },
        { name: 'Bữa tối', key: 'dinner', range: '18:00 - 20:00', optimal: '18:30', desc: 'Ăn nhẹ để duy trì năng lượng tối.' },
    ],
    3: [
        { name: 'Bữa sáng', key: 'breakfast', range: '7:00 - 9:00', optimal: '07:30', desc: 'Cung cấp năng lượng cho buổi sáng.' },
        { name: 'Bữa trưa', key: 'lunch', range: '12:00 - 14:00', optimal: '12:30', desc: 'Nạp năng lượng chính giữa ngày.' },
        { name: 'Bữa tối', key: 'dinner', range: '18:00 - 20:00', optimal: '18:30', desc: 'Ăn nhẹ để duy trì năng lượng tối.' },
    ],
    4: [
        { name: 'Bữa sáng', key: 'breakfast', range: '7:00 - 9:00', optimal: '07:30', desc: 'Cung cấp năng lượng cho buổi sáng.' },
        { name: 'Bữa trưa', key: 'lunch', range: '12:00 - 14:00', optimal: '12:30', desc: 'Nạp năng lượng chính giữa ngày.' },
        { name: 'Bữa tối', key: 'dinner', range: '18:00 - 20:00', optimal: '18:30', desc: 'Ăn nhẹ để duy trì năng lượng tối.' },
        { name: 'Bữa phụ tối', key: 'eveningSnack', range: '20:00 - 21:00', optimal: '20:00', desc: 'Ăn nhẹ buổi tối.' },
    ],
    5: [
        { name: 'Bữa sáng', key: 'breakfast', range: '7:00 - 9:00', optimal: '07:30', desc: 'Cung cấp năng lượng cho buổi sáng.' },
        { name: 'Bữa trưa', key: 'lunch', range: '12:00 - 14:00', optimal: '12:30', desc: 'Nạp năng lượng chính giữa ngày.' },
        { name: 'Bữa tối', key: 'dinner', range: '18:00 - 20:00', optimal: '18:30', desc: 'Ăn nhẹ để duy trì năng lượng tối.' },
        { name: 'Bữa phụ sáng', key: 'morningSnack', range: '9:30 - 10:30', optimal: '10:00', desc: 'Ăn nhẹ buổi sáng.' },
        { name: 'Bữa phụ tối', key: 'eveningSnack', range: '20:00 - 21:00', optimal: '20:00', desc: 'Ăn nhẹ buổi tối.' },
    ],
    6: [
        { name: 'Bữa sáng', key: 'breakfast', range: '7:00 - 9:00', optimal: '07:30', desc: 'Cung cấp năng lượng cho buổi sáng.' },
        { name: 'Bữa trưa', key: 'lunch', range: '12:00 - 14:00', optimal: '12:30', desc: 'Nạp năng lượng chính giữa ngày.' },
        { name: 'Bữa tối', key: 'dinner', range: '18:00 - 20:00', optimal: '18:30', desc: 'Ăn nhẹ để duy trì năng lượng tối.' },
        { name: 'Bữa phụ sáng', key: 'morningSnack', range: '9:30 - 10:30', optimal: '10:00', desc: 'Ăn nhẹ buổi sáng.' },
        { name: 'Bữa phụ chiều', key: 'afternoonSnack', range: '15:00 - 16:30', optimal: '16:00', desc: 'Ăn nhẹ buổi chiều.' },
        { name: 'Bữa phụ tối', key: 'eveningSnack', range: '20:00 - 21:00', optimal: '20:00', desc: 'Ăn nhẹ buổi tối.' },
    ],
    7: [
        { name: 'Bữa sáng', key: 'breakfast', range: '7:00 - 9:00', optimal: '07:30', desc: 'Khởi đầu ngày.' },
        { name: 'Bữa phụ sáng', key: 'morningSnack', range: '10:00 - 11:00', optimal: '10:30', desc: 'Duy trì năng lượng buổi sáng.' },
        { name: 'Bữa trưa', key: 'lunch', range: '12:00 - 14:00', optimal: '12:30', desc: 'Bữa chính giữa ngày.' },
        { name: 'Bữa phụ chiều', key: 'afternoonSnack', range: '15:00 - 17:00', optimal: '16:00', desc: 'Hỗ trợ buổi chiều.' },
        { name: 'Bữa phụ tối', key: 'eveningSnack', range: '18:30 - 19:30', optimal: '19:00', desc: 'Ăn nhẹ buổi tối.' },
        { name: 'Bữa tối muộn', key: 'lateDinner', range: '20:00 - 21:00', optimal: '20:30', desc: 'Ăn nhẹ trước khi ngủ (nếu cần).' },
        { name: 'Bữa phụ 1', key: 'snack1', range: '09:00 - 09:30', optimal: '09:15', desc: 'Bữa phụ linh hoạt 1.' },
        { name: 'Bữa phụ 2', key: 'snack2', range: '14:00 - 14:30', optimal: '14:15', desc: 'Bữa phụ linh hoạt 2.' },
        { name: 'Bữa phụ 3', key: 'snack3', range: '17:00 - 17:30', optimal: '17:15', desc: 'Bữa phụ linh hoạt 3.' },
    ],
};

const MealTimeSelector = ({ mealCount = 3, mealTimes, setMealTimes }) => {
    const idealMeals = IDEAL_MEAL_TIMES[mealCount] || IDEAL_MEAL_TIMES[3];

    const handleTimeChange = (key, value) => {
        setMealTimes((prev) => ({ ...prev, [key]: value }));
    };

    const fillIdealTimes = () => {
        const ideal = {};
        idealMeals.forEach(m => { ideal[m.key] = m.optimal; });
        setMealTimes(ideal);
    };

    return (
        <div
            className="max-w-2xl mx-auto my-8"
            style={{
                background: '#e6f9ec', // xanh nhạt
                border: '2px solid #22c55e',
                borderRadius: '2rem',
                boxShadow: '0 12px 40px 0 rgba(34,197,94,0.25), 0 2px 8px rgba(0,0,0,0.12)',
                padding: '40px',
                marginTop: '40px',
                marginBottom: '40px',
                position: 'relative',
                zIndex: 10
            }}
        >
            <div className="mb-6 p-4 bg-white rounded-xl border-l-4 border-green-400 shadow-md">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-green-800">Khung giờ ăn lý tưởng (tham khảo)</h3>
                    <button
                        type="button"
                        onClick={fillIdealTimes}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full hover:from-green-600 hover:to-green-700 transition duration-300 shadow-lg"
                    >
                        Dùng giờ tối ưu
                    </button>
                </div>
                <ul className="text-sm space-y-2 text-gray-700">
                    {idealMeals.map(m => (
                        <li key={m.key} className="flex items-center gap-2">
                            <span className="font-semibold text-green-700">{m.name}:</span>
                            <span>{m.range}</span>
                            <span className="text-green-600 font-semibold">(Tối ưu: {m.optimal})</span>
                            <span className="text-gray-500 ml-1">{m.desc}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-4 bg-green-100 rounded-xl border border-green-200 shadow-inner">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {idealMeals.map(m => (
                        <div key={m.key} className="flex flex-col gap-2 bg-white rounded-lg p-4 shadow border border-green-100">
                            <label className="text-base font-semibold text-green-700 mb-1">{m.name}</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={mealTimes[m.key] || ''}
                                    onChange={e => handleTimeChange(m.key, e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-green-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-center font-mono transition duration-200 bg-green-50"
                                />
                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-green-500 font-medium">
                                    Gợi ý: {m.optimal}
                                </span>
                            </div>
                        </div>
                    ))}
                </form>
            </div>
        </div>
    );
};

export default MealTimeSelector;