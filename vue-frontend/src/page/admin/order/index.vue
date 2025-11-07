<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

// --- STATE QUẢN LÝ ---
const API_URL = "http://localhost:3000"; // Đảm bảo json-server đang chạy ở cổng này

const orders = ref([]);         // Danh sách đơn hàng trên trang hiện tại
const isLoading = ref(true);

// State cho 2 Modal
const detailModalRef = ref(null);
const detailModalInstance = ref(null);
const statusModalRef = ref(null);
const statusModalInstance = ref(null);

// State lưu dữ liệu tạm thời khi mở Modal
const selectedOrder = ref(null);      // Đơn hàng đang xem/sửa
const selectedOrderStatus = ref('');  // Trạng thái đang chọn
const selectedOrderItems = ref([]); // Các sản phẩm trong đơn hàng chi tiết

// State cho phân trang
const pagination = reactive({
  currentPage: 1,
  itemsPerPage: 10, // Hiển thị 10 đơn hàng mỗi trang
  totalItems: 0,
  totalPages: 1
});

// --- VÒNG ĐỜI (LIFECYCLE) ---
onMounted(() => {
  fetchOrders(1); // Tải trang đầu tiên
  
  // Khởi tạo các instance Modal
  if (detailModalRef.value) {
    detailModalInstance.value = new Modal(detailModalRef.value);
  }
  if (statusModalRef.value) {
    statusModalInstance.value = new Modal(statusModalRef.value);
  }
});

// --- CÁC HÀM TẢI DỮ LIỆU ---

/**
 * Tải danh sách đơn hàng (ĐÃ CÓ PHÂN TRANG)
 * @param {number} page - Trang cần tải
 */
async function fetchOrders(page = 1) {
  isLoading.value = true;
  if (page < 1 || (page > pagination.totalPages && pagination.totalItems > 0)) {
    isLoading.value = false;
    return;
  }
  
  pagination.currentPage = page;

  try {
    // _page: Trang hiện tại
    // _limit: Số lượng/trang
    // _sort=id&_order=desc: Sắp xếp theo ID, mới nhất lên đầu
    const response = await axios.get(
      `${API_URL}/orders?_page=${pagination.currentPage}&_limit=${pagination.itemsPerPage}&_sort=id&_order=desc`
    );
    
    orders.value = response.data;
    
    // json-server trả về tổng số mục trong header 'x-total-count'
    pagination.totalItems = parseInt(response.headers['x-total-count'] || 0);
    pagination.totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
    
  } catch (error) {
    console.error("Lỗi khi tải đơn hàng:", error);
    Swal.fire('Lỗi', 'Không thể tải danh sách đơn hàng. Bạn đã chạy "json-server" chưa?', 'error');
  } finally {
    isLoading.value = false;
  }
}

// --- CÁC HÀM HELPER ---

function formatCurrency(value) {
  if (!value) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('vi-VN');
}

// Hàm helper để lấy class CSS cho badge trạng thái
function getStatusBadge(status) {
  switch (status) {
    case 'Chờ xử lý':
      return 'text-bg-warning';
    case 'Đang giao':
      return 'text-bg-primary';
    case 'Đã hoàn thành':
      return 'text-bg-success';
    case 'Đã hủy':
      return 'text-bg-danger';
    default:
      return 'text-bg-secondary';
  }
}

// --- CÁC HÀM CRUD MODAL ---

/**
 * Mở Modal xem chi tiết đơn hàng
 * @param {object} order - Đơn hàng được click
 */
async function openDetailModal(order) {
  selectedOrder.value = order;
  isLoading.value = true; // Bật loading cho modal
  detailModalInstance.value.show();
  
  try {
    // Tải các mục con (order_items) và thông tin sản phẩm (product) liên quan
    const response = await axios.get(
      `${API_URL}/order_items?orderId=${order.id}&_expand=product`
    );
    selectedOrderItems.value = response.data;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    detailModalInstance.value.hide();
    Swal.fire('Lỗi', 'Không thể tải chi tiết đơn hàng.', 'error');
  } finally {
    isLoading.value = false;
  }
}

/**
 * Mở Modal cập nhật trạng thái
 * @param {object} order - Đơn hàng được click
 */
function openStatusModal(order) {
  selectedOrder.value = order;
  selectedOrderStatus.value = order.status; // Set trạng thái hiện tại
  statusModalInstance.value.show();
}

/**
 * Xử lý API khi nhấn nút "Lưu" ở modal trạng thái
 */
async function handleUpdateStatus() {
  if (!selectedOrder.value) return;
  
  isLoading.value = true;
  try {
    // Gửi PATCH request chỉ để cập nhật 1 trường 'status'
    await axios.patch(`${API_URL}/orders/${selectedOrder.value.id}`, {
      status: selectedOrderStatus.value
    });
    
    statusModalInstance.value.hide();
    Swal.fire('Thành công', 'Đã cập nhật trạng thái đơn hàng.', 'success');
    
    // Tải lại trang hiện tại để cập nhật dữ liệu
    fetchOrders(pagination.currentPage);
    
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    Swal.fire('Lỗi', 'Không thể cập nhật trạng thái.', 'error');
  } finally {
    isLoading.value = false;
  }
}


/**
 * Xử lý xóa đơn hàng (và các mục con)
 * @param {object} order - Đơn hàng cần xóa
 */
