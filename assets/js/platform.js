async function loadPlatforms() {

    const { data, error } = await supabaseClient
      .from("platforms")
      .select("*")
      .order("created_at", { ascending: false });
  
    if (error) {
      alert(error.message);
      return;
    }
  
    renderPlatformTable(data);
  }
  
  function renderPlatformTable(data) {

    const table = document.getElementById("platformTable");
    if (!table) return;
  
    if (!data.length) {
      table.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted">
            No platforms yet
          </td>
        </tr>`;
      return;
    }
  
    table.innerHTML = data.map(item => {
  
      const updatedDate = new Date(item.updated_at)
        .toLocaleDateString(); // DATE only
  
      return `
        <tr>
          <td>${item.name}</td>
          <td>${item.percentage}%</td>
          <td>${updatedDate}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-primary me-2"
              onclick="editPlatform(${item.id}, '${item.name}', ${item.percentage})">
              Edit
            </button>
  
            <button class="btn btn-sm btn-danger"
              onclick="deletePlatform(${item.id})">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }
  
  window.openPlatformModal = function () {
  
    document.getElementById("platformForm").reset();
    document.getElementById("platform_id").value = "";
    document.getElementById("platformModalTitle").innerText = "Add Platform";
  
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("platformModal")
    ).show();
  };
  
  
  window.editPlatform = function (id, name, percentage) {
  
    document.getElementById("platform_id").value = id;
    document.getElementById("platform_name").value = name;
    document.getElementById("platform_percentage").value = percentage;
  
    document.getElementById("platformModalTitle").innerText = "Edit Platform";
  
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("platformModal")
    ).show();
  };
  window.deletePlatform = async function (id) {

    const confirmDelete = confirm("Are you sure you want to delete this platform?");
    if (!confirmDelete) return;
  
    const { error } = await supabaseClient
      .from("platforms")
      .delete()
      .eq("id", id);
  
    if (error) {
      alert(error.message);
      return;
    }
  
   loadPlatforms()
  };
   
  
  document.addEventListener("submit", async function (e) {
  
    if (e.target && e.target.id === "platformForm") {
  
      e.preventDefault();
  
      const id = document.getElementById("platform_id").value;
      const name = document.getElementById("platform_name").value;
      const percentage = parseFloat(
        document.getElementById("platform_percentage").value
      );
  
      if (id) {
        await supabaseClient
          .from("platforms")
          .update({ name, percentage })
          .eq("id", id);
      } else {
        await supabaseClient
          .from("platforms")
          .insert([{ name, percentage }]);
      }
  
      bootstrap.Modal.getInstance(
        document.getElementById("platformModal")
      ).hide();
  
      loadPlatforms();
    }
  });
  