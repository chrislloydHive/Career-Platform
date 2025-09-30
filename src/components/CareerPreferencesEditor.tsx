'use client';

import { useState } from 'react';
import { CareerPreferences } from '@/types/user-profile';

interface CareerPreferencesEditorProps {
  preferences: CareerPreferences;
  onSave: (preferences: CareerPreferences) => Promise<void>;
}

export function CareerPreferencesEditor({ preferences: initialPreferences, onSave }: CareerPreferencesEditorProps) {
  const [preferences, setPreferences] = useState<CareerPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateField = <K extends keyof CareerPreferences>(
    field: K,
    value: CareerPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const addToList = (field: keyof CareerPreferences, value: string) => {
    if (!value.trim()) return;
    const currentValue = preferences[field];
    if (Array.isArray(currentValue)) {
      updateField(field, [...currentValue, value.trim()] as CareerPreferences[typeof field]);
    }
  };

  const removeFromList = (field: keyof CareerPreferences, index: number) => {
    const currentValue = preferences[field];
    if (Array.isArray(currentValue)) {
      updateField(field, currentValue.filter((_, i) => i !== index) as CareerPreferences[typeof field]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(preferences);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderListEditor = (
    field: keyof CareerPreferences,
    label: string,
    placeholder: string
  ) => {
    const items = preferences[field];
    if (!Array.isArray(items)) return null;
    const [inputValue, setInputValue] = useState('');

    const handleAddItem = () => {
      if (inputValue.trim()) {
        addToList(field, inputValue);
        setInputValue('');
        setEditingField(null);
      }
    };

    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3">{label}</h3>
        {items.length > 0 && (
          <div className="space-y-2 mb-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-900 rounded-lg p-2 sm:p-3">
                <span className="flex-1 text-sm text-gray-300">{item}</span>
                <button
                  onClick={() => removeFromList(field, index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {editingField === field ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                } else if (e.key === 'Escape') {
                  setInputValue('');
                  setEditingField(null);
                }
              }}
              autoFocus
            />
            <button
              onClick={handleAddItem}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add
            </button>
            <button
              onClick={() => {
                setInputValue('');
                setEditingField(null);
              }}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingField(field)}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add item
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <h2 className="text-base sm:text-lg font-semibold text-blue-100 mb-2">Career Preferences</h2>
        <p className="text-xs sm:text-sm text-blue-200">
          These preferences guide the AI in finding the best opportunities for you. Be specific and honest -
          this information is used to personalize every job recommendation and career suggestion.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3">Ideal Role Description</h3>
        <textarea
          value={preferences.idealRole}
          onChange={(e) => updateField('idealRole', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg text-sm min-h-[100px]"
          placeholder="Describe your ideal role in detail..."
        />
      </div>

      {renderListEditor('whatMatters', 'What Matters Most', 'e.g., Helping people, Growth opportunities')}
      {renderListEditor('workEnvironment', 'Ideal Work Environment', 'e.g., Collaborative team, Remote flexibility')}
      {renderListEditor('dealBreakers', 'Deal Breakers', 'e.g., Poor work-life balance, No growth')}
      {renderListEditor('motivations', 'What Motivates You', 'e.g., Making an impact, Solving problems')}
      {renderListEditor('skillsToLeverage', 'Skills to Leverage', 'e.g., Marketing strategy, Client relations')}
      {renderListEditor('skillsToGrow', 'Skills to Grow', 'e.g., Data analytics, Leadership')}
      {renderListEditor('cultureFit', 'Culture Fit', 'e.g., Values transparency, Encourages innovation')}

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3">Work-Life Balance</h3>
        <textarea
          value={preferences.workLifeBalance}
          onChange={(e) => updateField('workLifeBalance', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg text-sm min-h-[80px]"
          placeholder="Describe your work-life balance priorities..."
        />
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3">Compensation Priority</h3>
        <textarea
          value={preferences.compensationPriority}
          onChange={(e) => updateField('compensationPriority', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg text-sm min-h-[80px]"
          placeholder="Describe your compensation priorities and expectations..."
        />
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3">Additional Notes</h3>
        <textarea
          value={preferences.customNotes}
          onChange={(e) => updateField('customNotes', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg text-sm min-h-[150px]"
          placeholder="Any additional context, insights, or preferences you want the AI to know..."
        />
      </div>

      {hasChanges && (
        <div className="sticky bottom-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-300">You have unsaved changes</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPreferences(initialPreferences);
                  setHasChanges(false);
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}