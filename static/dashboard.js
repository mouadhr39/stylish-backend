// Tab switching
function switchTab(tab, button) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    button.classList.add('active');
    
    if (tab === 'categories') loadCategories();
    if (tab === 'products') { loadCategories(); loadProducts(); }
    if (tab === 'collections') loadCollections();
}

// Load categories
async function loadCategories() {
    try {
        const res = await fetch('/v1/categories');
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
        const res = await fetch('/v1/products');
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

// Load collections
async function loadCollections() {
    try {
        const res = await fetch('/v1/collections');
        const collections = await res.json();
        
        // Populate collections table
        const tbody = document.querySelector('#collectionsTable tbody');
        tbody.innerHTML = collections.map(coll => `
            <tr>
                <td>${coll.id}</td>
                <td>${coll.code}</td>
                <td>${coll.name}</td>
                <td class="action-btns">
                    <button onclick="editCollection(${coll.id}, '${coll.code}', '${coll.name}')">Edit</button>
                    <button class="danger" onclick="deleteCollection('${coll.code}')">Delete</button>
                    <button onclick="selectCollection('${coll.code}')">Manage Products</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showMessage('collectionMessage', 'Error loading collections', 'error');
    }
}

// Load all products (flattened) for use in dropdowns
async function loadAllProductsFlat() {
    try {
        const res = await fetch('/v1/products');
        const data = await res.json();
        let allProducts = [];
        for (const [categoryName, products] of Object.entries(data)) {
            allProducts = allProducts.concat(products);
        }
        return allProducts;
    } catch (err) {
        console.error('Error loading all products:', err);
        return [];
    }
}

// Load products in a specific collection
async function loadCollectionProducts(collection_code) {
    try {
        const res = await fetch(`/v1/collection/${collection_code}/products`);
        return await res.json();
    } catch (err) {
        console.error('Error loading collection products:', err);
        return [];
    }
}

// Select a collection to manage its products
async function selectCollection(collection_code) {
    try {
        // Set the global variable
        currentCollectionCode = collection_code;
        
        // Show the products management section
        document.getElementById('collectionProductsSection').style.display = 'block';
        
        // Load the collection details to get the name
        const collectionRes = await fetch(`/v1/collections`);
        const collections = await collectionRes.json();
        const collection = collections.find(c => c.code === collection_code);
        if (collection) {
            document.getElementById('selectedCollectionName').textContent = collection.name;
        } else {
            document.getElementById('selectedCollectionName').textContent = collection_code;
        }
        
        // Load products in this collection
        const inCollectionProducts = await loadCollectionProducts(collection_code);
        
        // Load all products to compute which are not in the collection
        const allProducts = await loadAllProductsFlat();
        
        // Product IDs in the collection
        const inCollectionIds = new Set(inCollectionProducts.map(p => p.id));
        
        // Products not in the collection
        const availableProducts = allProducts.filter(p => !inCollectionIds.has(p.id));
        
        // Populate the add product dropdown
        const select = document.getElementById('addProductSelect');
        select.innerHTML = '<option value="">-- Select Product --</option>';
        availableProducts.forEach(p => {
            select.innerHTML += `<option value="${p.sku}">${p.name} (${p.sku})</option>`;
        });
        
        // Populate the collection products table (for removal)
        const tbody = document.querySelector('#collectionProductsTable tbody');
        tbody.innerHTML = inCollectionProducts.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.sku}</td>
                <td>$${p.price} ${p.currency}</td>
                <td>
                    <button class="danger" onclick="removeProductFromCollection('${collection_code}', '${p.sku}')">Remove</button>
                </td>
            </tr>
        `).join('');
        
        // If no products in collection, show a message
        if (inCollectionProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No products in this collection</td></tr>';
        }
        
        // If no products available to add, disable the dropdown
        if (availableProducts.length === 0) {
            document.getElementById('addProductSelect').disabled = true;
            document.getElementById('addProductSelect').innerHTML = '<option value="">No products available</option>';
        } else {
            document.getElementById('addProductSelect').disabled = false;
        }
    } catch (err) {
        showMessage('collectionMessage', err.message, 'error');
    }
}

// Collection form
function resetCollectionForm() {
    document.getElementById('collectionId').value = '';
    document.getElementById('collectionCode').value = '';
    document.getElementById('collectionName').value = '';
    document.getElementById('collectionSaveBtn').textContent = 'Add Collection';
    // Hide the products management section when resetting the form
    document.getElementById('collectionProductsSection').style.display = 'none';
}

async function handleCollectionForm(event) {
    event.preventDefault();
    const id = document.getElementById('collectionId').value;
    const code = document.getElementById('collectionCode').value;
    const name = document.getElementById('collectionName').value;

    if (!name.trim()) {
        showMessage('collectionMessage', 'Collection name is required', 'error');
        return;
    }

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/v1/collection/${code}` : '/v1/collection';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, name })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.description || 'Error');
        }

        showMessage('collectionMessage', id ? 'Collection updated!' : 'Collection added!', 'success');
        resetCollectionForm();
        loadCollections();
    } catch (err) {
        showMessage('collectionMessage', err.message, 'error');
    }
}

function editCollection(id, code, name) {
    document.getElementById('collectionId').value = id;
    document.getElementById('collectionCode').value = code;
    document.getElementById('collectionName').value = name;
    document.getElementById('collectionSaveBtn').textContent = 'Update Collection';
    document.querySelector('#collections .section').scrollIntoView();
}

async function deleteCollection(code) {
    if (!confirm('Delete this collection?')) return;
    try {
        const res = await fetch(`/v1/collection/${code}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error deleting');
        loadCollections();
        // Hide the products management section if the deleted collection was selected
        document.getElementById('collectionProductsSection').style.display = 'none';
    } catch (err) {
        showMessage('collectionMessage', err.message, 'error');
    }
}

// Product management for collections
async function addProductToCollection() {
    const productSku = document.getElementById('addProductSelect').value;
    if (!productSku) {
        showMessage('collectionMessage', 'Please select a product to add', 'error');
        return;
    }

    try {
        const res = await fetch(`/v1/collection/${currentCollectionCode}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku: productSku })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.description || 'Error');
        }

        showMessage('collectionMessage', 'Product added to collection!', 'success');
        // Reload the products in the collection and update the dropdown
        await selectCollection(currentCollectionCode);
    } catch (err) {
        showMessage('collectionMessage', err.message, 'error');
    }
}

async function removeProductFromCollection(collection_code, product_sku) {
    if (!confirm('Remove this product from the collection?')) return;
    try {
        const res = await fetch(`/v1/collection/${collection_code}/products/${product_sku}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.description || 'Error');
        }

        showMessage('collectionMessage', 'Product removed from collection!', 'success');
        // Reload the products in the collection and update the dropdown
        await selectCollection(collection_code);
    } catch (err) {
        showMessage('collectionMessage', err.message, 'error');
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
        const url = code ? `/v1/category/${code}` : '/v1/category';
        
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
        const res = await fetch(`/v1/category/${code}`, { method: 'DELETE' });
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
        const url = id ? `/v1/product/${id}` : '/v1/product';
        
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
        const res = await fetch('/v1/products');
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
        const res = await fetch(`/v1/product/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error deleting');
        loadProducts();
    } catch (err) {
        showMessage('productMessage', err.message, 'error');
    }
}

// Message function
function showMessage(elementId, msg, type) {
    const el = document.getElementById(elementId);
    el.className = `message ${type}`;
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; el.className = ''; }, 4000);
}

// Global variable to track the currently selected collection for product management
let currentCollectionCode = null;

// Initial load
loadCategories();