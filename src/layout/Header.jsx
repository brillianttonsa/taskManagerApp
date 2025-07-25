export default function Header(){
    return(
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-3xl font-bold text-blue-600">TaskFlow</h1>
                </div>
               
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">Manage task with ease</div>
              </div>
            </div>
          </div>
        </header>
    )
}

