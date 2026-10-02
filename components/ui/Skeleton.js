export default function Skeleton({ height = 20, width = "100%", style }) {
  return <div className="skel" style={{ height, width, ...style }} aria-hidden="true" />;
}
