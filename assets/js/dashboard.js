document.addEventListener("DOMContentLoaded", async () => {
  console.log("dashboard.js loaded");

  // 1. Load sidebar
  const sidebar = document.getElementById("sidebar");
  const res = await fetch("components/sidebar.html");
  sidebar.innerHTML = await res.text();

  sidebar.classList.add("sidebar", "bg-dark", "text-white");

  // 2. Sidebar toggle
  const toggleBtn = document.getElementById("toggleSidebar");
  const collapsed = localStorage.getItem("sidebarCollapsed") === "true";

  if (collapsed) {
    sidebar.classList.add("collapsed");
    toggleBtn.textContent = "☰";
  } else {
    toggleBtn.textContent = "←";
  }

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    const isCollapsed = sidebar.classList.contains("collapsed");
    toggleBtn.textContent = isCollapsed ? "☰" : "←";
    localStorage.setItem("sidebarCollapsed", isCollapsed);
  });

  // 3. Logout
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // 4. Page loader (SINGLE source of truth)
  async function loadPage(page) {
    const url = `pages/${page}.html`;
    console.log("Trying to fetch:", url);
  
    try {
      const res = await fetch(url);
      console.log("Response status:", res.status);
  
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
  
      const html = await res.text();
      document.getElementById("mainContent").innerHTML = html;
  
// dashboard.js
      if (page === "stock-input") {
        await fetch("pages/stock-input.html")
          .then(res => res.text())
          .then(html => {
            document.getElementById("mainContent").innerHTML = html;

            initStockPage();  // modal + form hooks
            loadStockData();  // table with Edit buttons
          });
      }
      if (page === "sales-input") {
        await initSalesPage();
      }

      if (page === "platforms") {
        loadPlatforms();
      }

      if (page === "movement") {
        initMovementPage();
      }
      if (page === "reports-daily") {
        loadDashboard();
      }
      if (page === "users") {
        initUsersPage();
        loadPlatforms();
    }
    } catch (err) {
      console.error("Fetch failed:", err);
      document.getElementById("mainContent").innerHTML =
        `<p class="text-danger">Failed to load ${page}</p>`;
    }
  }
  

  // 5. Navigation click handler (ONLY ONCE)
  document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      loadPage(link.dataset.page);
    });
  });

  // 6. Default page
  loadPage("reports-daily");
});
