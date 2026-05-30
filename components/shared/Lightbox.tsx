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
      carousel={{
        imageFit: "contain",
        imageProps: {
          style: {
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          },
        },
      }}
      controller={{ closeOnBackdropClick: true }}
      on={{ view: ({ index: nextIndex }) => setIndex(nextIndex) }}
    />
  );
}
