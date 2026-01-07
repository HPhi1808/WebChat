document.addEventListener("DOMContentLoaded", () => {
    // --- 1. CHECK QUYỀN ADMIN ---
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin';
        return; // Dừng chạy tiếp
    }

    // --- 2. RENDER LAYOUT (Sidebar & Header) ---
    const path = window.location.pathname; 
    
    // HTML cho Sidebar
    const sidebarHTML = `
        <div class="p-4 text-center border-bottom border-secondary">
            <h4 class="fw-bold">ADMIN PANEL</h4>
            <small class="text-success">● Online</small>
        </div>
        <nav class="nav flex-column mt-3">
            <a class="nav-link ${path.includes('dashboard') ? 'active' : ''}" href="/admin/dashboard.html">📊 Thống kê chung</a>
            <a class="nav-link ${path.includes('users') ? 'active' : ''}" href="/admin/users.html">👥 Quản lý User</a>
            <a class="nav-link ${path.includes('system_logs') ? 'active' : ''}" href="/admin/system_logs.html">📜 System Logs</a>
        </nav>
    `;

    // HTML cho Header
    const headerHTML = `
        <h5 class="m-0 text-secondary">Hệ thống quản trị</h5>
        <button id="btnLogout" class="btn btn-outline-danger btn-sm fw-bold">🚪 Đăng xuất</button>
    `;

    // Inject vào DOM
    const sidebarEl = document.getElementById('sidebar-placeholder');
    const headerEl = document.getElementById('header-placeholder');
    
    if(sidebarEl) sidebarEl.innerHTML = sidebarHTML;
    if(headerEl) headerEl.innerHTML = headerHTML;

    // --- 3. XỬ LÝ LOGOUT ---
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogout) {
        btnLogout.addEventListener('click', () => {
            if(confirm("Bạn muốn đăng xuất?")) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin';
            }
        });
    }
});