async function handleDelete(order) {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn?',
    text: `Bạn sẽ xóa vĩnh viễn đơn hàng #${order.id}!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Đồng ý xóa!',
    cancelButtonText: 'Hủy bỏ'
  });

  if (result.isConfirmed) {
    try {
      // 1. (Quan trọng) Xóa tất cả order_items liên quan
      const itemsToDelete = (await axios.get(`${API_URL}/order_items?orderId=${order.id}`)).data;
      
      await Promise.all(
        itemsToDelete.map(item => axios.delete(`${API_URL}/order_items/${item.id}`))
      );
      
      // 2. Xóa đơn hàng chính
      await axios.delete(`${API_URL}/orders/${order.id}`);

      Swal.fire('Đã xóa!', 'Đơn hàng đã được xóa.', 'success');
      
      // Tải lại dữ liệu (có thể cần quay về trang 1 nếu trang hiện tại hết dữ liệu)
      if (orders.value.length === 1 && pagination.currentPage > 1) {
        fetchOrders(pagination.currentPage - 1);
      } else {
        fetchOrders(pagination.currentPage);
      }
      
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
      Swal.fire('Lỗi', 'Không thể xóa đơn hàng này.', 'error');
    }
  }
}
</script>

<template>
  <div class="app-content-header">
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <h3 class="mb-0">Quản lý Đơn hàng</h3>
        </div>
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-end">
            <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
            <li class="breadcrumb-item active" aria-current="page">
              Đơn hàng
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <div class="app-content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Danh sách Đơn hàng</h3>
              </div>
            
            <div class="card-body p-0">
              <div v-if="isLoading && orders.length === 0" class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <table v-else class="table table-hover table-striped">
                <thead>
                  <tr>
                    <th style="width: 80px">Mã ĐH</th>
                    <th>Khách hàng</th>
                    <th>Điện thoại</th>
                    <th>Tổng tiền</th>
                    <th style="width: 150px">Trạng thái</th>
                    <th style="width: 160px">Ngày đặt</th>
                    <th style="width: 250px">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="orders.length === 0">
                    <td colspan="7" class="text-center">Không có đơn hàng nào</td>
                  </tr>
                  <tr v-for="order in orders" :key="order.id">
                    <td>#{{ order.id }}</td>
                    <td>{{ order.customerName }}</td>
                    <td>{{ order.customerPhone }}</td>
                    <td>{{ formatCurrency(order.totalAmount) }}</td>
                    <td>
                      <span class="badge" :class="getStatusBadge(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                    <td>{{ formatDate(order.createdAt) }}</td>
                    <td>
                      <button class="btn btn-info btn-sm me-2" @click="openDetailModal(order)">
                        <i class="bi bi-eye"></i> Xem
                      </button>
                      <button class="btn btn-warning btn-sm me-2" @click="openStatusModal(order)">
                        <i class="bi bi-pencil-square"></i> Sửa TT
                      </button>
                      <button class="btn btn-danger btn-sm" @click="handleDelete(order)">
                        <i class="bi bi-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="card-footer clearfix" v-if="!isLoading && pagination.totalPages > 1">
              <ul class="pagination pagination-sm m-0 float-end">
                <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="fetchOrders(pagination.currentPage - 1)">&laquo;</a>
                </li>
                
                <li v-for="page in pagination.totalPages" :key="page" 
                    class="page-item" 
                    :class="{ active: pagination.currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="fetchOrders(page)">{{ page }}</a>
                </li>

                <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                  <a class="page-link" href="#" @click.prevent="fetchOrders(pagination.currentPage + 1)">&raquo;</a>
                </li>
              </ul>
            </div>
            </div>
          </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="detailModal" ref="detailModalRef" tabindex="-1" aria-labelledby="detailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="detailModalLabel">
            Chi tiết Đơn hàng #{{ selectedOrder?.id }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="!selectedOrder">
            <p>Đang tải chi tiết...</p>
          </div>
          <div v-else>
            <h6>Thông tin khách hàng:</h6>
            <ul class="list-unstyled">
              <li><strong>Tên:</strong> {{ selectedOrder.customerName }}</li>
              <li><strong>SĐT:</strong> {{ selectedOrder.customerPhone }}</li>
              <li><strong>Địa chỉ:</strong> {{ selectedOrder.customerAddress }}</li>
            </ul>
            <hr>
            
            <h6>Các sản phẩm trong đơn:</h6>
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="4" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                  </td>
                </tr>
                <tr v-for="item in selectedOrderItems" :key="item.id">
                  <td>
                    {{ item.product?.name || `(SP ID: ${item.productId})` }}
                  </td>
                  <td>{{ formatCurrency(item.price) }}</td>
                  <td>x {{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.price * item.quantity) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="fw-bold">
                  <td colspan="3" class="text-end">Tổng cộng:</td>
                  <td>{{ formatCurrency(selectedOrder.totalAmount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="statusModal" ref="statusModalRef" tabindex="-1" aria-labelledby="statusModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="statusModalLabel">
            Cập nhật trạng thái ĐH #{{ selectedOrder?.id }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="statusSelect" class="form-label">Trạng thái đơn hàng</label>
            <select class="form-select" id="statusSelect" v-model="selectedOrderStatus">
              <option value="Chờ xử lý">Chờ xử lý</option>
              <option value="Đang giao">Đang giao</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy bỏ</button>
          <button type="button" class="btn btn-primary" @click="handleUpdateStatus" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table td .btn {
  margin-top: 2px;
  margin-bottom: 2px;
}
.card-body.p-0 .table {
  margin-bottom: 0; /* Xóa margin-bottom của table khi nằm trong card-body p-0 */
}
</style>