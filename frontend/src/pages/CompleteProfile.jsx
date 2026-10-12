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

const formatDateForApi = (date) => {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function CompleteProfile() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [profile, setProfile] = useState({
    username: user?.username ?? "",
    gender: "",
    country: "",
    dateOfBirth: null,
    privacyAccepted: false,
    marketingAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setError("");

    if (!profile.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!profile.gender) {
      setError("Please select your gender.");
      return;
    }

    if (!profile.country) {
      setError("Please select your country.");
      return;
    }

    if (!profile.dateOfBirth) {
      setError("Please select your date of birth.");
      return;
    }

    if (!profile.privacyAccepted) {
      setError("You must accept the Privacy Policy to continue.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        username: profile.username.trim(),
        gender: profile.gender,
        country: profile.country,
        date_of_birth: formatDateForApi(profile.dateOfBirth),
        account_type: "public",
        accept_privacy_policy: profile.privacyAccepted,
        marketing_consent: profile.marketingAccepted,
      };

      const { data } = await api.post(
        "/users/me/complete-profile",
        payload
      );

      updateUser(data);

      navigate("/", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;

      const message = Array.isArray(detail)
        ? detail
            .map((d) => {
              const location = d.loc?.slice(1).join(".");
              return location
                ? `${location}: ${d.msg}`
                : d.msg;
            })
            .join("\n")
        : detail || "Failed to complete profile.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Backend requires minimum age 13
  const today = new Date();

  const maxDate = new Date(
    today.getFullYear() - 13,
    today.getMonth(),
    today.getDate()
  );

  const minDate = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate()
  );

  return (
    <div className="h-full overflow-y-auto bg-surface font-serif px-8 pb-8 pt-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center">

          {/* Avatar */}
          <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-[#d6d6d6] text-[#2b2b2b] shadow-inner">
            <Camera
              className="h-12 w-12"
              strokeWidth={1.5}
            />

            <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          </div>

          <h1 className="mb-2 text-center text-5xl font-bold text-white">
            Complete your profile
          </h1>

          <p className="mb-8 text-center text-lg text-gray-400">
            Tell us a little about yourself to get started.
          </p>

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
                placeholder="Choose a username"
              />
            </div>

            <div className="grid grid-cols-2 gap-12">

              {/* LEFT */}
              <div className="space-y-6">

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-2xl font-bold text-white">
                    Gender*
                  </label>

                  <select
                    value={profile.gender}
                    onChange={(e) =>
                      updateField("gender", e.target.value)
                    }
                    className="w-full border-0 border-b border-white/30 bg-surface pb-2 text-xl text-white outline-none"
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>

                    <option value="prefer_not_to_say">
                      Prefer not to say
                    </option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="mb-2 block text-2xl font-bold text-white">
                    Country or region*
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

              {/* RIGHT */}
              <div>

                {/* DOB */}
                <div>
                  <label className="mb-2 block text-2xl font-bold text-white">
                    Date of birth*
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
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholderText="Select date of birth"
                    className="w-full border-0 border-b border-white/30 bg-transparent pb-2 text-xl text-white outline-none"
                    calendarClassName="bg-[#181818] text-white border border-white/10 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* CHECKBOXES */}
            <div className="mt-8 space-y-4">

              {/* Privacy */}
              <label className="flex items-start gap-3 text-lg text-white">
                <input
                  type="checkbox"
                  checked={profile.privacyAccepted}
                  onChange={(e) =>
                    updateField(
                      "privacyAccepted",
                      e.target.checked
                    )
                  }
                  className="mt-1 h-5 w-5 accent-[#D633E0]"
                />

                <span>
                  I accept the Privacy Policy*
                </span>
              </label>

              {/* Marketing */}
              <label className="flex items-start gap-3 text-lg text-white">
                <input
                  type="checkbox"
                  checked={profile.marketingAccepted}
                  onChange={(e) =>
                    updateField(
                      "marketingAccepted",
                      e.target.checked
                    )
                  }
                  className="mt-1 h-5 w-5 accent-[#D633E0]"
                />

                <span>
                  Share my registration data with Rythem's
                  content providers for marketing purposes.
                </span>
              </label>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-6 whitespace-pre-line rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-red-300">
                {error}
              </div>
            )}

            {/* SAVE */}
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={loading}
                className="max-w-[260px] rounded-full bg-gradient-to-r from-[#D633E0] to-[#C73FD2] px-10 py-3 text-xl text-white shadow-[0_0_20px_rgba(214,51,224,0.35)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating Profile..."
                  : "Complete Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}