import { useState } from 'preact/hooks';

interface Tab {
  id: string;
  label: string;
}

export default function TabToggle({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');

  function select(id: string) {
    setActive(id);
    document.querySelectorAll<HTMLElement>('[data-tab-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== id;
    });
  }

  return (
    <div role="tablist" aria-label="Product selections" class="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => select(tab.id)}
          class={`min-h-11 rounded-md border px-4 text-body-md font-semibold transition-colors duration-quick ${
            active === tab.id
              ? 'border-brand bg-brand text-on-brand'
              : 'border-border bg-surface text-muted hover:bg-surface-hover hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
