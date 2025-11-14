import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditProfile = ({ user, setUser }) => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    dob: "",
    mobile: "",
    interestedAreas: [],
    profilePic: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [newInterest, setNewInterest] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile
  useEffect(() => {
    if (!user?._id) return;
    axios
      .get(`http://localhost:5000/api/profile/${user._id}`)
      .then((res) => {
        setProfile(res.data);
        setImagePreview(res.data.profilePic || null);
      })
      .catch((err) => console.error(err));
  }, [user]);

  // Save profile
  const handleSave = async () => {
    try {
      setSaving(true);

      const formDataToSend = new FormData();

      formDataToSend.append("name", profile.name);
      formDataToSend.append("email", profile.email);
      formDataToSend.append("dob", profile.dob);
      formDataToSend.append("mobile", profile.mobile);
      profile.interestedAreas.forEach(area => {
  formDataToSend.append("interestedAreas[]", area);
});


      if (selectedImageFile) {
        formDataToSend.append("profilePic", selectedImageFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/profile/${user._id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      alert("Profile updated successfully!");

      navigate("/profile"); // 👉 redirect after update
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Add Interest
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;

    setProfile({
      ...profile,
      interestedAreas: [...profile.interestedAreas, newInterest.trim()],
    });

    setNewInterest("");
  };

  // Remove interest
  const removeInterest = (index) => {
    const updated = [...profile.interestedAreas];
    updated.splice(index, 1);

    setProfile({ ...profile, interestedAreas: updated });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex justify-center items-center py-12">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Edit Profile
        </h2>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={
                imagePreview ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow"
            />

            <label
              htmlFor="profilePic"
              className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              Change
            </label>

            <input
              id="profilePic"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          {uploading && (
            <p className="text-xs text-gray-500 mt-2">Uploading image...</p>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={profile.dob}
              onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Mobile
            </label>
            <input
              type="text"
              placeholder="Enter mobile..."
              value={profile.mobile}
              onChange={(e) =>
                setProfile({ ...profile, mobile: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Interested Areas
            </label>

            <div className="flex flex-wrap gap-2 mb-2">
              {profile.interestedAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {area}
                  <button
                    onClick={() => removeInterest(idx)}
                    className="text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new interest..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                onClick={handleAddInterest}
                className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className={`w-full mt-4 py-2 rounded-lg text-white ${
              saving || uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 transition"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
