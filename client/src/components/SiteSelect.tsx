import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type SiteSelectOption = {
  value: string;
  label: string;
};

type SiteSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SiteSelectOption[];
  className?: string;
  ariaLabel: string;
};

export function SiteSelect({ value, onChange, options, className = "", ariaLabel }: SiteSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const closeOnOutsidePress = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className={"site-select " + className} ref={rootRef}>
      <button
        type="button"
        className="site-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label ?? "Selecionar"}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className="site-select-menu" id={listId} role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={"site-select-option" + (option.value === value ? " selected" : "")}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type SiteAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel: string;
};

export function SiteAutocomplete({ value, onChange, options, placeholder, ariaLabel }: SiteAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const filteredOptions = options.filter((option) => option.toLocaleLowerCase("pt-BR").includes(value.toLocaleLowerCase("pt-BR")));

  useEffect(() => {
    const closeOnOutsidePress = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="site-autocomplete" ref={rootRef}>
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => { setOpen(true); setActiveIndex(-1); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
          } else if (event.key === "Enter" && open && activeIndex >= 0) {
            event.preventDefault();
            onChange(filteredOptions[activeIndex]);
            setOpen(false);
            setActiveIndex(-1);
          } else if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
      />
      {open && filteredOptions.length > 0 && (
        <div className="site-autocomplete-menu" id={listId} role="listbox" aria-label={ariaLabel}>
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              id={`${listId}-option-${filteredOptions.indexOf(option)}`}
              role="option"
              aria-selected={option === value}
              className={"site-autocomplete-option" + (filteredOptions.indexOf(option) === activeIndex ? " active" : "")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option);
                setOpen(false);
                setActiveIndex(-1);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
