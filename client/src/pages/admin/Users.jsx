import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/AdminLayout'
import Loader from '../../components/Loader'

const C = {
  bg: '#faf9f7',
  surface: '#f3f4f1',
  surfaceWhite: '#ffffff',
  primary: '#6c5c47',
  primaryDim: '#5f503c',
  onSurface: '#2f3331',
  onSurfaceVariant: '#5c605d',
  tertiary: '#645e5b',
  outlineVariant: '#afb3b0',
  secondaryContainer: '#ebe2d0',
  onSecondaryContainer: '#575144',
  error: '#9e422c',
  success: '#3b6e22',
  tableBorder: '#eef0ed'
}

const Users = () => {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Detailed selected user data for activity tracking modal
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetailLoading, setUserDetailLoading] = useState(false)
  const [userActivity, setUserActivity] = useState({ user: null, orders: [], history: { viewedProducts: [], searchHistory: [] } })

  const { token, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !token) {
      navigate('/login')
    }
    if (!authLoading && user?.role !== 'admin') {
      navigate('/')
    }
  }, [token, user, authLoading, navigate])

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const roleQuery = roleFilter !== 'all' ? `&role=${roleFilter}` : ''
      const searchQuery = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ''
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/users/admin/list?page=${currentPage}&limit=10${roleQuery}${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers(res.data.users || [])
      setTotal(res.data.total || 0)
      setPages(res.data.pages || 1)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch users list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchUsers()
  }, [token, currentPage, roleFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleToggleRole = async (targetUser) => {
    if (targetUser._id === user.id) {
      setError('You cannot revoke your own admin privileges.')
      return
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin'
    
    if (!window.confirm(`Are you sure you want to change ${targetUser.name}'s role to ${newRole}?`)) {
      return
    }

    setError('')
    setSuccessMsg('')
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/users/admin/${targetUser._id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccessMsg(`Successfully updated role for ${targetUser.name} to ${newRole}`)
      fetchUsers()
      
      // If we are currently inspecting this user's details, refresh it
      if (selectedUser && selectedUser._id === targetUser._id) {
        handleViewActivity(targetUser)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to update user role.')
    }
  }

  const handleDeleteUser = async (targetUser) => {
    if (targetUser._id === user.id) {
      setError('You cannot delete your own admin account.')
      return
    }

    if (!window.confirm(`⚠️ WARNING: Are you sure you want to delete user ${targetUser.name} (${targetUser.email})?\n\nThis will permanently delete their account, order history, wishlist, and interaction history. This action CANNOT be undone.`)) {
      return
    }

    setError('')
    setSuccessMsg('')
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/users/admin/${targetUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccessMsg(`Successfully deleted user ${targetUser.name} and related records.`)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to delete user.')
    }
  }

  const handleViewActivity = async (targetUser) => {
    setSelectedUser(targetUser)
    setUserDetailLoading(true)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/users/admin/${targetUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUserActivity(res.data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch user activity tracking records.')
    } finally {
      setUserDetailLoading(false)
    }
  }

  // Calculate stats for inspected user
  const totalUserSpent = userActivity.orders.reduce((acc, o) => acc + (o.orderStatus !== 'Cancelled' ? o.totalPrice : 0), 0)

  return (
    <AdminLayout>
      <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.tertiary, marginBottom: '8px' }}>
              Management Suite
            </p>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', color: C.onSurface }}>
              User Accounts
            </h1>
          </div>
          <div style={{ fontSize: '12px', color: C.onSurfaceVariant, backgroundColor: C.surfaceWhite, padding: '12px 20px', borderRadius: '4px', border: `1px solid ${C.surface}` }}>
            Total Registered Users: <strong style={{ color: C.primary }}>{total}</strong>
          </div>
        </div>

        {/* Action Feedbacks */}
        {error && (
          <div style={{ padding: '16px', backgroundColor: '#fe8b7020', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: C.error, margin: 0 }}>{error}</p>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error }} className="material-symbols-outlined">close</button>
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '16px', backgroundColor: '#e2f0d9', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: C.success, margin: 0 }}>{successMsg}</p>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.success }} className="material-symbols-outlined">close</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Main User List Card */}
          <div style={{ flex: selectedUser ? '1 1 55%' : '1 1 100%', backgroundColor: C.surfaceWhite, borderRadius: '4px', boxShadow: '0 4px 16px rgba(108,92,71,0.02)', border: `1px solid ${C.tableBorder}`, overflow: 'hidden', transition: 'all 0.3s' }}>
            
            {/* Filters Bar */}
            <div style={{ padding: '24px', backgroundColor: '#faf9f7', borderBottom: `1px solid ${C.tableBorder}`, display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '240px', border: `1px solid ${C.outlineVariant}40`, borderRadius: '2px', overflow: 'hidden', backgroundColor: '#fff' }}>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 16px', fontSize: '12px', fontFamily: 'Manrope' }}
                />
                <button type="submit" style={{ backgroundColor: C.primary, border: 'none', color: 'white', padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
                </button>
              </form>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant }}>Role Filter</label>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}
                  style={{ border: `1px solid ${C.outlineVariant}40`, padding: '10px 16px', borderRadius: '2px', fontSize: '12px', fontFamily: 'Manrope', backgroundColor: '#fff', outline: 'none', color: C.onSurface }}>
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '80px', textAlign: 'center' }}><Loader /></div>
            ) : users.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: C.outlineVariant, marginBottom: '16px' }}>group_off</span>
                <p style={{ fontSize: '14px', color: C.onSurfaceVariant }}>No users found matching requirements.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Manrope' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.tableBorder}`, backgroundColor: '#faf9f7' }}>
                      <th style={{ padding: '16px 24px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, fontWeight: 600 }}>User Profile</th>
                      <th style={{ padding: '16px 24px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, fontWeight: 600 }}>Role</th>
                      <th style={{ padding: '16px 24px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, fontWeight: 600 }}>Joined</th>
                      <th style={{ padding: '16px 24px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurfaceVariant, fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: `1px solid ${C.tableBorder}`, backgroundColor: selectedUser?._id === u._id ? `${C.surface}40` : 'transparent', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, fontSize: '12px', fontWeight: 600 }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: C.onSurface, margin: '0 0 2px 0' }}>{u.name}</p>
                              <p style={{ fontSize: '11px', color: C.onSurfaceVariant, margin: 0 }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ 
                            fontSize: '9px', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.1em', 
                            padding: '4px 10px', 
                            borderRadius: '99px', 
                            fontWeight: 600,
                            backgroundColor: u.role === 'admin' ? C.secondaryContainer : C.surface, 
                            color: u.role === 'admin' ? C.onSecondaryContainer : C.onSurfaceVariant 
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '12px', color: C.onSurfaceVariant }}>
                          {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleViewActivity(u)}
                              title="Inspect Activity & History"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', border: 'none', background: 'none', cursor: 'pointer', color: C.primary }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>analytics</span>
                            </button>
                            <button
                              onClick={() => handleToggleRole(u)}
                              title={`Toggle role to ${u.role === 'admin' ? 'user' : 'admin'}`}
                              disabled={u._id === user.id}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', border: 'none', background: 'none', cursor: 'pointer', color: C.onSurfaceVariant, opacity: u._id === user.id ? 0.3 : 1 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>swap_horiz</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Delete User Account"
                              disabled={u._id === user.id}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', border: 'none', background: 'none', cursor: 'pointer', color: C.error, opacity: u._id === user.id ? 0.3 : 1 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.tableBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{ padding: '8px 16px', border: `1px solid ${C.outlineVariant}30`, borderRadius: '2px', backgroundColor: '#fff', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: C.onSurface }}>
                  Previous
                </button>
                <span style={{ fontSize: '12px', color: C.onSurfaceVariant }}>
                  Page {currentPage} of {pages}
                </span>
                <button
                  disabled={currentPage === pages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pages))}
                  style={{ padding: '8px 16px', border: `1px solid ${C.outlineVariant}30`, borderRadius: '2px', backgroundColor: '#fff', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: currentPage === pages ? 'not-allowed' : 'pointer', color: C.onSurface }}>
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Activity / Tracking Detail Drawer Panel */}
          {selectedUser && (
            <div style={{ flex: '1 1 45%', backgroundColor: C.surfaceWhite, borderRadius: '4px', border: `1px solid ${C.tableBorder}`, boxShadow: '0 8px 32px rgba(108,92,71,0.06)', animation: 'slideIn 0.3s ease-out' }}>
              
              {/* Drawer Header */}
              <div style={{ padding: '24px', borderBottom: `1px solid ${C.tableBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#faf9f7' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.onSurface, margin: '0 0 4px 0' }}>
                    User Insight Profile
                  </h3>
                  <p style={{ fontSize: '11px', color: C.onSurfaceVariant, margin: 0 }}>
                    Track purchases & interactions
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVariant }}
                  className="material-symbols-outlined">
                  close
                </button>
              </div>

              {userDetailLoading ? (
                <div style={{ padding: '120px', textAlign: 'center' }}><Loader /></div>
              ) : (
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  
                  {/* User Profile summary */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {userActivity.user?.avatar ? (
                      <img src={userActivity.user.avatar} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, fontSize: '24px', fontWeight: 600 }}>
                        {userActivity.user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 300, color: C.onSurface, margin: '0 0 6px 0' }}>{userActivity.user?.name}</h2>
                      <p style={{ fontSize: '12px', color: C.onSurfaceVariant, margin: '0 0 8px 0' }}>{userActivity.user?.email}</p>
                      <span style={{ 
                        fontSize: '8px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em', 
                        padding: '2px 8px', 
                        borderRadius: '99px',
                        backgroundColor: userActivity.user?.role === 'admin' ? C.secondaryContainer : C.surface,
                        color: userActivity.user?.role === 'admin' ? C.onSecondaryContainer : C.onSurfaceVariant
                      }}>{userActivity.user?.role}</span>
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ backgroundColor: C.bg, padding: '16px', borderRadius: '2px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: C.onSurfaceVariant }}>Total Purchases</span>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: C.onSurface, margin: '4px 0 0 0' }}>
                        {userActivity.orders.filter(o => o.orderStatus !== 'Cancelled').length} orders
                      </p>
                    </div>
                    <div style={{ backgroundColor: C.bg, padding: '16px', borderRadius: '2px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: C.onSurfaceVariant }}>Total Spent</span>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: C.onSurface, margin: '4px 0 0 0' }}>
                        ₹{totalUserSpent.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurface, borderBottom: `1px solid ${C.tableBorder}`, paddingBottom: '8px', marginBottom: '12px' }}>
                      Stored Addresses
                    </h4>
                    {userActivity.user?.addresses && userActivity.user.addresses.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {userActivity.user.addresses.map((addr, idx) => (
                          <div key={idx} style={{ fontSize: '12px', color: C.onSurfaceVariant, padding: '10px', border: `1px solid ${C.tableBorder}`, borderRadius: '2px', position: 'relative' }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 500, color: C.onSurface }}>
                              Address #{idx + 1} {addr.isDefault && <span style={{ fontSize: '8px', textTransform: 'uppercase', padding: '1px 6px', backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer, marginLeft: '6px', borderRadius: '99px' }}>Default</span>}
                            </p>
                            <p style={{ margin: 0, fontWeight: 300, lineHeight: 1.5 }}>
                              {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: C.outlineVariant, fontStyle: 'italic', margin: 0 }}>No shipping addresses stored.</p>
                    )}
                  </div>

                  {/* Wishlist */}
                  <div>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurface, borderBottom: `1px solid ${C.tableBorder}`, paddingBottom: '8px', marginBottom: '12px' }}>
                      Wishlist Products ({userActivity.user?.wishlist?.length || 0})
                    </h4>
                    {userActivity.user?.wishlist && userActivity.user.wishlist.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                        {userActivity.user.wishlist.map(prod => (
                          <div key={prod._id} style={{ padding: '10px', border: `1px solid ${C.tableBorder}`, borderRadius: '2px', backgroundColor: C.bg }}>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: C.onSurface, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</p>
                            <p style={{ fontSize: '11px', color: C.primary, margin: 0 }}>₹{prod.price}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: C.outlineVariant, fontStyle: 'italic', margin: 0 }}>No items in wishlist.</p>
                    )}
                  </div>

                  {/* Viewed Products History */}
                  <div>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurface, borderBottom: `1px solid ${C.tableBorder}`, paddingBottom: '8px', marginBottom: '12px' }}>
                      Product Browsing Log
                    </h4>
                    {userActivity.history?.viewedProducts && userActivity.history.viewedProducts.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                        {userActivity.history.viewedProducts.filter(v => v.product).map((view, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '8px 4px', borderBottom: `1px dashed ${C.tableBorder}` }}>
                            <div>
                              <span style={{ fontWeight: 500, color: C.onSurface }}>{view.product.name}</span>
                              <span style={{ fontSize: '10px', color: C.onSurfaceVariant, marginLeft: '8px' }}>({view.product.category})</span>
                            </div>
                            <span style={{ fontSize: '10px', color: C.outlineVariant }}>
                              {new Date(view.viewedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: C.outlineVariant, fontStyle: 'italic', margin: 0 }}>No product views recorded yet.</p>
                    )}
                  </div>

                  {/* Search history query logs */}
                  <div>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurface, borderBottom: `1px solid ${C.tableBorder}`, paddingBottom: '8px', marginBottom: '12px' }}>
                      Search Queries Log
                    </h4>
                    {userActivity.history?.searchHistory && userActivity.history.searchHistory.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                        {userActivity.history.searchHistory.map((sh, idx) => (
                          <div key={idx} style={{ padding: '6px 12px', backgroundColor: C.surface, borderRadius: '2px', fontSize: '11px', color: C.onSurface, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>"{sh.query}"</span>
                            <span style={{ fontSize: '8px', color: C.onSurfaceVariant }}>{new Date(sh.searchedAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: C.outlineVariant, fontStyle: 'italic', margin: 0 }}>No searches recorded yet.</p>
                    )}
                  </div>

                  {/* Order History Detail list */}
                  <div>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.onSurface, borderBottom: `1px solid ${C.tableBorder}`, paddingBottom: '8px', marginBottom: '12px' }}>
                      Order History ({userActivity.orders.length})
                    </h4>
                    {userActivity.orders.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {userActivity.orders.map(order => (
                          <div key={order._id} style={{ padding: '12px', border: `1px solid ${C.tableBorder}`, borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: C.onSurface, margin: '0 0 4px 0' }}>
                                #{order._id.slice(-8).toUpperCase()}
                              </p>
                              <p style={{ fontSize: '11px', color: C.onSurfaceVariant, margin: 0 }}>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: '12px', fontWeight: 600, color: C.onSurface, margin: '0 0 4px 0' }}>
                                ₹{order.totalPrice}
                              </p>
                              <span style={{ 
                                fontSize: '8px', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em', 
                                padding: '2px 8px', 
                                borderRadius: '99px',
                                backgroundColor: order.orderStatus === 'Delivered' ? '#e2f0d9' : order.orderStatus === 'Cancelled' ? '#fe8b7020' : C.secondaryContainer,
                                color: order.orderStatus === 'Delivered' ? '#3b6e22' : order.orderStatus === 'Cancelled' ? '#9e422c' : C.onSecondaryContainer
                              }}>
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: C.outlineVariant, fontStyle: 'italic', margin: 0 }}>No orders placed by this user yet.</p>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  )
}

export default Users
