export {};

declare global {
  type TurnstileRenderOptions = {
    sitekey: string;
    callback: (token: string) => void;
    'error-callback'?: () => void;
    'expired-callback'?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
  };

  type TurnstileInstance = {
    render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
  };

  interface Window {
    turnstile?: TurnstileInstance;
  }
}
