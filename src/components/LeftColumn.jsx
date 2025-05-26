import Features from "./Features";
import Starts from "./Starts";

export default function LeftColumn(){
    return(
        <div className="lg:col-span-7 mb-8 lg:mb-0">
            <div className="max-w-2xl">
                <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                  Organize Your Life
                  <span className="block text-blue-600">One Task at a Time</span>
                </h2>
                <p className="mt-6 text-xl text-gray-500">
                  TaskFlow helps you manage your weekly tasks, track progress, and collaborate with family members. Stay
                  organized and achieve your goals with our intuitive task management system.
                </p>

                <Features/>
                <Starts/>

            </div>
        </div>
    )
}