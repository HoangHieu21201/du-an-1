<template>
  <div class="container py-5 product-detail-page">
    <div v-if="!loading && product && activeVariant" class="row g-4">

      <div class="col-lg-5">
        <div class="main-image-wrapper mb-3">
          <img
            :src="selectedImage"
            :alt="product.name"
            class="img-fluid rounded main-product-image"
          />
        </div>

        <div class="thumbnail-gallery" v-if="product.gallery_images && product.gallery_images.length > 1">
          <img
            v-for="(image, index) in product.gallery_images"
            :key="index"
            :src="image"
            :alt="`Thumbnail ${index + 1}`"
            class="thumbnail-item"
            :class="{ active: selectedImage === image }"
            @click="selectImage(image)"
          />
        </div>
      </div>

      <div class="col-lg-7">
        <div class="product-info-box">

          <h2 class="fw-bold mb-3 product-title">{{ product.name }}</h2>

          <div class="d-flex align-items-center mb-3 text-muted small">
            <div class="me-3">
              <i class="bi bi-star-fill text-warning"></i>
              {{ product.average_rating }} / 5
            </div>
            <div>
              ({{ product.review_count || 0 }} đánh giá |
              {{ product.sold_count || 0 }} đã bán)
            </div>
          </div>

          <div class="price-section mb-4">
            <span class="fs-2 fw-bold text-danger me-2">
              {{ formatCurrency(activeVariant.price) }}
            </span>
            <span
              v-if="activeVariant.original_price > activeVariant.price"
              class="text-muted text-decoration-line-through fs-5"
            >
              {{ formatCurrency(activeVariant.original_price) }}
            </span>
          </div>

          <div class="variant-section mb-4">
            <h5 class="fw-semibold fs-6">Chọn phiên bản:</h5>
            <div class="variant-options">
              <button
                v-for="(variant, index) in product.variants"
                :key="variant.id || index"
                class="btn variant-btn"
                :class="{ active: selectedVariantIndex === index }"
                @click="selectVariant(index)"
              >
                {{ variant.name || `Phiên bản ${index + 1}` }}
                <span class="variant-price">{{ formatCurrency(variant.price) }}</span>
              </button>
            </div>
          </div>

          <div class="d-flex align-items-center mb-4">
            <span class="fw-semibold me-3 fs-6">Số lượng:</span>
            <button class="btn btn-outline-secondary btn-qty" @click="decreaseQty">
              <i class="bi bi-dash"></i>
            </button>
            <input
              type="number"
              v-model.number="quantity"
              min="1"
              :max="activeVariant.stock"
              class="form-control text-center"
              style="width: 70px; margin: 0 5px;"
              @change="validateQty"
            />
            <button class="btn btn-outline-secondary btn-qty" @click="increaseQty">
              <i class="bi bi-plus"></i>
            </button>
            <span class="ms-3 text-success small fw-semibold">
              (✅ Còn lại: {{ activeVariant.stock }})
            </span>
          </div>

          <div class="action-buttons mt-4">
            <button class="btn btn-primary-green btn-lg me-3" @click="addToCart(product)">
              <i class="bi bi-cart-plus"></i> Thêm vào giỏ
            </button>
            <button class="btn btn-outline-danger btn-lg" @click="toggleFavorite(product)">
              <i
                :class="['bi', product.isFavorite ? 'bi-heart-fill' : 'bi-heart']"
              ></i>
            </button>
          </div>

        </div>
        <br>
        <div class="payment-offers-section mb-4">
          <h5 class="fw-semibold fs-6 mb-3 d-flex align-items-center">
            <i class="bi bi-credit-card-2-front-fill text-primary-green me-2"></i>
            Ưu đãi thanh toán
          </h5>

          <div class="offers-list">
            <div
              v-for="offer in paymentOffers"
              :key="offer.id"
              class="offer-item d-flex align-items-start"
            >
              <img
                :src="offer.logo_url"
                :alt="offer.partner"
                class="offer-logo me-3"
              />
              <div class="offer-text" v-html="offer.description"></div>
            </div>

            <button class="btn-view-all text-primary-green mt-3" @click="viewAllOffers">
              Xem tất cả ưu đãi <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        
        <div class="promotion-section-box mb-4">
            <h2><i class="fas fa-gift"></i> Khuyến mãi hấp dẫn</h2>

          <div class="promotion-list">

            <div class="promo-item">
              <span class="promo-badge-num">1</span>
              <div class="promo-text">
                Giảm thêm 10% cho Pin dự phòng - Camera giám sát - Đồng hồ trẻ em - Gia dụng - Sức khỏe Làm đẹp khi mua Điện thoại/Laptop.
                <a href="#" class="promo-link" @click.prevent="viewAllOffers">Xem chi tiết</a>
              </div>
            </div>

    <div class="promo-item">
              <span class="promo-badge-num">2</span>
              <div class="promo-text">
                Nhận thêm 1 trong các khuyến mãi sau:
              </div>
            </div>

            <div class="promo-item-sub">
              <i class="bi bi-dot text-primary-green fs-5"></i>
              <div class="promo-text">
                Mua combo phụ kiện cùng máy - giảm giá phụ kiện lên tới 25%
              </div>
              <span class="promo-badge-text">Khuyến mãi 1</span>
            </div>
 <a href="#" class="view-all">Xem tất cả <i class="fas fa-chevron-right"></i></a>






