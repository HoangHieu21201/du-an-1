<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Giả định useRouter và useRoute cho code chạy độc lập
const useRouterMock = () => ({
  push: (path) => console.log('Navigating to:', path)
});
const router = useRouterMock();

// Biến điều khiển popup
const showPopup = ref(false);
const selectedOrder = ref(null);
const isReviewing = ref(false);
const reviewText = ref('');
const reviewRating = ref(0);

// 🧾 Dữ liệu giả định cho danh sách đơn hàng (đã có sản phẩm)
const orders = ref([
  {
    id: 'DH1001',
    date: '2025-11-10',
    total: 550000,
    status: 'Đang giao hàng',
    // Thêm thông tin chi tiết đầy đủ cho Popup
    customer: { name: 'Nguyễn Văn An', phone: '0901 234 567', address: 'Số 123, đường A, Phường B, Quận C, TP. HCM' },
    payment: { subtotal: 550000, shippingFee: 0, total: 550000, method: 'Chuyển khoản' },
    items: [
      { id: 1, name: 'Chuột Logitech G102', price: 350000, qty: 1, image: 'https://via.placeholder.com/100x100/3498DB/FFFFFF?text=Mouse' },
      { id: 2, name: 'Lót chuột Razer', price: 200000, qty: 1, image: 'https://via.placeholder.com/100x100/EEEEEE/333333?text=Pad' },
    ],
    canCancel: true, canRepurchase: true, canReview: false, canReturn: true, isReviewed: false,
  },
  {
    id: 'DH1002',
    date: '2025-11-05',
    total: 280000,
    status: 'Đã giao thành công',
    customer: { name: 'Trần Thị B', phone: '0902 876 543', address: 'Đường Nguyễn Huệ, Quận 1, TP. HCM' },
    payment: { subtotal: 280000, shippingFee: 0, total: 280000, method: 'Thanh toán khi nhận hàng (COD)' },
    items: [
      { id: 3, name: 'Bàn phím cơ Akko 3087', price: 280000, qty: 1, image: 'https://via.placeholder.com/100x100/2ECC71/FFFFFF?text=Keyboard' },
    ],
    canCancel: false, canRepurchase: true, canReview: true, canReturn: true, isReviewed: false,
  },
  {
    id: 'DH1003',
    date: '2025-10-28',
    total: 1200000,
    status: 'Đã hủy',
    customer: { name: 'Lê Văn C', phone: '0903 123 987', address: 'Quận Bình Thạnh, TP. HCM' },
    payment: { subtotal: 1200000, shippingFee: 0, total: 1200000, method: 'Thẻ tín dụng' },
    items: [
      { id: 4, name: 'Tai nghe Razer Kraken', price: 1200000, qty: 1, image: 'https://via.placeholder.com/100x100/E74C3C/FFFFFF?text=Headset' },
    ],
    canCancel: false, canRepurchase: true, canReview: false, canReturn: false, isReviewed: false,
  },
  {
    id: 'DH1004',
    date: '2025-10-15',
    total: 350000,
    status: 'Hoàn thành, có thể đánh giá',
    customer: { name: 'Phạm Thu D', phone: '0904 456 123', address: 'Quận Tân Bình, TP. HCM' },
    payment: { subtotal: 350000, shippingFee: 0, total: 350000, method: 'Momo' },
    items: [
      { id: 5, name: 'Tấm lót bàn RGB', price: 350000, qty: 1, image: 'https://via.placeholder.com/100x100/95A5A6/FFFFFF?text=RGB' },
    ],
    canCancel: false, canRepurchase: true, canReview: true, canReturn: true, isReviewed: false,
  },
]);

// --- Logic Tính Toán cho Popup (Dựa trên selectedOrder) ---

const isCancellable = computed(() => selectedOrder.value?.canCancel && selectedOrder.value?.status === 'Đang giao hàng');
const isRepurchasable = computed(() => selectedOrder.value?.canRepurchase);
const isReturnable = computed(() => selectedOrder.value?.canReturn && (selectedOrder.value?.status === 'Đã giao thành công' || selectedOrder.value?.status === 'Hoàn thành, có thể đánh giá'));
const isReviewAvailable = computed(() => selectedOrder.value?.canReview && !selectedOrder.value?.isReviewed && (selectedOrder.value?.status === 'Đã giao thành công' || selectedOrder.value?.status === 'Hoàn thành, có thể đánh giá'));

// --- Logic cho Thanh Tiến Trình ---

