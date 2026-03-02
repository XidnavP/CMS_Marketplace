async function initUsersPage() {

    await loadUsers();

}

window.initUsersPage = initUsersPage;



/* LOAD USERS */
async function loadUsers() {
    const tbody = document.getElementById("userTableBody");

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Loading...
            </td>
        </tr>`;

    // Get current logged-in user
    const {
        data: { user: currentUser },
        error: currentUserError
    } = await supabaseClient.auth.getUser();

    if (currentUserError) {
        console.error("Failed to get current user:", currentUserError);
    }

    const { data, error } = await supabaseClient.rpc("admin_list_users");

    if (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-danger text-center">
                    ${error.message}
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = "";

    data.forEach(user => {
        const isCurrentUser = currentUser && user.id === currentUser.id;

        tbody.innerHTML += `
        <tr>
            <td>${user.email}</td>
            <td><small>${user.id}</small></td>
            <td>${user.role}
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                ${user.disabled
                    ? `<span class="badge bg-danger">Disabled</span>`
                    : `<span class="badge bg-success">Active</span>`}
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="changeUserPassword('${user.id}')">
                    Reset Password
                </button>

                ${!isCurrentUser
                    ? `<button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">
                        Delete
                    </button>`
                    : ""}
            </td>
        </tr>`;
    });
}

// const role = document.getElementById("newUserRole").value

/* CREATE USER */
async function createUser() {
    const email = document.getElementById("newUserEmail").value;
    const password = document.getElementById("newUserPassword").value;
    const role = document.getElementById("newUserRole").value
    try {
      const res = await fetch(
        "https://lktanoblozjgrhgnytvq.supabase.co/functions/v1/create-user",
        {   
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }) // can change role here
        }
      );
  
      const result = await res.json();
      console.log("Edge function response:", result);
  
      if (!res.ok) throw new Error(result.error || "Failed to create user");
  
      alert("User created successfully!");
      loadUsers(); // refresh table
  
      // close modal
      bootstrap.Modal.getInstance(document.getElementById("createUserModal")).hide();
    } catch (err) {
      console.error("Failed to create user:", err);
      alert("Failed to create user: " + err.message);
    }
  }

/* DELETE USER */
async function deleteUser(userId) {
    if (!confirm("Delete this user?")) return;
  
    try {
      const res = await fetch(
        "https://lktanoblozjgrhgnytvq.supabase.co/functions/v1/delete-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId })
        }
      );
  
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete user");
  
      alert("User deleted successfully");
      loadUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user: " + err.message);
    }
  }



/* RESET PASSWORD */
async function changeUserPassword(userId) {
    const newPassword = prompt("Enter new password for this user:");
    if (!newPassword) return;
  
    try {
      const res = await fetch(
        "https://lktanoblozjgrhgnytvq.supabase.co/functions/v1/change-user-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: userId,
            new_password: newPassword
          })
        }
      );
  
      const result = await res.json();
  
      if (!res.ok) throw new Error(result.error || "Failed to change password");
  
      alert("Password changed successfully!");
    } catch (err) {
      console.error("Failed to change password:", err);
      alert("Failed to change password: " + err.message);
    }
  }






function openCreateUserModal() {

    new bootstrap.Modal(
        document.getElementById("createUserModal")
    ).show();

}



function formatDate(dateString) {

    return new Date(dateString)
        .toLocaleString("id-ID");

}