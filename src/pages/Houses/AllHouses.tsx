import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import apiClient from '../../services/apiClient';

const AllHouses = () => {
  const navigate = useNavigate();
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const response = await apiClient.get(`/houses?admin=true`);
      setHouses(response.data);
    } catch (error) {
      console.error('Error fetching houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await apiClient.put(`/houses/${id}/toggle-status`);
      // Update local state
      setHouses(houses.map(h => h._id === id ? { ...h, isActive: response.data.isActive } : h));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle status');
    }
  };

  if (loading) return <div className="text-center py-10">Loading houses...</div>;

  return (
    <div>
      <PageMeta
        title="All Houses | RentBuddy Admin"
        description="View and manage all onboarded houses."
      />
      <PageBreadcrumb pageTitle="All Houses" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {houses.map((house) => (
          <div key={house._id} className={`bg-white rounded-xl shadow-sm border ${house.isActive ? 'border-gray-200' : 'border-red-300 opacity-80'} overflow-hidden flex flex-col`}>
            <div className="relative h-48">
              <img 
                src={house.images && house.images.length > 0 ? house.images[0].url : 'https://placehold.co/600x400?text=No+Image'} 
                alt={house.houseName} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {!house.isActive && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm font-bold">
                    DISABLED
                  </span>
                )}
                <span className="bg-white/90 text-gray-800 text-xs px-2 py-1 rounded shadow-sm font-bold">
                  {house.category}
                </span>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{house.houseName}</h3>
              <p className="text-gray-500 text-sm mb-3">📍 {house.location}</p>
              
              <div className="flex justify-between items-center mb-4 text-sm font-medium">
                <span className="text-gray-700">Rent: ₹{house.monthlyRent}</span>
                <span className="text-gray-700">{house.bhk}</span>
              </div>

              <div className="mt-auto flex gap-3">
                <button 
                  onClick={() => navigate(`/houses/edit/${house._id}`)}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg font-medium transition-colors border border-blue-200"
                >
                  Edit Details
                </button>
                <button 
                  onClick={() => handleToggleStatus(house._id)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors border ${
                    house.isActive 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'
                  }`}
                >
                  {house.isActive ? 'Disable Rent' : 'Enable Rent'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {houses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No houses onboarded yet.</p>
        </div>
      )}
    </div>
  );
};

export default AllHouses;
