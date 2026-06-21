// For You page - the main page after logging in
// Fetches 3 lists of books (selected, recommended, suggested) and displays them
// Also loads audio duration for each book by reading the audio file metadata

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { RootState } from "@/store";
import { openModal } from "@/store/modalSlice";
import { BsFillPlayFill } from "react-icons/bs";
import { SelectedBookSkeleton, BookRowSkeleton } from "@/components/Skeleton";

interface Book {
  id: string;
  title: string;
  author: string;
  subTitle: string;
  imageLink: string;
  audioLink: string;
  averageRating: number;
  subscriptionRequired: boolean; // if true, show the Premium pill
}

export default function ForYou() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [selected, setSelected]                 = useState<Book | null>(null);   // the "selected just for you" book
  const [recommended, setRecommended]           = useState<Book[]>([]);           // recommended books row
  const [suggested, setSuggested]               = useState<Book[]>([]);           // suggested books row
  const [fetching, setFetching]                 = useState(true);                 // true while API calls are running
  const [selectedDuration, setSelectedDuration] = useState("");                   // duration string for the selected book
  const [bookDurations, setBookDurations]       = useState<Record<string, string>>({}); // duration for each book card

  // redirect to home if not logged in
  useEffect(() => {
    if (!loading && !user) {
      dispatch(openModal());
      router.push("/");
    }
  }, [user, loading]);

  // fetch all three book lists at the same time
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [sel, rec, sug] = await Promise.all([
          fetch("https://us-central1-summaristt.cloudfunctions.net/getBooks?status=selected").then(r => r.json()),
          fetch("https://us-central1-summaristt.cloudfunctions.net/getBooks?status=recommended").then(r => r.json()),
          fetch("https://us-central1-summaristt.cloudfunctions.net/getBooks?status=suggested").then(r => r.json()),
        ]);
        // the selected API sometimes returns an array, sometimes a single object
        setSelected(Array.isArray(sel) ? sel[0] : sel);
        setRecommended(rec);
        setSuggested(sug);
      } catch (err) {
        console.error("Failed to fetch books", err);
      }
      setFetching(false);
    };
    fetchBooks();
  }, []);

  // get duration for the selected book from its audio file
  useEffect(() => {
    if (!selected?.audioLink) return;
    const audio = new Audio(selected.audioLink);
    audio.addEventListener("loadedmetadata", () => {
      const mins = Math.floor(audio.duration / 60);
      const secs = Math.floor(audio.duration % 60);
      setSelectedDuration(`${mins} mins ${secs} secs`);
    });
  }, [selected]);

  // get duration for every book in the recommended and suggested lists
  useEffect(() => {
    const allBooks = [...recommended, ...suggested];
    allBooks.forEach((book) => {
      if (!book.audioLink) return;
      const audio = new Audio(book.audioLink);
      audio.addEventListener("loadedmetadata", () => {
        const mins = String(Math.floor(audio.duration / 60)).padStart(2, "0");
        const secs = String(Math.floor(audio.duration % 60)).padStart(2, "0");
        // store duration by book id so each card can look it up
        setBookDurations((prev) => ({ ...prev, [book.id]: `${mins}:${secs}` }));
      });
    });
  }, [recommended, suggested]);

  // show skeletons while loading
  if (loading || fetching) {
    return (
      <div className="row">
        <div className="container">
          <div className="for-you__title">Selected just for you</div>
          <SelectedBookSkeleton />
          <div className="for-you__title">Recommended For You</div>
          <BookRowSkeleton />
          <div className="for-you__title">Suggested Books</div>
          <BookRowSkeleton />
        </div>
      </div>
    );
  }

  // renders a single book card for the recommended/suggested rows
  const renderBookCard = (book: Book) => (
    <div
      key={book.id}
      className="for-you__recommended--books-link"
      onClick={() => router.push(`/book/${book.id}`)}
    >
      {/* only show pill if book needs a subscription */}
      {book.subscriptionRequired && (
        <div className="book__pill book__pill--subscription-required">Premium</div>
      )}
      <audio src={book.audioLink} /> {/* hidden - just here to load metadata */}
      <figure className="book__image--wrapper" style={{ marginBottom: "8px" }}>
        <img className="book__image" style={{ display: "block" }} src={book.imageLink} alt="book" />
      </figure>
      <div className="recommended__book--title">{book.title}</div>
      <div className="recommended__book--author">{book.author}</div>
      <div className="recommended__book--sub-title">{book.subTitle}</div>
      <div className="recommended__book--details-wrapper">
        {/* duration - shows "..." until the audio metadata loads */}
        <div className="recommended__book--details">
          <div className="recommended__book--details-icon">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
              <path d="M13 7h-2v6h6v-2h-4z"></path>
            </svg>
          </div>
          <div className="recommended__book--details-text">
            {bookDurations[book.id] || "..."}
          </div>
        </div>
        {/* star rating */}
        <div className="recommended__book--details">
          <div className="recommended__book--details-icon">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3zM664.8 561.6l36.1 210.3L512 672.7 323.1 772l36.1-210.3-152.8-149L417.6 382 512 190.7 606.4 382l211.2 30.7-152.8 148.9z"></path>
            </svg>
          </div>
          <div className="recommended__book--details-text">{book.averageRating}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="row">
      <div className="container">
        <div className="for-you__wrapper">

          {/* selected book section */}
          <div className="for-you__title">Selected just for you</div>
          {selected && (
            <>
              <audio src={selected.audioLink} />
              <div
                className="selected__book"
                onClick={() => router.push(`/book/${selected.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="selected__book--sub-title">{selected.subTitle}</div>
                <div className="selected__book--line" />
                <div className="selected__book--content">
                  <figure className="book__image--wrapper" style={{ height: "140px", width: "140px", minWidth: "140px" }}>
                    <img className="book__image" style={{ display: "block" }} src={selected.imageLink} alt="book" />
                  </figure>
                  <div className="selected__book--text">
                    <div className="selected__book--title">{selected.title}</div>
                    <div className="selected__book--author">{selected.author}</div>
                    <div className="selected__book--duration-wrapper">
                      <div className="selected__book--icon"><BsFillPlayFill /></div>
                      <div className="selected__book--duration">
                        {selectedDuration || "Loading..."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* recommended books row */}
          <div>
            <div className="for-you__title">Recommended For You</div>
            <div className="for-you__sub--title">We think you&apos;ll like these</div>
            <div className="for-you__recommended--books">
              {recommended.map(renderBookCard)}
            </div>
          </div>

          {/* suggested books row */}
          <div>
            <div className="for-you__title">Suggested Books</div>
            <div className="for-you__sub--title">Browse those books</div>
            <div className="for-you__recommended--books">
              {suggested.map(renderBookCard)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
