export function clearDOM() {
  document.querySelectorAll(".container").forEach((container) => {
    if (!container.classList.contains("hidden")) {
      container.classList.add("d-none");
    }
  });
}

export function showInDOM(domElement) {
  domElement.classList.remove("d-none");
}

export function hideInDOM(domElement) {
  domElement.classList.add("d-none");
}
