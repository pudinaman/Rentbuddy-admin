import React from "react";
import TrackTableOne from "../../components/tables/TrackTableOne";

const Track: React.FC = () => {
  return (
    <div className="p-4 overflow-x-hidden h-screen flex flex-col">
      <TrackTableOne />
    </div>
  );
};

export default Track;
