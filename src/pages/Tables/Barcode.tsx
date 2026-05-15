import BarcodeTableOne from "../../components/tables/BarcodeTableOne";

const Barcode = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 dark:text-white">
        Barcode Management
      </h1>
      <BarcodeTableOne />
    </div>
  );
};

export default Barcode;
