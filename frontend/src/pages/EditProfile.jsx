import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Camera } from "lucide-react";
import Button from "../components/ui/Button";

import DatePicker from "react-datepicker";
import Select from "react-select";
import { getNames } from "country-list";

import "react-datepicker/dist/react-datepicker.css";

const GENDER_MAP = {
  male: "male",
  female: "female",
  other: "other",
  prefer_not_to_say: "prefer_not_to_say",
};

const countryOptions = getNames()
  .sort()
  .map((country) => ({
    value: country,
    label: country,
  }));

const selectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 0,
    boxShadow: "none",
    minHeight: "48px",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#181818",
    color: "white",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#D633E0" : "#181818",
    color: "white",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "white",
  }),
  input: (base) => ({
    ...base,
    color: "white",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.6)",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "white",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

export default function EditProfile() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [profile, setProfile] = useState({
    username: user?.username ?? "",
    gender: user?.gender ?? "",
    country: user?.country ?? "",
    dateOfBirth: user?.date_of_birth
      ? new Date(user.date_of_birth)
      : null,
    bio: "",
    privacyAccepted: true,
    marketingAccepted: true,
  });

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
  try {
    const payload = {};

    if (profile.username.trim()) {
      payload.username = profile.username.trim();
    }

    if (profile.gender) {
      payload.gender = profile.gender;
    }

    if (profile.country.trim()) {
      payload.country = profile.country.trim();
    }

    if (profile.dateOfBirth) {
      const year = profile.dateOfBirth.getFullYear();
      const month = String(
        profile.dateOfBirth.getMonth() + 1
      ).padStart(2, "0");
      const day = String(
        profile.dateOfBirth.getDate()
      ).padStart(2, "0");

      payload.date_of_birth = `${year}-${month}-${day}`;
    }

    const { data } = await api.patch(
      "/users/me",
      payload
    );

    updateUser(data);

    alert("Profile updated successfully!");

    navigate("/profile", { replace: true });
  } catch (error) {
    const detail = error.response?.data?.detail;

    const message = Array.isArray(detail)
      ? detail
          .map((d) => `${d.loc.slice(1).join(".")}: ${d.msg}`)
          .join("\n")
      : detail || error.message || "Failed to update profile";

    alert(message);
  }
};

  return (
    <div className="h-full overflow-y-auto bg-surface font-serif px-8 pb-8 pt-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-[#d6d6d6] text-[#2b2b2b] shadow-inner">
            <Camera className="h-12 w-12" strokeWidth={1.5} />
            <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          </div>

          <h1 className="mb-8 text-5xl font-bold text-white">
            Edit personal info
          </h1>

          <div className="w-full max-w-3xl">
            {/* Username */}
            <div className="mb-6">
              <label className="mb-2 block text-2xl font-bold text-white">
                Username*
              </label>

              <input
                type="text"
                value={profile.username}
                onChange={(e) =>
                  updateField("username", e.target.value)
                }
                className="w-full border-0 border-b border-white/30 bg-transparent pb-2 text-xl text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-12">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* Gender */}
                <div>
                  <label className="mb-2 block text-2xl font-bold text-white">
                    Gender
                  </label>

                  <select
                    value={profile.gender}
                    onChange={(e) =>
                      updateField("gender", e.target.value)
                    }
                    className="w-full border-0 border-b border-white/30 bg-surface pb-2 text-xl text-white outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">
                      Prefer not to say
                    </option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="mb-2 block text-2xl font-bold text-white">
                    Country or region
                  </label>

                  <Select
                    styles={selectStyles}
                    options={countryOptions}
                    placeholder="Select Country"
                    value={
                      countryOptions.find(
                        (c) => c.value === profile.country
                      ) || null
                    }
                    onChange={(selected) =>
                      updateField(
                        "country",
                        selected?.value || ""
                      )
                    }
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* Date Picker */}
                <div>
                  <label className="mb-2 block text-2xl font-bold text-white">
                    Date of birth
                  </label>

                  <DatePicker
                    selected={profile.dateOfBirth}
                    onChange={(date) =>
                      updateField("dateOfBirth", date)
                    }
                    dateFormat="dd/MM/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    maxDate={new Date()}
                    placeholderText="Select date of birth"
                    className="w-full border-0 border-b border-white/30 bg-transparent pb-2 text-xl text-white outline-none"
                    calendarClassName="bg-[#181818] text-white border border-white/10 rounded-lg"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-2 block text-2xl font-bold text-white">
                    Bio
                  </label>

                  <div className="border-b border-white/30 pb-2">
                    <textarea
                      value={profile.bio}
                      onChange={(e) =>
                        updateField("bio", e.target.value)
                      }
                      maxLength={150}
                      rows={2}
                      className="w-full resize-none bg-transparent text-xl text-white outline-none"
                    />

                    <div className="flex justify-end text-sm text-gray-300">
                      {profile.bio.length}/150
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CHECKBOXES */}
            <div className="mt-8 space-y-4">
              <label className="flex items-center gap-3 text-lg text-white">
                <input
                  type="checkbox"
                  checked={profile.privacyAccepted}
                  onChange={(e) =>
                    updateField(
                      "privacyAccepted",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[#D633E0]"
                />
                <span>Accept Privacy Policy</span>
              </label>

              <label className="flex items-center gap-3 text-lg text-white">
                <input
                  type="checkbox"
                  checked={profile.marketingAccepted}
                  onChange={(e) =>
                    updateField(
                      "marketingAccepted",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[#D633E0]"
                />
                <span>
                  Share my registration data with Rythem's
                  content providers for marketing purposes.
                </span>
              </label>
            </div>

            {/* SAVE BUTTON */}
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                className="max-w-[260px] rounded-full bg-gradient-to-r from-[#D633E0] to-[#C73FD2] px-10 py-3 text-xl text-white shadow-[0_0_20px_rgba(214,51,224,0.35)] hover:brightness-110"
              >
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}