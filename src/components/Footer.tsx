import { Github } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Side */}
          <div className="text-sm flex gap-4">
            <img src="https://bettergov.ph/logos/svg/BetterGov_Icon-White.svg" alt="BetterGov" width="48" height="48" />
            <p className="font-semibold text-white mb-2">BetterGov.ph
            <p className="text-gray-400">
              A community portal providing Philippine citizens, businesses, and visitors with information and services.
            </p>
            </p>
          </div>

          {/* Right Side */}
          <div className="text-sm text-right flex items-center justify-center md:justify-end">
            <a
              href="https://github.com/bettergovph/ph-tax-directory"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
              <span>Contribute to GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
