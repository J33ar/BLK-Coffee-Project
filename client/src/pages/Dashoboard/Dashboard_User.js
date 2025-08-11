import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Dashboard_Admin.css';
import Navbar from '../NavbarBLK/NavbarBLK';

function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProducts(res.data))
      .catch(() => alert("Failed to load products"));
  };

  const handleAddProduct = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add Product',
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Name">
        <textarea id="swal-description" class="swal2-textarea" placeholder="Description"></textarea>
        <input id="swal-price" type="number" step="0.01" class="swal2-input" placeholder="Price">
        <input id="swal-image" class="swal2-input" placeholder="Image URL">
        <input id="swal-category" class="swal2-input" placeholder="Category">
        <label style="display:flex;align-items:center;gap:5px;margin-top:10px;">
          <input id="swal-stock" type="checkbox" checked> In Stock
        </label>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: document.getElementById('swal-name').value,
          description: document.getElementById('swal-description').value,
          price: parseFloat(document.getElementById('swal-price').value),
          image_url: document.getElementById('swal-image').value,
          category: document.getElementById('swal-category').value,
          in_stock: document.getElementById('swal-stock').checked
        };
      }
    });

    if (formValues) {
      axios.post('http://localhost:5000/api/products', formValues, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
        const newProduct = res.data; 
        setProducts(prevProducts => [...prevProducts, newProduct]);
        Swal.fire("Success", "Product added successfully", "success");
        })
        .catch(() => Swal.fire("Error", "Failed to add product", "error"));
    }
  };

  const handleEditProduct = async (product) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Product',
      html: `
        <input id="swal-name" class="swal2-input" value="${product.name}">
        <textarea id="swal-description" class="swal2-textarea">${product.description}</textarea>
        <input id="swal-price" type="number" step="0.01" class="swal2-input" value="${product.price}">
        <input id="swal-image" class="swal2-input" value="${product.image_url}">
        <input id="swal-category" class="swal2-input" value="${product.category}">
        <label>
          <input id="swal-stock" type="checkbox" ${product.in_stock ? 'checked' : ''}> In Stock
        </label>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: document.getElementById('swal-name').value,
          description: document.getElementById('swal-description').value,
          price: parseFloat(document.getElementById('swal-price').value),
          image_url: document.getElementById('swal-image').value,
          category: document.getElementById('swal-category').value,
          in_stock: document.getElementById('swal-stock').checked
        };
      }
    });

    if (formValues) {
      axios.put(`http://localhost:5000/api/products/${product.id}`, formValues, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          fetchProducts();
          Swal.fire("Success", "Product updated successfully", "success");
        })
        .catch(() => Swal.fire("Error", "Failed to update product", "error"));
    }
  };

  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This product will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(() => {
            fetchProducts();
            Swal.fire("Deleted!", "The product has been deleted.", "success");
          })
          .catch(() => Swal.fire("Error", "Failed to delete product", "error"));
      }
    });
  };

const addToCart = async (product) => {
  try {
    
    if (!product.in_stock) {
      Swal.fire({
                        title: "Out of Stock",
                        text: `${product.name} is currently not available.`,
                        icon: "warning",
                        confirmButtonColor: "#313131", 
                        iconColor: "#313131",
                        customClass: {
                            confirmButton: "my-confirm-btn"
                        }     
                    });
      return;
    }

    await axios.post(
      "http://localhost:5000/cart/add",
      {
        product_id: product.id,
        quantity: 1
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    window.dispatchEvent(new Event("cartUpdated"));
    Swal.fire({
        title: "Success",
        text: `${product.name} added to cart!`,
        icon: "success",
        confirmButtonColor: "#313131", // لون الزر
        iconColor: "#313131" ,
        customClass: {
            confirmButton: "my-confirm-btn"
        }     
    });
  } catch (err) {
    Swal.fire("Error", err.response?.data?.error || "Failed to add to cart", "error");
  }
};


  const groupedProducts = products.reduce((groups, product) => {
    const category = product.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {});

  const categories = ['All', ...Object.keys(groupedProducts)];
  const displayedCategories = selectedCategory === 'All' ? Object.keys(groupedProducts) : [selectedCategory];
  const filteredProducts = displayedCategories.flatMap(category => 
    groupedProducts[category].filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-container">
    <Navbar/>
      <div className='divstyle'>
          <input
            type="text"
            placeholder="Search Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input marginstyle"
          />
          <select
            className="category-filter marginstyle"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {/* <button onClick={handleAddProduct} className="btn add-btn marginstyle">Add Product</button> */}
      </div>

      <div>
        {filteredProducts.length > 0 ? (
          displayedCategories.map((category) => (
            <div key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <div className="products-grid">
                {groupedProducts[category]?.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                  <div key={product.id} className="product-card">
                    <img src={product.image_url} alt={product.name} className="product-image" onError={(e) => e.target.src = '/fallback-image.png'} />
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <p><strong>Price:</strong> JOD {product.price}</p>
                      <p><strong>Status:</strong> {product.in_stock ? "✔️ Available" : "❌ Out of Stock"}</p>
                      <p className="product-date">
                        Added on: {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {/* <div className="card-actions">
                      <button onClick={() => handleEditProduct(product)} className="btn edit-btn">Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="btn delete-btn">Delete</button>
                    </div> */}
                      <button className="add-to-cart-btn" onClick={() => addToCart(product)}>🛒 Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
