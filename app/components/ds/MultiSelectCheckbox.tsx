'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SubCategory {
  id: string;
  label: string;
}

interface Category {
  id: string;
  label: string;
  subCategories: SubCategory[];
}

interface MultiSelectCheckboxProps {
  label: string;
  icon?: React.ReactNode;
  categories: Category[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
}

export function MultiSelectCheckbox({
  label,
  icon,
  categories,
  selectedIds,
  onChange,
  placeholder = 'Sélectionnez...',
}: MultiSelectCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if a parent category is fully selected (all children checked)
  const isParentFullySelected = (category: Category): boolean => {
    return category.subCategories.every((sub) => selectedIds.includes(sub.id));
  };

  // Check if a parent category is partially selected (some children checked)
  const isParentPartiallySelected = (category: Category): boolean => {
    const selectedSubCount = category.subCategories.filter((sub) =>
      selectedIds.includes(sub.id)
    ).length;
    return selectedSubCount > 0 && selectedSubCount < category.subCategories.length;
  };

  // Handle parent checkbox toggle
  const handleParentToggle = (category: Category) => {
    const isFullySelected = isParentFullySelected(category);
    const subIds = category.subCategories.map((sub) => sub.id);

    if (isFullySelected) {
      // Uncheck all children
      onChange(selectedIds.filter((id) => !subIds.includes(id)));
    } else {
      // Check all children
      const newSelected = [...selectedIds];
      subIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onChange(newSelected);
    }
  };

  // Handle child checkbox toggle
  const handleChildToggle = (childId: string) => {
    if (selectedIds.includes(childId)) {
      onChange(selectedIds.filter((id) => id !== childId));
    } else {
      onChange([...selectedIds, childId]);
    }
  };

  // Get display text for the dropdown button
  const getDisplayText = (): string => {
    if (selectedIds.length === 0) {
      return placeholder;
    }

    // Get all selected category/subcategory labels
    const selectedLabels: string[] = [];
    categories.forEach((category) => {
      category.subCategories.forEach((sub) => {
        if (selectedIds.includes(sub.id)) {
          selectedLabels.push(sub.label);
        }
      });
    });

    if (selectedLabels.length === 1) {
      return selectedLabels[0];
    } else if (selectedLabels.length === 2) {
      return `${selectedLabels[0]}, ${selectedLabels[1]}`;
    } else {
      return `${selectedLabels.length} catégories sélectionnées`;
    }
  };

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
        {icon}
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-full px-3 py-3 bg-white border border-neutral-300 rounded-lg text-left flex items-center justify-between transition-all focus:border-[#187A58] focus:outline-none"
          style={{ fontSize: '14px', fontWeight: 400 }}
        >
          <span className={selectedIds.length === 0 ? 'text-neutral-400' : 'text-neutral-800'}>
            {selectedIds.length === 0
              ? placeholder
              : `${selectedIds.length} sélectionné${selectedIds.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
            <div className="py-2">
              {categories.map((category) => {
                const isFullySelected = isParentFullySelected(category);
                const isPartiallySelected = isParentPartiallySelected(category);

                return (
                  <div key={category.id} className="mb-1">
                    {/* Parent Category */}
                    <button
                      type="button"
                      onClick={() => handleParentToggle(category)}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isFullySelected
                            ? 'bg-primary border-primary'
                            : isPartiallySelected
                            ? 'bg-primary/30 border-primary'
                            : 'bg-white border-neutral-400'
                        }`}
                      >
                        {isFullySelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        {isPartiallySelected && (
                          <div className="w-2.5 h-0.5 bg-primary rounded"></div>
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className="text-bg-base"
                        style={{ fontSize: '15px', fontWeight: 600 }}
                      >
                        {category.label}
                      </span>
                    </button>

                    {/* Sub-categories */}
                    <div className="ml-4">
                      {category.subCategories.map((subCategory) => {
                        const isSelected = selectedIds.includes(subCategory.id);

                        return (
                          <button
                            key={subCategory.id}
                            type="button"
                            onClick={() => handleChildToggle(subCategory.id)}
                            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-neutral-50 transition-colors"
                          >
                            {/* Checkbox */}
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-primary border-primary'
                                  : 'bg-white border-neutral-400'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </div>

                            {/* Label */}
                            <span
                              className="text-neutral-700"
                              style={{ fontSize: '14px', fontWeight: 400 }}
                            >
                              {subCategory.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with selection count */}
            {selectedIds.length > 0 && (
              <div className="border-t border-neutral-200 px-4 py-2 bg-neutral-50">
                <p className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                  {selectedIds.length} {selectedIds.length === 1 ? 'catégorie sélectionnée' : 'catégories sélectionnées'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}