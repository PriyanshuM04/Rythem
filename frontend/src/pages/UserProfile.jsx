import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, UserRound } from "lucide-react";
import api from "../services/api";

export default function UserProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/users/me");

        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);

        const detail = err.response?.data?.detail;

        setError(
          Array.isArray(detail)
            ? detail.map((d) => d.msg).join(", ")
            : detail || "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface text-white">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-surface text-red-400">
        {error}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto bg-surface font-serif px-8 pb-8 pt-6">
      <div className="mx-auto max-w-5xl">

        {/* PROFILE HEADER */}
        <div className="flex items-center justify-center gap-6 pb-8 pt-4">

          {/* Avatar */}
          <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-[#d6d6d6] text-[#2b2b2b] shadow-inner">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound
                className="h-16 w-16"
                strokeWidth={1.5}
              />
            )}
          </div>

          {/* User information */}
          <div className="flex flex-col items-start gap-2">

            <h1 className="text-5xl font-bold tracking-tight text-white">
              {user.username}
            </h1>

            <p className="text-base text-gray-300">
              {user.email}
            </p>

            <p className="text-base text-gray-300">
              {user.playlist_count}{" "}
              {user.playlist_count === 1
                ? "Playlist"
                : "Playlists"}
            </p>

            <button
              onClick={() => navigate("/profile/edit")}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

          </div>
        </div>

        <div className="border-t border-white/20" />

        {/* FOLLOWING */}
        <section className="pt-8">
          <h2 className="mb-8 text-4xl font-bold text-white">
            Following
          </h2>

          {/* Backend doesn't currently provide following data */}
          <div className="py-8 text-center text-gray-400">
            No following data available yet.
          </div>
        </section>

        {/* PLAYLISTS */}
        <section className="pt-10">
          <h2 className="mb-8 text-4xl font-bold text-white">
            Playlists/Albums
          </h2>

          {user.playlist_count === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No playlists yet.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-8">
              {Array.from(
                { length: user.playlist_count },
                (_, index) => (
                  <div
                    key={index}
                    className="h-40 w-full rounded-xl border border-white/5 bg-[#d6d6d6]"
                  />
                )
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}