document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll('[data-include]');
  const promises = Array.from(includes).map(el => {
    const file = el.getAttribute('data-include');
    return fetch(file)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        return response.text();
      })
      .then(data => {
        el.innerHTML = data;
      })
      .catch(err => console.error(err));
  });

  Promise.all(promises).then(() => {
    document.dispatchEvent(new Event("componentsLoaded"));
  });
});
