import React from "react";

const SortingArrows = () => (
  <div className="flex flex-col">
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      className="mb-0.5 fill-gray-550 transition-all dark:fill-gray-650 dark:group-data-[state=asc]/sorting-arrows:fill-white group-data-[state=asc]/sorting-arrows:fill-black dark:group-data-[state=desc]/sorting-arrows:group-hover/sorting-arrows:fill-white group-data-[state=desc]/sorting-arrows:group-hover/sorting-arrows:fill-black dark:group-data-[state=desc]/sorting-arrows:group-hover/sorting-arrows:opacity-60 group-data-[state=desc]/sorting-arrows:group-hover/sorting-arrows:opacity-70"
      fill="currentColor"
      role="img"
    >
      <path d="M5.00006 0.5C4.86153 0.5 4.72298 0.551171 4.61709 0.653809L0.283789 4.85381C0.128873 5.00396 0.0824004 5.22963 0.166358 5.42598C0.249774 5.62233 0.447929 5.75 0.666761 5.75H9.33336C9.55219 5.75 9.75035 5.62233 9.83376 5.42598C9.91772 5.22963 9.87125 5.00396 9.71633 4.85381L5.38303 0.653809C5.27714 0.551171 5.13859 0.5 5.00006 0.5Z" />
    </svg>
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      className="rotate-180 fill-gray-550 transition-all dark:fill-gray-650 dark:group-data-[state=desc]/sorting-arrows:fill-white group-data-[state=desc]/sorting-arrows:fill-black dark:group-hover/sorting-arrows:fill-white group-hover/sorting-arrows:fill-black dark:group-data-[state=asc]/sorting-arrows:group-hover/sorting-arrows:opacity-60 group-data-[state=asc]/sorting-arrows:group-hover/sorting-arrows:opacity-70"
      fill="currentColor"
      role="img"
    >
      <path d="M5.00006 0.5C4.86153 0.5 4.72298 0.551171 4.61709 0.653809L0.283789 4.85381C0.128873 5.00396 0.0824004 5.22963 0.166358 5.42598C0.249774 5.62233 0.447929 5.75 0.666761 5.75H9.33336C9.55219 5.75 9.75035 5.62233 9.83376 5.42598C9.91772 5.22963 9.87125 5.00396 9.71633 4.85381L5.38303 0.653809C5.27714 0.551171 5.13859 0.5 5.00006 0.5Z" />
    </svg>
  </div>
);

export default SortingArrows;
