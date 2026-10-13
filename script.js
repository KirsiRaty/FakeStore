let shoppingcart = [];

// ================== Fetch Products ==================
function fetchProducts() {
  fetch('https://fakestoreapi.com/products')
    .then(response => response.json())
    .then(products => displayProducts(products))
    .catch(error => console.error('Error fetching products:', error));
}

// ================== Display Products ==================
function displayProducts(products) {
  const container = document.getElementById('product-list');

  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');

    // Add-to-Cart button now uses class="add-to-cart" and no inline styles
card.innerHTML = `
  <img src="${product.image}" alt="${product.title}" />
  <h3>${product.title}</h3>
  <div class="card-bottom">
    <p class="price">$${product.price}</p>
    <button class="add-to-cart" data-id="${product.id}">
      Add to Cart
    </button>
  </div>
`;

    container.appendChild(card);
  });

  // Attach event listeners to all Add-to-Cart buttons
  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const id = parseInt(button.dataset.id);
      const product = products.find(p => p.id === id);
      addToCart(product);
    });
  });
}

// ================== Add to Cart ==================
function addToCart(product) {
  shoppingcart.push(product);
  localStorage.setItem('shoppingcart', JSON.stringify(shoppingcart));
  updateCartUI();
}

// ================== Update Cart UI ==================
function updateCartUI() {
  const cartList = document.getElementById('cart-items');
  cartList.innerHTML = '';

  shoppingcart.forEach((item, index) => {
    const li = document.createElement('li');

    li.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; gap: 20px;">
        
        <div style="display: flex; align-items: center; gap: 20px;">
          <img src="${item.image}" alt="${item.title}" width="40" height="40" style="object-fit: contain;" />
          <div>
            <p style="margin: 0; font-weight: bold;">${item.title}</p>
            <p style="margin: 0; padding-top:8px;">$${item.price}</p>
          </div>
        </div>

        <button class="delete-item" data-index="${index}">✖</button>
      </div>
    `;

    cartList.appendChild(li);
  });
}

// ================== Load Cart from LocalStorage ==================
window.addEventListener('load', () => {
  const storedCart = localStorage.getItem('shoppingcart');
  if (storedCart) {
    shoppingcart = JSON.parse(storedCart);
    updateCartUI();
  }

  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
});

// ================== Dark Mode Toggle ==================
document.getElementById('toggle-dark').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// ================== Delete Cart Item ==================
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-item')) {
    const index = e.target.dataset.index;
    shoppingcart.splice(index, 1);
    localStorage.setItem('shoppingcart', JSON.stringify(shoppingcart));
    updateCartUI();
  }
});

// ================== Initialize ==================
fetchProducts();
