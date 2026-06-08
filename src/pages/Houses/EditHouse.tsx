import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { getCategories, createCategory, deleteCategory } from "../../services/categoryService";
import { updateHouse, getHouseById } from "../../services/houseService";
import { Home, MapPin, Building, Bed, Bath, Info, DollarSign, Percent, ShieldCheck, Check, ImagePlus, X, LayoutGrid, Plus, Trash2, Video } from "lucide-react";
import { toast } from "react-toastify";

const amenitiesList = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "WiFi",
  "Power Backup",
  "Elevator",
  "24/7 Security",
  "Furnished",
  "Balcony",
  "Club House",
  "Park",
  "Pet Friendly",
];

export default function EditHouse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    houseName: "",
    category: "",
    location: "",
    bhk: "1 BHK",
    bedrooms: 1,
    bathrooms: 1,
    kitchens: 1,
    sqft: "",
    amenities: [] as string[],
    about: "",
    images: [] as File[],
    videos: [] as File[],
    existingImages: [] as { url: string, fileId: string }[],
    existingVideos: [] as { url: string, fileId: string }[],
    monthlyRent: "",
    brokerage: "",
    securityDeposit: "",
    visitFee: "",
  });

  useEffect(() => {
    fetchCategories();
    if (id) fetchHouseDetails();
  }, [id]);

  const fetchHouseDetails = async () => {
    try {
      const data = await getHouseById(id!);
      setFormData((prev) => ({
        ...prev,
        houseName: data.houseName,
        category: data.category,
        location: data.location,
        bhk: data.bhk,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        kitchens: data.kitchens,
        sqft: data.sqft,
        amenities: data.amenities || [],
        about: data.about,
        monthlyRent: data.monthlyRent,
        brokerage: data.brokerage,
        securityDeposit: data.securityDeposit,
        visitFee: data.visitFee || "",
        existingImages: data.images || [],
        existingVideos: data.videos || [],
      }));
    } catch (error) {
      toast.error("Failed to load house details");
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, category: data[0].name }));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (window.confirm(`Can we add ${newCategory.trim()} category?`)) {
      try {
        const added = await createCategory(newCategory.trim());
        setCategories((prev) => [added.category, ...prev]);
        setFormData((prev) => ({ ...prev, category: added.category.name }));
        setNewCategory("");
        setIsAddCategoryOpen(false);
        toast.success("Category added successfully!");
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to add category");
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (!formData.category) return;
    
    const catObj = categories.find(c => c.name === formData.category);
    if (!catObj) return;

    if (window.confirm(`Can we delete ${formData.category} category?`)) {
      try {
        await deleteCategory(catObj._id);
        const updated = categories.filter((c) => c._id !== catObj._id);
        setCategories(updated);
        setFormData((formPrev) => ({ ...formPrev, category: updated.length > 0 ? updated[0].name : "" }));
        toast.success("Category deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const isSelected = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: isSelected
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      let validFiles = [];
      for (const file of newFiles) {
        if (file.size > 500 * 1024) {
          toast.error(`File ${file.name} exceeds 500KB limit.`);
        } else {
          validFiles.push(file);
        }
      }
      
      setFormData((prev) => {
        const totalImages = prev.images.length + validFiles.length;
        if (totalImages > 7) {
          toast.error("You can only upload a maximum of 7 images.");
          const allowedFiles = validFiles.slice(0, 7 - prev.images.length);
          return { ...prev, images: [...prev.images, ...allowedFiles] };
        }
        return { ...prev, images: [...prev.images, ...validFiles] };
      });
    }
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      let validFiles = [];
      for (const file of newFiles) {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`Video ${file.name} exceeds 20MB limit.`);
        } else {
          validFiles.push(file);
        }
      }
      
      setFormData((prev) => {
        const totalVideos = prev.videos.length + validFiles.length;
        if (totalVideos > 2) {
          toast.error("You can only upload a maximum of 2 videos.");
          const allowedFiles = validFiles.slice(0, 2 - prev.videos.length);
          return { ...prev, videos: [...prev.videos, ...allowedFiles] };
        }
        return { ...prev, videos: [...prev.videos, ...validFiles] };
      });
    }
  };

  const removeExistingVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingVideos: prev.existingVideos.filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0 && formData.existingImages.length === 0) {
      toast.error("Please ensure at least 1 property image is present.");
      return;
    }
    
    try {
      setIsLoading(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images' || key === 'videos') {
          (value as File[]).forEach((file) => data.append(key, file));
        } else if (key === 'existingImages' || key === 'existingVideos') {
          (value as { url: string, fileId: string }[]).forEach((item) => data.append(key, JSON.stringify(item)));
        } else if (key === 'amenities') {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });

      await updateHouse(id!, data);
      toast.success("House updated successfully!");
      navigate('/houses/all');
    } catch (error) {
      toast.error("Failed to update house.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit House Details" />

      <div className="max-w-4xl mx-auto pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Home className="h-6 w-6" />
              </div>
              Add New Property
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Fill in the details below to list a new property on RentBuddy.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Property Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Building className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="houseName"
                      required
                      placeholder="e.g. Skyline Apartments"
                      value={formData.houseName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category *</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <LayoutGrid className="h-4 w-4" />
                      </div>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800 appearance-none cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryOpen(true)}
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                      title="Add New Category"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCategory}
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
                      title="Delete Selected Category"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g. Andheri West, Mumbai"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Property Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">2</span>
                Property Configuration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pl-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">BHK Configuration</label>
                  <select
                    name="bhk"
                    value={formData.bhk}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                  >
                    <option value="1 RK">1 RK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="4+ BHK">4+ BHK</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Area (Sq. Ft.) *</label>
                  <input
                    type="number"
                    name="sqft"
                    required
                    min="0"
                    placeholder="e.g. 1200"
                    value={formData.sqft}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Bed className="h-3.5 w-3.5 text-slate-400" /> Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    min="1"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Bath className="h-3.5 w-3.5 text-slate-400" /> Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    min="1"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kitchens</label>
                  <input
                    type="number"
                    name="kitchens"
                    min="1"
                    value={formData.kitchens}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">3</span>
                Amenities & Features
              </h3>
              
              <div className="pl-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenitiesList.map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200
                          ${isSelected 
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300" 
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"
                          }
                        `}
                      >
                        <div className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 dark:border-slate-600"}`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 4: About Property */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">4</span>
                About This Property
              </h3>
              
              <div className="pl-8">
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-center pointer-events-none text-slate-400">
                    <Info className="h-4 w-4" />
                  </div>
                  <textarea
                    name="about"
                    rows={4}
                    placeholder="Describe the property, nearby landmarks, atmosphere, etc..."
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 5: Property Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">5</span>
                Property Images
              </h3>
              
              <div className="pl-8">
                <div className="relative rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6 text-center hover:border-indigo-500 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 mb-2">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Click to upload images or drag and drop (Max 7 images)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Supported formats: JPG, JPEG, PNG, WEBP (Max size: 500KB per image)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Upload Images"
                    />
                  </div>
                </div>

                {(formData.images.length > 0 || formData.existingImages.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={img.url} 
                          alt={`Existing Image ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.images.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`New Upload ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 6: Property Videos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">6</span>
                Property Videos
              </h3>
              
              <div className="pl-8">
                <div className="relative rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6 text-center hover:border-indigo-500 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 mb-2">
                      <Video className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Click to upload videos or drag and drop (Max 2 videos)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Supported formats: MP4, WEBM, MOV, MKV (Max size: 20MB per video)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".mp4,.webm,.mov,.mkv"
                      onChange={handleVideoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Upload Videos"
                    />
                  </div>
                </div>

                {(formData.videos.length > 0 || formData.existingVideos.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.existingVideos.map((vid, idx) => (
                      <div key={`existing-vid-${idx}`} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
                        <video 
                          src={vid.url} 
                          className="w-full h-full object-cover"
                          controls
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => removeExistingVideo(idx)}
                            className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-colors shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.videos.map((file, idx) => (
                      <div key={`new-vid-${idx}`} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
                        <video 
                          src={URL.createObjectURL(file)} 
                          className="w-full h-full object-cover"
                          controls
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => removeVideo(idx)}
                            className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-colors shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 7: Financials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">7</span>
                Pricing Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pl-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Rent (₹) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      name="monthlyRent"
                      required
                      min="0"
                      placeholder="e.g. 25000"
                      value={formData.monthlyRent}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Brokerage Charges (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Percent className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      name="brokerage"
                      min="0"
                      placeholder="e.g. 12500"
                      value={formData.brokerage}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Security Deposit (₹) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      name="securityDeposit"
                      required
                      min="0"
                      placeholder="e.g. 50000"
                      value={formData.securityDeposit}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Visit Charges (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      name="visitFee"
                      min="0"
                      placeholder="e.g. 500"
                      value={formData.visitFee}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/houses/all')}
                className="mr-4 px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Property"}
              </button>
            </div>

          </form>
        </div>
      </div>

      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add New Category</h3>
            <input 
              type="text" 
              value={newCategory} 
              onChange={e => setNewCategory(e.target.value)} 
              placeholder="e.g. Bachelor House"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setIsAddCategoryOpen(false); setNewCategory(""); }} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition">Cancel</button>
              <button type="button" onClick={handleAddCategory} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
