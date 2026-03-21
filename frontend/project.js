/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function getProjectId() {
    return new URLSearchParams(window.location.search).get('id');
}

function getToken() {
    return localStorage.getItem('token');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

function getCurrentUserId() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id.id;
    } catch {
        return null;
    }
}

let toastTimer = null;
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast hidden'; }, 3000);
}

function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ─────────────────────────────────────────
   API — Project & Tasks
───────────────────────────────────────── */
async function getProjectById() {
    const res = await fetch(`/project?id=${getProjectId()}`, {
        method: 'GET', headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to load project');
    return res.json();
}

async function fetchTasks() {
    const res = await fetch(`/tasks?id=${getProjectId()}`, {
        method: 'GET', headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to load tasks');
    return res.json();
}

async function createTask(name, description) {
    const res = await fetch(`/tasks?id=${getProjectId()}`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ name, description })
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
}

async function deleteTask(task_id) {
    const res = await fetch(`/tasks?id=${getProjectId()}`, {
        method: 'DELETE', headers: authHeaders(),
        body: JSON.stringify({ task_id })
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
}

async function updateTaskStatus(task_id, status) {
    const res = await fetch(`/tasks?id=${getProjectId()}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ task_id, status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
}

async function fetchMembers(task_id) {
    const res = await fetch(`/members?task_id=${task_id}`, {
        method: 'GET', headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to load members');
    return res.json();
}

async function deleteMember(task_id, member_id) {
    const res = await fetch(`/member`, {
        method: 'DELETE', headers: authHeaders(),
        body: JSON.stringify({ task_id, member_id })
    });
    if (!res.ok) throw new Error('Failed to remove member');
    return res.json();
}

/* ─────────────────────────────────────────
   API — Invites & Join Requests
───────────────────────────────────────── */
async function sendInvite(username) {
    const res = await fetch('/invite', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ username, project_id: getProjectId() })
    });
    return res.json();
}

async function fetchJoinRequests() {
    const res = await fetch(`/requests?project_id=${getProjectId()}`, {
        method: 'GET', headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to load requests');
    return res.json();
}

async function respondJoinRequest(user_id, status) {
    const res = await fetch('/requests/respond', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ user_id, project_id: getProjectId(), status })
    });
    return res.json();
}

/* ─────────────────────────────────────────
   Render — Tasks
───────────────────────────────────────── */
function getStatusClass(status) {
    if (!status) return 'status-pending';
    const s = status.toLowerCase().replace(' ', '_');
    if (s === 'done')        return 'status-done';
    if (s === 'in_progress') return 'status-in_progress';
    return 'status-pending';
}

function renderTasks(tasks) {
    const grid    = document.getElementById('tasks-grid');
    const countEl = document.getElementById('task-count');

    if (!tasks || tasks.length === 0) {
        countEl.textContent = '0 tasks';
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No tasks yet</h3>
                <p>Click "+ New Task" to get started</p>
            </div>`;
        return;
    }

    countEl.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
    grid.innerHTML = tasks.map((task, i) => `
        <div class="task-card" style="animation-delay:${i * 0.05}s" data-id="${task.id}">
            <div class="task-card-top">
                <span class="task-name">${escHtml(task.title)}</span>
                <span class="status-badge ${getStatusClass(task.satus)}">${task.satus || 'pending'}</span>
            </div>
            <p class="task-desc">${escHtml(task.description || '—')}</p>
            <select class="status-select" data-task-id="${task.id}" onchange="handleStatusChange(this)">
                <option value="pending"     ${(!task.satus || task.satus === 'pending')      ? 'selected' : ''}>Pending</option>
                <option value="in_progress" ${task.satus === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="done"        ${task.satus === 'done'        ? 'selected' : ''}>Done</option>
            </select>
            <div class="task-card-actions">
                <button class="btn-members" onclick="handleViewMembers(${task.id})">👥 Members</button>
                <button class="btn-delete-task" onclick="handleDeleteClick(${task.id})" title="Delete task">🗑</button>
            </div>
        </div>
    `).join('');
}

/* ─────────────────────────────────────────
   Render — Members
───────────────────────────────────────── */
function renderMembers(members, task_id) {
    const list = document.getElementById('members-list');
    if (!members || members.length === 0) {
        list.innerHTML = '<li class="members-empty">No members assigned to this task.</li>';
        return;
    }
    list.innerHTML = members.map(m => `
        <li class="member-item">
            <div class="member-info">
                <span class="member-name">${escHtml(m.name || m.username || 'User')}</span>
                <span class="member-email">${escHtml(m.email || '')}</span>
            </div>
            <button class="btn-remove-member" onclick="handleRemoveMember(${task_id}, ${m.id}, this)">Remove</button>
        </li>
    `).join('');
}

/* ─────────────────────────────────────────
   Render — Join Requests
───────────────────────────────────────── */
function renderJoinRequests(requests) {
    const list  = document.getElementById('requests-list');
    const badge = document.getElementById('requests-badge');

    if (!requests || requests.length === 0) {
        badge.classList.add('hidden');
        list.innerHTML = '<li class="requests-empty">No pending join requests.</li>';
        return;
    }

    badge.textContent = requests.length;
    badge.classList.remove('hidden');

    list.innerHTML = requests.map(r => `
        <li class="request-item" id="req-${r.user_id}">
            <div class="member-info">
                <span class="member-name">${escHtml(r.name)}</span>
                <span class="member-email">@${escHtml(r.username)}</span>
            </div>
            <div class="request-actions">
                <button class="btn-accept" onclick="handleRespondRequest(${r.user_id}, 'accepted', this)">Accept</button>
                <button class="btn-reject" onclick="handleRespondRequest(${r.user_id}, 'rejected', this)">Reject</button>
            </div>
        </li>
    `).join('');
}

/* ─────────────────────────────────────────
   Owner Check
───────────────────────────────────────── */
function checkOwnerAndShowButtons(project) {
    const p         = Array.isArray(project) ? project[0] : project;
    const currentId = getCurrentUserId();
    if (currentId && String(p.owner_id) === String(currentId)) {
        document.getElementById('invite-btn').classList.remove('hidden');
        document.getElementById('join-requests-btn').classList.remove('hidden');
        fetchJoinRequests().then(reqs => {
            const badge = document.getElementById('requests-badge');
            if (reqs && reqs.length > 0) {
                badge.textContent = reqs.length;
                badge.classList.remove('hidden');
            }
        }).catch(() => {});
    }
}

/* ─────────────────────────────────────────
   Event Handlers
───────────────────────────────────────── */
async function handleStatusChange(select) {
    const task_id = select.dataset.taskId;
    const status  = select.value;
    select.disabled = true;
    try {
        await updateTaskStatus(task_id, status);
        const card  = select.closest('.task-card');
        const badge = card.querySelector('.status-badge');
        badge.className  = `status-badge ${getStatusClass(status)}`;
        badge.textContent = status;
        showToast('Status updated');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        select.disabled = false;
    }
}

let pendingDeleteId = null;
function handleDeleteClick(task_id) {
    pendingDeleteId = task_id;
    openModal('delete-modal');
}

async function handleViewMembers(task_id) {
    document.getElementById('members-list').innerHTML =
        '<li style="color:var(--text-muted);padding:12px">Loading...</li>';
    openModal('members-modal');
    try {
        const members = await fetchMembers(task_id);
        renderMembers(members, task_id);
    } catch (err) {
        document.getElementById('members-list').innerHTML =
            `<li style="color:var(--danger);padding:12px">${err.message}</li>`;
    }
}

async function handleRemoveMember(task_id, member_id, btn) {
    btn.disabled    = true;
    btn.textContent = '...';
    try {
        await deleteMember(task_id, member_id);
        btn.closest('.member-item').remove();
        showToast('Member removed');
        if (document.getElementById('members-list').children.length === 0) {
            document.getElementById('members-list').innerHTML =
                '<li class="members-empty">No members assigned.</li>';
        }
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled    = false;
        btn.textContent = 'Remove';
    }
}

async function handleRespondRequest(user_id, status, btn) {
    btn.disabled = true;
    try {
        const res = await respondJoinRequest(user_id, status);
        if (res.error) { showToast(res.error, 'error'); btn.disabled = false; return; }
        // remove row
        document.getElementById(`req-${user_id}`)?.remove();
        showToast(status === 'accepted' ? 'Member added to project!' : 'Request rejected');
        // update badge
        const remaining = document.getElementById('requests-list').children.length;
        const badge     = document.getElementById('requests-badge');
        if (remaining === 0) {
            document.getElementById('requests-list').innerHTML =
                '<li class="requests-empty">No pending join requests.</li>';
            badge.classList.add('hidden');
        } else {
            badge.textContent = remaining;
        }
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
    }
}

/* ─────────────────────────────────────────
   Init
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    (async () => {
        try {
            const projectData = await getProjectById();
            const p = Array.isArray(projectData) ? projectData[0] : projectData;
            document.getElementById('nav-project-name').textContent = p.name || 'Project';
            document.getElementById('nav-project-desc').textContent = p.description || '';
            checkOwnerAndShowButtons(projectData);
        } catch (err) {
            console.error('Project load error:', err);
        }

        try {
            const tasks = await fetchTasks();
            renderTasks(tasks);
        } catch (err) {
            document.getElementById('tasks-grid').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Could not load tasks</h3>
                    <p>${err.message}</p>
                </div>`;
            document.getElementById('task-count').textContent = 'Error';
        }
    })();

    document.getElementById('add-task-btn').addEventListener('click', () => openModal('add-modal'));
    document.getElementById('close-add-modal').addEventListener('click', () => closeModal('add-modal'));
    document.getElementById('cancel-add-modal').addEventListener('click', () => closeModal('add-modal'));

    document.getElementById('confirm-add-task').addEventListener('click', async () => {
        const name = document.getElementById('task-name-input').value.trim();
        const desc = document.getElementById('task-desc-input').value.trim();
        if (!name) { showToast('Task name is required', 'error'); return; }
        const btn = document.getElementById('confirm-add-task');
        btn.disabled = true; btn.textContent = 'Creating...';
        try {
            await createTask(name, desc);
            closeModal('add-modal');
            document.getElementById('task-name-input').value = '';
            document.getElementById('task-desc-input').value = '';
            showToast('Task created!');
            renderTasks(await fetchTasks());
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false; btn.textContent = 'Create Task';
        }
    });

    document.getElementById('close-delete-modal').addEventListener('click', () => closeModal('delete-modal'));
    document.getElementById('cancel-delete-modal').addEventListener('click', () => closeModal('delete-modal'));

    document.getElementById('confirm-delete-task').addEventListener('click', async () => {
        if (!pendingDeleteId) return;
        const btn = document.getElementById('confirm-delete-task');
        btn.disabled = true; btn.textContent = 'Deleting...';
        try {
            await deleteTask(pendingDeleteId);
            closeModal('delete-modal');
            showToast('Task deleted');
            renderTasks(await fetchTasks());
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false; btn.textContent = 'Delete';
            pendingDeleteId = null;
        }
    });

    document.getElementById('close-members-modal').addEventListener('click', () => closeModal('members-modal'));
    document.getElementById('cancel-members-modal').addEventListener('click', () => closeModal('members-modal'));
    document.getElementById('invite-btn').addEventListener('click', () => openModal('invite-modal'));
    document.getElementById('close-invite-modal').addEventListener('click', () => closeModal('invite-modal'));
    document.getElementById('cancel-invite-modal').addEventListener('click', () => closeModal('invite-modal'));

    document.getElementById('confirm-invite').addEventListener('click', async () => {
        const username = document.getElementById('invite-username-input').value.trim();
        if (!username) { showToast('Enter a username', 'error'); return; }
        const btn = document.getElementById('confirm-invite');
        btn.disabled = true; btn.textContent = 'Sending...';
        try {
            const res = await sendInvite(username);
            if (res.error) { showToast(res.error, 'error'); return; }
            closeModal('invite-modal');
            document.getElementById('invite-username-input').value = '';
            showToast(`Invite sent to ${username}!`);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false; btn.textContent = 'Send Invite';
        }
    });

    document.getElementById('join-requests-btn').addEventListener('click', async () => {
        document.getElementById('requests-list').innerHTML =
            '<li style="color:var(--text-muted);padding:12px">Loading...</li>';
        openModal('requests-modal');
        try {
            const requests = await fetchJoinRequests();
            renderJoinRequests(requests);
        } catch (err) {
            document.getElementById('requests-list').innerHTML =
                `<li style="color:var(--danger);padding:12px">${err.message}</li>`;
        }
    });
    document.getElementById('close-requests-modal').addEventListener('click', () => closeModal('requests-modal'));
    document.getElementById('cancel-requests-modal').addEventListener('click', () => closeModal('requests-modal'));

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });
});