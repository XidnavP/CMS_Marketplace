document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Auth JS loaded");
  
    const form = document.getElementById("loginForm");
    console.log("Form found:", form);
  
    if (!form) return;
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("🔐 Login submitted");
  
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      const { data, error } =
        await window.supabaseClient.auth.signInWithPassword({
          email: `${username}@local.app`,
          password
        });
  
      if (error) {
        alert("Login failed: " + error.message);
        return;
      }
      console.log(window.location.href);
      window.location.href = "./dashboard.html";
    });
  });

  window.logout = async function () {
    await window.supabaseClient.auth.signOut();
    window.location.href = "./index.html";
  };