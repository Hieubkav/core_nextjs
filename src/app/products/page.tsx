export default function ProductsPage() {
  const products = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  // Array 10 số
  
  return (
    <div>
      <h1>Danh sách sản phẩm</h1>
      {products.map((number) => (
        <p key={number}>Sản phẩm {number}</p>
      ))}
    </div>
  );
}