const orderSteps = [
  { key: 'placed', label: 'Đã đặt hàng', statusMatch: ['Đã đặt hàng', 'Chờ chuyển phát', 'Đang giao hàng', 'Đã giao thành công', 'Hoàn thành, có thể đánh giá'] },
  { key: 'shipping_prep', label: 'Chờ chuyển phát', statusMatch: ['Chờ chuyển phát', 'Đang giao hàng', 'Đã giao thành công', 'Hoàn thành, có thể đánh giá'] },
  { key: 'in_transit', label: 'Đang trung chuyển', statusMatch: ['Đang giao hàng', 'Đã giao thành công', 'Hoàn thành, có thể đánh giá'] },
  { key: 'delivered', label: 'Đã giao đơn hàng', statusMatch: ['Đã giao thành công', 'Hoàn thành, có thể đánh giá'] },
];

const getActiveStepIndex = computed(() => {
  if (!selectedOrder.value) return -1;

  // Xử lý trường hợp đặc biệt: Đã hủy
  if (selectedOrder.value.status === 'Đã hủy') {
    return -2; // Đánh dấu trạng thái hủy
  }

  // Tìm kiếm trạng thái khớp với bước cuối cùng (step index cao nhất)
  let activeIndex = -1;
  const currentStatus = selectedOrder.value.status;
  for (let i = orderSteps.length - 1; i >= 0; i--) {
    if (orderSteps[i].statusMatch.includes(currentStatus)) {
      activeIndex = i;
      break;
    }
  }
  return activeIndex;
});


// --- Hàm Định Dạng và Class ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusClass = (status) => {
  return 'status-' + status.toLowerCase().replace(/ /g, '-').replace(/,/g, '');
};

// --- Logic Popup ---

const openDetailPopup = (order) => {
  selectedOrder.value = order;
  isReviewing.value = false;
  reviewText.value = '';
  reviewRating.value = 0;
  showPopup.value = true;
};

const closeDetailPopup = () => {
  showPopup.value = false;
  selectedOrder.value = null;
  isReviewing.value = false;
};

// --- Các hàm xử lý hành động (giữ nguyên logic alert) ---

const handleCancel = () => {
  if (confirm(`Bạn có chắc muốn hủy đơn hàng #${selectedOrder.value.id} không?`)) {
    alert(`Đã gửi yêu cầu hủy đơn hàng #${selectedOrder.value.id}`);
    // Giả lập cập nhật trạng thái
    const orderToUpdate = orders.value.find(o => o.id === selectedOrder.value.id);
    if (orderToUpdate) {
      orderToUpdate.status = 'Đã hủy';
      orderToUpdate.canCancel = false;
      // Cập nhật selectedOrder nếu đang mở popup
      selectedOrder.value.status = 'Đã hủy';
      selectedOrder.value.canCancel = false;
    }
  }
};

const handleRepurchase = () => {
  alert(`Đã thêm các sản phẩm của đơn hàng #${selectedOrder.value.id} vào giỏ hàng!`);
  // router.push('/cart');
};

const handleStartReview = () => {
  isReviewing.value = true;
};

const handleSubmitReview = () => {
  if (reviewRating.value === 0) {
    alert('Vui lòng chọn số sao để đánh giá!');
    return;
  }
  alert(`Cảm ơn bạn đã đánh giá ${reviewRating.value} sao cho đơn hàng #${selectedOrder.value.id}!`);
  const orderToUpdate = orders.value.find(o => o.id === selectedOrder.value.id);
  if (orderToUpdate) {
    orderToUpdate.isReviewed = true;
    // Cập nhật selectedOrder nếu đang mở popup
    selectedOrder.value.isReviewed = true;
  }
  isReviewing.value = false;
};

const handleReturn = () => {
  if (confirm(`Bạn có chắc muốn yêu cầu hoàn hàng cho đơn hàng #${selectedOrder.value.id} không?`)) {
    alert(`Đã gửi yêu cầu hoàn hàng cho đơn hàng #${selectedOrder.value.id}.`);
    const orderToUpdate = orders.value.find(o => o.id === selectedOrder.value.id);
    if (orderToUpdate) {
      orderToUpdate.canReturn = false;
      // Cập nhật selectedOrder nếu đang mở popup
      selectedOrder.value.canReturn = false;
    }
  }
};
</script>

