// Book detail page - shows all the info about a single book
// Fetches the book by ID from the URL, loads audio duration,
// checks if the book is already in the user's library,
// and handles the read/listen button with auth + subscription checks

import { BookDetailSkeleton } from "@/components/Skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { openModal } from "@/store/modalSlice";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { AiOutlineRead } from "react-icons/ai";
import { MdOutlineMic } from "react-icons/md";
import { BiStar, BiTime, BiMicrophone, BiBulb } from "react-icons/bi";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Book {
  id: string;
  title: string;
  author: string;
  subTitle: string;
  imageLink: string;
  audioLink: string;
  totalRating: number;
  averageRating: number;
  keyIdeas: number;
  type: string;
  status: string;
  subscriptionRequired: boolean;
  summary: string;
  tags: string[];
  bookDescription: string;
  authorDescription: string;
}

export default function BookPage() {
  const router   = useRouter();
  const { id }   = router.query; // book ID from the URL
  const dispatch = useDispatch();
  const { user, subscription } = useSelector((state: RootState) => state.auth);

  const [book, setBook]           = useState<Book | null>(null);
  const [loading, setLoading]     = useState(true);
  const [duration, setDuration]   = useState("");     // formatted duration string e.g. "4 mins 52 secs"
  const [inLibrary, setInLibrary] = useState(false); // true if this book is saved in the user's library

  // fetch the book data when the page loads
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

  // get audio duration by loading the audio file and reading its metadata
  useEffect(() => {
    if (!book?.audioLink) return;
    const audio = new Audio(book.audioLink);
    audio.addEventListener("loadedmetadata", () => {
      const mins = Math.floor(audio.duration / 60);
      const secs = Math.floor(audio.duration % 60);
      setDuration(`${mins} mins ${secs} secs`);
    });
  }, [book]);

  // check if this book is already saved in the user's Firestore library
  useEffect(() => {
    if (!user || !book) return;
    const checkLibrary = async () => {
      const docRef  = doc(db, "users", user.uid, "library", book.id);
      const docSnap = await getDoc(docRef);
      setInLibrary(docSnap.exists());
    };
    checkLibrary();
  }, [user, book]);

  // handle read/listen button click
  // - not logged in → open auth modal
  // - premium book + basic plan → go to choose-plan
  // - otherwise → go to player
  const handleReadListen = () => {
    if (!user) {
      dispatch(openModal());
      return;
    }
    if (book?.subscriptionRequired && subscription === "basic") {
      router.push("/choose-plan");
      return;
    }
    router.push(`/player/${id}`);
  };

  // save or remove the book from the user's library
  const handleLibrary = async () => {
    if (!user) {
      dispatch(openModal());
      return;
    }
    try {
      const docRef = doc(db, "users", user.uid, "library", book!.id);
      if (inLibrary) {
        await deleteDoc(docRef);
        setInLibrary(false);
        alert("Book removed from library!");
      } else {
        // save a snapshot of the book data to Firestore
        await setDoc(docRef, {
          id:                   book!.id,
          title:                book!.title,
          author:               book!.author,
          subTitle:             book!.subTitle,
          imageLink:            book!.imageLink,
          audioLink:            book!.audioLink,
          averageRating:        book!.averageRating,
          subscriptionRequired: book!.subscriptionRequired,
          savedAt:              new Date().toISOString(),
          finished:             false, // gets set to true when the audio ends in the player
        });
        setInLibrary(true);
        alert("Book saved to library!");
      }
    } catch (err) {
      console.error("Failed to update library", err);
    }
  };

  if (loading) return <BookDetailSkeleton />;
  if (!book)   return <div className="row"><div className="container">Book not found.</div></div>;

  return (
    <div className="inner__wrapper">

      {/* left side - book info */}
      <div className="inner__book">
        <div className="inner-book__title">{book.title}</div>
        <div className="inner-book__author">{book.author}</div>
        <div className="inner-book__sub--title">{book.subTitle}</div>

        {/* book stats row - rating, duration, type, key ideas */}
        <div className="inner-book__wrapper">
          <div className="inner-book__description--wrapper">
            <div className="inner-book__description">
              <div className="inner-book__icon"><BiStar /></div>
              {book.averageRating}&nbsp;
              <span style={{ color: "#6b7280" }}>({book.totalRating}&nbsp;ratings)</span>
            </div>
            <div className="inner-book__description">
              <div className="inner-book__icon"><BiTime /></div>
              {duration || "Loading..."}
            </div>
            <div className="inner-book__description">
              <div className="inner-book__icon"><BiMicrophone /></div>
              {book.type}
            </div>
            <div className="inner-book__description">
              <div className="inner-book__icon"><BiBulb /></div>
              {book.keyIdeas} Key ideas
            </div>
          </div>
        </div>

        {/* read and listen buttons - both do the same thing */}
        <div className="inner-book__read--btn-wrapper">
          <button className="inner-book__read--btn" onClick={handleReadListen}>
            <div className="inner-book__read--icon"><AiOutlineRead /></div>
            <div>Read</div>
          </button>
          <button className="inner-book__read--btn" onClick={handleReadListen}>
            <div className="inner-book__read--icon"><MdOutlineMic /></div>
            <div>Listen</div>
          </button>
        </div>

        {/* library button - toggles save/saved state */}
        <div
          className="inner-book__bookmark"
          onClick={handleLibrary}
          style={{ color: inLibrary ? "#032b41" : "#0365f2", cursor: "pointer" }}
        >
          <div className="inner-book__bookmark--icon">
            {inLibrary ? <BsBookmarkFill /> : <BsBookmark />}
          </div>
          <div>{inLibrary ? "Saved in My Library" : "Add title to My Library"}</div>
        </div>

        {/* tags */}
        <div className="inner-book__secondary--title">What&apos;s it about?</div>
        <div className="inner-book__tags--wrapper">
          {book.tags?.map((tag) => (
            <span key={tag} className="inner-book__tag">{tag}</span>
          ))}
        </div>

        <div className="inner-book__book--description">{book.bookDescription}</div>

        <h2 className="inner-book__secondary--title">About the author</h2>
        <div className="inner-book__author--description">{book.authorDescription}</div>
      </div>

      {/* right side - book cover image */}
      <div className="inner-book--img-wrapper">
        <figure className="book__image--wrapper" style={{ height: "300px", width: "300px", minWidth: "300px" }}>
          <img className="book__image" style={{ display: "block" }} src={book.imageLink} alt={book.title} />
        </figure>
      </div>
    </div>
  );
}
