// Skeleton components - loading placeholders shown while data is fetching
// Each one matches the layout of the real content so the page doesn't jump around

import styles from "@/styles/skeleton.module.css";

// base skeleton block - just an animated gray rectangle
interface SkeletonProps {
  width?:        string; // defaults to 100%
  height?:       string; // defaults to 16px
  borderRadius?: string; // defaults to 4px
  className?:    string;
}

export function SkeletonBlock({
  width        = "100%",
  height       = "16px",
  borderRadius = "4px",
  className    = "",
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

// shown on the for-you page while the selected book is loading
export function SelectedBookSkeleton() {
  return (
    <div className={styles.selected_book_skeleton}>
      <div className={styles.selected_book_skeleton_text}>
        <SkeletonBlock height="16px" width="90%" />
        <SkeletonBlock height="16px" width="70%" />
        <SkeletonBlock height="16px" width="80%" />
      </div>
      <SkeletonBlock width="140px" height="180px" /> {/* book cover */}
      <div className={styles.selected_book_skeleton_text}>
        <SkeletonBlock height="20px" width="60%" />
        <SkeletonBlock height="16px" width="40%" />
      </div>
    </div>
  );
}

// shown on the for-you page while recommended/suggested rows are loading
// renders 5 placeholder cards in a row
export function BookRowSkeleton() {
  return (
    <div className={styles.books_row_skeleton}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.book_card_skeleton}>
          <SkeletonBlock width="160px" height="180px" /> {/* cover */}
          <SkeletonBlock height="16px" width="90%" />    {/* title */}
          <SkeletonBlock height="14px" width="60%" />    {/* author */}
          <SkeletonBlock height="12px" width="80%" />    {/* subtitle */}
        </div>
      ))}
    </div>
  );
}

// shown on /book/[id] while the book data is loading
export function BookDetailSkeleton() {
  return (
    <div className={styles.book_detail_skeleton}>
      <div className={styles.book_detail_left}>
        <SkeletonBlock height="32px"  width="70%" />   {/* title */}
        <SkeletonBlock height="20px"  width="40%" />   {/* author */}
        <SkeletonBlock height="16px"  width="90%" />   {/* subtitle */}
        <SkeletonBlock height="16px"  width="50%" />   {/* rating */}
        <SkeletonBlock height="16px"  width="60%" />   {/* duration */}
        <SkeletonBlock height="40px"  width="260px" /> {/* buttons */}
        <SkeletonBlock height="16px"  width="30%" />   {/* bookmark */}
        <SkeletonBlock height="100px" width="100%" />  {/* description */}
        <SkeletonBlock height="200px" width="100%" />  {/* author bio */}
      </div>
      <div className={styles.book_detail_right}>
        <SkeletonBlock width="300px" height="300px" /> {/* cover image */}
      </div>
    </div>
  );
}

// shown on /settings while Firebase is figuring out if someone is logged in
export function SettingsSkeleton() {
  return (
    <div className={styles.settings_skeleton}>
      <SkeletonBlock height="32px" width="200px" /> {/* page title */}
      <SkeletonBlock height="1px"  width="100%" />  {/* divider */}
      <SkeletonBlock height="20px" width="160px" /> {/* subscription label */}
      <SkeletonBlock height="16px" width="100px" /> {/* plan name */}
      <SkeletonBlock height="40px" width="180px" /> {/* upgrade button */}
      <SkeletonBlock height="1px"  width="100%" />  {/* divider */}
      <SkeletonBlock height="20px" width="80px" />  {/* email label */}
      <SkeletonBlock height="16px" width="200px" /> {/* email address */}
    </div>
  );
}
