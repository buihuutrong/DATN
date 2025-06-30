import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { FaPercentage, FaFire } from 'react-icons/fa';
import { getComplianceHistory } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ComplianceDashboard = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        if (user?._id) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Calculate the correct date range (last 7 days ending yesterday)
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - 1);
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 6);

            setDateRange({ start: startDate, end: endDate });

            const endStr = endDate.toISOString().split('T')[0];
            const startStr = startDate.toISOString().split('T')[0];

            const historyData = await getComplianceHistory(user._id, startStr, endStr);
            setStats(historyData);

            // 2. Create a complete 7-day axis
            const fullDateRange = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                fullDateRange.push(new Date(d));
            }

            // 3. Map backend data to the full date axis
            const dataMap = new Map(
                historyData?.history?.map(item => [item.date.split('T')[0], item.compliance])
            );

            const completeData = fullDateRange.map(date => {
                const dateKey = date.toISOString().split('T')[0];
                return dataMap.has(dateKey) ? dataMap.get(dateKey) : 0;
            });

            // 4. Set the chart data
            setChartData({
                labels: fullDateRange.map(date =>
                    date.toLocaleDateString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric' })
                ),
                datasets: [
                    {
                        label: 'Mức độ tuân thủ',
                        data: completeData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        borderWidth: 2,
                        spanGaps: true, // Nối các điểm dữ liệu ngay cả khi có giá trị null
                    },
                ],
            });

        } catch (error) {
            console.error('Error fetching compliance data:', error);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { size: 14, weight: 'bold' } }
            },
            title: {
                display: false // The main title is already outside the chart
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(1) + '%';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: (value) => `${value}%` }
            }
        },
        elements: {
            line: { tension: 0.4 },
            point: { radius: 4, borderWidth: 2, backgroundColor: 'white' }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm" role="alert">
                    <strong className="font-medium">Lỗi!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Tiến độ ({formatDate(dateRange.start)} - {formatDate(dateRange.end)})
                </h1>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                <Line data={chartData} options={chartOptions} className="min-h-[400px]" />
            </div>
        </div>
    );
};

export default ComplianceDashboard;