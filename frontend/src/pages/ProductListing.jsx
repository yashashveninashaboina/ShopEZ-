import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Pagination, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const ProductListing = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Read URL search params on mount/url change
  useEffect(() => {
    const params = new URLSearchParams(search);
    const queryCat = params.get('category') || '';
    const querySearch = params.get('search') || '';
    const querySort = params.get('sort') || '';
    
    setSelectedCategory(queryCat);
    setSearchQuery(querySearch);
    if (querySort) {
      if (querySort === 'discount') {
        setSortOption('price-asc'); // Mock deals sorting
      } else {
        setSortOption(querySort);
      }
    }
    setPage(1); // Reset page to 1 on filter trigger
  }, [search]);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products based on filters, pagination and sorting
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/api/products?page=${page}&sort=${sortOption}&pageSize=6`;
        
        if (selectedCategory) url += `&category=${selectedCategory}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (selectedRating) url += `&rating=${selectedRating}`;
        if (searchQuery) url += `&keyword=${encodeURIComponent(searchQuery)}`;

        const { data } = await api.get(url);
        setProducts(data.products);
        setPage(data.page);
        setTotalPages(data.pages);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, selectedCategory, minPrice, maxPrice, selectedRating, sortOption, searchQuery]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating('');
    setSortOption('newest');
    setSearchQuery('');
    navigate('/shop');
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container className="my-3">
      <Row className="gy-4">
        {/* Sidebar Filters */}
        <Col lg={3}>
          <Card className="shadow-sm border-0 p-3" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold">Filters</h5>
              <Button variant="link" onClick={handleClearFilters} className="text-decoration-none text-danger p-0 small">
                Clear All
              </Button>
            </div>

            <hr className="my-2 text-muted" />

            {/* Search Input */}
            <div className="mb-4">
              <Form.Label className="fw-semibold small text-uppercase text-muted">Search</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: '8px 0 0 8px' }}
                />
                <Button variant="outline-secondary" onClick={() => navigate(`/shop?search=${searchQuery}`)} style={{ borderRadius: '0 8px 8px 0' }}>
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <Form.Label className="fw-semibold small text-uppercase text-muted">Categories</Form.Label>
              <div className="d-flex flex-column gap-2 mt-1">
                <Form.Check
                  type="radio"
                  label="All Categories"
                  name="categoryRadio"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                  id="cat-all"
                />
                {categories.map((cat) => (
                  <Form.Check
                    key={cat._id}
                    type="radio"
                    label={cat.name}
                    name="categoryRadio"
                    checked={selectedCategory === cat.slug || selectedCategory === cat._id}
                    onChange={() => setSelectedCategory(cat.slug)}
                    id={`cat-${cat._id}`}
                  />
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <Form.Label className="fw-semibold small text-uppercase text-muted">Price Range (₹)</Form.Label>
              <Row className="g-2 mt-1">
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                </Col>
              </Row>
            </div>

            {/* Minimum Rating */}
            <div className="mb-3">
              <Form.Label className="fw-semibold small text-uppercase text-muted">Minimum Rating</Form.Label>
              <Form.Select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                style={{ borderRadius: '8px' }}
                className="mt-1"
              >
                <option value="">Any Rating</option>
                <option value="4">4 ★ & above</option>
                <option value="3">3 ★ & above</option>
                <option value="2">2 ★ & above</option>
              </Form.Select>
            </div>
          </Card>
        </Col>

        {/* Products Grid */}
        <Col lg={9}>
          {/* Top Bar (Results count & Sorting) */}
          <Card className="shadow-sm border-0 p-3 mb-4" style={{ borderRadius: '16px' }}>
            <Row className="align-items-center gy-2">
              <Col xs={12} sm={6}>
                <span className="text-muted">
                  {loading ? 'Searching...' : `Showing ${products.length} products`}
                </span>
              </Col>
              <Col xs={12} sm={6} className="d-flex justify-content-sm-end align-items-center gap-2">
                <span className="text-muted small text-nowrap">Sort By:</span>
                <Form.Select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{ width: '180px', borderRadius: '8px' }}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </Form.Select>
              </Col>
            </Row>
          </Card>

          {/* Products Loading / Results */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
              <Spinner animation="border" variant="primary" />
            </div>
          ) : products.length === 0 ? (
            <Card className="shadow-sm border-0 p-5 text-center text-muted" style={{ borderRadius: '16px' }}>
              <i className="bi bi-search-heart display-3 mb-3 text-primary"></i>
              <h5>No Products Found</h5>
              <p className="mb-0">Try clearing filters or tweaking your keywords.</p>
              <Button onClick={handleClearFilters} className="btn-primary-gradient mt-3 mx-auto px-4 py-2">
                Show All Products
              </Button>
            </Card>
          ) : (
            <>
              <Row className="g-4">
                {products.map((product) => (
                  <Col key={product._id} xs={12} sm={6} md={4}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <Pagination>
                    <Pagination.Prev
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                    />
                    {[...Array(totalPages).keys()].map((x) => (
                      <Pagination.Item
                        key={x + 1}
                        active={x + 1 === page}
                        onClick={() => handlePageChange(x + 1)}
                      >
                        {x + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={page === totalPages}
                      onClick={() => handlePageChange(page + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductListing;
