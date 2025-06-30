import React, { useEffect, useState } from 'react';
import { getUsers, getUserById, updateUser } from '../../services/api'; // Import hàm API và updateUser
import { Eye, Edit, Trash2 } from 'lucide-react'; // Import icons

const Users = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho modal xem chi tiết
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);

    // State cho modal chỉnh sửa
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'user', isVerified: false });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await getUsers();
                // Backend trả về { success: true, data: [...] }
                if (response.success && Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    // Xử lý trường hợp response không như mong đợi
                    setUsers([]);
                    setError('Định dạng dữ liệu người dùng không hợp lệ.');
                }
            } catch (err) {
                setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleViewUser = async (userId) => {
        setShowDetailModal(true);
        setDetailLoading(true);
        setDetailError(null);
        setSelectedUser(null);
        try {
            const response = await getUserById(userId);
            // Sửa lại logic cho phù hợp với response từ backend
            // Backend trả về { user: {...} }
            if (response && response.user) {
                setSelectedUser(response.user);
            } else {
                setDetailError('Không tìm thấy dữ liệu người dùng trong phản hồi.');
            }
        } catch (err) {
            setDetailError('Đã xảy ra lỗi. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    // Mở modal chỉnh sửa và điền dữ liệu
    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        });
        setShowEditModal(true);
        setEditError(null);
    };

    // Cập nhật state của form khi người dùng nhập liệu
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        // Chuyển đổi giá trị của select "isVerified" từ chuỗi về boolean
        if (name === 'isVerified') {
            setEditFormData(prev => ({ ...prev, isVerified: JSON.parse(value) }));
        } else {
            setEditFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Gửi dữ liệu cập nhật lên server
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        setEditLoading(true);
        setEditError(null);

        try {
            const response = await updateUser(editingUser._id, editFormData);
            if (response.success) {
                // Cập nhật lại danh sách users trong state
                setUsers(prevUsers => prevUsers.map(user =>
                    user._id === editingUser._id ? response.data : user
                ));
                setShowEditModal(false); // Đóng modal khi thành công
            } else {
                setEditError(response.message || 'Cập nhật thất bại.');
            }
        } catch (err) {
            setEditError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setEditLoading(false);
        }
    };

    const closeModal = () => {
        setShowDetailModal(false);
        setShowEditModal(false);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const tableHeaderStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #e5e7eb', color: '#4b5563' };
    const tableRowStyle = { borderBottom: '1px solid #f3f4f6' };
    const tableCellStyle = { padding: '12px 16px', verticalAlign: 'middle' };
    const actionButton = { background: 'none', border: 'none', cursor: 'pointer', padding: 6 };

    if (loading) {
        return <div className="foods-admin-container"><div className="modal-loading">Đang tải danh sách người dùng...</div></div>;
    }

    if (error) {
        return <div className="foods-admin-container"><div className="modal-error">{error}</div></div>;
    }

    return (
        <div className="foods-admin-container">
            <h2 className="foods-admin-title">Quản lý người dùng</h2>
            <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="foods-admin-search"
            />
            <div className="foods-admin-table-wrapper">
                <table className="foods-admin-table">
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Tên</th>
                            <th style={tableHeaderStyle}>Email</th>
                            <th style={tableHeaderStyle}>Vai trò</th>
                            <th style={tableHeaderStyle}>Xác thực Email</th>
                            <th style={tableHeaderStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user._id} style={tableRowStyle} className="foods-admin-row">
                                <td style={tableCellStyle}>{user.name}</td>
                                <td style={tableCellStyle}>{user.email}</td>
                                <td style={tableCellStyle}>
                                    <span className={user.role === 'admin' ? 'badge badge-rejected' : 'badge badge-approved'}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={tableCellStyle}>
                                    {user.isVerified ?
                                        <span className="badge badge-approved">Đã xác thực</span> :
                                        <span className="badge badge-pending">Chưa xác thực</span>}
                                </td>
                                <td style={{ ...tableCellStyle, display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleViewUser(user._id)} style={actionButton} title="Xem chi tiết"><Eye size={18} color="#0ea5e9" /></button>
                                    <button onClick={() => handleEditClick(user)} style={actionButton} title="Chỉnh sửa"><Edit size={18} color="#f59e42" /></button>
                                    <button style={actionButton} title="Xóa người dùng"><Trash2 size={18} color="#ef4444" /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ ...tableCellStyle, textAlign: 'center', padding: '20px' }}>
                                    Không tìm thấy người dùng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal xem chi tiết người dùng */}
            {showDetailModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content food-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={closeModal} title="Đóng">&times;</button>
                        <h2 className="modal-title">Chi tiết người dùng</h2>
                        {detailLoading && <div className="modal-loading">Đang tải...</div>}
                        {detailError && <div className="modal-error">{detailError}</div>}
                        {selectedUser && (
                            <div className="modal-info-grid">
                                <div className="modal-info-row"><span className="modal-label">ID:</span> <span className="modal-value">{selectedUser._id}</span></div>
                                <div className="modal-info-row"><span className="modal-label">Tên:</span> <span className="modal-value">{selectedUser.name}</span></div>
                                <div className="modal-info-row"><span className="modal-label">Email:</span> <span className="modal-value">{selectedUser.email}</span></div>
                                <div className="modal-info-row"><span className="modal-label">Vai trò:</span> <span className="modal-value">{selectedUser.role}</span></div>
                                <div className="modal-info-row">
                                    <span className="modal-label">Xác thực Email:</span>
                                    <span className="modal-value">{selectedUser.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                                </div>
                                <div className="modal-info-row"><span className="modal-label">Ngày tạo:</span> <span className="modal-value">{new Date(selectedUser.createdAt).toLocaleString()}</span></div>
                                <div className="modal-info-row"><span className="modal-label">Cập nhật cuối:</span> <span className="modal-value">{new Date(selectedUser.updatedAt).toLocaleString()}</span></div>
                                {selectedUser.nutritionProfile && (
                                    <div className="modal-info-row"><span className="modal-label">Hồ sơ dinh dưỡng:</span> <span className="modal-value">{selectedUser.nutritionProfile.isComplete ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</span></div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa người dùng */}
            {showEditModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content food-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={closeModal} title="Đóng">&times;</button>
                        <h2 className="modal-title">Chỉnh sửa người dùng</h2>
                        <form onSubmit={handleUpdateSubmit}>
                            {editError && <div className="modal-error">{editError}</div>}
                            <div className="modal-info-grid">
                                <div className="modal-info-row">
                                    <span className="modal-label">Họ tên:</span>
                                    <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="modal-value" required />
                                </div>
                                <div className="modal-info-row">
                                    <span className="modal-label">Email:</span>
                                    <input type="email" name="email" value={editFormData.email} onChange={handleEditFormChange} className="modal-value" required />
                                </div>
                                <div className="modal-info-row">
                                    <span className="modal-label">Vai trò:</span>
                                    <select name="role" value={editFormData.role} onChange={handleEditFormChange} className="modal-value">
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="modal-info-row">
                                    <span className="modal-label">Xác thực Email:</span>
                                    <select name="isVerified" value={editFormData.isVerified} onChange={handleEditFormChange} className="modal-value">
                                        <option value={true}>Đã xác thực</option>
                                        <option value={false}>Chưa xác thực</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
                                <button type="button" className="action-btn delete" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="action-btn approve" disabled={editLoading}>
                                    {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users; 