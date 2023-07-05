import { RefObject } from "react";
import { StateSnapshot, VirtuosoHandle } from "react-virtuoso";
import { useDoubleTap } from "use-double-tap";

/**
 * Scrolls to the next or previous comment relative to the current visible comment.
 * @param virtuosoRef - A React ref object containing a VirtuosoHandle instance.
 * @param direction - The direction to scroll in. Can be "next" or "previous".
 */
const scrollToComment = async (
  virtuosoRef: RefObject<VirtuosoHandle>,
  direction: "next" | "previous"
) => {
  const currentIndex = await getCurrentIndex(virtuosoRef);

  return virtuosoRef.current?.scrollToIndex({
    index: currentIndex + (direction === "next" ? 1 : -1),
    align: "start",
    behavior: "smooth",
  });
};

/**
 * Gets the index of the currently visible comment in the Virtuoso component.
 * @param virtuosoRef - A React ref object containing a VirtuosoHandle instance.
 * @returns The index of the currently visible comment.
 */
const getCurrentIndex = async (virtuosoRef: RefObject<VirtuosoHandle>) => {
  const { ranges, scrollTop } = await new Promise<StateSnapshot>((resolve) =>
    virtuosoRef.current?.getState((state) => resolve(state))
  );

  // add a little offset to the scroll position to make sure we don't miss the index
  const offsetScrollTop = scrollTop + 1;

  let index = 0; // index of the selected comment
  let startPosition = 0; // start position of the comment being checked

  // find the index of the comment that is currently visible
  for (const { startIndex, size } of ranges) {
    const endPosition = startPosition + size;

    if (startPosition <= offsetScrollTop && offsetScrollTop <= endPosition) {
      index = startIndex;
      break;
    }

    startPosition = endPosition;
  }

  return index;
};

export const useCommentFab = (virtuosoRef: RefObject<VirtuosoHandle>) =>
  useDoubleTap(() => scrollToComment(virtuosoRef, "previous"), undefined, {
    onSingleTap: () => scrollToComment(virtuosoRef, "next"),
  });
