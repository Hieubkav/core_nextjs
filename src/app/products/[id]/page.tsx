export default function ProductDetailPage({
  params
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1>Sản phẩm {params.id}</h1>
      <p>Đây là chi tiết sản phẩm số {params.id}</p>
    </div>
  );
}