<template>
  <div class="order-list-container">
    <h2 class="title">📋 Danh Sách Đơn Hàng</h2>

    <div v-if="orders.length > 0" class="order-cards">
      <div v-for="order in orders" :key="order.id" class="order-card" @click="openDetailPopup(order)">
        <div class="card-header">
          <strong>Đơn hàng #{{ order.id }}</strong>
          <span :class="['status-badge', getStatusClass(order.status)]">
            {{ order.status }}
          </span>
        </div>

        <p>Ngày đặt: {{ order.date }}</p>

        <div class="product-table">
          <div class="product-header">
            <span class="col-name">Sản phẩm</span>
            <span class="col-qty">SL</span>
            <span class="col-price">Giá</span>
          </div>

          <div v-for="(product, index) in order.items" :key="index" class="product-row">
            <span class="col-name">{{ product.name }}</span>
            <span class="col-qty">x{{ product.qty || product.quantity }}</span>
            <span class="col-price">{{ formatCurrency(product.price) }}</span>
          </div>
        </div>

        <p class="total-amount">Tổng cộng: <strong>{{ formatCurrency(order.total) }}</strong></p>

        <button class="detail-btn">
          Xem Chi Tiết
        </button>
      </div>
    </div>

    <p v-else class="no-orders">Bạn chưa có đơn hàng nào.</p>

    <div v-if="showPopup && selectedOrder" class="popup-overlay" @click.self="closeDetailPopup">
      <div class="popup-content">
        <button class="close-btn" @click="closeDetailPopup">×</button>
        <h2 class="popup-title">🛒 Chi Tiết Đơn Hàng #{{ selectedOrder.id }}</h2>

        <div class="status-progress-bar-container">
          <div v-if="getActiveStepIndex === -2" class="cancelled-status-message">
            ❌ Đơn hàng đã bị hủy
          </div>
          <div v-else class="status-progress-bar">
            <div v-for="(step, index) in orderSteps" :key="step.key" class="step" :class="{
              'active': index <= getActiveStepIndex,
              'current': index === getActiveStepIndex
            }">
              <div class="icon-container">
                <i v-if="step.key === 'placed'" class="fas fa-box-open"></i>
                <i v-else-if="step.key === 'shipping_prep'" class="fas fa-truck-loading"></i>
                <i v-else-if="step.key === 'in_transit'" class="fas fa-shipping-fast"></i>
                <i v-else-if="step.key === 'delivered'" class="fas fa-check-circle"></i>
              </div>
              <div class="step-label">{{ step.label }}</div>
            </div>
            <div class="progress-line">
              <div class="progress-fill"
                :style="{ width: getActiveStepIndex === -1 ? '0%' : (getActiveStepIndex / (orderSteps.length - 1)) * 100 + '%' }">
              </div>
            </div>
          </div>
        </div>
        <div class="detail-card info-section">
          <h3><i class="fas fa-info-circle section-icon"></i> Thông tin Đơn hàng</h3>
          <div class="info-row">
            <span>Mã đơn hàng:</span>
            <strong>#{{ selectedOrder.id }}</strong>
          </div>
          <div class="info-row">
            <span>Ngày đặt:</span>
            <span>{{ selectedOrder.date }}</span>
          </div>
          <div class="info-row">
            <span>Trạng thái:</span>
            <strong class="status-text">{{ selectedOrder.status }}</strong>
          </div>
        </div>

        <div class="detail-card customer-section">
          <h3><i class="fas fa-user section-icon"></i> Thông tin Khách hàng</h3>
          <p><strong>{{ selectedOrder.customer.name }}</strong></p>
          <p><i class="fas fa-phone-alt"></i> {{ selectedOrder.customer.phone }}</p>
          <p><i class="fas fa-map-marker-alt"></i> {{ selectedOrder.customer.address }}</p>
        </div>

        <div class="detail-card product-section">
          <h3><i class="fas fa-box-open section-icon"></i> Sản phẩm đã đặt</h3>
          <div class="product-list-popup">
            <div v-for="item in selectedOrder.items" :key="item.id" class="product-item">
              <img :src="item.image" :alt="item.name" class="product-image">

              <div class="product-info">
                <span class="product-name">{{ item.name }}</span>
                <span class="product-qty">Số lượng: x{{ item.qty }}</span>
              </div>

              <span class="product-price">{{ formatCurrency(item.price * item.qty) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-card payment-section">
          <h3><i class="fas fa-credit-card section-icon"></i> Chi tiết Thanh toán</h3>
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span>{{ formatCurrency(selectedOrder.payment.subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Phí giao hàng:</span>
            <span>{{ formatCurrency(selectedOrder.payment.shippingFee) }}</span>
          </div>
          <div class="summary-row total">
            <strong>Tổng cộng:</strong>
            <strong class="total-amount">{{ formatCurrency(selectedOrder.payment.total) }}</strong>
          </div>
          <div class="summary-row payment-method">
            <span>Hình thức thanh toán:</span>
            <span><i class="fas fa-money-bill-wave"></i> {{ selectedOrder.payment.method }}</span>
          </div>
        </div>

        <div class="detail-card action-section">
          <h3><i class="fas fa-cogs section-icon"></i> Hành Động</h3>
          <div class="action-buttons">
            <button v-if="isCancellable" @click="handleCancel" class="action-btn danger-btn">
              <i class="fas fa-times-circle"></i> Hủy Đơn Hàng
            </button>

            <button v-if="isRepurchasable" @click="handleRepurchase" class="action-btn primary-btn">
              <i class="fas fa-redo-alt"></i> Mua Lại Đơn Này
            </button>

            <button v-if="isReviewAvailable" @click="handleStartReview" class="action-btn success-btn">
              <i class="fas fa-star"></i> Đánh Giá
            </button>
            <button v-else-if="selectedOrder.isReviewed" class="action-btn disabled-btn" disabled>
              <i class="fas fa-check-circle"></i> Đã Đánh Giá
            </button>

            <button v-if="isReturnable" @click="handleReturn" class="action-btn secondary-btn">
              <i class="fas fa-undo-alt"></i> Yêu Cầu Hoàn Hàng
            </button>
          </div>
        </div>

        <div v-if="isReviewing" class="detail-card review-form-section">
          <h3><i class="fas fa-comment-dots section-icon"></i> Gửi Đánh Giá Của Bạn</h3>
          <div class="rating-stars">
            <span v-for="star in 5" :key="star" @click="reviewRating = star"
              :class="{ 'star-icon': true, 'active': star <= reviewRating }">
              ★
            </span>
          </div>
          <textarea v-model="reviewText" placeholder="Viết nhận xét của bạn..."></textarea>
          <button @click="handleSubmitReview" class="action-btn primary-btn submit-review-btn">
            <i class="fas fa-paper-plane"></i> Gửi Đánh Giá
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Định nghĩa màu sắc */
:root {
  --primary-color: #009981;
  --danger-color: #E74C3C;
  --secondary-color: #3498DB;
  --success-color: #28A745;
  --text-color: #333;
  --light-gray: #f8f8f8;
  --border-color: #e0e0e0;
}

/* --- STYLES CHO DANH SÁCH (giữ nguyên) --- */
.order-list-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--light-gray);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title {
  color: var(--primary-color);
  border-bottom: 3px solid var(--primary-color);
  padding-bottom: 10px;
  margin-bottom: 25px;
}

.order-cards {
  display: grid;
  gap: 20px;
}

.order-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 5px solid var(--primary-color);
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.85em;
  font-weight: bold;
  color: white;
}

.status-dang-giao-hang {
  background-color: var(--secondary-color);
}

.status-da-giao-thanh-cong,
.status-hoan-thanh-co-the-danh-gia {
  background-color: var(--success-color);
}

.status-da-huy {
  background-color: #95A5A6;
}

/* Bảng sản phẩm gọn gàng */
.product-table {
  margin: 10px 0;
  font-size: 0.95em;
  width: 100%;
}

.product-header {
  display: grid;
  grid-template-columns: 1fr 60px 100px;
  font-weight: bold;
  color: #555;
  border-bottom: 2px solid #ddd;
  padding-bottom: 5px;
  margin-bottom: 5px;
}

.product-row {
  display: grid;
  grid-template-columns: 1fr 60px 100px;
  padding: 5px 0;
  border-bottom: 1px dashed #ddd;
  align-items: center;
}

.col-name {
  text-align: left;
}

.col-qty {
  text-align: center;
}

.col-price {
  text-align: right;
}

.total-amount {
  margin-top: 10px;
  font-size: 1.1em;
  color: var(--primary-color);
}

.detail-btn {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  transition: background-color 0.3s;
  margin-top: 10px;
  border: none;
  cursor: pointer;
}

.detail-btn:hover {
  background-color: #007A65;
}

.no-orders {
  text-align: center;
  color: #666;
  font-style: italic;
}

/* --- STYLES CHO POPUP (giữ nguyên) --- */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 25px 30px;
  width: 95%;
  max-width: 650px;
  position: relative;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #000;
}

.popup-title {
  text-align: center;
  font-size: 1.6em;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 20px;
}

/* --- STYLES CHI TIẾT ĐƠN HÀNG (Giữ nguyên) --- */

.detail-card {
  background-color: #fcfcfc;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid var(--border-color);
  padding: 15px 20px;
  margin-bottom: 15px;
}

.detail-card h3 {
  border-left: 5px solid var(--primary-color);
  padding-left: 15px;
  font-size: 1.2em;
  margin-bottom: 15px;
}

.product-list-popup {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-section .info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 1em;
  border-bottom: 1px dashed var(--border-color);
}

.info-section .status-text {
  color: var(--primary-color);
  font-weight: bold;
}

.customer-section p {
  margin: 8px 0;
  color: #555;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-section p strong {
  color: var(--text-color);
}

.product-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.product-list-popup .product-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-name {
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 3px;
  font-size: 1em;
}

.product-qty {
  font-size: 0.9em;
  color: #777;
}

.product-price {
  font-weight: bold;
  color: var(--primary-color);
  white-space: nowrap;
  font-size: 1em;
}

.payment-section .summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 1em;
  color: #555;
}

.payment-section .summary-row.total {
  font-size: 1.2em;
  font-weight: bold;
  color: var(--text-color);
  border-top: 2px solid var(--border-color);
  padding-top: 10px;
  margin-top: 5px;
}

.payment-section .total-amount {
  color: var(--primary-color);
}

.payment-method {
  font-size: 0.95em;
  color: #777;
  padding-top: 5px;
  border-top: 1px dashed var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Action Section (Giữ nguyên) */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
}

.action-btn i {
  font-size: 1.1em;
}

.primary-btn {
  background-color: var(--primary-color);
  color: white;
}

.primary-btn:hover {
  background-color: #007A65;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.danger-btn {
  background-color: red;
  color: white;
}

.danger-btn:hover {
  background-color: #C0392B;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.success-btn {
  background-color: green;
  color: white;
}

.success-btn:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.secondary-btn {
  background-color: rgb(220, 53, 69);
  color: white;
}

.secondary-btn:hover {
  background-color: rgb(192, 44, 59);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.disabled-btn {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.8;
}

.disabled-btn:hover {
  transform: none;
  box-shadow: none;
}

/* Review Form (Giữ nguyên) */
.review-form-section textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  margin: 15px 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1em;
}

.rating-stars {
  font-size: 1.8em;
  cursor: pointer;
  color: #ccc;
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.star-icon {
  transition: color 0.1s ease-in-out;
}

.star-icon.active {
  color: gold;
}

.submit-review-btn {
  width: auto;
  margin-top: 10px;
}


/* --- STYLES MỚI CHO THANH TIẾN TRÌNH TRẠNG THÁI --- */

.status-progress-bar-container {
  padding: 20px 10px;
  margin-bottom: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  position: relative;
  border: 1px solid #ddd;
}

.status-progress-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding-top: 20px;
  /* Khoảng trống cho icon/dot */
}

.progress-line {
  position: absolute;
  top: 30px;
  /* Căn giữa chiều dọc với các icon */
  left: 10%;
  right: 10%;
  height: 4px;
  background-color: #ccc;
  z-index: 1;
  border-radius: 2px;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.5s ease-in-out;
  border-radius: 2px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 25%;
  /* Chia đều cho 4 bước */
  position: relative;
  z-index: 2;
  /* Đảm bảo các bước nằm trên đường kẻ */
}

.icon-container {
  width: 40px;
  height: 40px;
  background-color: #fff;
  border: 3px solid #ccc;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
  font-size: 1.2em;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.step.active .icon-container {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.step.current .icon-container {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: scale(1.1);
  box-shadow: 0 0 0 5px rgba(0, 153, 129, 0.2);
  /* Hiệu ứng nhấn mạnh */
}

.step-label {
  font-size: 0.9em;
  font-weight: 500;
  color: #999;
  min-height: 40px;
  /* Đảm bảo chiều cao đồng đều */
  transition: color 0.3s ease;
}

.step.active .step-label {
  color: var(--text-color);
}

.step.current .step-label {
  font-weight: bold;
  color: var(--primary-color);
}

/* Xử lý trạng thái Đã hủy */
.cancelled-status-message {
  text-align: center;
  padding: 15px;
  background-color: #FADBD8;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.1em;
}
</style>