// role.js

window.applyRoleRestrictions = function(root = document) {
  const roles = window.CURRENT_USER_ROLES || [];
  if (!roles.length) return;

  root.querySelectorAll("[data-role]").forEach(el => {
    const allowedRoles = el.getAttribute("data-role")
      .split(",")
      .map(r => r.trim());
    const hasAccess = allowedRoles.some(r => roles.includes(r));

    el.style.display = hasAccess ? "" : "none";

    // Optionally disable inputs inside restricted sections
    el.querySelectorAll("input, select, textarea, button").forEach(input => {
      input.disabled = !hasAccess;
    });
  });
};

// Automatically apply role restrictions to any new content after roles are ready
document.addEventListener("rolesReady", () => {
  window.applyRoleRestrictions(document);
  
  const observer = new MutationObserver(() => {
    window.applyRoleRestrictions(document);
  });
  observer.observe(document.body, { childList: true, subtree: true });
});