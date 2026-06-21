// Library page - shows the user's saved and finished books
// Saved books are ones the user bookmarked (finished: false)
// Finished books are ones the user listened to all the way through (finished: true)
// Each card has a remove button that deletes it from Firestore right away

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RootState } from "@/store";
import { openModal } from "@/store/modalSlice";

// shape of a book stored in Firestore under users/{uid}/library/{bookId}
interface LibraryBook {
  id: string;
  title: string;
  author: string;
  subTitle: string;
  imageLink: string;
  audioLink: string;
  averageRating: number;
  subscriptionRequired: boolean;
  finished: boolean; // false = saved, true = listened to the end
  savedAt: string;   // when it was saved
}

export default function Library() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [books, setBooks]       = useState<LibraryBook[]>([]);
  const [fetching, setFetching] = useState(true); // true while loading from Firestore

  // redirect if not logged in, otherwise load the library
  useEffect(() => {
    if (!loading && !user) {
      dispatch(openModal());
      router.push("/");
      return;
    }
    if (!user) return;

    const fetchLibrary = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users", user.uid, "library"));
        const data = snapshot.docs.map((doc) => doc.data() as LibraryBook);
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch library", err);
      }
      setFetching(false);
    };

    fetchLibrary();
  }, [user, loading]);

  // delete from Firestore and remove from local state so the UI updates immediately
  const handleRemove = async (bookId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "library", bookId));
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      console.error("Failed to remove book", err);
    }
  };

  // split books into two lists based on finished status
  const savedBooks    = books.filter((b) => !b.finished);
  const finishedBooks = books.filter((b) => b.finished);

  // renders a single book card with a remove button below it
  const renderBookCard = (book: LibraryBook) => (
    <div key={book.id} style={{ position: "relative" }}>
      {/* clicking the card goes to book detail page */}
      <div
        className="for-you__recommended--books-link"
        onClick={() => router.push(`/book/${book.id}`)}
      >
        {book.subscriptionRequired && (
          <div className="book__pill">Premium</div>
        )}
        <figure className="book__image--wrapper" style={{ marginBottom: "8px" }}>
          <img className="book__image" style={{ display: "block" }} src={book.imageLink} alt={book.title} />
        </figure>
        <div className="recommended__book--title">{book.title}</div>
        <div className="recommended__book--author">{book.author}</div>
        <div className="recommended__book--sub-title">{book.subTitle}</div>
        <div className="recommended__book--details-wrapper">
          <div className="recommended__book--details">☆ {book.averageRating}</div>
        </div>
      </div>

      {/* remove button - stopPropagation stops the card click from firing too */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRemove(book.id);
        }}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          color: "#f56c6c", fontSize: "13px", fontWeight: 500,
          padding: "6px 12px", marginTop: "4px",
          cursor: "pointer", background: "none", border: "none",
        }}
      >
        ✕ Remove from My Library
      </button>
    </div>
  );

  if (loading || fetching) {
    return (
      <div className="row">
        <div className="container">
          <div className="for-you__title">My Library</div>
          <div className="for-you__sub--title">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="container">

        <div className="for-you__title">My Library</div>
        <div
          className="for-you__sub--title"
          style={{ borderBottom: "1px solid #e1e7ea", paddingBottom: "16px", marginBottom: "24px" }}
        />

        {/* saved books section */}
        <div className="for-you__title" style={{ fontSize: "18px" }}>Saved Books</div>
        {savedBooks.length === 0 ? (
          <div style={emptyStyle}>
            <p style={{ fontWeight: 600, color: "#032b41", marginBottom: "8px" }}>Save your favourite books!</p>
            <p style={{ color: "#394547", fontWeight: 300 }}>When you save a book, it will appear here.</p>
          </div>
        ) : (
          <div className="for-you__recommended--books">
            {savedBooks.map(renderBookCard)}
          </div>
        )}

        {/* finished books section */}
        <div className="for-you__title" style={{ fontSize: "18px", marginTop: "32px" }}>Finished</div>
        {finishedBooks.length === 0 ? (
          <div style={emptyStyle}>
            <p style={{ fontWeight: 600, color: "#032b41", marginBottom: "8px" }}>Done and dusted!</p>
            <p style={{ color: "#394547", fontWeight: 300 }}>When you finish a book, it will appear here.</p>
          </div>
        ) : (
          <div className="for-you__recommended--books">
            {finishedBooks.map(renderBookCard)}
          </div>
        )}

      </div>
    </div>
  );
}

// reused for both empty state boxes
const emptyStyle: React.CSSProperties = {
  background: "#f1f6f4", borderRadius: "8px",
  padding: "32px", textAlign: "center", marginBottom: "32px",
};
