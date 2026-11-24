interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  /** Id del texto que describe el ajuste (aria-labelledby). */
  labelledBy: string;
  describedBy?: string;
}

/** Interruptor accesible (role="switch") con texto Sí / No visible. */
export function Toggle({ checked, onChange, labelledBy, describedBy }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      className="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={onChange}
    >
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
      <span className="switch__label" aria-hidden="true">
        {checked ? 'Sí' : 'No'}
      </span>
    </button>
  );
}
