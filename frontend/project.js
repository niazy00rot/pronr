
function getProjectId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
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

/* ─────────────────────────────────────────
   API Calls
───────────────────────────────────────── */

// GET /project?id=
async function getProjectById() {
    const id = getProjectId();
    const res = await fetch(`/project?id=${id}`, {
        method: 'GET',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to load project');
    return res.json();
}

// GET /tasks?id=
async function fetchTasks() {
    const id = getProjectId();
    const res = await fetch(`/tasks?id=${id}`, {
        method: 'GET',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to load tasks');
    return res.json();
}

// POST /tasks?id=
async function createTask(name, description) {
    const id = getProjectId();
    const res = await fetch(`/tasks?id=${id}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, description })
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
}

// DELETE /tasks?id=
async function deleteTask(task_id) {
    const id = getProjectId();
    const res = await fetch(`/tasks?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ task_id })
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
}

// PUT /tasks?id=
async function updateTaskStatus(task_id, status) {
    const id = getProjectId();
    const res = await fetch(`/tasks?id=${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ task_id, status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
}

// GET /members?task_id=
async function fetchMembers(task_id) {
    const res = await fetch(`/members?task_id=${task_id}`, {
        method: 'GET',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to load members');
    return res.json();
}

// DELETE /member
async function deleteMember(task_id, member_id) {
    const res = await fetch(`/member`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ task_id, member_id })
    });
    if (!res.ok) throw new Error('Failed to remove member');
    return res.json();
}

/* ─────────────────────────────────────────
   Render
───────────────────────────────────────── */

function getStatusClass(status) {
    if (!status) return 'status-pending';
    const s = status.toLowerCase().replace(' ', '_');
    if (s === 'done')        return 'status-done';
    if (s === 'in_progress') return 'status-in_progress';
    return 'status-pending';
}

function renderTasks(tasks) {
    const grid = document.getElementById('tasks-grid');
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
                <span class="status-badge ${getStatusClass(task.status)}">${task.status || 'pending'}</span>
            </div>
            <p class="task-desc">${escHtml(task.description || '—')}</p>
            <select class="status-select" data-task-id="${task.id}" onchange="handleStatusChange(this)">
                <option value="pending"     ${(!task.status || task.status === 'pending')     ? 'selected' : ''}>Pending</option>
                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="done"        ${task.status === 'done'        ? 'selected' : ''}>Done</option>
            </select>
            <div class="task-card-actions">
                <button class="btn-members" onclick="handleViewMembers(${task.id})">👥 Members</button>
                <button class="btn-delete-task" onclick="handleDeleteClick(${task.id})" title="Delete task">🗑</button>
            </div>
        </div>
    `).join('');
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderNavProject(data) {
    const project = Array.isArray(data) ? data[0] : data;
    document.getElementById('nav-project-name').textContent = project.name || 'Project';
    document.getElementById('nav-project-desc').textContent = project.description || '';
}

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
   Event Handlers
───────────────────────────────────────── */

// Status change
async function handleStatusChange(select) {
    const task_id = select.dataset.taskId;
    const status  = select.value;
    select.disabled = true;
    try {
        await updateTaskStatus(task_id, status);
        // Update badge on card
        const card  = select.closest('.task-card');
        const badge = card.querySelector('.status-badge');
        badge.className = `status-badge ${getStatusClass(status)}`;
        badge.textContent = status;
        showToast('Status updated');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        select.disabled = false;
    }
}

// Delete task — open confirm modal
let pendingDeleteId = null;
function handleDeleteClick(task_id) {
    pendingDeleteId = task_id;
    openModal('delete-modal');
}

// View members
let activeTaskId = null;
async function handleViewMembers(task_id) {
    activeTaskId = task_id;
    document.getElementById('members-list').innerHTML = '<li style="color:var(--text-muted);padding:12px">Loading...</li>';
    openModal('members-modal');
    try {
        const members = await fetchMembers(task_id);
        renderMembers(members, task_id);
    } catch (err) {
        document.getElementById('members-list').innerHTML = `<li style="color:var(--danger);padding:12px">${err.message}</li>`;
    }
}

// Remove member
async function handleRemoveMember(task_id, member_id, btn) {
    btn.disabled = true;
    btn.textContent = '...';
    try {
        await deleteMember(task_id, member_id);
        btn.closest('.member-item').remove();
        showToast('Member removed');
        if (document.getElementById('members-list').children.length === 0) {
            document.getElementById('members-list').innerHTML = '<li class="members-empty">No members assigned.</li>';
        }
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Remove';
    }
}

/* ─────────────────────────────────────────
   Init
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    /* ── Load project info + tasks ── */
    (async () => {
        try {
            const projectData = await getProjectById();
            renderNavProject(projectData);
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

    /* ── Add Task Modal ── */
    document.getElementById('add-task-btn').addEventListener('click', () => openModal('add-modal'));
    document.getElementById('close-add-modal').addEventListener('click', () => closeModal('add-modal'));
    document.getElementById('cancel-add-modal').addEventListener('click', () => closeModal('add-modal'));

    document.getElementById('confirm-add-task').addEventListener('click', async () => {
        const name = document.getElementById('task-name-input').value.trim();
        const desc = document.getElementById('task-desc-input').value.trim();
        if (!name) { showToast('Task name is required', 'error'); return; }

        const btn = document.getElementById('confirm-add-task');
        btn.disabled = true;
        btn.textContent = 'Creating...';
        try {
            await createTask(name, desc);
            closeModal('add-modal');
            document.getElementById('task-name-input').value = '';
            document.getElementById('task-desc-input').value = '';
            showToast('Task created!');
            const tasks = await fetchTasks();
            renderTasks(tasks);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Task';
        }
    });

    /* ── Delete Modal ── */
    document.getElementById('close-delete-modal').addEventListener('click', () => closeModal('delete-modal'));
    document.getElementById('cancel-delete-modal').addEventListener('click', () => closeModal('delete-modal'));

    document.getElementById('confirm-delete-task').addEventListener('click', async () => {
        if (!pendingDeleteId) return;
        const btn = document.getElementById('confirm-delete-task');
        btn.disabled = true;
        btn.textContent = 'Deleting...';
        try {
            await deleteTask(pendingDeleteId);
            closeModal('delete-modal');
            showToast('Task deleted');
            const tasks = await fetchTasks();
            renderTasks(tasks);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Delete';
            pendingDeleteId = null;
        }
    });

    /* ── Members Modal ── */
    document.getElementById('close-members-modal').addEventListener('click', () => closeModal('members-modal'));
    document.getElementById('cancel-members-modal').addEventListener('click', () => closeModal('members-modal'));

    /* ── Close modals on backdrop click ── */
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });
});