<!-- === MUA KÈM GIÁ SỐC === -->
<section class="bundle-deal-section">
  <div class="bundle-header">
    <h2><i class="fas fa-bolt"></i> Mua kèm giá sốc</h2>
  </div>

  <div class="bundle-products">
    <div v-for="product in bundleDeals" :key="product.id" class="bundle-item">
      <img :src="product.image" :alt="product.name" />
      <h3>{{ product.name }}</h3>
      <div class="price">
        <span class="new-price">{{ product.newPrice.toLocaleString() }}₫</span>
        <span class="old-price">{{ product.oldPrice.toLocaleString() }}₫</span>
      </div>
      <button class="btn-buy-now">Mua ngay</button>
    </div>
  </div>
  <div class="service-package">
  <h3>🎯 Chọn gói dịch vụ bảo hành</h3>
  <div class="package-options">
    <div
      class="package-card"
      v-for="(pkg, index) in warrantyPackages"
      :key="index"
      :class="{ active: selectedPackage === pkg }"
      @click="selectedPackage = pkg"
    >
      <h4>{{ pkg.name }}</h4>
      <p>{{ pkg.desc }}</p>
      <span class="price">+{{ pkg.price.toLocaleString() }}₫</span>
    </div>
  </div>
</div>
</section>





        
          </div>
        </div>
      </div>

    </div>

    <div v-if="!loading && product" class="row mt-5">
      <div class="col-12">

        <section class="trade-in-section mb-5">
          <h3 class="fw-bold">Iphone - Giảm giá tới 50% </h3>
          <p class="subtitle">(Giá độc quyền )</p>

          <div class="trade-in-features">
            <div class="feature-item">
              <div class="icon-wrapper">
                <i class="bi bi-cash-coin"></i>
              </div>
              Giá thu tốt nhất<br>thị trường
            </div>
            <div class="feature-item">
              <div class="icon-wrapper">
                <i class="bi bi-pencil-square"></i>
              </div>
              Định giá nhanh chóng<br>Thủ tục đơn giản
            </div>
            <div class="feature-item">
              <div class="icon-wrapper">
                <i class="bi bi-gift"></i>
              </div>
              Trợ giá thêm đến 1 triệu<br>cho thành viên
            </div>
          </div>

          <div class="trade-in-search-wrapper">
            <div class="trade-in-searchbar">
              <button class="upload-btn">
                <i class="bi bi-arrow-up"></i>
              </button>
              <input
                type="text"
                class="search-input"
                placeholder="Tìm sản phẩm ..."
                v-model="tradeInSearchTerm"
                @focus="tradeInResultsVisible = true"
                @blur="setTimeout(() => tradeInResultsVisible = false, 200)"
              />
            </div>

            <div class="trade-in-results" v-if="tradeInResultsVisible && tradeInSearchResults.length > 0">
              <ul>
                <li
                  v-for="item in tradeInSearchResults"
                  :key="item.id"
                  @click="navigateToProduct(item.id)"
                >
                  <img :src="item.image_url" :alt="item.name" class="result-img">
                  <span class="result-name">{{ item.name }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="related-products-section mb-5" v-if="relatedProducts.length > 0">
          <h4 class="section-title">Sản phẩm liên quan</h4>
          <div class="horizontal-scroll-container">
            <div
              v-for="relatedProduct in relatedProducts"
              :key="relatedProduct.id"
              class="product-card-simple"
              @click="navigateToProduct(relatedProduct.id)"
            >
              <img :src="relatedProduct.image_url" :alt="relatedProduct.name" class="card-img"/>
              <h5 class="card-name">{{ relatedProduct.name }}</h5>
              <p class="card-price">{{ formatCurrency(getMinPrice(relatedProduct.variants)) }}</p>
            </div>
          </div>
        </section>

        <section class="mb-5 product-description">
          <h4 class="section-title">📄 Mô tả sản phẩm</h4>
          <p>
            {{ product.description || "Sản phẩm chất lượng cao, bảo hành chính hãng 12 tháng." }}
          </p>
        </section>

        <section class="product-reviews">
          <h4 class="section-title">
            💬 Đánh giá ({{ reviews.length }})
          </h4>
          <div v-if="reviews.length">
            <div
              v-for="review in reviews"
              :key="review.id"
              class="review-item"
            >
              <div class="d-flex align-items-center mb-1">
                <i class="bi bi-person-circle me-2 fs-5"></i>
                <strong>Người dùng #{{ review.userId }}</strong>
              </div>
              <div class="text-warning small mb-1">
                <i v-for="n in review.rating" :key="n" class="bi bi-star-fill"></i>
              </div>
              <p class="mb-0">{{ review.content }}</p>
            </div>
          </div>
          <p v-else class="text-muted">Chưa có đánh giá nào cho sản phẩm này.</p>
        </section>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5 loading-spinner">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">Đang tải dữ liệu sản phẩm...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const API_URL = "http://localhost:3000";
const route = useRoute();
const router = useRouter();

const product = ref(null);
const reviews = ref([]);
const quantity = ref(1);
const loading = ref(true);

// 🔹 GỘP THÀNH MỘT BIẾN paymentOffers DUY NHẤT
const paymentOffers = ref([
  {
    id: 1,
    partner: "HSBC",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/5/5a/HSBC_logo_%282018%29.svg",
    description: "Giảm <b>2 triệu</b> khi thanh toán bằng thẻ tín dụng HSBC."
  },
  {
    id: 2,
    partner: "Home Credit",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Home_Credit_logo.svg",
    description: "Ưu đãi <b>0% lãi suất</b> khi trả góp qua Home Credit."
  },
  {
    id: 3,
    partner: "MOMO",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/0/0c/MoMo_Logo.png",
    description: "Giảm <b>200K</b> khi thanh toán qua ví MOMO."
  },
  {
    id: 4,
    partner: "TPBank",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/TPBank_logo.svg",
    description: "Nhận <b>50K hoàn tiền</b> khi thanh toán bằng thẻ TPBank EVO."
  }
]);

// 🔹 DỮ LIỆU GÓI DỊCH VỤ BẢO HÀNH
const warrantyPackages = ref([
  { name: "Gói cơ bản", desc: "Bảo hành 6 tháng, 1 đổi 1 trong 30 ngày", price: 199000 },
  { name: "Gói nâng cao", desc: "Bảo hành 12 tháng, đổi mới miễn phí lỗi NSX", price: 299000 },
  { name: "Gói VIP", desc: "Bảo hành 24 tháng, đổi mới toàn diện", price: 499000 },
]);

const selectedPackage = ref(null);


const selectedVariantIndex = ref(0);
const selectedImage = ref('');

const allProducts = ref([]);
const relatedProducts = ref([]);
const tradeInSearchTerm = ref('');
const tradeInResultsVisible = ref(false);

const activeVariant = computed(() => {
  if (!product.value || !product.value.variants) return null;
  return product.value.variants[selectedVariantIndex.value];
});

const tradeInSearchResults = computed(() => {
  if (tradeInSearchTerm.value.length < 2) return [];
  const term = tradeInSearchTerm.value.toLowerCase();
  return allProducts.value
    .filter(p => (p.name || '').toLowerCase().includes(term))
    .slice(0, 5);
});

const viewAllOffers = () => {
  alert("Hiển thị toàn bộ danh sách ưu đãi thanh toán (sẽ cập nhật sau)");
};

const fetchAllProducts = async () => {
  try {
    const res = await axios.get(`${API_URL}/products`);
    allProducts.value = res.data || [];
  } catch (err) {
    console.error("Lỗi tải tất cả sản phẩm:", err);
  }
};

const loadProductById = async (id) => {
  try {
    loading.value = true;
    const productRes = await axios.get(`${API_URL}/products/${id}`);

    // đảm bảo variants tồn tại
    if (!productRes.data.variants || !productRes.data.variants.length) {
      productRes.data.variants = [{ price: 0, original_price: 0, stock: 0 }];
    }

    productRes.data.variants.forEach((v, i) => {
      v.name = v.name || `Phiên bản ${i + 1}`;
      // đảm bảo có stock numeric
      v.stock = Number.isFinite(+v.stock) ? +v.stock : 0;
      v.price = Number.isFinite(+v.price) ? +v.price : 0;
      v.original_price = Number.isFinite(+v.original_price) ? +v.original_price : v.price;
    });

    productRes.data.gallery_images = [
      productRes.data.image_url || 'https://placehold.co/500x500/009981/white?text=Main+Image',
      'https://placehold.co/500x500/009981/white?text=Anh+2',
      'https://placehold.co/500x500/009981/white?text=Anh+3',
      'https://placehold.co/500x500/009981/white?text=Anh+4'
    ];

    product.value = productRes.data;

    selectedVariantIndex.value = 0;
    selectedImage.value = product.value.gallery_images[0] || product.value.image_url || '';
    quantity.value = 1;

    const reviewRes = await axios.get(`${API_URL}/reviews?productId=${id}`);
    reviews.value = reviewRes.data || [];

  } catch (error) {
    console.error("Lỗi tải sản phẩm:", error);
    // nếu lỗi thì chuyển trang not-found (giữ nguyên hành vi cũ)
    router.replace("/not-found");
  } finally {
    loading.value = false;
  }
};

const selectVariant = (index) => {
  selectedVariantIndex.value = index;
  // nếu thay đổi phiên bản mà stock nhỏ hơn quantity hiện tại => điều chỉnh
  validateQty();
};

const selectImage = (imageUrl) => {
  selectedImage.value = imageUrl;
};

const navigateToProduct = (productId) => {
  router.push(`/products/${productId}`);
  tradeInResultsVisible.value = false;
  tradeInSearchTerm.value = '';
};

const getMinPrice = (variants) => {
  if (!variants || !variants.length) return 0;
  return Math.min(...variants.map(v => v.price));
};

const formatCurrency = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

const decreaseQty = () => {
  if (quantity.value > 1) quantity.value = Number(quantity.value) - 1;
};

const increaseQty = () => {
  if (!activeVariant.value) return;
  const max = activeVariant.value.stock ?? 1;
  if (quantity.value < max) quantity.value = Number(quantity.value) + 1;
};

const validateQty = () => {
  if (!activeVariant.value) return;
  const max = activeVariant.value.stock ?? 1;
  if (quantity.value > max) quantity.value = max;
  if (quantity.value < 1 || !Number.isFinite(Number(quantity.value))) quantity.value = 1;
  // force number
  quantity.value = Number(quantity.value);
};

const addToCart = (productItem) => {
  if (!activeVariant.value) return;
  alert(`Đã thêm ${quantity.value} x ${productItem.name} (${activeVariant.value.name}) vào giỏ hàng!`);
};

const toggleFavorite = (productItem) => {
  // nếu chưa có thuộc tính isFavorite thì tạo
  productItem.isFavorite = !productItem.isFavorite;
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  const id = route.params.id;
  if (id) loadProductById(id);
  fetchAllProducts();
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) loadProductById(newId);
});

