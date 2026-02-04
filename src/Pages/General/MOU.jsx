import { FileText } from 'lucide-react';

export default function MOU() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Memorandum of Understanding</h1>
          <p className="text-xl text-gray-600 mb-8">Coming Soon</p>
          <p className="text-gray-500">
            This section is under development. MOU management features will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
