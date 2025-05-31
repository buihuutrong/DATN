import React, { useState } from 'react';
import './CommunitySection.css';

const CommunitySection = ({ user }) => {
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: 'Nguyễn Văn A',
            avatar: 'https://via.placeholder.com/40',
            content: 'Chia sẻ công thức salad rau củ healthy cho bữa trưa!',
            likes: 15,
            comments: 5,
            timestamp: '2 giờ trước'
        },
        {
            id: 2,
            author: 'Trần Thị B',
            avatar: 'https://via.placeholder.com/40',
            content: 'Mình vừa đạt được mục tiêu giảm 5kg trong 2 tháng. Cảm ơn mọi người đã động viên!',
            likes: 30,
            comments: 8,
            timestamp: '5 giờ trước'
        }
    ]);

    const [newPost, setNewPost] = useState('');

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const post = {
            id: Date.now(),
            author: user?.name || 'Người dùng',
            avatar: 'https://via.placeholder.com/40',
            content: newPost,
            likes: 0,
            comments: 0,
            timestamp: 'Vừa xong'
        };

        setPosts(prev => [post, ...prev]);
        setNewPost('');
    };

    const handleLike = (postId) => {
        setPosts(prev => prev.map(post =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ));
    };

    return (
        <div className="community-section">
            <div className="section-header">
                <h2>Cộng đồng dinh dưỡng</h2>
            </div>

            <form className="post-form" onSubmit={handlePostSubmit}>
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    rows="3"
                />
                <button type="submit" className="btn-primary">
                    <i className="fas fa-paper-plane"></i> Đăng bài
                </button>
            </form>

            <div className="posts-list">
                {posts.map(post => (
                    <div key={post.id} className="post-card">
                        <div className="post-header">
                            <img src={post.avatar} alt={post.author} className="author-avatar" />
                            <div className="post-info">
                                <h3>{post.author}</h3>
                                <span className="timestamp">{post.timestamp}</span>
                            </div>
                        </div>
                        <p className="post-content">{post.content}</p>
                        <div className="post-actions">
                            <button
                                className="action-btn"
                                onClick={() => handleLike(post.id)}
                            >
                                <i className="fas fa-heart"></i> {post.likes}
                            </button>
                            <button className="action-btn">
                                <i className="fas fa-comment"></i> {post.comments}
                            </button>
                            <button className="action-btn">
                                <i className="fas fa-share"></i> Chia sẻ
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="community-features">
                <h3>Tính năng sắp tới</h3>
                <div className="feature-grid">
                    <div className="feature-card">
                        <i className="fas fa-users"></i>
                        <h4>Nhóm dinh dưỡng</h4>
                        <p>Tham gia các nhóm theo mục tiêu và sở thích</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-trophy"></i>
                        <h4>Thử thách</h4>
                        <p>Tham gia các thử thách dinh dưỡng hàng tuần</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-star"></i>
                        <h4>Chuyên gia</h4>
                        <p>Tương tác với các chuyên gia dinh dưỡng</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunitySection; 