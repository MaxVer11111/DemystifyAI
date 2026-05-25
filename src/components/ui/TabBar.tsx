"use client";

import { Container } from "../layout/Container";

interface Tab {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  vertical?: boolean;
}

export function TabBar({ tabs, activeTab, onTabChange, vertical }: TabBarProps) {
  if (vertical) {
    return (
      <nav className="tab-bar-vertical">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    );
  }
  return (
    <nav className="tab-bar">
      <Container className="tab-bar-inner">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </Container>
    </nav>
  );
}
