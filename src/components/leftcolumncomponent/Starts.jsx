import { stats } from "../utils/stats"
export default function Starts() {
    return (
        <div className="mt-10 bg-white rounded-lg p-6 shadow-sm border border-gray-200">  
            <div className="grid grid-cols-3 gap-4 text-center">
                {stats.map((stats,index) => (
                    <div>
                        <div
                        className={`text-2xl font-bold text-${stats.color}-600`}>{stats.stats}</div>
                        <div className="text-sm text-gray-500">{stats.description}</div>
                    
                    </div> 
                ))}               
            </div>
        </div>
    )
}