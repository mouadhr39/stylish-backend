// Tab switching
function switchTab(tab, button) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    button.classList.add('active');
    
    if (tab === 'categories') loadCategories();
    if (tab === 'products') { loadCategories(); loadProducts(); }
}

// Load categories
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        
        // Populate category dropdown in products form
        const select = document.getElementById('productCategory');
        const current = select.value;
        select.innerHTML = '';
        categories.forEach(cat => {
            select.innerHTML += `<option id="${cat.id}" value="${cat.code}">${cat.name}</option>`;
        });
        if (current) select.value = current;
        
        // Populate categories table
        const tbody = document.querySelector('#categoriesTable tbody');
        tbody.innerHTML = categories.map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td>${cat.code}</td>
                <td>${cat.name}</td>
                <td class="action-btns">
                    <button onclick="editCategory(${cat.id}, '${cat.code}', '${cat.name}')">Edit</button>
                    <button class="danger" onclick="deleteCategory('${cat.code}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showMessage('categoryMessage', 'Error loading categories', 'error');
    }
}

// Load products
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const tbody = document.querySelector('#productsTable tbody');
        
        let rows = '';
        for (const [categoryName, products] of Object.entries(data)) {
            products.forEach(p => {
                const imgHtml = p.imagePath ? `<img src="${p.imagePath}" alt="${p.name}" class="product-img">` : '<span style="color: #999;">No image</span>';
                rows += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.imagePath}</td>
                        <td>${p.name}</td>
                        <td>${p.sku}</td>
                        <td>$${p.price} ${p.currency}</td>
                        <td>${categoryName}</td>
                        <td>${p.inStock ? '✓' : '✗'}</td>
                        <td>${p.rating} (${p.reviews})</td>
                        <td>
                            <button onclick="editProduct(${p.id})">Edit</button>
                            <button class="danger" onclick="deleteProduct(${p.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
        tbody.innerHTML = rows || '<tr><td colspan="9" style="text-align: center;">No products</td></tr>';
    } catch (err) {
        showMessage('productMessage', 'Error loading products', 'error');
    }
}

// Category form
function resetCategoryForm() {
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryCode').value = '';
    document.getElementById('categoryName').value = '';
    document.getElementById('categorySaveBtn').textContent = 'Add Category';
}

async function handleCategoryForm(event) {
    event.preventDefault();
    const id = document.getElementById('categoryId').value;
    const code = document.getElementById('categoryCode').value;
    const name = document.getElementById('categoryName').value;

    if (!name.trim()) {
        showMessage('categoryMessage', 'Category name is required', 'error');
        return;
    }

    try {
        const method = code ? 'PUT' : 'POST';
        const url = code ? `/api/category/${code}` : '/api/category';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, name })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.description || 'Error');
        }

        showMessage('categoryMessage', code ? 'Category updated!' : 'Category added!', 'success');
        resetCategoryForm();
        loadCategories();
    } catch (err) {
        showMessage('categoryMessage', err.message, 'error');
    }
}

function editCategory(id, code, name) {
    document.getElementById('categoryId').value = id;
    document.getElementById('categoryCode').value = code;
    document.getElementById('categoryName').value = name;
    document.getElementById('categorySaveBtn').textContent = 'Update Category';
    document.querySelector('#categories .section').scrollIntoView();
}

async function deleteCategory(code) {
    if (!confirm('Delete this category?')) return;
    try {
        const res = await fetch(`/api/category/${code}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error deleting');
        loadCategories();
    } catch (err) {
        showMessage('categoryMessage', err.message, 'error');
    }
}

// Product form
function resetProductForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productSku').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCurrency').value = 'USD';
    document.getElementById('productInStock').value = 'true';
    document.getElementById('productRating').value = '0';
    document.getElementById('productReviews').value = '0';
    document.getElementById('productImagePath').value = '';
    document.getElementById('productSaveBtn').textContent = 'Add Product';
}

async function handleProductForm(event) {
    event.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const sku = document.getElementById('productSku').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const currency = document.getElementById('productCurrency').value;
    const category_code = document.getElementById('productCategory').value;
    const in_stock = document.getElementById('productInStock').value === 'true';
    const rating = parseFloat(document.getElementById('productRating').value);
    const reviews = parseInt(document.getElementById('productReviews').value);
    const image_path = document.getElementById('productImagePath').value || null;

    if (!name.trim() || !sku.trim() || isNaN(price) || !category_code) {
        showMessage('productMessage', 'Please fill all required fields', 'error');
        return;
    }

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/product/${id}` : '/api/product';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, sku, price, currency, category_code, in_stock, rating, reviews, image_path })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.description || 'Error');
        }

        showMessage('productMessage', id ? 'Product updated!' : 'Product added!', 'success');
        resetProductForm();
        loadProducts();
    } catch (err) {
        showMessage('productMessage', err.message, 'error');
    }
}

async function editProduct(id) {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        let product = null;
        for (const products of Object.values(data)) {
            const found = products.find(p => p.id === id);
            if (found) { product = found; break; }
        }
        if (!product) throw new Error('Product not found');

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCurrency').value = product.currency;
        document.getElementById('productCategory').value = product.category_code;
        document.getElementById('productInStock').value = product.inStock;
        document.getElementById('productRating').value = product.rating;
        document.getElementById('productReviews').value = product.reviews;
        document.getElementById('productImagePath').value = product.imagePath || '';
        document.getElementById('productSaveBtn').textContent = 'Update Product';
        document.querySelector('#products .section').scrollIntoView();
    } catch (err) {
        showMessage('productMessage', err.message, 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    try {
        const res = await fetch(`/api/product/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error deleting');
        loadProducts();
    } catch (err) {
        showMessage('productMessage', err.message, 'error');
    }
}

function showMessage(elementId, msg, type) {
    const el = document.getElementById(elementId);
    el.className = `message ${type}`;
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; el.className = ''; }, 4000);
}

// Initial load
loadCategories();
