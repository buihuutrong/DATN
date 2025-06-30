import React, { useState } from 'react';
import { searchFoods } from '../services/api';
import './FoodSearch.css';

const BACKEND_URL = "http://localhost:8000";

const FoodSearch = ({ onFoodSelect }) => {
    const [searchParams, setSearchParams] = useState({
        query: '',
        preferences: [],
        restrictions: [],
        min_calories: '',
        max_calories: '',
        min_protein: '',
        max_protein: '',
        min_carbs: '',
        max_carbs: '',
        min_fat: '',
        max_fat: '',
        meal_time: '',
        season: '',
        weather: '',
        page: 1,
        limit: 20
    });

    const [searchResults, setSearchResults] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await searchFoods(searchParams);
            setSearchResults(response.foods);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError(err.response?.data?.detail || 'Có lỗi xảy ra khi tìm kiếm');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePageChange = (newPage) => {
        setSearchParams(prev => ({
            ...prev,
            page: newPage
        }));
        handleSearch();
    };

    return (
        <div className="food-search-container">
            <div className="search-form">
                <div className="search-input-group">
                    <input
                        type="text"
                        name="query"
                        value={searchParams.query}
                        onChange={handleInputChange}
                        placeholder="Tìm kiếm món ăn..."
                        className="search-input"
                    />
                    <button onClick={handleSearch} className="search-button">
                        Tìm kiếm
                    </button>
                </div>

                <div className="filters-grid">
                    <div className="filter-group">
                        <h4>Calories</h4>
                        <div className="range-inputs">
                            <input
                                type="number"
                                name="min_calories"
                                value={searchParams.min_calories}
                                onChange={handleInputChange}
                                placeholder="Min"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                name="max_calories"
                                value={searchParams.max_calories}
                                onChange={handleInputChange}
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h4>Protein (g)</h4>
                        <div className="range-inputs">
                            <input
                                type="number"
                                name="min_protein"
                                value={searchParams.min_protein}
                                onChange={handleInputChange}
                                placeholder="Min"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                name="max_protein"
                                value={searchParams.max_protein}
                                onChange={handleInputChange}
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h4>Carbs (g)</h4>
                        <div className="range-inputs">
                            <input
                                type="number"
                                name="min_carbs"
                                value={searchParams.min_carbs}
                                onChange={handleInputChange}
                                placeholder="Min"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                name="max_carbs"
                                value={searchParams.max_carbs}
                                onChange={handleInputChange}
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h4>Fat (g)</h4>
                        <div className="range-inputs">
                            <input
                                type="number"
                                name="min_fat"
                                value={searchParams.min_fat}
                                onChange={handleInputChange}
                                placeholder="Min"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                name="max_fat"
                                value={searchParams.max_fat}
                                onChange={handleInputChange}
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h4>Bữa ăn</h4>
                        <select
                            name="meal_time"
                            value={searchParams.meal_time}
                            onChange={handleInputChange}
                        >
                            <option value="">Tất cả</option>
                            <option value="breakfast">Bữa sáng</option>
                            <option value="lunch">Bữa trưa</option>
                            <option value="dinner">Bữa tối</option>
                            <option value="snack">Bữa phụ</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <h4>Mùa</h4>
                        <select
                            name="season"
                            value={searchParams.season}
                            onChange={handleInputChange}
                        >
                            <option value="">Tất cả</option>
                            <option value="spring">Xuân</option>
                            <option value="summer">Hạ</option>
                            <option value="autumn">Thu</option>
                            <option value="winter">Đông</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <h4>Thời tiết</h4>
                        <select
                            name="weather"
                            value={searchParams.weather}
                            onChange={handleInputChange}
                        >
                            <option value="">Tất cả</option>
                            <option value="sunny">Nắng</option>
                            <option value="rainy">Mưa</option>
                            <option value="cloudy">Nhiều mây</option>
                            <option value="cold">Lạnh</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-spinner">Đang tìm kiếm...</div>
            ) : (
                <div className="search-results">
                    {searchResults.map((food) => (
                        <div
                            key={food._id}
                            className="food-card"
                            onClick={() => onFoodSelect && onFoodSelect(food)}
                        >
                            <img
                                src={food.image?.startsWith('http') ? food.image : `${BACKEND_URL}${food.image}`}
                                alt={food.name}
                                className="food-image"
                            />
                            <div className="food-info">
                                <h3 className="food-name">{food.name}</h3>
                                <div className="food-macros">
                                    <span>{food.calories} kcal</span>
                                    <span>P: {food.protein}g</span>
                                    <span>C: {food.carbs}g</span>
                                    <span>F: {food.fat}g</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`page-button ${page === searchParams.page ? 'active' : ''}`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FoodSearch; 