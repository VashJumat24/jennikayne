class BrandCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentIndex = 0;
    this.carouselInterval = null;
    this.desktopItems = 4;  // Set default items for desktop
    this.tabletItems = 3;   // Set default items for tablet
    this.mobileItems = 2;   // Set default items for mobile
    this.totalItems = 0;
  }

  connectedCallback() {
    this.render();
    this.initializeCarousel();
    this.addEventListeners();
  }

  // Function to render the carousel structure
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
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 20px;
        }
        .product-item {
          border: 1px solid #ddd;
          padding: 15px;
          text-align: center;
        }
        .product-item img {
          width: 100%;
          height: auto;
        }
        .product-item .product-title {
          font-size: 1.2rem;
          margin-top: 10px;
        }
        .product-item .product-price {
          font-size: 1.1rem;
          color: #b12704;
        }

        /* Responsiveness */
        @media (max-width: 1024px) {
          .carousel-item {
            width: 33.33%;
          }
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .carousel-item {
            width: 50%;
          }
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
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
      <div class="product-grid">
        <!-- Product grid will be dynamically populated here -->
      </div>
    `;
  }

  // Function to initialize the carousel with settings and autoplay
  initializeCarousel() {
    this.carouselContainer = this.shadowRoot.querySelector('.carousel-container');
    this.carouselPrevButton = this.shadowRoot.querySelector('.carousel-prev');
    this.carouselNextButton = this.shadowRoot.querySelector('.carousel-next');

    // Adjust the total number of items in the carousel
    this.totalItems = this.shadowRoot.querySelectorAll('.carousel-item').length;

    this.updateCarousel();
    this.startAutoplay();
  }

  // Function to start the autoplay of the carousel
  startAutoplay() {
    this.carouselInterval = setInterval(() => {
      this.goToNextItem();
    }, 3000);
  }

  // Function to stop the autoplay
  stopAutoplay() {
    clearInterval(this.carouselInterval);
  }

  // Function to update the carousel display
  updateCarousel() {
    const itemsToShow = this.getItemsToShow();
    const offset = -this.currentIndex * (100 / itemsToShow);
    this.carouselContainer.style.transform = `translateX(${offset}%)`;
  }

  // Function to determine how many items to show based on the screen size
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

  // Function to move to the next item in the carousel
  goToNextItem() {
    this.currentIndex = (this.currentIndex + 1) % this.totalItems;
    this.updateCarousel();
  }

  // Function to move to the previous item in the carousel
  goToPrevItem() {
    this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
    this.updateCarousel();
  }

  // Function to add event listeners for carousel navigation
  addEventListeners() {
    this.carouselPrevButton.addEventListener('click', () => this.goToPrevItem());
    this.carouselNextButton.addEventListener('click', () => this.goToNextItem());

    // Event listener for when a carousel item is clicked
    this.carouselContainer.addEventListener('click', (e) => {
      const clickedItem = e.target.closest('.carousel-item');
      if (clickedItem) {
        const brandCollection = clickedItem.getAttribute('data-collection');
        const collectionTitle = `Shop ${brandCollection}`;
        
        // Update the page title dynamically
        document.title = collectionTitle;

        // Fetch products for the selected brand
        this.fetchBrandProducts(brandCollection);
      }
    });
  }

  // Fetch products for the selected brand
  fetchBrandProducts(brandCollection) {
    fetch(`/collections/${brandCollection}.json`)
      .then(response => response.json())
      .then(data => {
        const products = data.products;
        const productContainer = this.shadowRoot.querySelector('.product-grid');
        productContainer.innerHTML = ''; // Clear existing products

        // Add the products to the grid
        products.forEach(product => {
          const productElement = document.createElement('div');
          productElement.classList.add('product-item');
          
          productElement.innerHTML = `
            <a href="${product.url}" class="product-link">
              <img src="${product.featured_image.src}" alt="${product.title}" class="product-image" />
              <h3 class="product-title">${product.title}</h3>
              <p class="product-price">${product.price}</p>
            </a>
          `;
          
          productContainer.appendChild(productElement);
        });
      })
      .catch(error => {
        console.error('Error fetching brand products:', error);
        alert('Failed to load products for this brand.');
      });
  }
}

// Define the custom element 'brand-carousel'
customElements.define('brand-carousel', BrandCarousel);
