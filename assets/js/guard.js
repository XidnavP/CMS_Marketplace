document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;

  try {
    // 1️⃣ Get current session
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
      window.location.replace("index.html");
      return;
    }

    const roles = rolesData.map(r => r.role);

    // 4️⃣ Save roles globally
    window.CURRENT_USER_ROLES = roles;
    console.log("✅ User roles loaded:", roles);

    // 5️⃣ Dispatch rolesReady so dashboard.js knows roles are ready
    document.dispatchEvent(new CustomEvent("rolesReady"));

  } catch (err) {
    console.error("Guard error:", err);
    window.location.replace("index.html");
  }
});