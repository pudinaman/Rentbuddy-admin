import React from "react";
import RepairTableOne from "../../components/tables/RepairTableOne";

const Repair: React.FC = () => {
  return (
    <div className="p-4 h-screen flex flex-col w-full max-w-full overflow-x-hidden overflow-y-auto">
      <RepairTableOne />
    </div>
  );
};

export default Repair;
