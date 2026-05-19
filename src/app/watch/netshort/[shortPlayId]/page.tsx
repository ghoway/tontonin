"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNetShortDetail } from "@/hooks/useNetShort";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, List } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Hls from "hls.js";

export default function NetShortWatchPage() {
  const params = useParams<{ shortPlayId: string }>();
  const searchParams = useSearchParams();
  const shortPlayId = params.shortPlayId;
  const router = useRouter();
  
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Debug log state (kept internal for now, can be exposed if needed)
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const addLog = (msg: string) => {
    console.log(msg);
    // setDebugLog(prev => [...prev.slice(-4), msg]); 
  };

  // Get episode from URL
  useEffect(() => {
    const ep = searchParams.get("ep");
    if (ep) {
      setCurrentEpisode(parseInt(ep) || 1);
    }
  }, [searchParams]);

  // Fetch detail with all episodes
  const { data, isLoading, error } = useNetShortDetail(shortPlayId || "");

  // Get current episode data
  const currentEpisodeData = data?.episodes?.find(
    (ep) => ep.episodeNo === currentEpisode
  );

  // Handle video ended - auto next episode
  const handleVideoEnded = useCallback(() => {
    if (!data?.episodes) return;
    const nextEp = currentEpisode + 1;
    const nextEpisodeData = data.episodes.find((ep) => ep.episodeNo === nextEp);
    
    if (nextEpisodeData) {
      setCurrentEpisode(nextEp);
      window.history.replaceState(null, '', `/watch/netshort/${shortPlayId}?ep=${nextEp}`);
    }
  }, [currentEpisode, data?.episodes, shortPlayId]);

  // Load video with fallback support for MP4/HLS
  useEffect(() => {
    if (currentEpisodeData?.videoUrl && videoRef.current) {
        const video = videoRef.current;
        const videoUrl = currentEpisodeData.videoUrl;

        addLog(`Loading video: ${videoUrl}`);

        // Clean up previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const isHlsUrl = videoUrl.includes('.m3u8') || videoUrl.includes('application/x-mpegURL');
        const isMp4Url = videoUrl.includes('.mp4') || videoUrl.includes('mime_type=video_mp4');

        // Priority 1: HLS.js for .m3u8 (if supported)
        if (isHlsUrl && Hls.isSupported()) {
            addLog("Detected HLS stream, initializing HLS.js...");
            const hls = new Hls({
                debug: false,
                enableWorker: true,
                xhrSetup: function (xhr, url) {
                    xhr.withCredentials = false;
                },
            });
            hlsRef.current = hls;
            
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                addLog("Manifest parsed, playing...");
                video.play().catch((e) => addLog(`Auto-play failed: ${e.message}`));
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                const errorMsg = `HLS Error: ${data.type} - ${data.details}`;
                console.error(errorMsg);
                
                if (data.fatal) {
                   // ... error handling
                   // If HLS fails fatally, we could try native as last ditch, but usually fatal means fatal.
                   hls.destroy();
                }
            });
        } 
        // Priority 2: Native playback (MP4 or Native HLS on Safari)
        else {
             addLog(isMp4Url ? "Detected MP4/Native stream" : "Unknown format, trying native playback");
             video.src = videoUrl;
             video.load(); // Ensure source update
             
             const playPromise = video.play();
             if (playPromise !== undefined) {
                playPromise.catch((e) => {
                    addLog(`Native play failed: ${e.message}`);
                });
             }
        }
    }

    return () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
    };
  }, [currentEpisodeData?.videoUrl]);

  const goToEpisode = (ep: number) => {
    setCurrentEpisode(ep);
    router.replace(`/watch/netshort/${shortPlayId}?ep=${ep}`, { scroll: false });
    setShowEpisodeList(false);
  };

  const totalEpisodes = data?.totalEpisodes || 1;

  // Manual Subtitle Injection & Enforcement
  useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const subtitleUrl = currentEpisodeData?.subtitleUrl 
          ? `/api/proxy/video?url=${encodeURIComponent(currentEpisodeData.subtitleUrl)}`
          : "";

      // Helper to inject track safely
      const injectTrack = () => {
          if (!subtitleUrl) return;

          // Check if already exists
          const tracks = Array.from(video.getElementsByTagName('track'));
          const existing = tracks.find(t => t.label === 'Indonesia' && t.srclang === 'id');
          
          if (existing) {
             if (existing.src === subtitleUrl) {
                 return; // Already has correct track
             } else {
                 video.removeChild(existing);
             }
          }

          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.label = 'Indonesia';
          track.srclang = 'id';
          track.default = true;
          track.src = subtitleUrl;
          
          track.onload = () => {
              if (track.track) track.track.mode = 'showing';
          };
          
          video.appendChild(track);
      };

      // Helper to Enforce Visibility
      const enforce = () => {
          const tracks = Array.from(video.textTracks);
          const indo = tracks.find(t => t.label === 'Indonesia' || t.language === 'id');
          if (indo && indo.mode !== 'showing') {
              indo.mode = 'showing';
          }
      };

      // Inject immediately logic
      injectTrack();

      // Listeners for enforcement
      video.addEventListener('loadeddata', enforce);
      video.addEventListener('canplay', enforce);
      video.addEventListener('playing', enforce);
      video.addEventListener('seeked', enforce);

      // --- HLS Integration ---
      if (hlsRef.current) {
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              injectTrack();
              enforce();
          });
          hlsRef.current.on(Hls.Events.LEVEL_SWITCHED, () => {
              injectTrack();
              enforce();
          });
      }

      // Polling for first 2 seconds (Race fix)
      let retries = 0;
      const poll = setInterval(() => {
          injectTrack(); 
          enforce();
          retries++;
          if (retries > 10) clearInterval(poll);
      }, 200);

      return () => {
          video.removeEventListener('loadeddata', enforce);
          video.removeEventListener('canplay', enforce);
          video.removeEventListener('playing', enforce);
          video.removeEventListener('seeked', enforce);
          clearInterval(poll);
          
          try {
             const tracks = Array.from(video.getElementsByTagName('track'));
             const current = tracks.find(t => t.src === subtitleUrl);
             if (current) video.removeChild(current);
          } catch(e) {}
      };
  }, [currentEpisodeData?.subtitleUrl]); // Run when subtitle URL changes

  return (
    <main className="fixed inset-0 bg-black flex flex-col">
      {/* Header - Fixed Overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 h-16 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent" />
        
        <div className="relative z-10 flex items-center justify-between h-full px-4 max-w-7xl mx-auto pointer-events-auto">
          <Link
            href={`/detail/netshort/${shortPlayId}`}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-primary font-bold hidden sm:inline shadow-black drop-shadow-md">SekaiDrama</span>
          </Link>
          
          <div className="text-center flex-1 px-4 min-w-0">
            <h1 className="text-white font-medium truncate text-sm sm:text-base drop-shadow-md">
              {data?.title || "Loading..."}
            </h1>
            <p className="text-white/80 text-xs drop-shadow-md">Episode {currentEpisode}</p>
          </div>

          <button
            onClick={() => setShowEpisodeList(!showEpisodeList)}
            className="p-2 text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <List className="w-6 h-6 drop-shadow-md" />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 w-full h-full relative bg-black flex flex-col items-center justify-center">
         <div className="relative w-full h-full flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
                <AlertCircle className="w-10 h-10 text-destructive mb-4" />
                <p className="text-white mb-4">Gagal memuat video</p>
                <button
                  onClick={() => router.refresh()}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
                >
                  Coba Lagi
                </button>
              </div>
            )}
            
            <video
              ref={videoRef}
              className="w-full h-full object-contain max-h-[100dvh]"
              controls
              playsInline
              autoPlay
              crossOrigin="anonymous"
              {...({ disableRemotePlayback: true, referrerPolicy: "no-referrer" } as any)}
              onEnded={handleVideoEnded}
            />
         </div>

         {/* Navigation Controls Overlay - Bottom */}
         <div className="absolute bottom-20 md:bottom-12 left-0 right-0 z-40 pointer-events-none flex justify-center pb-safe-area-bottom">
            <div className="flex items-center gap-2 md:gap-6 pointer-events-auto bg-black/60 backdrop-blur-md px-3 py-1.5 md:px-6 md:py-3 rounded-full border border-white/10 shadow-lg transition-all scale-90 md:scale-100 origin-bottom">
                <button
                  onClick={() => currentEpisode > 1 && goToEpisode(currentEpisode - 1)}
                  disabled={currentEpisode <= 1}
                  className="p-1.5 md:p-2 rounded-full text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                </button>
                
                <span className="text-white font-medium text-xs md:text-sm tabular-nums min-w-[60px] md:min-w-[80px] text-center">
                  Ep {currentEpisode} / {totalEpisodes}
                </span>

                <button
                  onClick={() => currentEpisode < totalEpisodes && goToEpisode(currentEpisode + 1)}
                  disabled={currentEpisode >= totalEpisodes}
                  className="p-1.5 md:p-2 rounded-full text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                </button>
            </div>
         </div>
      </div>



      {/* Episode List Sidebar */}
      {showEpisodeList && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setShowEpisodeList(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-zinc-900 z-[70] overflow-y-auto border-l border-white/10 shadow-2xl animate-in slide-in-from-right">
            <div className="p-4 border-b border-white/10 sticky top-0 bg-zinc-900 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white">Daftar Episode</h2>
                <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  Total {totalEpisodes}
                </span>
              </div>
              <button
                onClick={() => setShowEpisodeList(false)}
                className="p-1 text-white/70 hover:text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-5 gap-2">
              {data?.episodes?.map((episode) => (
                <button
                  key={episode.episodeId}
                  onClick={() => goToEpisode(episode.episodeNo)}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                    ${episode.episodeNo === currentEpisode 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  {episode.episodeNo}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
