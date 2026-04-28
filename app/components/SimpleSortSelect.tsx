import {useState} from 'react';

import {IconCaret} from '~/components/Icon';

interface SortOption {
  value: string;
  label: string;
}

interface SimpleSortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SortOption[];
}

export function SimpleSortSelect({
  value,
  onValueChange,
  options,
}: SimpleSortSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sort-select px-4 py-2 bg-white border border-[#e7e5e4] text-[#292524] text-xs tracking-wider rounded-sm focus:outline-none focus:border-[#78716c] cursor-pointer flex items-center justify-between w-40"
      >
        <span>{selectedOption?.label}</span>
        <IconCaret className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-[#e7e5e4] rounded-sm shadow-lg z-50 min-w-[160px]">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-xs ${
                  option.value === value
                    ? 'bg-[#292524] text-white'
                    : 'text-[#a8a29e] hover:bg-[#f5f5f4] hover:text-[#292524]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
