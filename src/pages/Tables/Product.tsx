import ProductTableOne from "../../components/tables/ProductTableOne";

const Product = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 dark:text-white">
        Product Management
      </h1>
      <ProductTableOne />
    </div>
  );
};

export default Product;
