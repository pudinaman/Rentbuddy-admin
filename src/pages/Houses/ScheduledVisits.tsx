import { useEffect, useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import apiClient from '../../services/apiClient';
import { CalendarDays, MapPin, Phone, User, Building, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

interface Visit {
  _id: string;
  name: string;
  mobile: string;
  propertyLocation: string;
  visitDate: string;
  visitTime: string;
  visitFee: number;
  status: string;
  createdAt: string;
  houseId?: {
    _id: string;
    houseName: string;
    category: string;
    location: string;
    bhk: string;
    images?: { url: string }[];
  };
}

const ScheduledVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await apiClient.get('/visits');
      setVisits(response.data.visits || []);
    } catch (error) {
      console.error('Error fetching scheduled visits:', error);
      toast.error('Failed to load scheduled visits');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="text-center py-10">Loading scheduled visits...</div>;

  return (
    <div>
      <PageMeta
        title="Scheduled Visits | RentBuddy Admin"
        description="View and manage property visit requests."
      />
      <PageBreadcrumb pageTitle="Scheduled Requests" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visits.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
            <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800">No Visits Scheduled</h3>
            <p className="text-slate-500 mt-2">There are currently no property visits requested by users.</p>
          </div>
        )}

        {visits.map((visit) => (
          <div key={visit._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row transition hover:shadow-md">
            <div className="md:w-2/5 h-48 md:h-auto relative bg-slate-100 border-b md:border-b-0 md:border-r border-slate-200">
              {visit.houseId && visit.houseId.images && visit.houseId.images.length > 0 ? (
                <img 
                  src={visit.houseId.images[0].url} 
                  alt={visit.houseId.houseName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Building className="h-10 w-10 mb-2 opacity-50" />
                  <span className="text-sm font-medium">No Image</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm ${getStatusColor(visit.status)}`}>
                  {visit.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {visit.houseId ? visit.houseId.houseName : 'Unknown Property'}
              </h3>
              {visit.houseId && (
                <p className="text-sm text-indigo-600 font-semibold mb-4 bg-indigo-50 inline-block px-2 py-0.5 rounded-md w-fit">
                  {visit.houseId.category} • {visit.houseId.bhk}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Customer</p>
                      <p className="font-semibold text-slate-800">{visit.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Contact</p>
                      <p className="font-semibold text-slate-800">{visit.mobile}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date & Time</p>
                      <p className="font-semibold text-slate-800">{visit.visitDate}</p>
                      <p className="text-slate-600">{visit.visitTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Visit Fee</p>
                      <p className="font-semibold text-green-600">₹{visit.visitFee}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-slate-600 leading-tight">
                  <span className="font-medium text-slate-800">Location:</span> {visit.propertyLocation}
                </p>
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduledVisits;
