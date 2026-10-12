import { useRef as useDemoLoginRef, useState as useDemoLoginState } from 'react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

function Login({ onLogin }) {
  const demoLoginLock = useDemoLoginRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useDemoLoginState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, demoLoginCredentials) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: (demoLoginCredentials?.email ?? email), password: (demoLoginCredentials?.password ?? password) });
      localStorage.setItem('token', data.token);
      onLogin(data.user);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade">
        <h1>AI Sales Trainer</h1>
        <p className="subtitle">Enterprise Sales Training Simulator</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button disabled={demoLoginBusy || loading} className="btn btn-secondary" onClick={async(event)=>{
 if(demoLoginLock.current||loading)return;
 demoLoginLock.current=true;setDemoLoginBusy(true);
 try{const {data:credentials}=await api.get('/auth/demo-credentials');if(!credentials?.email||!credentials?.password)throw Error('Demo credentials are unavailable.');setEmail(credentials.email);setPassword(credentials.password);await handleSubmit(event,credentials);}
 catch(err){toast.error(err.response?.data?.error||err.message||'Demo login failed.');}
 finally{demoLoginLock.current=false;setDemoLoginBusy(false);}
}} style={{ width: '100%' }}>
            Log In as Demo
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          <p>Demo: demo@demo.com / password123</p>
          <p style={{ marginTop: 8 }}>Per-seat pricing: $50-200/month</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
