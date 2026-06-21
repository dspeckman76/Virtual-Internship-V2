// Player page - shows the book summary text and audio player bar
// The font size of the summary is controlled by the Aa buttons in the sidebar
// When the audio ends, the book gets marked as finished in Firestore

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";

interface Book {
  id: string;
  title: string;
  author: string;
  imageLink: string;
  audioLink: string;
  summary: string;
}

export default function PlayerPage() {
  const router = useRouter();
  const { id } = router.query;

  const { user } = useSelector((state: RootState) => state.auth);
  const fontSize = useSelector((state: RootState) => state.modal.fontSize); // from Aa sidebar selector

  const [book, setBook]               = useState<Book | null>(null);
  const [loading, setLoading]         = useState(true);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // current position in seconds
  const [duration, setDuration]       = useState(0); // total length in seconds

  // ref to the audio element so we can control it directly
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // fetch book data when the page loads
  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      try {
        const res  = await fetch(`https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`);
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error("Failed to fetch book", err);
      }
      setLoading(false);
    };
    fetchBook();
  }, [id]);

  // redirect to home if not logged in
  useEffect(() => {
    if (!user) router.push("/");
  }, [user]);

  // converts seconds to MM:SS format for the time display
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // skip back 10 seconds, don't go below 0
  const handleSkipBack = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };

  // skip forward 10 seconds, don't go past the end
  const handleSkipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
  };

  // called when user drags the progress bar
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  if (!book)   return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Book not found.</div>;

  return (
    <div className="summary">

      {/* hidden audio element - controlled via audioRef */}
      <audio
        ref={audioRef}
        src={book.audioLink}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={async () => {
          setIsPlaying(false);
          // mark book as finished in Firestore if it's in the user's library
          if (user && id) {
            try {
              await updateDoc(
                doc(db, "users", user.uid, "library", id as string),
                { finished: true }
              );
            } catch {
              // book might not be in library, that's fine
            }
          }
        }}
      />

      {/* book summary text - font size comes from Redux */}
      <div className="audio__book--summary">
        <div className="audio__book--summary-title">
          <b>{book.title}</b>
        </div>
        <div
          className="audio__book--summary-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          {book.summary}
        </div>
      </div>

      {/* fixed audio player bar at the bottom */}
      <div className="audio__wrapper">

        {/* left - book info */}
        <div className="audio__track--wrapper">
          <figure className="audio__track--image-mask">
            <figure className="book__image--wrapper" style={{ height: "48px", width: "48px", minWidth: "48px" }}>
              <img className="book__image" style={{ display: "block" }} src={book.imageLink} alt={book.title} />
            </figure>
          </figure>
          <div className="audio__track--details-wrapper">
            <div className="audio__track--title">{book.title}</div>
            <div className="audio__track--author">{book.author}</div>
          </div>
        </div>

        {/* center - play/pause and skip buttons */}
        <div className="audio__controls--wrapper">
          <div className="audio__controls">
            <button className="audio__controls--btn" onClick={handleSkipBack}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" stroke="#000" strokeWidth="2" d="M3.11111111,7.55555556 C4.66955145,4.26701301 8.0700311,2 12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 L12,22 C6.4771525,22 2,17.5228475 2,12 M2,4 L2,8 L6,8 M9,16 L9,9 L7,9.53333333 M17,12 C17,10 15.9999999,8.5 14.5,8.5 C13.0000001,8.5 12,10 12,12 C12,14 13,15.5000001 14.5,15.5 C16,15.4999999 17,14 17,12 Z M14.5,8.5 C16.9253741,8.5 17,11 17,12 C17,13 17,15.5 14.5,15.5 C12,15.5 12,13 12,12 C12,11 12.059,8.5 14.5,8.5 Z"></path>
              </svg>
            </button>
            <button className="audio__controls--btn audio__controls--btn-play" onClick={handlePlayPause}>
              {isPlaying
                ? <BsFillPauseFill className="audio__controls--play-icon" />
                : <BsFillPlayFill  className="audio__controls--play-icon" />}
            </button>
            <button className="audio__controls--btn" onClick={handleSkipForward}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" stroke="#000" strokeWidth="2" d="M20.8888889,7.55555556 C19.3304485,4.26701301 15.9299689,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 L12,22 C17.5228475,22 22,17.5228475 22,12 M22,4 L22,8 L18,8 M9,16 L9,9 L7,9.53333333 M17,12 C17,10 15.9999999,8.5 14.5,8.5 C13.0000001,8.5 12,10 12,12 C12,14 13,15.5000001 14.5,15.5 C16,15.4999999 17,14 17,12 Z M14.5,8.5 C16.9253741,8.5 17,11 17,12 C17,13 17,15.5 14.5,15.5 C12,15.5 12,13 12,12 C12,11 12.059,8.5 14.5,8.5 Z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* right - progress bar and time */}
        <div className="audio__progress--wrapper">
          <div className="audio__time">{formatTime(currentTime)}</div>
          {/* gradient on the range input shows how much has been played */}
          <input
            type="range"
            className="audio__progress--bar"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleScrub}
            style={{
              background: `linear-gradient(to right, #2bd97c ${(currentTime / duration) * 100}%, #6d787d ${(currentTime / duration) * 100}%)`
            }}
          />
          <div className="audio__time">{formatTime(duration)}</div>
        </div>
      </div>
    </div>
  );
}
