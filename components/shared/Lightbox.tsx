"use client";

import YarlLightbox, { type Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export function Lightbox({
  open,
  close,
  slides,
  index,
  setIndex,
}: {
  open: boolean;
  close: () => void;
  slides: Slide[];
  index: number;
  setIndex: (index: number) => void;
}) {
  return (
    <YarlLightbox
      open={open}
      close={close}
      slides={slides}
      index={index}
      controller={{ closeOnBackdropClick: true }}
      on={{ view: ({ index: nextIndex }) => setIndex(nextIndex) }}
    />
  );
}
