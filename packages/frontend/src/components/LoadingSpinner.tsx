interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return <div className="loading">{text}</div>;
}
