<script setup>
import { onMounted } from 'vue';
// Đảm bảo bạn đã cài apexcharts: npm install apexcharts
import ApexCharts from 'apexcharts';

onMounted(() => {
  // --- BIỂU ĐỒ KHÁCH TRUY CẬP ---
  const visitors_chart_options = {
    series: [
      { name: 'Cao - 2023', data: [100, 120, 170, 167, 180, 177, 160] },
      { name: 'Thấp - 2023', data: [60, 80, 70, 67, 80, 77, 100] },
    ],
    chart: {
      height: 200,
      type: 'line',
      toolbar: { show: false },
    },
    colors: ['#0d6efd', '#adb5bd'],
    stroke: { curve: 'smooth' },
    grid: {
      borderColor: '#e7e7e7',
      row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 },
    },
    legend: { show: false },
    markers: { size: 1 },
    xaxis: {
      categories: ['22', '23', '24', '25', '26', '27', '28'],
    },
  };

  const visitors_chart = new ApexCharts(
    document.querySelector('#visitors-chart'),
    visitors_chart_options
  );
  visitors_chart.render();

  // --- BIỂU ĐỒ DOANH THU ---
  const sales_chart_options = {
    series: [
      { name: 'Lợi nhuận ròng', data: [44, 55, 57, 56, 61, 58, 63, 60, 66] },
      { name: 'Doanh thu', data: [76, 85, 101, 98, 87, 105, 91, 114, 94] },
      { name: 'Dòng tiền tự do', data: [35, 41, 36, 26, 45, 48, 52, 53, 41] },
    ],
    chart: { type: 'bar', height: 200 },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' },
    },
    legend: { show: false },
    colors: ['#0d6efd', '#20c997', '#ffc107'],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: ['Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'CN', 'Th9', 'Th10'],
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: function (val) { return '$ ' + val + ' nghìn'; },
      },
    },
  };

  const sales_chart = new ApexCharts(
    document.querySelector('#sales-chart'),
    sales_chart_options
  );
  sales_chart.render();
});
</script>

<template>
  <div class="app-content-header">
    <div class="container-fluid">
      <div class="row">
      </div>
    </div>
  </div>

  <div class="app-content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-6">
          <div class="card mb-4">
            <div class="card-header border-0">
              <div class="d-flex justify-content-between">
                <h3 class="card-title">Khách truy cập cửa hàng</h3>
                <a href="javascript:void(0);" class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">Xem báo cáo</a>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex">
                <p class="d-flex flex-column">
                  <span class="fw-bold fs-5">820</span>
                  <span>Khách theo thời gian</span>
                </p>
                <p class="ms-auto d-flex flex-column text-end">
                  <span class="text-success"> <i class="bi bi-arrow-up"></i> 12.5% </span>
                  <span class="text-secondary">So với tuần trước</span>
                </p>
              </div>

              <div class="position-relative mb-4">
                <div id="visitors-chart"></div>
              </div>

              <div class="d-flex flex-row justify-content-end">
                <span class="me-2"> <i class="bi bi-square-fill text-primary"></i> Tuần này </span>
                <span> <i class="bi bi-square-fill text-secondary"></i> Tuần trước </span>
              </div>
            </div>
          </div>
          <div class="card mb-4">
            <div class="card-header border-0">
              <h3 class="card-title">Sản phẩm</h3>
              <div class="card-tools">
                <a href="#" class="btn btn-tool btn-sm"> <i class="bi bi-download"></i> </a>
                <a href="#" class="btn btn-tool btn-sm"> <i class="bi bi-list"></i> </a>
              </div>
            </div>
            <div class="card-body table-responsive p-0">
              <table class="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Đã bán</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <img src="#" alt="Sản phẩm 1" class="rounded-circle img-size-32 me-2" />
                      Sản phẩm A
                    </td>
                    <td>$13 USD</td>
                    <td>
                      <small class="text-success me-1"> <i class="bi bi-arrow-up"></i> 12% </small>
                      12,000 Đã bán
                    </td>
                    <td> <a href="#" class="text-secondary"> <i class="bi bi-search"></i> </a> </td>
                  </tr>
                   <tr>
                    <td>
                      <img src="#" alt="Sản phẩm 1" class="rounded-circle img-size-32 me-2" />
                      Sản phẩm B
                    </td>
                    <td>$29 USD</td>
                    <td>
                      <small class="text-info me-1"> <i class="bi bi-arrow-down"></i> 0.5% </small>
                      123,234 Đã bán
                    </td>
                    <td> <a href="#" class="text-secondary"> <i class="bi bi-search"></i> </a> </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </div>
        <div class="col-lg-6">
          <div class="card mb-4">
            <div class="card-header border-0">
              <div class="d-flex justify-content-between">
                <h3 class="card-title">Doanh thu</h3>
                <a href="javascript:void(0);" class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">Xem báo cáo</a>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex">
                <p class="d-flex flex-column">
                  <span class="fw-bold fs-5">$18,230.00</span>
                  <span>Doanh thu theo thời gian</span>
                </p>
                <p class="ms-auto d-flex flex-column text-end">
                  <span class="text-success"> <i class="bi bi-arrow-up"></i> 33.1% </span>
                  <span class="text-secondary">So với năm ngoái</span>
                </p>
              </div>

              <div class="position-relative mb-4">
                <div id="sales-chart"></div>
              </div>

              <div class="d-flex flex-row justify-content-end">
                <span class="me-2"> <i class="bi bi-square-fill text-primary"></i> Năm nay </span>
                <span> <i class="bi bi-square-fill text-secondary"></i> Năm ngoái </span>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header border-0">
              <h3 class="card-title">Tổng quan cửa hàng</h3>
              <div class="card-tools">
                <a href="#" class="btn btn-sm btn-tool"> <i class="bi bi-download"></i> </a>
                <a href="#" class="btn btn-sm btn-tool"> <i class="bi bi-list"></i> </a>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center border-bottom mb-3">
                <p class="text-success fs-2"> <i class="bi bi-cart-fill"></i> </p>
                <p class="d-flex flex-column text-end">
                  <span class="fw-bold"> <i class="bi bi-graph-up-arrow text-success"></i> 12% </span>
                  <span class="text-secondary">TỶ LỆ CHUYỂN ĐỔI</span>
                </p>
              </div>
              <div class="d-flex justify-content-between align-items-center border-bottom mb-3">
                <p class="text-info fs-2"> <i class="bi bi-bag-fill"></i> </p>
                <p class="d-flex flex-column text-end">
                  <span class="fw-bold"> <i class="bi bi-graph-up-arrow text-info"></i> 0.8% </span>
                  <span class="text-secondary">TỶ LỆ BÁN HÀNG</span>
                </p>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-0">
                <p class="text-danger fs-2"> <i class="bi bi-people-fill"></i> </p>
                <p class="d-flex flex-column text-end">
                  <span class="fw-bold"> <i class="bi bi-graph-down-arrow text-danger"></i> 1% </span>
                  <span class="text-secondary">TỶ LỆ ĐĂNG KÝ</span>
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </template>