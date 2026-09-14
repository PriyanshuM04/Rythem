import { useRef, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PlayableThumbnail from "../components/ui/PlayableThumbnail";
import { usePlayerStore } from "../store/playerStore";

const RECENT_VISIBLE_LIMIT = 12;
const PAGE_SIZE = 10;
const MAX_SONGS = 50; // temporary safety ceiling for mock data

const allRecentItems = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  name: `Name ${i + 1}`,
  about: `About ${i + 1}`,
}));

function generateTrendingBatch(startId, count) {
  return Array.from({ length: count }, (_, i) => {
    const id = startId + i;
    return {
      id,
      title: `Song ${id} Name`,
      artists: "Artist1, Artist2",
      album: "Album",
      plays: `${Math.max(10, 130 - id * 3)}K`,
    };
  });
}

export default function Home() {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const [trendingSongs, setTrendingSongs] = useState(() => generateTrendingBatch(1, PAGE_SIZE));
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollContainerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Refs mirror the latest state so the observer (created once) always
  // sees current values without needing to be recreated on every update.
  const trendingSongsRef = useRef(trendingSongs);
  const loadingMoreRef = useRef(loadingMore);
  trendingSongsRef.current = trendingSongs;
  loadingMoreRef.current = loadingMore;

  const isCurrentlyPlaying = (section, id) =>
    isPlaying && currentSong?.section === section && currentSong?.id === id;

  const handlePlayClick = (section, songData) => {
    const isSameSong = currentSong?.section === section && currentSong?.id === songData.id;
    if (isSameSong) {
      togglePlay();
    } else {
      playSong({ section, ...songData });
    }
  };

  const visibleRecent = allRecentItems.slice(0, RECENT_VISIBLE_LIMIT);
  const hasMoreRecentHistory = allRecentItems.length > RECENT_VISIBLE_LIMIT;

  const loadMore = useCallback(() => {
    if (loadingMoreRef.current || trendingSongsRef.current.length >= MAX_SONGS) return;
    setLoadingMore(true);
    // TODO: replace with real API call, e.g.
    // GET /songs/trending?offset={trendingSongsRef.current.length}&limit=10
    setTimeout(() => {
      setTrendingSongs((prev) => [
        ...prev,
        ...generateTrendingBatch(prev.length + 1, PAGE_SIZE),
      ]);
      setLoadingMore(false);
    }, 400);
  }, []);

  // Observer is created exactly once (empty dependency array) and persists
  // for the component's lifetime — this is what prevents the cascade bug.
  useEffect(() => {
    const root = scrollContainerRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root, rootMargin: "100px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="h-full flex flex-col bg-surface font-serif p-8">
      {/* Recent — fixed at top, original size, horizontal scroll, no visible scrollbar */}
      <section className="mb-8 shrink-0">
        <h2 className="text-2xl font-bold text-white mb-5">Recent</h2>
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-5 w-max">
              {visibleRecent.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    handlePlayClick("recent", { id: item.id, title: item.name, artists: item.about, album: "" })
                  }
                  className="flex flex-col gap-2 cursor-pointer w-32 shrink-0 group"
                >
                  <PlayableThumbnail
                    isPlaying={isCurrentlyPlaying("recent", item.id)}
                    className="aspect-square"
                    eqSize={22}
                  />
                  <div>
                    <p className="text-sm text-white font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.about}</p>
                  </div>
                </div>
              ))}

              {hasMoreRecentHistory && (
                <button
                  onClick={() => navigate("/history")}
                  className="self-start h-32 flex items-center justify-center hover:opacity-70 transition shrink-0 mr-8"
                  title="See full history"
                >
                  <ChevronRight className="w-8 h-8 text-gray-300" />
                </button>
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-linear-to-l from-surface to-transparent" />
        </div>
      </section>

      {/* Trending Now — the ONLY internally scrollable region */}
      <section className="flex-1 min-h-0 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-5 shrink-0">Trending Now</h2>
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto custom-scrollbar pr-2"
          >
            <div className="flex flex-col gap-2">
              {trendingSongs.map((song) => {
                const playing = isCurrentlyPlaying("trending", song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlayClick("trending", song)}
                    className={`grid grid-cols-[40px_1fr_1fr_1fr_80px] items-center gap-4 px-4 py-3 rounded-md cursor-pointer transition shrink-0 ${
                      playing ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <PlayableThumbnail isPlaying={playing} className="w-8 h-8" eqSize={14} />
                    <p className={`text-sm font-medium truncate ${playing ? "text-accent" : "text-white"}`}>
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{song.artists}</p>
                    <p className="text-sm text-gray-400 truncate">{song.album}</p>
                    <p className="text-sm text-gray-400 text-right">{song.plays}</p>
                  </div>
                );
              })}

              <div ref={sentinelRef} className="h-1" />

              {loadingMore && (
                <p className="text-center text-sm text-gray-500 py-3">Loading more...</p>
              )}
              {trendingSongs.length >= MAX_SONGS && (
                <p className="text-center text-sm text-gray-500 py-3">You've reached the end.</p>
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-surface to-transparent" />
        </div>
      </section>
    </div>
  );
}