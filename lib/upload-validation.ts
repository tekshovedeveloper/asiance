import { showAppToast } from './app-toast';

export const MAX_UPLOAD_FILE_SIZE_MB = 10;
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;
export const UPLOAD_TOO_LARGE_MESSAGE =
  'This file is too large. Please upload a file that is 10 MB or smaller.';

export class UploadFileTooLargeError extends Error {
  constructor() {
    super(UPLOAD_TOO_LARGE_MESSAGE);
    this.name = 'UploadFileTooLargeError';
  }
}

export function isUploadFileTooLarge(file: File) {
  return file.size > MAX_UPLOAD_FILE_SIZE_BYTES;
}

export function assertUploadFileSize(file: File) {
  if (!isUploadFileTooLarge(file)) return;

  showAppToast(UPLOAD_TOO_LARGE_MESSAGE, 'error');
  throw new UploadFileTooLargeError();
}

export function isUploadFileTooLargeError(error: unknown) {
  return error instanceof UploadFileTooLargeError ||
    (error instanceof Error && error.name === 'UploadFileTooLargeError');
}

export function uploadErrorMessage(error: unknown, fallback = 'Upload failed. Please try again.') {
  return error instanceof Error ? error.message : fallback;
}
