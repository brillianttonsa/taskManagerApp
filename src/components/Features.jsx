export default function Features(){
    return(
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-lg">📋</span>
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Weekly Planning</h3>
                        <p className="text-sm text-gray-500">Organize tasks by week with automatic archiving</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">📊</span>
                    </div>
                    </div>
                    <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Progress Tracking</h3>
                    <p className="text-sm text-gray-500">Visual dashboards and completion analytics</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">👨‍👩‍👧‍👦</span>
                    </div>
                    </div>
                    <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Family Collaboration</h3>
                    <p className="text-sm text-gray-500">Share and assign tasks with family members</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">📈</span>
                    </div>
                    </div>
                    <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Weekly Reports</h3>
                    <p className="text-sm text-gray-500">Generate PDF reports of your progress</p>
                    </div>
                </div>
            </div>
        </div>
    )
}