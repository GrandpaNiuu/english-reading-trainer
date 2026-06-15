if (Array.isArray(window.GENERATED_PASSAGES)) {
  window.PASSAGES = [...(window.PASSAGES || []), ...window.GENERATED_PASSAGES];
}

if (Array.isArray(window.CURATED_PASSAGES)) {
  window.PASSAGES = [...(window.PASSAGES || []), ...window.CURATED_PASSAGES];
}
