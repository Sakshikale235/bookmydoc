import React from 'react';
import { UserInfo } from '../../types/chatbot';

interface SummaryCardProps {
  userInfo: UserInfo;
  onEditField: (field: string) => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ userInfo, onEditField }) => {
  const calculateBMI = () => {
    if (userInfo.height && userInfo.weight) {
      const heightInMeters = userInfo.height / 100;
      const bmi = userInfo.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const bmi = calculateBMI();
  const bmiValue = bmi ? parseFloat(bmi) : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Information</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Age:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-800">{userInfo.age || 'Not provided'}</span>
              <button
                onClick={() => onEditField('age')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Gender:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-800">{userInfo.gender || 'Not provided'}</span>
              <button
                onClick={() => onEditField('gender')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Height:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-800">
                {userInfo.height ? `${userInfo.height} cm` : 'Not provided'}
              </span>
              <button
                onClick={() => onEditField('height')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Weight:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-800">
                {userInfo.weight ? `${userInfo.weight} kg` : 'Not provided'}
              </span>
              <button
                onClick={() => onEditField('weight')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Blood Group:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-800">{userInfo.blood_group || 'Not provided'}</span>
              <button
                onClick={() => onEditField('blood_group')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Location:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-800">{userInfo.location || 'Not provided'}</span>
              <button
                onClick={() => onEditField('address')}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {bmiValue && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">BMI:</span>
            <span className="text-sm text-gray-800">
              {bmi} ({getBMICategory(bmiValue)})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
