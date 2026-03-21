/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function getToken() {
    return localStorage.getItem('token');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
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
   API
───────────────────────────────────────── */
async function get_user_info() {
    const res = await fetch('/user', { method: 'GET', headers: authHeaders() });
    return res.json();
}

async function get_user_projects() {
    const res = await fetch('/projects', { method: 'GET', headers: authHeaders() });
    return res.json();
}

async function fetchInvites() {
    const res = await fetch('/invites', { method: 'GET', headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load invites');
    return res.json();
}

async function respondInvite(project_id, status) {
    const res = await fetch('/invites/respond', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ project_id, status })
    });
    return res.json();
}

async function create_project_api(project_name, description) {
    const res = await fetch('/project', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ project_name, des: description })
    });
    return res.json();
}

async function searchProject(name) {
    const res = await fetch(`/requist/project?name=${encodeURIComponent(name)}`, {
        method: 'GET', headers: authHeaders()
    });
    return res.json();
}

async function sendJoinRequest(project_id) {
    const res = await fetch('/requist', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ project_id })
    });
    return res.json();
}

/* ─────────────────────────────────────────
   Render
───────────────────────────────────────── */
function render_person_info(data) {
    const person_info = document.getElementById('person-info');
    person_info.innerHTML = `
        <div id="first">
            <h1>${escHtml(data.job_name)} ${escHtml(data.name)}</h1>
        </div>
        <div id="user">
            <h1>${escHtml(data.username)}</h1>
        </div>
        <div id="email">
            <h1>${escHtml(data.email)}</h1>
        </div>
        <div id="phone">
            <h1>${escHtml(data.phone)}</h1>
        </div>
        <div id="number-of-projects">
            <h1>${escHtml(String(data.number_of_projects || ''))}</h1>
        </div>
        <button><a href="#">Edit Profile</a></button>
    `;
}

