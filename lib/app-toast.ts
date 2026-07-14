export type AppToastType = 'info' | 'success' | 'error';

export const APP_TOAST_EVENT = 'asiance:app-toast';

export type AppToastDetail = {
  message: string;
  type?: AppToastType;
};

export function showAppToast(message: string, type: AppToastType = 'info') {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent<AppToastDetail>(APP_TOAST_EVENT, {
    detail: { message, type },
  }));
}
