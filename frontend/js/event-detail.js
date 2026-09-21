let eventId = null;
let eventData = null;

async function loadDetail() {
  requireAuth();
  eventId = new URLSearchParams(location.search).get('id');
  if (!eventId) return location.href = 'dashboard.html';
  try {
    eventData = await apiRequest(`/api/events/${eventId}/detail`);
    renderHero(); renderStats(); renderDepartments(); renderTasks(); renderTimeline();
    await loadReport();
  } catch (e) { document.getElementById('error').textContent = e.message; }
}

function renderHero() {
  document.getElementById('eventName').textContent = eventData.name;
  document.getElementById('eventType').textContent = eventData.event_type || 'Event';
  document.getElementById('eventDescription').textContent = eventData.description || 'Chưa có mô tả';
  document.getElementById('heroMeta').innerHTML = `<span class="meta-item">◷ ${fmtDate(eventData.event_date)}</span><span class="meta-item">⌖ ${esc(eventData.location || 'Chưa đặt')}</span><span class="meta-item">♙ ${eventData.attendees || 0} khách</span><span class="meta-item">${fmtMoney(eventData.budget)}</span>`;
  document.getElementById('statusBadge').textContent = eventData.status || '-';
}
function renderStats() {
  const total = eventData.tasks?.length || 0;
  const done = eventData.tasks?.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length || 0;
  document.getElementById('statTasks').textContent = total;
  document.getElementById('statDone').textContent = done;
  document.getElementById('statDept').textContent = eventData.departments?.length || 0;
  document.getElementById('statTimeline').textContent = eventData.timeline_items?.length || 0;
}
function renderDepartments() {
  const b = document.getElementById('departments');
  b.innerHTML = eventData.departments?.length ? eventData.departments.map(d => `<div class="list-item"><div><strong>${esc(d.name)}</strong><div class="muted">${esc(d.description || 'Chưa có mô tả')}</div></div><button class="btn btn-sm btn-danger" onclick="deleteDepartment(${d.id})">Xóa</button></div>`).join('') : '<div class="empty">Chưa có department.</div>';
}
function renderTasks() {
  const b = document.getElementById('tasks');
  b.innerHTML = eventData.tasks?.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Task</th><th>Priority</th><th>Status</th><th>Progress</th><th></th></tr></thead><tbody>${eventData.tasks.map(t => `<tr><td><strong>${esc(t.title)}</strong><div class="muted">${esc(t.description || '')}</div></td><td>${esc(t.priority || '-')}</td><td><span class="badge ${statusClass(t.status)}">${esc(t.status || '-')}</span></td><td style="min-width:130px"><div class="progress"><span style="width:${Math.min(100, Math.max(0, t.progress || 0))}%"></span></div><small class="muted">${t.progress || 0}%</small></td><td><button class="btn btn-sm btn-danger" onclick="deleteTask(${t.id})">Xóa</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Chưa có task.</div>';
}
function renderTimeline() {
  const b = document.getElementById('timeline');
  const items = [...(eventData.timeline_items || [])].sort((a,b) => new Date(a.start_time) - new Date(b.start_time));
  b.innerHTML = items.length ? `<div class="timeline">${items.map(t => `<div class="timeline-item"><span class="timeline-dot"></span><strong>${esc(t.title)}</strong><div class="muted">${fmtDate(t.start_time)} → ${fmtDate(t.end_time)}</div><button class="btn btn-sm btn-danger" style="margin-top:8px" onclick="deleteTimeline(${t.id})">Xóa</button></div>`).join('')}</div>` : '<div class="empty">Chưa có timeline.</div>';
}

function openModal(type) {
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('modalTitle').textContent = type === 'department' ? 'Thêm department' : type === 'task' ? 'Thêm task' : type === 'timeline' ? 'Thêm timeline' : 'Chỉnh sửa event';
  const fields = {
    department: `<div class="field"><label>Tên department</label><input id="mName" required></div><div class="field" style="margin-top:14px"><label>Mô tả</label><textarea id="mDesc" rows="3"></textarea></div>`,
    task: `<div class="field"><label>Tên task</label><input id="mName" required></div><div class="field" style="margin-top:14px"><label>Mô tả</label><textarea id="mDesc" rows="3"></textarea></div><div class="form-grid" style="margin-top:14px"><div class="field"><label>Priority</label><select id="mPriority"><option>LOW</option><option selected>MEDIUM</option><option>HIGH</option><option>URGENT</option></select></div><div class="field"><label>Status</label><select id="mStatus"><option selected>TODO</option><option>IN_PROGRESS</option><option>DONE</option></select></div></div><div class="field" style="margin-top:14px"><label>Progress (%)</label><input id="mProgress" type="number" min="0" max="100" value="0"></div>`,
    timeline: `<div class="field"><label>Tiêu đề</label><input id="mName" required></div><div class="form-grid" style="margin-top:14px"><div class="field"><label>Bắt đầu</label><input id="mStart" type="datetime-local" required></div><div class="field"><label>Kết thúc</label><input id="mEnd" type="datetime-local" required></div></div>`,
    event: `<div class="field"><label>Tên event</label><input id="mEventName" required value="${esc(eventData.name)}"></div><div class="form-grid" style="margin-top:14px"><div class="field"><label>Loại</label><input id="mEventType" value="${esc(eventData.event_type || '')}"></div><div class="field"><label>Địa điểm</label><input id="mLocation" value="${esc(eventData.location || '')}"></div><div class="field"><label>Ngày tổ chức</label><input id="mEventDate" type="datetime-local" value="${toLocalInput(eventData.event_date)}"></div><div class="field"><label>Số người</label><input id="mAttendees" type="number" min="0" value="${eventData.attendees || 0}"></div><div class="field"><label>Ngân sách</label><input id="mBudget" type="number" min="0" step="0.01" value="${eventData.budget || 0}"></div><div class="field"><label>Trạng thái</label><select id="mEventStatus"><option ${eventData.status==='PLANNING'?'selected':''}>PLANNING</option><option ${eventData.status==='ONGOING'?'selected':''}>ONGOING</option><option ${eventData.status==='COMPLETED'?'selected':''}>COMPLETED</option><option ${eventData.status==='CANCELLED'?'selected':''}>CANCELLED</option></select></div></div><div class="field" style="margin-top:14px"><label>Mô tả</label><textarea id="mEventDesc" rows="4">${esc(eventData.description || '')}</textarea></div>`
  };
  document.getElementById('modalBody').innerHTML = fields[type];
  document.getElementById('modalSave').onclick = () => saveModal(type);
}
function toLocalInput(v) { if (!v) return ''; const d = new Date(v); const p = n => String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }
function closeModal() { document.getElementById('modal').style.display = 'none'; }

async function saveModal(type) {
  try {
    let path, body;
    if (type === 'department') { path='/api/departments/'; body={event_id:Number(eventId),name:mName.value.trim(),description:mDesc.value.trim()||null}; }
    else if (type === 'task') { path='/api/tasks/'; body={event_id:Number(eventId),title:mName.value.trim(),description:mDesc.value.trim()||null,priority:mPriority.value,status:mStatus.value,progress:Number(mProgress.value||0)}; }
    else if (type === 'timeline') { path='/api/timeline/'; body={event_id:Number(eventId),title:mName.value.trim(),start_time:new Date(mStart.value).toISOString(),end_time:new Date(mEnd.value).toISOString()}; }
    else { path=`/api/events/${eventId}`; body={name:mEventName.value.trim(),event_type:mEventType.value.trim()||null,location:mLocation.value.trim()||null,event_date:mEventDate.value?new Date(mEventDate.value).toISOString():null,attendees:Number(mAttendees.value||0),budget:Number(mBudget.value||0),status:mEventStatus.value,description:mEventDesc.value.trim()||null}; }
    await apiRequest(path,{method:type==='event'?'PUT':'POST',body:JSON.stringify(body)});
    closeModal(); toast('Đã lưu'); loadDetail();
  } catch(e) { toast(e.message); }
}

async function loadReport() {
  const box = document.getElementById('reportContent');
  try {
    const r = await apiRequest(`/api/reports/event/${eventId}`);
    box.innerHTML = `<div class="grid grid-2"><div><strong>Summary</strong><p>${esc(r.summary||'-')}</p></div><div><strong>Achievements</strong><p>${esc(r.achievements||'-')}</p></div><div><strong>Problems</strong><p>${esc(r.problems||'-')}</p></div><div><strong>Recommendations</strong><p>${esc(r.recommendations||'-')}</p></div></div><div class="actions" style="margin-top:18px"><button class="btn btn-primary btn-sm" onclick="openReportModal()">Chỉnh sửa report</button></div>`;
  } catch(_) {
    box.innerHTML = `<div class="empty">Chưa có report.</div><div class="actions" style="margin-top:14px"><button class="btn btn-primary btn-sm" onclick="openReportModal()">+ Tạo report</button></div>`;
  }
}
function openReportModal() {
  document.getElementById('modal').style.display='flex'; document.getElementById('modalTitle').textContent='Event report';
  document.getElementById('modalBody').innerHTML=`<div class="field"><label>Summary</label><textarea id="rSummary" rows="3"></textarea></div><div class="field" style="margin-top:12px"><label>Achievements</label><textarea id="rAchievements" rows="3"></textarea></div><div class="field" style="margin-top:12px"><label>Problems</label><textarea id="rProblems" rows="3"></textarea></div><div class="field" style="margin-top:12px"><label>Recommendations</label><textarea id="rRecommendations" rows="3"></textarea></div>`;
  document.getElementById('modalSave').onclick = saveReport;
}
async function saveReport() {
  try {
    const body={summary:rSummary.value.trim()||null,achievements:rAchievements.value.trim()||null,problems:rProblems.value.trim()||null,recommendations:rRecommendations.value.trim()||null};
    try { await apiRequest(`/api/reports/event/${eventId}`,{method:'PUT',body:JSON.stringify(body)}); }
    catch(e) { if (!String(e.message).toLowerCase().includes('not found')) throw e; await apiRequest('/api/reports/',{method:'POST',body:JSON.stringify({event_id:Number(eventId),...body})}); }
    closeModal(); toast('Đã lưu report'); loadReport();
  } catch(e) { toast(e.message); }
}
async function deleteDepartment(id){if(!confirm('Xóa department này?'))return;try{await apiRequest(`/api/departments/${id}`,{method:'DELETE'});loadDetail()}catch(e){toast(e.message)}}
async function deleteTask(id){if(!confirm('Xóa task này?'))return;try{await apiRequest(`/api/tasks/${id}`,{method:'DELETE'});loadDetail()}catch(e){toast(e.message)}}
async function deleteTimeline(id){if(!confirm('Xóa timeline này?'))return;try{await apiRequest(`/api/timeline/${id}`,{method:'DELETE'});loadDetail()}catch(e){toast(e.message)}}
async function deleteEvent(){if(!confirm('Xóa toàn bộ event này?'))return;try{await apiRequest(`/api/events/${eventId}`,{method:'DELETE'});location.href='dashboard.html'}catch(e){toast(e.message)}}
