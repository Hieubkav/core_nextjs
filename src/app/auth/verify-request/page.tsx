export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-green-600">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M34 14l2 2-20 20-8-8 2-2 6 6z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kiểm tra email của bạn
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chúng tôi đã gửi một link đăng nhập đến địa chỉ email của bạn.
          </p>
          <p className="mt-4 text-center text-sm text-gray-600">
            Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam) và nhấp vào link để đăng nhập.
          </p>
        </div>
        
        <div className="mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Lưu ý quan trọng
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Link đăng nhập sẽ hết hạn sau 24 giờ</li>
                    <li>Nếu không thấy email, vui lòng kiểm tra thư mục spam</li>
                    <li>Bạn có thể đóng tab này và quay lại sau khi nhấp vào link</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ← Quay lại trang đăng nhập
          </a>
        </div>
      </div>
    </div>
  )
}
