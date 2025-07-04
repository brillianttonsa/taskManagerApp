import { features } from "../utils/features"
export default function Features(){
    return(
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            
                {features.map((feature,index) => (
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`w-8 h-8 bg-${feature.color}-500 rounded-md flex items-center justify-center`}>
                                    <span className="text-white text-lg">{feature.icon}</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    )
}