export function cloudinaryImageUrl(url: string, width: number) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  return url.replace(
    '/image/upload/',
    `/image/upload/f_auto,q_auto:good,w_${width},c_limit/`,
  );
}
