// role.js
window.applyRoleRestrictions = function() {
    const roles = window.CURRENT_USER_ROLES || [];
  
    document.querySelectorAll("[data-role]").forEach(el => {
      const allowedRoles = el.getAttribute("data-role").split(",");
      const hasAccess = allowedRoles.some(r => roles.includes(r));
  
      if (!hasAccess) {
        // hide element instead of removing
        el.style.display = "none";
      }
    });
  };
  
  window.userHasRole = function(role) {
    return window.CURRENT_USER_ROLES?.includes(role);
  };
  
  // Optional: automatically hide new elements
  const observer = new MutationObserver(() => {
    applyRoleRestrictions();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // In your role script
document.querySelectorAll("[data-role]").forEach(el => {
    const allowedRoles = el.getAttribute("data-role").split(",");
    const hasAccess = allowedRoles.some(r => roles.includes(r));
  
    if (!hasAccess) {
      // Instead of hiding the whole div, disable inputs inside
      el.querySelectorAll("input, select, textarea, button").forEach(input => {
        input.disabled = true;
      });
    } else {
      el.querySelectorAll("input, select, textarea, button").forEach(input => {
        input.disabled = false;
      });
    }
  });