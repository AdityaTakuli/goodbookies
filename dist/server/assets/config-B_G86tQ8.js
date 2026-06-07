const MEDIA_CATEGORIES = ["avatars", "venues", "videos"];
const MEDIA_CATEGORY_CONFIG = {
  avatars: {
    maxBytes: 2 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    label: "Profile photo"
  },
  venues: {
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    label: "Venue photo"
  },
  videos: {
    maxBytes: 50 * 1024 * 1024,
    mimeTypes: ["video/mp4", "video/webm"],
    label: "Video"
  }
};
function acceptAttrForCategory(category) {
  return MEDIA_CATEGORY_CONFIG[category].mimeTypes.join(",");
}
export {
  MEDIA_CATEGORIES as M,
  MEDIA_CATEGORY_CONFIG as a,
  acceptAttrForCategory as b
};
