import React, { useState } from "react";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    gender: "",
    preference: "",
    interests: [],
    hobbies: "Reading, Traveling",
    city: "",
    images: [],
  });
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Ahmedabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
    "Meerut",
    "Rajkot",
    "Kalyan-Dombivli",
    "Vasai-Virar",
    "Varanasi",
    "Srinagar",
    "Aurangabad",
  ];
  const allInterests = [
    "Poetry",
    "Slam Poetry",
    "Sneakers",
    "Songwriting",
    "Freelancing",
    "Photography",
    "Start ups",
    "Choir",
    "Cosplay",
    "Content Creation",
    "Investment",
    "Vintage fashion",
    "Voguing",
    "Singing",
    "Language Exchange",
    "Guitarists",
    "Writing",
    "Literature",
    "NFTs",
    "Tattoos",
    "Painting",
    "Upcycling",
    "Entrepreneurship",
    "Saxophonist",
    "Ballet",
    "Bassist",
    "Musical Writing",
    "Dancing",
    "Art",
    "Drummer",
  ];

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    setProfile((prev) => {
      const updatedInterests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updatedInterests };
    });
  };

  const handleSaveChanges = () => {
    console.log("Saved profile:", profile);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + profile.images.length > 6) {
      alert("You can upload a maximum of 6 photos");
      return;
    }

    const newImages = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        if (newImages.length === files.length) {
          setProfile((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setProfile((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  return (
    <div className="min-h-screen pb-24">
      {" "}
      {/* Added padding for footer */}
      <div className="max-w-lg mx-auto p-6 bg-white shadow-xl rounded-2xl text-gray-800 font-sans">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <label
            className="relative cursor-pointer w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden group flex-shrink-0"
            onClick={() => setShowImageGallery(true)}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              multiple
              onChange={handleImageUpload}
            />
            <div className="w-full h-full flex items-center justify-center bg-gray-100 transition-colors group-hover:bg-gray-200">
              {profile.images.length > 0 ? (
                <img
                  src={profile.images[0]}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <svg
                    className="w-6 h-6 text-gray-400 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-500">
                    Upload
                  </span>
                </div>
              )}
            </div>
          </label>
          <div className="flex flex-col items-start">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-600 mt-1 text-sm">{profile.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name Field */}
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Interests Field */}
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests
              </label>
              <div
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => setShowInterestsModal(true)}
              >
                {profile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">
                    Select your interests...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Gender Preference Field */}
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Looking For
              </label>
              <select
                name="preference"
                value={profile.preference}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
              >
                <option value="" disabled>
                  Select Preference
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          {/* Gender Field */}
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m-4-4h8M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Gender
              </label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* City Field */}
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                name="city"
                value={profile.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
              >
                <option value="" disabled>
                  Select City
                </option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSaveChanges}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01]"
          >
            Save Changes
          </button>
        </div>

        {/* Interests Modal */}
        {showInterestsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center p-4">
            <div
              className="bg-white p-6 rounded-2xl w-full max-w-md flex flex-col"
              style={{ height: "90vh" }}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  Select Interests
                </h3>
                <button
                  onClick={() => setShowInterestsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search interests..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="flex-1 overflow-y-auto mb-4">
                <div className="grid grid-cols-2 gap-3">
                  {allInterests
                    .filter((interest) =>
                      interest.toLowerCase().includes(searchTerm)
                    )
                    .map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`flex items-center justify-center px-3 py-2 rounded-xl border transition-all ${
                          profile.interests.includes(interest)
                            ? "bg-blue-500 border-blue-600 text-white shadow-inner"
                            : "bg-gray-50 border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700"
                        }`}
                      >
                        <span className="text-sm font-medium">{interest}</span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowInterestsModal(false)}
                  className="w-full bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-pink-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Gallery Modal */}
        {showImageGallery && (
          <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-pink-400 p-6 rounded-2xl w-full max-w-md flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">Your Photos</h3>
                <button
                  onClick={() => setShowImageGallery(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {profile.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Uploaded ${index}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
