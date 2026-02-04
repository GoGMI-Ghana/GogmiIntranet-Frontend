import { Megaphone } from 'lucide-react';

export default function Advocacy() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 mb-6">
            <Megaphone className="w-10 h-10 text-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Advocacy</h1>
          <p className="text-xl text-gray-600 mb-8">Coming Soon</p>
          <p className="text-gray-500">
            This section is under development. Advocacy and outreach features will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
