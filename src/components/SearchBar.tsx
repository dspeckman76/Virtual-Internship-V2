// SearchBar - the search input in the top bar
// Searches books by title or author after the user stops typing for 300ms
// Shows results in a dropdown, clicking a result goes to that book's page

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { BsSearch } from "react-icons/bs";

interface Book {
  id: string;
  title: string;
  author: string;
  imageLink: string;
  subTitle: string;
}

export default function SearchBar() {
  const router = useRouter();

  const [query, setQuery]             = useState("");         // what the user typed
  const [results, setResults]         = useState<Book[]>([]); // API results
  const [isLoading, setIsLoading]     = useState(false);      // show "Searching..." in dropdown
  const [showResults, setShowResults] = useState(false);      // show/hide dropdown

  const debounceRef = useRef<NodeJS.Timeout | null>(null); // stores the timeout ID so we can cancel it
  const wrapperRef  = useRef<HTMLDivElement>(null);        // ref to detect clicks outside

  // wait 300ms after typing stops before hitting the API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // cancel the previous timer if user is still typing
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res  = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBooksByAuthorOrTitle?search=${query}`
        );
        const data = await res.json();
        setResults(data || []);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed", err);
      }
      setIsLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // close dropdown when clicking anywhere outside the search bar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setQuery("");
    setShowResults(false);
    router.push(`/book/${id}`);
  };

  return (
    <div className="search" ref={wrapperRef}>
      <div className="search__input--wrapper">
        <input
          className="search__input"
          type="text"
          placeholder="Search for books"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onKeyDown={(e) => {
            // pressing Enter goes to the first result
            if (e.key === "Enter" && results.length > 0) {
              handleSelect(results[0].id);
            }
          }}
        />
        <div className="search__icon">
          <BsSearch />
        </div>
      </div>

      {/* dropdown results */}
      {showResults && (
        <div className="search__books--wrapper">
          {isLoading && (
            <div className="search__book--link">
              <div className="search__book--title">Searching...</div>
            </div>
          )}
          {!isLoading && results.length === 0 && (
            <div className="search__book--link">
              <div className="search__book--title">No results found</div>
            </div>
          )}
          {!isLoading && results.map((book) => (
            <div
              key={book.id}
              className="search__book--link"
              onClick={() => handleSelect(book.id)}
            >
              <div className="search__book--img-mask">
                <img src={book.imageLink} alt={book.title} className="search__book--img" />
              </div>
              <div>
                <div className="search__book--title">{book.title}</div>
                <div className="search__book--author">{book.author}</div>
                {book.subTitle && (
                  <div className="search__book--author" style={{ fontSize: "12px" }}>
                    {book.subTitle}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
