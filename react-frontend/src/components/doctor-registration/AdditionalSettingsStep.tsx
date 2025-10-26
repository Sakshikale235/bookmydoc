import React from 'react';
import { FileText, Plus, X } from 'lucide-react';

interface AdditionalSettingsStepProps {
  formData: {
    bio: string;
    assistantContact: string;
    conditions: string[];
    advanceNotice: string;
    homeVisits: boolean;
    autoConfirm: boolean;
    feedbackSummary: boolean;
  };
  handleInputChange: (field: string, value: any) => void;
  handleArrayChange: (field: string, index: number, value: string) => void;
  addArrayItem: (field: string) => void;
  removeArrayItem: (field: string, index: number) => void;
}

const AdditionalSettingsStep: React.FC<AdditionalSettingsStepProps> = ({
  formData,
  handleInputChange,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FileText className="w-6 h-6 mr-2" />
        Additional Settings
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio (50-100 words)
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide a brief professional bio highlighting your expertise and approach to patient care..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assistant/Receptionist Contact (Optional)
          </label>
          <input
            type="text"
            value={formData.assistantContact}
            onChange={(e) => handleInputChange('assistantContact', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contact number for patient queries"
          />
        </div>

        {/* Common Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Common Medical Conditions You Handle
          </label>
          {formData.conditions.map((condition, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={condition}
                onChange={(e) => handleArrayChange('conditions', index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Hypertension, Diabetes"
              />
              {formData.conditions.length > 1 && (
                <button
                  onClick={() => removeArrayItem('conditions', index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayItem('conditions')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Another Condition
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Advance Notice Required (e.g., 24 hours)
          </label>
          <input
            type="text"
            value={formData.advanceNotice}
            onChange={(e) => handleInputChange('advanceNotice', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="24 hours"
          />
        </div>

        {/* Toggle Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Home Visits</h3>
              <p className="text-sm text-gray-600">Do you conduct home visits?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.homeVisits}
                onChange={(e) => handleInputChange('homeVisits', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Auto-Confirm Appointments</h3>
              <p className="text-sm text-gray-600">Enable automatic appointment confirmation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.autoConfirm}
                onChange={(e) => handleInputChange('autoConfirm', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Monthly Feedback Summaries</h3>
              <p className="text-sm text-gray-600">Receive monthly feedback to improve service</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.feedbackSummary}
                onChange={(e) => handleInputChange('feedbackSummary', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalSettingsStep;
