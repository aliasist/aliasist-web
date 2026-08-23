/** A user-placed element on one page, in fractional page coordinates (0–1)
 * so it survives zoom/resize without recalculation. Origin is top-left,
 * matching screen/canvas convention — pdf-lib's origin is bottom-left, so
 * export flips the y axis at write time. */
export interface PlacedElement {
  id: string;
  page: number; // 1-indexed
  type: "text" | "signature";
  xFrac: number;
  yFrac: number;
  widthFrac: number;
  heightFrac: number;
  // type === "text"
  text?: string;
  fontSizePt?: number;
  color?: string;
  // type === "signature"
  imageDataUrl?: string; // PNG data URL from the signature pad
}

export interface PageInfo {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
}
