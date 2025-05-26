export default function Footer(){
    return(
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} TaskFlow. Built with React, Express-Node.js, and secure authentication.
              </p>
            </div>
          </div>
        </footer>
    )
}
