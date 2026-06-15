if (Array.isArray(window.GENERATED_PASSAGES)) {
  window.PASSAGES = [...(window.PASSAGES || []), ...window.GENERATED_PASSAGES];
}
