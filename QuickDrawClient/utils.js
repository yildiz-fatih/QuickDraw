// Helper to clear non-info containers from view
export function clearDOM() {
    document.querySelectorAll(".container").forEach((container) => {
        if (!container.classList.contains("hidden") && container.id !== "infoContainer") {
            container.classList.add("hidden");
        }
    });
}

export function showInDOM(domElement) {
    domElement.classList.remove("hidden");
}

export function hideInDOM(domElement) {
    domElement.classList.add("hidden");
}
