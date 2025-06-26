"use client"

import { useState } from "react"
import { ChevronDownIcon, GiftIcon, FireIcon, Squares2X2Icon } from "@heroicons/react/24/outline"

const NavbarSection = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [selectedShipTo, setSelectedShipTo] = useState({ country: "Germany", flag: "🇩🇪", code: "DE" })

  const categories = [
    { name: "Automobiles", id: "6851bb0bbde28e12d8b5f4c3" },
    { name: "Clothes and wear", id: "6851bb0bbde28e12d8b5f4c4" },
    { name: "Home interiors", id: "6851bb0bbde28e12d8b5f4c5" },
    { name: "Computer and tech", id: "685057c94315074980a6bcfe" },//6851bb0bbde28e12d8b5f4c6
    { name: "Tools, equipments", id: "6851bb0bbde28e12d8b5f4c7" },
    { name: "Sports and outdoor", id: "6851bb0bbde28e12d8b5f4c8" },
    { name: "Animal and pets", id: "6851bb0bbde28e12d8b5f4c9" },
    { name: "Machinery tools", id: "6851bb0bbde28e12d8b5f4ca" },
    { name: "More category", id: "6851bb0bbde28e12d8b5f4cb" },
  ]

  const languages = [
    { code: "EN", name: "English", flag: "🇺🇸" },
    { code: "ES", name: "Spanish", flag: "🇪🇸" },
    { code: "FR", name: "French", flag: "🇫🇷" },
    { code: "DE", name: "German", flag: "🇩🇪" },
    { code: "ZH", name: "Chinese", flag: "🇨🇳" },
    { code: "AR", name: "Arabic", flag: "🇸🇦" },
  ]

  const shippingCountries = [
    { country: "Germany", flag: "🇩🇪", code: "DE" },
    { country: "United States", flag: "🇺🇸", code: "US" },
    { country: "United Kingdom", flag: "🇬🇧", code: "GB" },
    { country: "France", flag: "🇫🇷", code: "FR" },
    { country: "Spain", flag: "🇪🇸", code: "ES" },
    { country: "Italy", flag: "🇮🇹", code: "IT" },
    { country: "Canada", flag: "🇨🇦", code: "CA" },
    { country: "Australia", flag: "🇦🇺", code: "AU" },
    { country: "Japan", flag: "🇯🇵", code: "JP" },
    { country: "China", flag: "🇨🇳", code: "CN" },
  ]

  return (
    <nav className="hidden md:block bg-white border-y border-gray-200 bg-white shadow-lg sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left Section */}
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide sm:overflow-visible w-full min-w-0">
              {/* All Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("categories")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-3 focus:outline-none">
                  <Squares2X2Icon className="h-4 w-4 hidden sm:block" />
                  <span className="text-sm font-medium">All category</span>
                  <ChevronDownIcon className="h-4 w-4 hidden sm:block" />
                </button>

                {activeDropdown === "categories" && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[100]">
                    <div className="py-2">
                      {categories.map((category) => (
                        <a
                          key={category.id}
                          href={`/products?category=${category.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        >
                          {category.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hot Offers */}
              <a href="/hot-offers" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 py-3">
                <FireIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Hot offers</span>
              </a>

              {/* Gift Boxes */}
              <a href="/gift-boxes" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 py-3">
                <GiftIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Gift boxes</span>
              </a>

              {/* Projects */}
              <a href="/projects" className="text-sm font-medium text-gray-700 hover:text-blue-600 py-3">
                Projects
              </a>

              {/* Menu Item */}
              <a href="/menu" className="text-sm font-medium text-gray-700 hover:text-blue-600 py-3">
                Menu item
              </a>

              {/* Help */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("help")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 py-3 focus:outline-none">
                  <span className="text-sm font-medium">Help</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {activeDropdown === "help" && (
                  <div className="absolute top-full left-0 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-[100]">
                    <div className="py-2">
                      <a href="/support" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Support
                      </a>
                      <a href="/faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        FAQ
                      </a>
                      <a href="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Contact
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Language Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("language")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-3 focus:outline-none">
                <span className="text-sm font-medium">English, USD</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {activeDropdown === "language" && (
                <div className="absolute top-full right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[100]">
                  <div className="py-2">
                    {languages.map((lang, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                        onClick={() => {
                          setActiveDropdown(null)
                        }}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ship to Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("shipto")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-3 focus:outline-none">
                <span className="text-sm font-medium">Ship to</span>
                <span className="text-lg">{selectedShipTo.flag}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {activeDropdown === "shipto" && (
                <div className="absolute top-full right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[100]">
                  <div className="py-2">
                    {shippingCountries.map((country, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                        onClick={() => {
                          setSelectedShipTo(country)
                          setActiveDropdown(null)
                        }}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span>{country.country}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavbarSection
