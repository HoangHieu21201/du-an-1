<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap'; // Import Modal của Bootstrap

const API_URL = import.meta.env.VITE_API_BASE_URL; // Giả sử bạn dùng VITE_API_BASE_URL
const categories = ref([]); // Danh sách danh mục
const isLoading = ref(true); // Trạng thái loading
const modalInstance = ref(null); // Instance của Modal Bootstrap
const modalRef = ref(null); // Template ref cho modal element
const isEditMode = ref(false); // Cờ để biết đang Thêm mới (false) hay Chỉnh sửa (true)

// Dữ liệu cho form
const formData = reactive({
  id: null,
  name: '',
  description: ''
});

// Lỗi validation
const errors = reactive({
  name: '',
  description: ''
});

// --- VÒNG ĐỜI (LIFECYCLE) ---
onMounted(() => {
  fetchCategories();
  // Khởi tạo Modal Bootstrap
  if (modalRef.value) {
    modalInstance.value = new Modal(modalRef.value);
  }
});

// --- CÁC HÀM CRUD ---

/**
 * Tải danh sách danh mục từ API
 * (Giả sử API endpoint là /categories)
 */
async function fetchCategories() {
  isLoading.value = true;
  try {
    // !!! THAY THẾ ENDPOINT API CHO PHÙ HỢP
    const response = await axios.get(`${API_URL}/categories`); 
    categories.value = response.data; // Giả sử API trả về mảng
  } catch (error) {
    console.error("Lỗi khi tải danh sách danh mục:", error);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: 'Không thể tải danh sách danh mục.',
    });
  } finally {
    isLoading.value = false;
  }
}

/**
 * Reset form về trạng thái ban đầu
 */
function resetForm() {
  formData.id = null;
  formData.name = '';
  formData.description = '';

  // Xóa lỗi
  errors.name = '';
  errors.description = '';
}

/**
 * Mở modal ở chế độ "Thêm mới"
 */
function openCreateModal() {
  resetForm();
  isEditMode.value = false;
  modalInstance.value.show();
}

/**
 * Mở modal ở chế độ "Chỉnh sửa"
 * @param {object} category - Đối tượng danh mục cần sửa
 */
function openEditModal(category) {
  resetForm();
  isEditMode.value = true;

  // Điền dữ liệu của danh mục vào form
  formData.id = category.id;
  formData.name = category.name;
  formData.description = category.description;
  
  modalInstance.value.show();
}

/**
 * Xác thực form (kiểm tra Tên danh mục là bắt buộc)
 */
function validateForm() {
  errors.name = '';
  let isValid = true;

  if (!formData.name.trim()) {
    errors.name = 'Vui lòng nhập tên danh mục.';
    isValid = false;
  }
  return isValid;
}

/**
 * Xử lý lưu (gọi API Thêm mới hoặc Cập nhật)
 */
async function handleSave() {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  const payload = {
    name: formData.name,
    description: formData.description,
  };

  try {
    if (isEditMode.value) {
      // --- CHẾ ĐỘ CẬP NHẬT (UPDATE) ---
      // !!! THAY THẾ ENDPOINT API CHO PHÙ HỢP
      await axios.put(`${API_URL}/categories/${formData.id}`, payload);
      Swal.fire('Thành công', 'Đã cập nhật danh mục!', 'success');
    } else {
      // --- CHẾ ĐỘ TẠO MỚI (CREATE) ---
      // !!! THAY THẾ ENDPOINT API CHO PHÙ HỢP
      await axios.post(`${API_URL}/categories`, payload);
      Swal.fire('Thành công', 'Đã tạo danh mục mới!', 'success');
    }

    modalInstance.value.hide(); // Đóng modal
    fetchCategories(); // Tải lại danh sách
  } catch (apiError) {
    console.error("Lỗi khi lưu:", apiError);
    if (apiError.response?.data?.errors?.name) {
      errors.name = apiError.response.data.errors.name[0];
    } else {
      Swal.fire('Thất bại', 'Đã có lỗi xảy ra. Vui lòng thử lại.', 'error');
    }
  } finally {
    isLoading.value = false;
  }
}

/**
 * Xử lý xóa danh mục
 * @param {object} category - Đối tượng danh mục cần xóa
 */
async function handleDelete(category) {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn?',
    text: `Bạn sẽ xóa vĩnh viễn danh mục "${category.name}"!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Đồng ý xóa!',
    cancelButtonText: 'Hủy bỏ'
  });

  if (result.isConfirmed) {
    try {
      // !!! THAY THẾ ENDPOINT API CHO PHÙ HỢP
      await axios.delete(`${API_URL}/categories/${category.id}`);
      Swal.fire(
        'Đã xóa!',
        'Danh mục đã được xóa.',
        'success'
      );
      fetchCategories(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      Swal.fire('Lỗi', 'Không thể xóa danh mục này.', 'error');
    }
  }
}
</script>

<template>
  <div class="app-content-header">
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <h3 class="mb-0">Quản lý Danh mục</h3>
        </div>
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-end">
            <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
            <li class="breadcrumb-item active" aria-current="page">
              Danh mục
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
              <h3 class="card-title">Danh sách Danh mục</h3>
              <div class="card-tools">
                <button type="button" class="btn btn-primary" @click="openCreateModal">
                  <i class="bi bi-plus-lg"></i> Thêm mới
                </button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="isLoading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <table v-else class="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <!-- nếu không có sản phẩm thì hiển thị 1 sản phẩm code cứng(default) -->
                 <tbody>
                    <tr></tr>
                 </tbody>
                <tbody>
                  <tr v-if="categories.length === 0">
                    <td colspan="5" class="text-center">Không có dữ liệu</td>
                  </tr>
                  <tr v-for="category in categories" :key="category.id">
                    <td>{{ category.id }}</td>
                    <td>{{ category.name }}</td>
                    <td>{{ category.description || 'N/A' }}</td>
                    <td>{{ new Date(category.created_at).toLocaleDateString('vi-VN') }}</td>
                    <td>
                      <button class="btn btn-warning btn-sm me-2" @click="openEditModal(category)">
                        <i class="bi bi-pencil"></i> Sửa
                      </button>
                      <button class="btn btn-danger btn-sm" @click="handleDelete(category)">
                        <i class="bi bi-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </div>
          </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="categoryModal" ref="modalRef" tabindex="-1" aria-labelledby="categoryModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="categoryModalLabel">
            {{ isEditMode ? 'Chỉnh sửa Danh mục' : 'Tạo Danh mục mới' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <div class="mb-3">
              <label for="name" class="form-label">Tên danh mục <span class="text-danger">*</span></label>
              <input type="text" class="form-control" :class="{ 'is-invalid': errors.name }" id="name"
                v-model="formData.name">
              <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">Mô tả</label>
              <textarea class="form-control" id="description" rows="3" v-model="formData.description"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy bỏ</button>
          <button type="button" class="btn btn-primary" @click="handleSave" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            Lưu lại
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Thêm một chút khoảng cách cho các nút trong bảng */
.table td .btn {
  margin-top: 2px;
  margin-bottom: 2px;
}
</style>