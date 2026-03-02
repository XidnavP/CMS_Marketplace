document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;

  // 1️⃣ Check session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.replace("index.html");
    return;
  }

  // 2️⃣ Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  // 3️⃣ Fetch roles from user_roles table
  const { data: rolesData, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to fetch user roles:", error.message);
    alert("Access denied");
    window.location.replace("dashboard.html");
    return;
  }

  const roles = rolesData.map(r => r.role);

  // 4️⃣ Role check against allowed roles
  const allowedRoles = window.ALLOWED_ROLES || [];
  if (allowedRoles.length && !allowedRoles.some(r => roles.includes(r))) {
    alert("Access denied");
    window.location.replace("dashboard.html");
    return;
  }

  // ✅ If you need, store roles globally for other scripts
  window.CURRENT_USER_ROLES = roles;
});