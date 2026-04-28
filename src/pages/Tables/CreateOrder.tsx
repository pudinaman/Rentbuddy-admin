import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const CreateOrder = () => {
  return (
    <>
      <PageMeta
        title="RentBuddy - Create Order"
        description="This is the create order page of RentBuddy admin panel."
      />
      <PageBreadcrumb pageTitle="Create Order" />
      <div className="rounded-2xl border border-white/10 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-900/80">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Order</h2>
        <p className="text-slate-500 dark:text-slate-400 italic">
          Order creation form is under development.
        </p>
      </div>
    </>
  );
};

export default CreateOrder;
