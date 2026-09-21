const API_BASE = localStorage.getItem('api_base') || 'http://localhost:8000';
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null; try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data?.detail || data?.message || `Request failed (${response.status})`);
  return data;
}
function requireAuth(){if(!localStorage.getItem('access_token')) location.href='login.html'}
function logout(){localStorage.removeItem('access_token');location.href='login.html'}
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function fmtDate(v){return v?new Date(v).toLocaleString('vi-VN',{dateStyle:'medium',timeStyle:'short'}):'Chưa đặt'}
function fmtMoney(v){return Number(v||0).toLocaleString('vi-VN')+' đ'}
function statusClass(s){s=String(s||'').toUpperCase();return s==='COMPLETED'?'success':s==='CANCELLED'?'danger':s==='ONGOING'?'warning':''}
function toast(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.style.display='block';setTimeout(()=>el.style.display='none',2200)}
