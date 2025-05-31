import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const features = [
    { icon: 'fas fa-heartbeat', title: 'Tính TDEE & Macro', desc: 'Cá nhân hóa nhu cầu dinh dưỡng, tối ưu cho từng mục tiêu.' },
    { icon: 'fas fa-utensils', title: 'Gợi ý món ăn', desc: 'Đề xuất món phù hợp sở thích, sức khỏe, thời tiết.' },
    { icon: 'fas fa-list-alt', title: 'Thực đơn tối ưu GA', desc: 'Tối ưu thực đơn bằng AI/GA, đa dạng và khoa học.' },
    { icon: 'fas fa-robot', title: 'Tư vấn AI', desc: 'Hỏi đáp dinh dưỡng thông minh, hỗ trợ cá nhân hóa.' },
    { icon: 'fas fa-gift', title: 'Điểm thưởng', desc: 'Nhận thưởng khi hoàn thành mục tiêu, đổi ưu đãi.' },
    { icon: 'fas fa-shopping-cart', title: 'Danh sách mua sắm', desc: 'Tự động tạo danh sách nguyên liệu cần thiết.' },
];

const testimonials = [
    {
        name: 'Nguyễn Văn A',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        text: 'Tôi đã giảm 5kg nhờ thực đơn cá nhân hóa! Rất dễ sử dụng.',
        tag: 'Giảm cân',
    },
    {
        name: 'Trần Thị B',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        text: 'Hệ thống gợi ý món ăn rất tiện lợi, giúp tôi duy trì chế độ ăn.',
        tag: 'Tập gym',
    },
    {
        name: 'Lê Văn C',
        avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
        text: 'Tư vấn AI rất hữu ích, đặc biệt với người bị tiểu đường như tôi.',
        tag: 'Bệnh lý',
    },
];

export default function HomePage() {
    return (
        <div className="homepage">
            <header className="header">
                <div className="logo">
                    <i className="fas fa-leaf"></i> Smart Nutrition
                </div>
                <nav>
                    <Link to="/">Trang chủ</Link>
                    <Link to="/meals">Món ăn</Link>
                    <Link to="/menu">Thực đơn</Link>
                    <Link to="/profile">Hồ sơ</Link>
                    <Link to="/ai">Hỗ trợ AI</Link>
                    <Link to="/login" className="btn-login">Đăng nhập</Link>
                </nav>
            </header>
            <section className="hero">
                <div className="hero-content">
                    <h1>Dinh dưỡng thông minh cho cuộc sống lành mạnh</h1>
                    <p>Cá nhân hóa thực đơn, theo dõi sức khỏe, nhận tư vấn từ AI và chuyên gia.</p>
                    <Link to="/register" className="btn-cta">Bắt đầu ngay</Link>
                </div>
                <div className="hero-img">
                    <img src="/assets/anh/home.jpg" alt="Healthy food" />
                </div>
            </section>
            <section className="features">
                <h2>Tính năng thông minh</h2>
                <div className="feature-list">
                    {features.map((f, i) => (
                        <div className="feature-card" key={i}>
                            <i className={f.icon}></i>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className="testimonials">
                <h2>Người dùng nói gì về chúng tôi</h2>
                <div className="testimonial-list">
                    {testimonials.map((t, i) => (
                        <div className="testimonial-card" key={i}>
                            <img src={t.avatar} alt={t.name} />
                            <div>
                                <h4>{t.name}</h4>
                                <span>{t.tag}</span>
                            </div>
                            <p>"{t.text}"</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className="cta-section">
                <h2>Sẵn sàng để thay đổi lối sống của bạn?</h2>
                <Link to="/register" className="btn-cta">Đăng ký ngay</Link>
            </section>
            <footer className="footer">
                <div>
                    <span className="logo"><i className="fas fa-leaf"></i> Smart Nutrition</span>
                    <span>© 2025 Smart Nutrition. All rights reserved.</span>
                </div>
                <div className="footer-links">
                    <a href="#">Giới thiệu</a>
                    <a href="#">Liên hệ</a>
                    <a href="#">Chính sách bảo mật</a>
                </div>
            </footer>
        </div>
    );
}