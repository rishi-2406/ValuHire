import { Bell, Search, Menu } from "lucide-react";
import { useState } from "react";

export default function TopBar({ title, eyebrow, actions, onSearch, onMenuClick, showSearch = true }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="topbar">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="icon-button md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1 className="truncate">{title}</h1>
        </div>
      </div>

      <div className="topbar-actions flex-1 justify-end">
        {showSearch ? (
          <div className="hidden md:flex items-center gap-2 px-3 h-10 bg-white border border-outline rounded-lg w-full max-w-xs">
            <Search size={18} className="text-on-surface-variant" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                onSearch?.(e.target.value);
              }}
              placeholder="Search…"
              className="flex-1 bg-transparent outline-none text-sm"
              aria-label="Search"
            />
          </div>
        ) : null}

        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        {actions}
      </div>
    </div>
  );
}
