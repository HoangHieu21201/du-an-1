<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap'; // Import Modal của Bootstrap

// --- STATE QUẢN LÝ ---
const API_URL = import.meta.env.VITE_API_BASE_URL;
const users = ref([]); // Danh sách người dùng
const isLoading = ref(true); // Trạng thái loading
const modalInstance = ref(null); // Instance của Modal Bootstrap
const modalRef = ref(null); // Template ref cho modal element
const isEditMode = ref(false); // Cờ để biết đang Thêm mới (false) hay Chỉnh sửa (true)

// Dữ liệu cho form (dùng chung cho cả Thêm và Sửa)
const formData = reactive({
  id: null,
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'nhanvien'
});

// Lỗi validation
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// --- VÒNG ĐỜI (LIFECYCLE) ---
onMounted(() => {
  fetchUsers();
  // Khởi tạo Modal Bootstrap một lần khi component được mounted
  if (modalRef.value) {
    modalInstance.value = new Modal(modalRef.value);
  }
});

// --- CÁC HÀM CRUD ---

/**
 * Tải danh sách người dùng từ API
 */
async function fetchUsers() {
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_URL}/admin_Account`);
    users.value = response.data; // Giả sử API trả về mảng người dùng
  } catch (error) {
    console.error("Lỗi khi tải danh sách người dùng:", error);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: 'Không thể tải danh sách người dùng. Vui lòng thử lại sau.',
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
  formData.username = '';
  formData.email = '';
  formData.password = '';
  formData.confirmPassword = '';
  formData.role = 'nhanvien';

  // Xóa lỗi
  Object.keys(errors).forEach(key => errors[key] = '');
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
 * @param {object} user - Đối tượng người dùng cần sửa
 */
function openEditModal(user) {
  resetForm();
  isEditMode.value = true;

  // Điền dữ liệu của user vào form
  formData.id = user.id;
  formData.username = user.username;
  formData.email = user.email;
  formData.role = user.role;
  // Mật khẩu để trống, chỉ điền nếu muốn thay đổi
  
  modalInstance.value.show();
}

/**
 * Xác thực form
 */
function validateForm() {
  // Reset lỗi
  Object.keys(errors).forEach(key => errors[key] = '');
  let isValid = true;
  const re = /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]+$/;

  if (!formData.username.trim()) {
    errors.username = 'Vui lòng nhập tên hiển thị.';
    isValid = false;
  } else if (!re.test(formData.username)) {
      errors.username = 'Tên hiển thị chỉ được dùng chữ và số.'
      isValid = false;
  }

  if (!formData.email) {
    errors.email = 'Vui lòng nhập email.';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Email không đúng định dạng.';
    isValid = false;
  }

  // Khi tạo mới, mật khẩu là bắt buộc
  if (!isEditMode.value) {
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
      isValid = false;
    }
  }

  // Nếu có nhập mật khẩu (dù là tạo mới hay cập nhật), thì phải xác nhận
  if (formData.password) {
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
      isValid = false;
    }
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
  
  // Xây dựng payload, loại bỏ confirmPassword
  const payload = {
    username: formData.username,
    email: formData.email,
    role: formData.role,
  };

  // Chỉ thêm mật khẩu vào payload nếu nó được điền
  if (formData.password) {
    payload.password = formData.password;
    payload.password_confirmation = formData.confirmPassword;
  }

  try {
    if (isEditMode.value) {
      // --- CHẾ ĐỘ CẬP NHẬT (UPDATE) ---
      await axios.put(`${API_URL}/admin_Account/${formData.id}`, payload);
      Swal.fire('Thành công', 'Đã cập nhật người dùng!', 'success');
    } else {
      // --- CHẾ ĐỘ TẠO MỚI (CREATE) ---
      await axios.post(`${API_URL}/admin_Account`, payload);
      Swal.fire('Thành công', 'Đã tạo người dùng mới!', 'success');
    }

    modalInstance.value.hide(); // Đóng modal
    fetchUsers(); // Tải lại danh sách
  } catch (apiError) {
    console.error("Lỗi khi lưu:", apiError);
    if (apiError.response?.data?.errors) {
      // Hiển thị lỗi validation từ server
      const serverErrors = apiError.response.data.errors;
      if (serverErrors.email) errors.email = serverErrors.email[0];
      if (serverErrors.username) errors.username = serverErrors.username[0];
    } else {
      Swal.fire('Thất bại', 'Đã có lỗi xảy ra. Vui lòng thử lại.', 'error');
    }
  } finally {
    isLoading.value = false;
  }
}

/**
 * Xử lý xóa người dùng
 * @param {object} user - Đối tượng người dùng cần xóa
 */
async function handleDelete(user) {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn?',
    text: `Bạn sẽ xóa vĩnh viễn người dùng "${user.username}"!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Đồng ý xóa!',
    cancelButtonText: 'Hủy bỏ'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_URL}/admin_Account/${user.id}`);
      Swal.fire(
        'Đã xóa!',
        'Người dùng đã được xóa.',
        'success'
      );
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      Swal.fire('Lỗi', 'Không thể xóa người dùng này.', 'error');
    }
  }
}
</script>

<template>
  <div class="app-content-header">
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <h3 class="mb-0">Quản lý Người dùng</h3>
        </div>
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-end">
            <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
            <li class="breadcrumb-item active" aria-current="page">
              Người dùng
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
              <h3 class="card-title">Danh sách Người dùng</h3>
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
                    <th>Tên đăng nhập</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="users.length === 0">
                    <td colspan="6" class="text-center">Không có dữ liệu</td>
                  </tr>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span v-if="user.role === 'admin'" class="badge text-bg-danger">Quản trị viên</span>
                      <span v-else class="badge text-bg-success">Nhân viên</span>
                    </td>
                    <td>{{ new Date(user.created_at).toLocaleDateString('vi-VN') }}</td>
                    <td>
                      <button class="btn btn-warning btn-sm me-2" @click="openEditModal(user)">
                        <i class="bi bi-pencil"></i> Sửa
                      </button>
                      <button class="btn btn-danger btn-sm" @click="handleDelete(user)">
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

  <div class="modal fade" id="userModal" ref="modalRef" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="userModalLabel">
            {{ isEditMode ? 'Chỉnh sửa Người dùng' : 'Tạo Người dùng mới' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <div class="mb-3">
              <label for="username" class="form-label">Tên đăng nhập</label>
              <input type="text" class="form-control" :class="{ 'is-invalid': errors.username }" id="username"
                v-model="formData.username">
              <div class="invalid-feedback" v-if="errors.username">{{ errors.username }}</div>
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" :class="{ 'is-invalid': errors.email }" id="email"
                v-model="formData.email">
              <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
            </div>

            <div class="mb-3">
              <label for="role" class="form-label">Vai trò</label>
              <select class="form-select" id="role" v-model="formData.role">
                <option value="nhanvien">Nhân viên</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>
            
            <hr>

            <div class="mb-3">
              <label for="password" class="form-label">Mật khẩu</label>
              <input type="password" class="form-control" :class="{ 'is-invalid': errors.password }" id="password"
                v-model="formData.password">
              <div class="form-text" v-if="isEditMode">(Để trống nếu không muốn thay đổi)</div>
              <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
              <input type="password" class="form-control" :class="{ 'is-invalid': errors.confirmPassword }"
                id="confirmPassword" v-model="formData.confirmPassword">
              <div class="invalid-feedback" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
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