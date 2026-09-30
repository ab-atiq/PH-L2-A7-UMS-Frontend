import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleListLoading() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <Skeleton key={item} className="h-14 w-full" />
      ))}
    </div>
  );
}
