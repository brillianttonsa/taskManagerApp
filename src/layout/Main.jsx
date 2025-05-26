import LeftColumn from "../components/LeftColumn";
import RightColumn from "../components/RightColumn";

// Main.jsx
export default function Main(){
    return(
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <LeftColumn/>
                <RightColumn/>
            </div>
        </main>
    )
}