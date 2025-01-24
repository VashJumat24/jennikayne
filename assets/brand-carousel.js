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
    this.productsContainer = null; // To hold the products container
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
          gap:1.5rem; 
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
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 1.5em;
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

        /* Product list styles */
        .product-list {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 30px;
        }
        .product-item img {
          width: 100%;
          height: auto;
        }
      </style>

      <div class="carousel-wrapper">
        <div class="carousel-container">
          <!-- Carousel items will be dynamically added here -->
        </div>
      </div>
      <button class="carousel-prev">&#10094;</button>
      <button class="carousel-next">&#10095;</button>
      
      <div class="product-list">
        <!-- Products will be dynamically added here -->
      </div>
    `;
  }

  // Initialize the carousel with items and autoplay
  initializeCarousel() {
    this.carouselContainer = this.shadowRoot.querySelector('.carousel-container');
    this.carouselPrevButton = this.shadowRoot.querySelector('.carousel-prev');
    this.carouselNextButton = this.shadowRoot.querySelector('.carousel-next');
    this.productsContainer = this.shadowRoot.querySelector('.product-list');

    this.addCarouselItems(); // Add carousel items dynamically
    this.totalItems = this.carouselContainer.children.length;

    this.updateCarousel();
    //this.startAutoplay();
  }

  // Function to dynamically add carousel items from the blocks
  addCarouselItems() {
    const blocks = this.querySelectorAll('carousel-item'); // Here we're using the custom tag
    blocks.forEach(block => {
      const item = document.createElement('div');
      item.classList.add('carousel-item');
      item.dataset.handle = block.dataset.handle; // Storing the handle of the brand in the dataset
      item.innerHTML = `
        <img src="${block.dataset.image}" alt="${block.dataset.name}">
        <div class="brand-overlay">${block.dataset.name}</div>
      `;
      item.addEventListener('click', () => this.fetchAndDisplayProducts(item.dataset.handle));
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

  // Fetch products for the selected brand
  fetchAndDisplayProducts(brandHandle) {
    this.productsContainer.innerHTML = '<p>Loading products...</p>'; // Show loading text

    fetch(`/collections/${brandHandle}/products.json`)
      .then(response => response.json())
      .then(data => {
        const products = data.products;
        this.displayProducts(products);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        this.productsContainer.innerHTML = '<p>Sorry, there was an error loading the products.</p>';
      });
  }

  // Display products in the product list
  displayProducts(products) {
    this.productsContainer.innerHTML = ''; // Clear the loading message

    if (products.length > 0) {
      products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
          <a href="/products/${product.handle}">
            <img src="${product.featured_image.src}" alt="${product.title}" />
            <p class="product-title">${product.title}</p>
            <p class="product-price">${(product.price / 100).toFixed(2)} USD</p>
          </a>
        `;
        this.productsContainer.appendChild(productItem);
      });
    } else {
      this.productsContainer.innerHTML = '<p>No products found for this brand.</p>';
    }
  }
}

// Define the custom element 'brand-carousel'
customElements.define('brand-carousel', BrandCarousel);