watchEffect(() => {
  if (product.value && allProducts.value.length > 0) {
    const currentProductId = product.value.id;
    const categoryId = product.value.category?.id;
    if (categoryId) {
      relatedProducts.value = allProducts.value
        .filter(p => p.category?.id === categoryId && p.id !== currentProductId)
        .slice(0, 5);
    }
  }
});
</script>

<style scoped>
/* Định nghĩa màu chủ đạo */
:root {
  --primary-color: rgb(0, 153, 129);
  --primary-hover: rgb(0, 117, 99);
  --primary-light: rgba(0, 153, 129, 0.1);
  --trade-in-red: #d70018; /* Màu đỏ cho mục thu cũ */
}

.product-detail-page {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

/* CỘT PHẢI - HỘP THÔNG TIN */
.product-info-box {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.product-title {
  color: #222;
}

.price-section {
  background-color: #fdfdfd;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

/* CỘT TRÁI - HÌNH ẢNH */
.main-image-wrapper {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}
.main-product-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  transition: transform 0.3s ease;
}
.main-product-image:hover {
  transform: scale(1.05);
}

.thumbnail-gallery {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.thumbnail-item {
  width: 70px;
  height: 70px;
  border: 2px solid #ddd;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}
.thumbnail-item:hover {
  opacity: 1;
  border-color: #aaa;
}
.thumbnail-item.active {
  opacity: 1;
  border-color: var(--primary-color);
  box-shadow: 0 0 5px var(--primary-light);
}

/* CHỌN BIẾN THỂ (VARIANT) */
.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.variant-btn {
  border: 2px solid #ddd;
  background-color: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 0px 25px;
  text-align: left;
  font-weight: 500;
  transition: all 0.2s ease;
}
.variant-btn:hover {
  border-color: #aaa;
}
.variant-btn.active {
  border-color: var(--primary-color);
  background-color: var(--primary-light);
  box-shadow: 0 0 0 2px var(--primary-color);
}
.variant-price {
  font-size: 0.85em;
  font-weight: bold;
  color: var(--primary-color);
}

/* NÚT SỐ LƯỢNG */
.btn-qty {
  width: 40px;
  height: 40px;
  padding: 0;
  line-height: 40px;
}

/* NÚT CHÍNH */
.btn-primary-green {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  transition: all 0.3s ease;
}
.btn-primary-green:hover {
  background-color: #67a5a7; /* Màu xanh đậm hơn */
  border-radius: 12px; /* Bo góc mềm mại */
  box-shadow: 0 0 12px rgba(103, 165, 167, 0.7); /* Hiệu ứng sáng mờ */
  transition: all 0.3s ease; /* Hiệu ứng chuyển mượt mà */
  transform: scale(1.05);
}

/* MÔ TẢ & ĐÁNH GIÁ */
.product-description, .product-reviews {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #eee;
}
.section-title {
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-weight: 600;
  color: var(--primary-color);
}
.review-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 0;
}
.review-item:last-child {
  border-bottom: none;
}


.trade-in-section {
  background-color: #222;
  color: #fff;
  border-radius: 12px;
  padding: 25px 30px;
  text-align: center;
}
.trade-in-section h3 {
  font-size: 1.75rem;
  font-weight: 700;
}
.trade-in-section .subtitle {
  color: #ccc;
  font-size: 0.95rem;
  margin-bottom: 25px;
}
.trade-in-features {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
}
.feature-item {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}
.feature-item .icon-wrapper {
  background-color: var(--trade-in-red);
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 1.6rem;
}

.trade-in-search-wrapper {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.trade-in-searchbar {
  background-color: #555;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
}
.trade-in-searchbar .upload-btn {
  background-color: var(--trade-in-red);
  border: none;
  border-radius: 8px;
  color: white;
  width: 45px;
  height: 45px;
  font-size: 1.3rem;
  margin-right: 10px;
  flex-shrink: 0;
}
.trade-in-searchbar .search-input {
  flex: 1;
  background-color: #fff;
  color: #222;
  border-radius: 8px;
  padding: 12px 15px;
  border: none;
  width: 100%;
  font-size: 0.9rem;
  outline: none;
}
.trade-in-searchbar .search-input::placeholder {
  color: #777;
}

.trade-in-results {
  position: absolute;
  top: 105%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}
.trade-in-results ul {
  list-style: none;
  padding: 5px;
  margin: 0;
}
.trade-in-results li {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  color: #333;
}
.trade-in-results li:hover {
  background-color: #f4f4f4;
}
.trade-in-results .result-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}
.trade-in-results .result-name {
  font-size: 0.9rem;
  font-weight: 500;
}

/* ==== CSS SẢN PHẨM LIÊN QUAN ==== */
.related-products-section {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #eee;
}
.horizontal-scroll-container {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 10px;
}

/* ==== ƯU ĐÃI THANH TOÁN ==== */
.payment-offers-section {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.offers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.offer-item {
  background-color: #f9fdfc;
  border: 1px solid #e0f2ef;
  border-radius: 10px;
  padding: 10px 15px;
  transition: all 0.2s ease;
}

.offer-item:hover {
  background-color: #f3fbf9;
  border-color: var(--primary-color);
  transform: translateX(3px);
}

.offer-logo {
  width: 38px;
  height: 38px;
  object-fit: contain;
  border-radius: 6px;
  background-color: white;
  padding: 4px;
  border: 1px solid #eee;
}

.offer-text {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

.btn-view-all {
  border: none;
  background: none;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.btn-view-all:hover {
  text-decoration: underline;
}

/* ==== 🔽 ĐÂY LÀ CSS MỚI ĐƯỢC THÊM VÀO 🔽 ==== */
.promotion-section-box {
  background-color: #f3f9ff; /* Màu nền xanh nhạt */
  border: 1px solid #d0e6ff; /* Viền xanh */
  border-radius: 10px;
  padding: 20px 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
}

.promotion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.promo-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.promo-badge-num {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background-color: #007bff; /* Màu xanh dương cho số */
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 3px; /* Căn chỉnh cho thẳng hàng */
}

.promo-text {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

.promo-link {
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--primary-color);
  margin-left: 5px;
}
.promo-link:hover {
  text-decoration: underline;
}

.promo-item-sub {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-left: 30px; /* Thụt vào so với mục 2 */
  position: relative; /* Dùng để định vị nhãn */
}

.promo-item-sub .bi-dot {
  line-height: 1.2;
  margin-top: -3px; /* Kéo dấu chấm lên */
  color: var(--primary-color);
}

.promo-badge-text {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #e0f2ef;
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}
/* ====== PHẦN KHUYẾN MÃI HẤP DẪN ====== */
.promotions {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  padding: 20px;
  margin-top: 25px;
}
.promotions h3 {
  font-size: 1.2rem;
  color: #e63946;
  margin-bottom: 10px;
}
.promotions ul {
  list-style: none;
  padding: 0;
}
.promotions li {
  background: #fff6f6;
  border-left: 4px solid #e63946;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.95rem;
}

/* ====== PHẦN MUA KÈM GIÁ SỐC ====== */
.combo-deal {
  background: linear-gradient(180deg, #fff 0%, #f9f9f9 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 20px;
  margin-top: 30px;
}
.combo-deal h3 {
  font-size: 1.2rem;
  color: #d62828;
  margin-bottom: 15px;
}
.combo-products {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
}
.combo-card {
  flex: 0 0 160px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  text-align: center;
  padding: 10px;
  transition: all 0.3s ease;
}
.combo-card img {
  width: 100%;
  border-radius: 8px;
}
.combo-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
}
.combo-card .price {
  color: #e63946;
  font-weight: bold;
  margin-top: 8px;
}

/* ====== GÓI BẢO HÀNH ====== */
.service-package {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 20px;
  margin-top: 30px;
}
.service-package h3 {
  font-size: 1.2rem;
  color: #1d3557;
  margin-bottom: 15px;
}
.package-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.package-card {
  flex: 1 1 calc(33.33% - 10px);
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.package-card:hover {
  border-color: #457b9d;
  transform: translateY(-4px);
  background: #f1f9ff;
}
.package-card.active {
  border-color: #1d3557;
  background: #e8f3ff;
  box-shadow: 0 3px 8px rgba(29,53,87,0.2);
}
.package-card h4 {
  margin: 0;
  color: #1d3557;
  font-size: 1rem;
}
.package-card p {
  margin: 6px 0;
  font-size: 0.9rem;
  color: #555;
}
.package-card .price {
  color: #e63946;
  font-weight: bold;
  display: inline-block;
  margin-top: 5px;
}

</style>
