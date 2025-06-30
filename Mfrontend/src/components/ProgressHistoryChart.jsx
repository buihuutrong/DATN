import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Dot } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#fff', border: '1.5px solid #4CAF50', borderRadius: 12, padding: 12, boxShadow: '0 4px 16px rgba(44,175,80,0.13)', color: '#25624a', fontWeight: 600 }}>
                <div style={{ marginBottom: 4 }}>Ngày: <span style={{ color: '#25624a' }}>{label}</span></div>
                <div>Mức độ tuân thủ: <span style={{ color: '#4CAF50' }}>{payload[0].value}%</span></div>
            </div>
        );
    }
    return null;
};

const ProgressHistoryChart = ({ history = [], type = 'week', loading = false, onTypeChange }) => {
    // history: [{ date: '2024-06-03', compliance: 80 }, ...]
    return (
        <div style={{ width: '100%', minHeight: 380, background: '#fff', borderRadius: 20, boxShadow: '0 6px 32px rgba(44,62,80,0.10)', padding: 32, marginTop: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 18, gap: 18 }}>
                <h2 style={{ textAlign: 'center', margin: 0, fontWeight: 800, fontSize: 26, color: '#25624a', letterSpacing: 1 }}>Biểu đồ tiến độ tuân thủ</h2>
                <div style={{ display: 'flex', gap: 8, marginLeft: 24 }}>
                    <button
                        style={{
                            padding: '8px 24px',
                            borderRadius: 16,
                            border: '2px solid #4CAF50',
                            background: type === 'week' ? 'linear-gradient(90deg,#43e97b 0%,#38f9d7 100%)' : '#fff',
                            color: type === 'week' ? '#fff' : '#25624a',
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: type === 'week' ? 'default' : 'pointer',
                            boxShadow: type === 'week' ? '0 2px 12px #4caf5040' : 'none',
                            transition: 'all 0.18s',
                            outline: 'none',
                            borderColor: type === 'week' ? '#43e97b' : '#4CAF50',
                        }}
                        onClick={() => onTypeChange && onTypeChange('week')}
                        disabled={type === 'week'}
                    >
                        TUẦN
                    </button>
                    <button
                        style={{
                            padding: '8px 24px',
                            borderRadius: 16,
                            border: '2px solid #4CAF50',
                            background: type === 'month' ? 'linear-gradient(90deg,#43e97b 0%,#38f9d7 100%)' : '#fff',
                            color: type === 'month' ? '#fff' : '#25624a',
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: type === 'month' ? 'default' : 'pointer',
                            boxShadow: type === 'month' ? '0 2px 12px #4caf5040' : 'none',
                            transition: 'all 0.18s',
                            outline: 'none',
                            borderColor: type === 'month' ? '#43e97b' : '#4CAF50',
                        }}
                        onClick={() => onTypeChange && onTypeChange('month')}
                        disabled={type === 'month'}
                    >
                        THÁNG
                    </button>
                </div>
            </div>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto', width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #4CAF50', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ marginTop: 12, color: '#888' }}>Đang tải dữ liệu...</div>
                </div>
            ) : history && history.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={history} margin={{ top: 16, right: 32, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontWeight: 600, fontSize: 14, fill: '#25624a' }} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontWeight: 600, fontSize: 14, fill: '#25624a' }} label={{ value: '%', position: 'insideLeft', offset: 0, fill: '#25624a', fontWeight: 700 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 700, color: '#25624a' }} />
                        <Line
                            type="monotone"
                            dataKey="compliance"
                            name="Mức độ tuân thủ"
                            stroke="#43e97b"
                            strokeWidth={3.5}
                            dot={{ r: 7, fill: '#fff', stroke: '#43e97b', strokeWidth: 3, filter: 'drop-shadow(0 2px 8px #43e97b55)' }}
                            activeDot={{ r: 10, fill: '#38f9d7', stroke: '#43e97b', strokeWidth: 4, filter: 'drop-shadow(0 2px 12px #38f9d7aa)' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ textAlign: 'center', color: '#888', fontWeight: 600, fontSize: 18, padding: '48px 0' }}>
                    Không có dữ liệu để hiển thị biểu đồ.
                </div>
            )}
        </div>
    );
};

export default ProgressHistoryChart; 