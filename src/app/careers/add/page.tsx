'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { CareerFormWizard } from '@/components/CareerFormWizard';
import { JobCategory } from '@/types/career';

export default function AddCareerPage() {
  const [showForm, setShowForm] = useState(false);
  const [savedCareers, setSavedCareers] = useState<JobCategory[]>([]);

  const handleCareerSaved = (career: JobCategory) => {
    setSavedCareers(prev => [...prev, career]);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation
        title="Add New Career"
        subtitle="Create new career profiles for the database"
        actions={
          !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Career
            </button>
          ) : null
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showForm ? (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">Add Careers to the Database</h2>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Create comprehensive career profiles with detailed information about job roles, requirements,
                daily tasks, salary ranges, and career progression paths.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create New Career Profile
              </button>
            </div>

            {savedCareers.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-4">Recently Added Careers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedCareers.map((career, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                      <h4 className="text-lg font-semibold text-gray-100 mb-2">{career.title}</h4>
                      <p className="text-sm text-gray-400 mb-3">{career.category}</p>
                      <p className="text-sm text-gray-300 line-clamp-2">{career.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <CareerFormWizard
            onSave={handleCareerSaved}
            onCancel={() => setShowForm(false)}
          />
        )}
      </main>
    </div>
  );
}