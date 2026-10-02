import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="grid g4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={130} style={{ borderRadius: 14 }} />)}
      </div>
      <div className="grid g2 mt">
        <Skeleton height={320} style={{ borderRadius: 14 }} />
        <Skeleton height={320} style={{ borderRadius: 14 }} />
      </div>
    </>
  );
}
