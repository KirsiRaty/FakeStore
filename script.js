let shoppingcart = [];
let allProducts = [];
let activeFilter = 'all';

const categoryMatches = {
  clothing: ["men's clothing", "women's clothing"],
  jewelery: ['jewelery'],
  electronics: ['electronics']
};

const formatPrice = price => `$${Number(price).toFixed(2)}`;

function fetchProducts() {
  const container = document.getElementById('product-list');
  container.innerHTML = '<p class="loading-message">Gathering the good things…</p>';

  fetch('https://fakestoreapi.com/products')
    .then(response => {
      if (!response.ok) throw new Error('Products could not be loaded.');
      return response.json();
    })
    .then(products => {
      allProducts = products;
      displayProducts();
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      container.innerHTML = '<p class="empty-results">We couldn’t load the collection just now. Please try again shortly.</p>';
      document.getElementById('product-count').textContent = '';
    });
}

function displayProducts() {
  const container = document.getElementById('product-list');
  const query = document.getElementById('product-search').value.trim().toLowerCase();
  const sortBy = document.getElementById('sort-products').value;
  let products = allProducts.filter(product => {
    const categoryMatch = activeFilter === 'all' || categoryMatches[activeFilter]?.includes(product.category);
    const searchMatch = `${product.title} ${product.category}`.toLowerCase().includes(query);
    return categoryMatch && searchMatch;
  });

  if (sortBy === 'price-low') products.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') products.sort((a, b) => b.price - a.price);
  if (sortBy === 'name') products.sort((a, b) => a.title.localeCompare(b.title));

  document.getElementById('product-count').textContent = `${products.length} ${products.length === 1 ? 'piece' : 'pieces'} to explore`;
  container.innerHTML = '';

  if (!products.length) {
    container.innerHTML = '<p class="empty-results">No pieces found. Try another search.</p>';
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-wrap">
        <span class="product-tag">${index < 4 ? 'Just in' : 'A good find'}</span>
        <img src="${product.image}" alt="${product.title}" loading="lazy" />
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${product.title}</h3>
        <div class="card-bottom">
          <p class="price">${formatPrice(product.price)}</p>
          <button class="add-to-cart" type="button" data-id="${product.id}">Add to bag <span aria-hidden="true">+</span></button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function addToCart(product) {
  if (!product) return;
  shoppingcart.push(product);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('shoppingcart', JSON.stringify(shoppingcart));
}

function updateCartUI() {
  const cartList = document.getElementById('cart-items');
  cartList.innerHTML = '';

  shoppingcart.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${item.image}" alt="" />
      <div class="cart-item-copy">
        <p class="cart-item-title">${item.title}</p>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
      </div>
      <button class="delete-item" type="button" data-index="${index}" aria-label="Remove ${item.title} from bag">×</button>
    `;
    cartList.appendChild(li);
  });

  const itemCount = shoppingcart.length;
  const subtotal = shoppingcart.reduce((sum, item) => sum + Number(item.price), 0);
  document.getElementById('cart-count').textContent = itemCount;
  document.getElementById('cart-heading-count').textContent = `(${itemCount})`;
  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('cart-empty').hidden = itemCount > 0;
}

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.filter === filter);
  });
  displayProducts();
}

document.addEventListener('click', event => {
  const addButton = event.target.closest('.add-to-cart');
  if (addButton) {
    const product = allProducts.find(item => item.id === Number(addButton.dataset.id));
    addToCart(product);
    return;
  }

  const removeButton = event.target.closest('.delete-item');
  if (removeButton) {
    shoppingcart.splice(Number(removeButton.dataset.index), 1);
    saveCart();
    updateCartUI();
    return;
  }

  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) setFilter(filterButton.dataset.filter);
});

document.getElementById('product-search').addEventListener('input', displayProducts);
document.getElementById('sort-products').addEventListener('change', displayProducts);
document.getElementById('toggle-dark').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

window.addEventListener('DOMContentLoaded', () => {
  try {
    shoppingcart = JSON.parse(localStorage.getItem('shoppingcart') || '[]');
    if (!Array.isArray(shoppingcart)) shoppingcart = [];
  } catch {
    shoppingcart = [];
  }

  if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
  updateCartUI();
  fetchProducts();
});
