class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <div class="flex-shrink-0 flex items-center">
              <a href="index.html" class="text-2xl sm:text-3xl font-bold text-gray-800">
                What To Do <span class="font-normal text-gray-500">by Nana Sue</span>
              </a>
            </div>
            
            <!-- Desktop Navigation -->
            <div class="hidden md:flex md:items-center md:space-x-10">
              <a href="index.html" class="nav-link text-gray-600 hover:text-gray-900 px-3 py-2 text-base font-medium">Home</a>
              <a href="about.html" class="nav-link text-gray-600 hover:text-gray-900 px-3 py-2 text-base font-medium">About</a>
              <a href="playbook.html" class="nav-link text-gray-600 hover:text-gray-900 px-3 py-2 text-base font-medium">PlayBook</a>
              <a href="schedule.html" class="nav-link text-gray-600 hover:text-gray-900 px-3 py-2 text-base font-medium">Schedule</a>
              <a href="contact.html" class="nav-link text-gray-600 hover:text-gray-900 px-3 py-2 text-base font-medium">Contact</a>
            </div>

            <!-- Mobile Menu Button -->
            <div class="md:hidden flex items-center">
              <button id="hamburger-btn" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--sage-green)]">
                <span class="sr-only">Open main menu</span>
                <!-- Icon Open -->
                <svg id="icon-open" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <!-- Icon Close -->
                <svg id="icon-close" class="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="index.html" class="mobile-nav-link block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Home</a>
            <a href="about.html" class="mobile-nav-link block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">About</a>
            <a href="playbook.html" class="mobile-nav-link block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">PlayBook</a>
            <a href="schedule.html" class="mobile-nav-link block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Schedule</a>
            <a href="contact.html" class="mobile-nav-link block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Contact</a>
          </div>
        </div>
      </header>
    `;

    this.highlightActiveLink();
    this.initMobileMenu();
  }

  highlightActiveLink() {
    // Get current page name (e.g., "playbook.html")
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // Find all links in this component
    const links = this.querySelectorAll('a');

    links.forEach(link => {
      // If the link href matches the current page, add 'active' class
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }

  initMobileMenu() {
    const hamburgerBtn = this.querySelector("#hamburger-btn");
    const mobileMenu = this.querySelector("#mobile-menu");
    const iconOpen = this.querySelector("#icon-open");
    const iconClose = this.querySelector("#icon-close");

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
        iconOpen.classList.toggle("hidden");
        iconClose.classList.toggle("hidden");
      });
    }
  }
}

// Register the custom tag <site-header>
customElements.define('site-header', SiteHeader);