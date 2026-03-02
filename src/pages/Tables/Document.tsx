import DocumentTableOne from "../../components/tables/DocumentTableOne";

const Document = () => {
  return (
    <div className="p-5 w-full min-h-[82vh] overflow-visible">
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
        <DocumentTableOne />
      </div>
    </div>
  );
};

export default Document;
