document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username =
      document.getElementById("username").value;

    const password =
      document.getElementById("password").value;

    // 1. Login
    const { data, error } =
      await window.supabaseClient.auth.signInWithPassword({
        email: `${username}@local.app`,
        password
      });

    if (error) {
      alert(error.message);
      return;
    }

    // 2. Get auth user
    const { data: userData } =
      await window.supabaseClient.auth.getUser();

    const user = userData.user;

    console.log("Auth ID:", user.id);
    
    // 3. Fetch role from your table using auth ID
    const { data: roleData, error: roleError } =
      await window.supabaseClient
        .from("user_roles")   // your table name
        .select("role")
        .eq("user_id", user.id)
        .single();

    if (roleError) {
      console.error(roleError);
      alert("Role not found");
      return;
    }

    const role = roleData.role;

    console.log("Role:", role);

    // 4. Save role
    
    localStorage.setItem("roles", JSON.stringify(window.CURRENT_USER_ROLES)); // Better storage

    // 5. Redirect
    window.location.href = "./dashboard.html";

  });

});

window.logout = async function () {
  await window.supabaseClient.auth.signOut();
  localStorage.clear();
  window.CURRENT_USER_ROLES = null;  // ✅ Clear global roles
  window.location.href = "./index.html";
};