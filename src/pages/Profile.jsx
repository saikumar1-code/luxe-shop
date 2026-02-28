import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ full_name: '', phone: '', avatar_url: '' })
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile(data)
      else setProfile({ full_name: user.user_metadata?.name || '', phone: '', avatar_url: '' })
      setLoading(false)
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() })
    if (error) toast.error('Error saving', error.message)
    else toast.success('Profile updated!')
    setSaving(false)
  }

  if (!user) return (
    <div className="page container" style={{ textAlign:'center', paddingTop:'160px' }}>
      <h2>Please sign in</h2>
      <Link to="/login" className="btn btn-primary" style={{ marginTop:'20px', display:'inline-block' }}>Sign In</Link>
    </div>
  )

  return (
    <div className="page">
      <div className="container" style={{ paddingBottom:'60px' }}>
        <h1 className="page-heading gradient-text" style={{ padding:'32px 0 24px' }}>My Profile</h1>

        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:'32px', alignItems:'start' }}>
          {/* Sidebar */}
          <div className="glass" style={{ padding:'24px', borderRadius:'var(--radius-lg)' }}>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <div className="avatar" style={{ width:'72px', height:'72px', margin:'0 auto 12px', fontSize:'1.6rem' }}>
                {(profile.full_name || user.email)?.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight:600 }}>{profile.full_name || 'My Account'}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:'4px' }}>{user.email}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              {[
                { id:'profile', icon:'👤', label:'Profile Info' },
                { id:'security', icon:'🔒', label:'Security' },
              ].map(t => (
                <button key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`filter-opt ${activeTab === t.id ? 'active' : ''}`}
                  style={{ display:'flex', gap:'10px', alignItems:'center' }}
                >
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
              <div className="divider" />
              <Link to="/orders" className="filter-opt" style={{ display:'flex', gap:'10px', alignItems:'center', textDecoration:'none', color:'var(--text-secondary)' }}>
                <span>📦</span>My Orders
              </Link>
              <Link to="/wishlist" className="filter-opt" style={{ display:'flex', gap:'10px', alignItems:'center', textDecoration:'none', color:'var(--text-secondary)' }}>
                <span>♡</span>Wishlist
              </Link>
            </div>
          </div>

          {/* Main */}
          <div>
            {activeTab === 'profile' && (
              <div className="glass" style={{ padding:'32px', borderRadius:'var(--radius-lg)' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', marginBottom:'28px' }}>Personal Information</h3>
                {loading ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                    {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:'50px', borderRadius:'10px' }} />)}
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="input-glass" value={profile.full_name || ''} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="input-glass" value={user.email} disabled style={{ opacity:0.6, cursor:'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="input-glass" value={profile.phone || ''} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 0000" />
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf:'flex-start' }}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="glass" style={{ padding:'32px', borderRadius:'var(--radius-lg)' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', marginBottom:'28px' }}>Security Settings</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <div style={{ padding:'20px', background:'rgba(99,102,241,0.1)', borderRadius:'12px', border:'1px solid rgba(99,102,241,0.2)' }}>
                    <div style={{ fontWeight:600, marginBottom:'4px' }}>Email Address</div>
                    <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>{user.email}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="input-glass" type="password" placeholder="Enter new password" id="newpass" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input className="input-glass" type="password" placeholder="Confirm new password" id="confirmpass" />
                  </div>
                  <button className="btn btn-primary" style={{ alignSelf:'flex-start' }} onClick={async () => {
                    const np = document.getElementById('newpass').value
                    const cp = document.getElementById('confirmpass').value
                    if (!np) { toast.error('Enter new password'); return }
                    if (np !== cp) { toast.error('Passwords do not match'); return }
                    const { error } = await supabase.auth.updateUser({ password: np })
                    if (error) toast.error('Error', error.message)
                    else toast.success('Password updated!')
                  }}>
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