function render_projects(projects) {
    const proj = document.getElementById('projects');
    proj.innerHTML = '';
    if (!projects || projects.length === 0) {
        proj.innerHTML = '<p style="color:var(--text-muted);padding:20px">No projects yet. Create one!</p>';
        return;
    }
    projects.forEach(p => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
            <h1>${escHtml(p.name)}</h1>
            <p>${escHtml(p.description || '')}</p>
            <a class="btn" href="project.html?id=${p.id}">View Details</a>
        `;
        proj.appendChild(div);
    });
}

function renderInvites(invites) {
    const list  = document.getElementById('invites-list');
    const badge = document.getElementById('notif-badge');

    if (!invites || invites.length === 0) {
        badge.classList.add('hidden');
        list.innerHTML = '<li class="invite-empty">No pending invites.</li>';
        return;
    }

    badge.textContent = invites.length;
    badge.classList.remove('hidden');

    list.innerHTML = invites.map(inv => `
        <li class="invite-item" id="inv-${inv.pro_id}">
            <div class="invite-info">
                <span class="invite-project">${escHtml(inv.name)}</span>
                <span class="invite-desc">${escHtml(inv.description || '')}</span>
            </div>
            <div class="invite-actions">
                <button class="btn-accept" onclick="handleRespondInvite(${inv.pro_id}, 'accepted', this)">Accept</button>
                <button class="btn-reject" onclick="handleRespondInvite(${inv.pro_id}, 'rejected', this)">Reject</button>
            </div>
        </li>
    `).join('');
}

function renderSearchResults(results) {
    const list = document.getElementById('search-results');

    if (!results || results.error) {
        list.innerHTML = '<li class="search-empty">No project found with that name.</li>';
        return;
    }

    const data = Array.isArray(results) ? results : [results];

    list.innerHTML = data.map(p => {
        let actionBtn = '';
        if (p.request_status === 'pending') {
            actionBtn = `<span class="status-tag pending">⏳ Pending</span>`;
        } else if (p.request_status === 'member') {
            actionBtn = `<span class="status-tag member">✓ Member</span>`;
        } else {
            actionBtn = `<button class="btn-request" onclick="handleJoinRequest(${p.id}, this)">Request to Join</button>`;
        }

        return `
            <li class="search-result-item">
                <div class="invite-info">
                    <span class="invite-project">${escHtml(p.name)}</span>
                    <span class="invite-desc">${escHtml(p.description || '')}</span>
                </div>
                ${actionBtn}
            </li>
        `;
    }).join('');
}

/* ─────────────────────────────────────────
   Event Handlers
───────────────────────────────────────── */
async function handleRespondInvite(project_id, status, btn) {
    btn.disabled = true;
    try {
        const res = await respondInvite(project_id, status);
        if (res && res.error) { showToast(res.error, 'error'); btn.disabled = false; return; }

        document.getElementById(`inv-${project_id}`)?.remove();
        showToast(status === 'accepted' ? 'Joined project!' : 'Invite rejected');

        const remaining = document.getElementById('invites-list').children.length;
        const badge     = document.getElementById('notif-badge');
        if (remaining === 0) {
            document.getElementById('invites-list').innerHTML = '<li class="invite-empty">No pending invites.</li>';
            badge.classList.add('hidden');
        } else {
            badge.textContent = remaining;
        }

        if (status === 'accepted') {
            const projects = await get_user_projects();
            render_projects(projects);
        }
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
    }
}

async function handleJoinRequest(project_id, btn) {
    btn.disabled = true;
    btn.textContent = 'Sending...';
    try {
        const res = await sendJoinRequest(project_id);
        if (res && res.error) {
            showToast(res.error, 'error');
            btn.disabled = false;
            btn.textContent = 'Request to Join';
            return;
        }
        btn.outerHTML = `<span class="status-tag pending">⏳ Pending</span>`;
        showToast('Request sent!');
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Request to Join';
    }
}

function render_create_project_form() {
    const form = document.getElementById('create_project');
    form.style.display = 'block';
    form.innerHTML = `
        <form id="create-proj-form">
            <label for="name">Project Name</label>
            <input id="name" placeholder="Project name" required>
            <label for="description">Description</label>
            <input id="description" placeholder="Project description" required>
            <button type="submit" class="btn">Create</button>
            <button type="button" class="btn btn-cancel" id="cancel-create">Cancel</button>
        </form>
    `;

    document.getElementById('cancel-create').addEventListener('click', () => {
        form.style.display = 'none';
        form.innerHTML = '';
    });

    document.getElementById('create-proj-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const project_name = document.getElementById('name').value.trim();
        const description  = document.getElementById('description').value.trim();
        if (!project_name) return;
        try {
            await create_project_api(project_name, description);
            form.style.display = 'none';
            form.innerHTML = '';
            showToast('Project created!');
            const projects = await get_user_projects();
            render_projects(projects);
        } catch (err) {
            showToast('Failed to create project', 'error');
        }
    });
}

/* ─────────────────────────────────────────
   Init
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    (async () => {
        try {
            const data = await get_user_info();
            render_person_info(Array.isArray(data) ? data[0] : data);
        } catch (err) { console.error('User info error:', err); }

        try {
            const projects = await get_user_projects();
            render_projects(projects);
        } catch (err) { console.error('Projects error:', err); }

        try {
            const invites = await fetchInvites();
            if (invites && invites.length > 0) {
                const badge = document.getElementById('notif-badge');
                badge.textContent = invites.length;
                badge.classList.remove('hidden');
            }
        } catch (err) { console.error('Invites error:', err); }
    })();

    document.getElementById('notif-btn').addEventListener('click', async () => {
        document.getElementById('invites-list').innerHTML = '<li style="color:var(--text-muted);padding:12px">Loading...</li>';
        openModal('invites-modal');
        try {
            const invites = await fetchInvites();
            renderInvites(invites);
        } catch (err) {
            document.getElementById('invites-list').innerHTML = `<li style="color:var(--danger);padding:12px">${err.message}</li>`;
        }
    });
    document.getElementById('close-invites-modal').addEventListener('click', () => closeModal('invites-modal'));
    document.getElementById('cancel-invites-modal').addEventListener('click', () => closeModal('invites-modal'));

    document.getElementById('search-btn').addEventListener('click', () => {
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('search-project-input').value = '';
        openModal('search-modal');
    });
    document.getElementById('close-search-modal').addEventListener('click', () => closeModal('search-modal'));
    document.getElementById('cancel-search-modal').addEventListener('click', () => closeModal('search-modal'));

    document.getElementById('search-go-btn').addEventListener('click', async () => {
        const name = document.getElementById('search-project-input').value.trim();
        if (!name) { showToast('Enter a project name', 'error'); return; }
        const btn = document.getElementById('search-go-btn');
        btn.disabled = true; btn.textContent = 'Searching...';
        const list = document.getElementById('search-results');
        list.innerHTML = '<li style="color:var(--text-muted);padding:12px">Loading...</li>';
        try {
            const results = await searchProject(name);
            renderSearchResults(results);
        } catch (err) {
            list.innerHTML = `<li style="color:var(--danger);padding:12px">${err.message}</li>`;
        } finally {
            btn.disabled = false; btn.textContent = 'Search';
        }
    });

    document.getElementById('search-project-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('search-go-btn').click();
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });
});