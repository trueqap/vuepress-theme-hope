import type { PhotoSwipeOptions } from "vuepress-plugin-photo-swipe";

export const resolvePhotoSwipeOptions = (
  options?: PhotoSwipeOptions | false
): PhotoSwipeOptions | false => (options === false ? false : options || {});
