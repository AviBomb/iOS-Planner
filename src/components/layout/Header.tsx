import React from 'react';
import { Calendar, Plus, Sparkles, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: 'schedule' | 'health' | 'alarms';
  onAddTask?: () => void;
  isStandalone: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onAddTask, isStandalone }) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const getTitle = () => {
    switch (activeTab) {
      case 'schedule':
        return 'Today’s Schedule';
      case 'health':
        return 'Apple Health Sync';
      case 'alarms':
        return 'Alarms & Alerts';
    }
  };

  return (
    <header className="sticky top-0 z-30 pt-safe px-4 pb-3 ios-glass-header transition-all">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-ios-textSecondary uppercase tracking-wider font-semibold">
            <Calendar className="w-3.5 h-3.5 text-ios-blue" />
            <span>{dateFormatted}</span>
            {isStandalone ? (
              <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-ios-green/20 text-ios-green">
                <Smartphone className="w-2.5 h-2.5" />
                iOS App
              </span>
            ) : (
              <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-ios-orange/20 text-ios-orange">
                Web Preview
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">{getTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'schedule' && onAddTask && (
            <button
              onClick={onAddTask}
              className="flex items-center gap-1.5 bg-ios-blue hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold px-3.5 py-1.5 rounded-full transition-all shadow-lg shadow-ios-blue/20"
              aria-label="Add New Task"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}

          {activeTab === 'health' && (
            <div className="w-8 h-8 rounded-full bg-ios-pink/20 flex items-center justify-center text-ios-pink">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

