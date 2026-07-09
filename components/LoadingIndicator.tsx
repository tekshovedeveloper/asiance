type LoadingIndicatorProps = {
  label?: string;
  compact?: boolean;
};

export function LoadingIndicator({ label = 'Loading...', compact = false }: LoadingIndicatorProps) {
  return (
    <div className={compact ? 'loader-inline' : 'loader-panel'} role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
