import React from 'react';
import { CalendarCheck, Activity, Bell } from 'lucide-react';

export type TabType = 'schedule' | 'health' | 'alarms';

interface NavigationBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingAlarmsCount?: number;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange,
  pendingAlarmsCount = 0
}) => {
  const tabs = [
    {
      id: 'schedule' as TabType,
      label: 'Schedule',
      icon: CalendarCheck
    },
    {
      id: 'health' as TabType,
      label: 'Health',
      icon: Activity
    },
    {
      id: 'alarms' as TabType,
      label: 'Alarms',
      icon: Bell,
      badge: pendingAlarmsCount > 0 ? pendingAlarmsCount : undefined
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-safe ios-glass-tabbar select-none">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
                isActive ? 'text-ios-blue' : 'text-ios-textSecondary hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-ios-red text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-ios-blue font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

