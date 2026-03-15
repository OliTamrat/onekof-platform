'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Sparkles,
  Rocket,
  Target,
  TrendingUp,
  Zap,
  Star,
  Heart,
  Users,
  Briefcase,
  Code,
  Palette,
  Music,
  Camera,
  Book,
  Coffee,
  Lightbulb,
  Award,
  Flag,
  Shield,
  Crown,
  Gem,
  Flame,
  Settings,
  Layout,
  Database,
  Terminal,
  Package,
  Truck,
  MessageSquare,
  Mail,
  Phone,
  Map,
  Calendar,
  Clock,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Link2,
  Eye,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Icon categories with Lucide React icons
const ICON_CATEGORIES = {
  Popular: [
    { name: 'Rocket', icon: Rocket },
    { name: 'Target', icon: Target },
    { name: 'Star', icon: Star },
    { name: 'Users', icon: Users },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Lightbulb', icon: Lightbulb },
    { name: 'Flag', icon: Flag },
    { name: 'Crown', icon: Crown },
  ],
  Business: [
    { name: 'Briefcase', icon: Briefcase },
    { name: 'TrendingUp', icon: TrendingUp },
    { name: 'Target', icon: Target },
    { name: 'Award', icon: Award },
    { name: 'Shield', icon: Shield },
    { name: 'Gem', icon: Gem },
  ],
  Development: [
    { name: 'Code', icon: Code },
    { name: 'Terminal', icon: Terminal },
    { name: 'Database', icon: Database },
    { name: 'Package', icon: Package },
    { name: 'Settings', icon: Settings },
    { name: 'Layout', icon: Layout },
  ],
  Creative: [
    { name: 'Palette', icon: Palette },
    { name: 'Camera', icon: Camera },
    { name: 'Music', icon: Music },
    { name: 'Sparkles', icon: Sparkles },
  ],
  Communication: [
    { name: 'MessageSquare', icon: MessageSquare },
    { name: 'Mail', icon: Mail },
    { name: 'Phone', icon: Phone },
    { name: 'Share2', icon: Share2 },
  ],
  Productivity: [
    { name: 'Calendar', icon: Calendar },
    { name: 'Clock', icon: Clock },
    { name: 'Book', icon: Book },
    { name: 'Coffee', icon: Coffee },
  ],
  Action: [
    { name: 'Zap', icon: Zap },
    { name: 'Rocket', icon: Rocket },
    { name: 'Flame', icon: Flame },
    { name: 'Bell', icon: Bell },
  ],
};

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  label?: string;
  className?: string;
}

export function IconPicker({ value, onChange, label, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof ICON_CATEGORIES>('Popular');

  // Get all icons from all categories
  const allIcons = Object.values(ICON_CATEGORIES).flat();

  // Find the selected icon
  const selectedIcon = allIcons.find(icon => icon.name === value);
  const SelectedIconComponent = selectedIcon?.icon;

  // Filter icons based on search
  const filteredIcons = searchQuery
    ? allIcons.filter(icon =>
        icon.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ICON_CATEGORIES[selectedCategory];

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label className="text-white">{label}</Label>}

      <div className="relative">
        {/* Selected Icon Display */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center gap-3 rounded-md border border-slate-700 bg-[#1B1F23] px-3 py-2 text-sm text-white hover:bg-[#22272B] focus:border-primary-500 focus:outline-none transition-colors"
        >
          {SelectedIconComponent ? (
            <>
              <SelectedIconComponent className="h-5 w-5 text-primary-500" />
              <span>{selectedIcon.name}</span>
            </>
          ) : (
            <span className="text-slate-400">Choose an icon...</span>
          )}
        </button>

        {/* Icon Picker Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <div className="absolute z-50 mt-2 w-[400px] rounded-lg border border-slate-700 bg-[#22272B] p-4 shadow-2xl">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search icons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#1B1F23] border-slate-700 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Categories */}
              {!searchQuery && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {Object.keys(ICON_CATEGORIES).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category as keyof typeof ICON_CATEGORIES)}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                        selectedCategory === category
                          ? 'bg-primary-500 text-white'
                          : 'bg-[#1B1F23] text-slate-400 hover:bg-[#282E33]'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Icons Grid */}
              <div className="max-h-[300px] overflow-y-auto">
                <div className="grid grid-cols-6 gap-2">
                  {filteredIcons.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        onChange(name);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-md border transition-all hover:scale-110',
                        value === name
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-slate-700 bg-[#1B1F23] hover:border-primary-500 hover:bg-[#282E33]'
                      )}
                      title={name}
                    >
                      <Icon className={cn(
                        'h-5 w-5',
                        value === name ? 'text-primary-500' : 'text-slate-400'
                      )} />
                    </button>
                  ))}
                </div>

                {filteredIcons.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-400">No icons found</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="bg-[#282E33] border-slate-700 text-white hover:bg-slate-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {value && (
        <p className="text-xs text-slate-400">
          Selected: {value}
        </p>
      )}
    </div>
  );
}
