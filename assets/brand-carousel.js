class BrandCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentIndex = 0;
    this.carouselInterval = null;
    this.desktopItems = 4;  // Default items for desktop
    this.tabletItems = 3;   // Default items for tablet
    this.mobileItems = 2;   // Default items for mobile
    this.totalItems = 0;
  }

  connectedCallback() {
    this.render();
    this.initializeCarousel();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* Carousel Styles */
        .carousel-wrapper {
          overflow: hidden;
          position: relative;
        }
        .carousel-container {
          display: flex;
          transition: transform 0.5s ease;
        }
        .carousel-item {
          flex: 0 0 auto;
          width: 25%;
          position: relative;
        }
        .carousel-item img {
          width: 100%;
          height: auto;
        }
        .carousel-item .brand-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 10px;
          text-align: center;
        }

        /* Responsiveness */
        @media (max-width: 1024px) {
          .carousel-item {
            width: 33.33%;
          }
        }
        @media (max-width: 768px) {
          .carousel-item {
            width: 50%;
          }
        }
      </style>

      <div class="carousel-wrapper">
        <div class="carousel-container">
          <!-- Carousel items will be dynamically added here -->
        </div>
      </div>
      <button class="carousel-prev">&#10094;</button>
      <button class="carousel-next">&#10095;</button>
    `;
  }

  // Initialize the carousel with items and autoplay
  initializeCarousel() {
    this.carouselContainer = this.shadowRoot.querySelector('.carousel-container');
    this.carouselPrevButton = this.shadowRoot.querySelector('.carousel-prev');
    this.carouselNextButton = this.shadowRoot.querySelector('.carousel-next');

    this.addCarouselItems(); // Add carousel items dynamically
    this.totalItems = this.carouselContainer.children.length;

    this.updateCarousel();
    this.startAutoplay();
  }

  // Function to dynamically add carousel items from the blocks
  addCarouselItems() {
    const blocks = this.querySelectorAll('carousel-item'); // Here we're using the custom tag
    blocks.forEach(block => {
      const item = document.createElement('div');
      item.classList.add('carousel-item');
      item.innerHTML = `
        <img src="${block.dataset.image}" alt="${block.dataset.name}">
        <div class="brand-overlay">${block.dataset.name}</div>
      `;
      this.carouselContainer.appendChild(item);
    });

    // Clone first and last items for infinite loop effect
    const firstItem = this.carouselContainer.firstElementChild.cloneNode(true);
    const lastItem = this.carouselContainer.lastElementChild.cloneNode(true);
    this.carouselContainer.appendChild(firstItem);
    this.carouselContainer.insertBefore(lastItem, this.carouselContainer.firstChild);
  }

  // Start autoplay of the carousel
  startAutoplay() {
    this.carouselInterval = setInterval(() => {
      this.goToNextItem();
    }, 3000);
  }

  // Stop autoplay
  stopAutoplay() {
    clearInterval(this.carouselInterval);
  }

  // Update the carousel to show the correct items
  updateCarousel() {
    const itemsToShow = this.getItemsToShow();
    const offset = -this.currentIndex * (100 / itemsToShow);
    this.carouselContainer.style.transform = `translateX(${offset}%)`;
  }

  // Get the number of items to show based on screen size
  getItemsToShow() {
    const screenWidth = window.innerWidth;
    let itemsToShow = this.desktopItems;

    if (screenWidth <= 1024 && screenWidth > 768) {
      itemsToShow = this.tabletItems;
    } else if (screenWidth <= 768) {
      itemsToShow = this.mobileItems;
    }

    return itemsToShow;
  }

  // Go to the next carousel item
  goToNextItem() {
    this.currentIndex = (this.currentIndex + 1) % this.totalItems;
    this.updateCarousel();
  }

  // Go to the previous carousel item
  goToPrevItem() {
    this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
    this.updateCarousel();
  }

  // Add event listeners for carousel navigation
  addEventListeners() {
    this.carouselPrevButton.addEventListener('click', () => this.goToPrevItem());
    this.carouselNextButton.addEventListener('click', () => this.goToNextItem());
  }
}

// Define the custom element 'brand-carousel'
customElements.define('brand-carousel', BrandCarousel);
