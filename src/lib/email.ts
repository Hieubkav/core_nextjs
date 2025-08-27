import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, url: string) {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Đăng nhập vào Digital Store',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Đăng nhập vào Digital Store</h2>
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu đăng nhập vào tài khoản Digital Store. Nhấp vào nút bên dưới để tiếp tục:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Đăng nhập
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Nếu bạn không yêu cầu đăng nhập, vui lòng bỏ qua email này.
        </p>
        <p style="color: #666; font-size: 14px;">
          Link này sẽ hết hạn sau 24 giờ.
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendOrderConfirmation(
  customerEmail: string,
  orderNumber: string,
  orderDetails: any
) {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: customerEmail,
    subject: `Xác nhận đơn hàng #${orderNumber}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Xác nhận đơn hàng</h2>
        <p>Xin chào ${orderDetails.customerName},</p>
        <p>Cảm ơn bạn đã đặt hàng tại Digital Store. Đơn hàng của bạn đã được tiếp nhận.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Thông tin đơn hàng</h3>
          <p><strong>Mã đơn hàng:</strong> ${orderNumber}</p>
          <p><strong>Tổng tiền:</strong> ${orderDetails.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
          <p><strong>Trạng thái:</strong> Đang xử lý</p>
        </div>

        <h3>Chi tiết sản phẩm:</h3>
        ${orderDetails.items.map((item: any) => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.productName}</strong> - ${item.variantName}</p>
            <p>Số lượng: ${item.quantity} x ${item.price.toLocaleString('vi-VN')} VNĐ</p>
          </div>
        `).join('')}

        <p style="margin-top: 30px;">
          Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận và giao hàng.
        </p>
        
        <p>Trân trọng,<br>Digital Store Team</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendAdminOrderNotification(orderNumber: string, orderDetails: any) {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 Đơn hàng mới #${orderNumber}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #dc3545; text-align: center;">Đơn hàng mới</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Thông tin đơn hàng</h3>
          <p><strong>Mã đơn hàng:</strong> ${orderNumber}</p>
          <p><strong>Khách hàng:</strong> ${orderDetails.customerName}</p>
          <p><strong>Email:</strong> ${orderDetails.customerEmail}</p>
          <p><strong>SĐT:</strong> ${orderDetails.customerPhone || 'Không có'}</p>
          <p><strong>Tổng tiền:</strong> ${orderDetails.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
        </div>

        <h3>Chi tiết sản phẩm:</h3>
        ${orderDetails.items.map((item: any) => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.productName}</strong> - ${item.variantName}</p>
            <p>Số lượng: ${item.quantity} x ${item.price.toLocaleString('vi-VN')} VNĐ</p>
          </div>
        `).join('')}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/admin/orders" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Xem chi tiết đơn hàng
          </a>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
