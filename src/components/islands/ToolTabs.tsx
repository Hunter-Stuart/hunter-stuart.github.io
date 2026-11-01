interface Props<T extends string> {
  label: string;
  prefix: string;
  tabs: ReadonlyArray<{ id: T; label: string }>;
  active: T;
  onChange(value: T): void;
}

export default function ToolTabs<T extends string>({
  label,
  prefix,
  tabs,
  active,
  onChange,
}: Props<T>) {
  return (
    <div className="tool-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${prefix}-tab-${tab.id}`}
          aria-controls={`${prefix}-panel-${tab.id}`}
          aria-selected={active === tab.id}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => {
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = tabs.length - 1;
            else return;
            event.preventDefault();
            const selected = tabs[next];
            if (!selected) return;
            onChange(selected.id);
            document.getElementById(`${prefix}-tab-${selected.id}`)?.focus();
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
