function isStoredMediaPath(value) {
  return value.startsWith("/uploads/") || value.startsWith("/venues/") || value.startsWith("/api/media/user/") || value.startsWith("/api/media/venue/") || value.startsWith("/api/media/asset/");
}
function isAllowedImageReference(value) {
  return isStoredMediaPath(value) || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("venue-");
}
export {
  isAllowedImageReference as i
};
