// Landing-page behaviour.
// PriceList is intentionally static in this design release.
// Production PriceList will be loaded from Firestore only after the
// database/configuration stage is completed.
document.querySelectorAll(".select-service").forEach(link => {
  link.addEventListener("click", () => {
    const card = link.closest(".price-card");
    if (!card) return;
    sessionStorage.setItem("selectedPrice", JSON.stringify({
      id: `design-${card.dataset.service.toLowerCase().replace(/\s+/g,"-")}`,
      service: card.dataset.service,
      package: card.dataset.package,
      price: Number(card.dataset.price),
      ownership: "shared"
    }));
  });
});
