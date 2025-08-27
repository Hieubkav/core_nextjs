import { prisma } from './prisma'

export async function seedDatabase() {
  try {
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'tranmanhhieu10@gmail.com' },
      update: {},
      create: {
        email: 'tranmanhhieu10@gmail.com',
        name: 'Admin',
        role: 'admin',
        emailVerified: new Date(),
      },
    })

    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'gpt-accounts' },
        update: {},
        create: {
          name: 'Tài khoản GPT',
          slug: 'gpt-accounts',
          description: 'Tài khoản ChatGPT Plus và Pro',
          sortOrder: 1,
        },
      }),
      prisma.category.upsert({
        where: { slug: 'capcut-accounts' },
        update: {},
        create: {
          name: 'Tài khoản CapCut',
          slug: 'capcut-accounts',
          description: 'Tài khoản CapCut Pro',
          sortOrder: 2,
        },
      }),
      prisma.category.upsert({
        where: { slug: 'adobe-accounts' },
        update: {},
        create: {
          name: 'Tài khoản Adobe',
          slug: 'adobe-accounts',
          description: 'Tài khoản Adobe Creative Cloud',
          sortOrder: 3,
        },
      }),
    ])

    // Create sample products
    const gptProduct = await prisma.product.upsert({
      where: { slug: 'chatgpt-plus' },
      update: {},
      create: {
        name: 'ChatGPT Plus',
        slug: 'chatgpt-plus',
        description: 'Tài khoản ChatGPT Plus với đầy đủ tính năng premium',
        shortDesc: 'Truy cập không giới hạn ChatGPT-4',
        features: [
          'Truy cập ChatGPT-4 không giới hạn',
          'Tốc độ phản hồi nhanh hơn',
          'Ưu tiên truy cập khi server bận',
          'Truy cập các tính năng mới nhất',
        ],
        categoryId: categories[0].id,
        sortOrder: 1,
      },
    })

    // Create product variants
    await Promise.all([
      prisma.productVariant.upsert({
        where: { id: 1 },
        update: {},
        create: {
          name: '1 tháng',
          description: 'Sử dụng trong 1 tháng',
          price: 150000,
          originalPrice: 200000,
          productId: gptProduct.id,
          isDefault: true,
          sortOrder: 1,
        },
      }),
      prisma.productVariant.upsert({
        where: { id: 2 },
        update: {},
        create: {
          name: '3 tháng',
          description: 'Sử dụng trong 3 tháng',
          price: 400000,
          originalPrice: 600000,
          productId: gptProduct.id,
          sortOrder: 2,
        },
      }),
      prisma.productVariant.upsert({
        where: { id: 3 },
        update: {},
        create: {
          name: '1 năm',
          description: 'Sử dụng trong 1 năm',
          price: 1500000,
          originalPrice: 2400000,
          productId: gptProduct.id,
          sortOrder: 3,
        },
      }),
    ])

    // Create settings
    const settings = [
      { key: 'site_name', value: 'Digital Store', group: 'general', label: 'Tên website' },
      { key: 'site_description', value: 'Cửa hàng sản phẩm số uy tín', group: 'general', label: 'Mô tả website' },
      { key: 'facebook_url', value: 'https://facebook.com/digitalstore', group: 'social', label: 'Facebook URL' },
      { key: 'zalo_phone', value: '0123456789', group: 'social', label: 'Số Zalo' },
      { key: 'contact_phone', value: '0123456789', group: 'general', label: 'Số điện thoại' },
      { key: 'bank_name', value: 'Vietcombank', group: 'payment', label: 'Tên ngân hàng' },
      { key: 'bank_account', value: '1234567890', group: 'payment', label: 'Số tài khoản' },
      { key: 'bank_owner', value: 'TRAN MANH HIEU', group: 'payment', label: 'Chủ tài khoản' },
    ]

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    }

    // Create sample FAQ
    const faqs = [
      {
        question: 'Tài khoản có bị khóa không?',
        answer: 'Chúng tôi cam kết tài khoản không bị khóa trong thời gian sử dụng. Nếu có vấn đề, chúng tôi sẽ hỗ trợ thay thế miễn phí.',
        sortOrder: 1,
      },
      {
        question: 'Thời gian giao hàng bao lâu?',
        answer: 'Sau khi thanh toán, chúng tôi sẽ giao tài khoản trong vòng 5-30 phút.',
        sortOrder: 2,
      },
      {
        question: 'Có hỗ trợ sau bán hàng không?',
        answer: 'Có, chúng tôi hỗ trợ 24/7 qua Zalo và Facebook. Mọi vấn đề sẽ được giải quyết nhanh chóng.',
        sortOrder: 3,
      },
    ]

    for (const faq of faqs) {
      await prisma.fAQ.create({
        data: faq,
      })
    }

    console.log('✅ Database seeded successfully!')
    return { success: true }

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}
