import { useState, useEffect } from "react";
import { getUserInfo } from "../../api/api"; // Adjusted path based on your project structure
import API from "../../api/axiosConfig"; // Adjust the path based on your project structure

const Profile = () => {
  const [user, setUser] = useState({
    did: "",
    name: "",
    dob: "",
    birthplace: "",
    userName: "",
  });
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null); // For local state of uploaded image
  const [imagePreview, setImagePreview] = useState(null); // To display preview of image
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode

  // Fetch user data using DID from localStorage
  useEffect(() => {
    const did = localStorage.getItem("did");
    if (!did) {
      setError("User not authenticated");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await getUserInfo(did);
        setUser(response.data);

        // Retrieve profile picture from localStorage if exists
        const savedProfilePicture = localStorage.getItem("profilePicture");
        if (savedProfilePicture) {
          setImagePreview(savedProfilePicture); // Set image preview from localStorage
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("User not found");
        } else {
          setError("Failed to fetch user profile");
        }
      }
    };

    fetchUserData();
  }, []);

  // Handle the profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(file); // Set the image file for sending to the backend
        setImagePreview(reader.result); // Set preview for image
        // Save the base64 image string in localStorage
        localStorage.setItem("profilePicture", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update profile information
  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("userName", user.userName);
      formData.append("dob", user.dob);
      formData.append("birthplace", user.birthplace);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture); // Append the image file to form data
      }
  
      // Send the form data to the backend to update the profile
      await API.put("/user/update", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Profile updated successfully!");
      setIsEditing(false); // Close the edit form after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    }
  };
  
  // Toggle edit form visibility
  const toggleEditForm = () => {
    setIsEditing(!isEditing); // Toggle the edit mode
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {error && <div className="bg-red-200 text-red-800 p-4 rounded-lg mb-4">{error}</div>}

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
          {/* Profile Picture Section */}
          <div className="flex justify-center mb-6">
            <img
              src={imagePreview || "path_to_default_image.jpg"} // Show uploaded image preview or default
              alt="Profile Picture"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div className="flex justify-center mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-pic-upload"
            />
            <label
              htmlFor="profile-pic-upload"
              className="text-blue-500 cursor-pointer"
            >
              Upload New Picture
            </label>
          </div>

          {/* User Information Section */}
          <div>
            <div className="text-xl font-semibold text-center mb-2">{user.name}</div>
            <div className="text-center text-gray-500 mb-4">{user.userName}</div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">DID:</span>
                <span className="text-gray-600">{user.did}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date of Birth:</span>
                <span className="text-gray-600">{user.dob}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Birthplace:</span>
                <span className="text-gray-600">{user.birthplace}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex justify-center item-center">
          <button
            onClick={toggleEditForm}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
          >
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        {isEditing && (
          <div className="bg-white w-100 p-6 rounded-lg shadow-md">
            {/* Edit User Profile Information */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-semibold">DID</label>
                <input
                  type="text"
                  value={user.did}
                  onChange={(e) => setUser({ ...user, did: e.target.value })}
                  className="p-2 w-80 border rounded-md"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="p-2 w-80 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Date of Birth</label>
                <input
                  type="date"
                  value={user.dob}
                  onChange={(e) => setUser({ ...user, dob: e.target.value })}
                  className="p-2 w-80 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Birthplace</label>
                <input
                  type="text"
                  value={user.birthplace}
                  onChange={(e) => setUser({ ...user, birthplace: e.target.value })}
                  className="p-2 w-80 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Username</label>
                <input
                  type="text"
                  value={user.userName}
                  onChange={(e) => setUser({ ...user, userName: e.target.value })}
                  className="p-2 w-80 border rounded-md"
                />
              </div>
            </div>

            {/* Update Button */}
            <button
              onClick={handleProfileUpdate}
              className="bg-blue-500 text-white p-2 rounded-lg mt-4 hover:bg-blue-600"
            >
              Update Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
