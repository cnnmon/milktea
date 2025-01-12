import { Skeleton } from "@/components/ui/skeleton";

export function List({
  notepads,
  onClick,
}: {
  notepads?: {
    _id: string;
    title: string;
    _creationTime: number;
    tags: string[];
  }[];
  onClick?: (id: string) => void;
}) {
  if (!notepads) {
    return (
      <div className="flex flex-col gap-1 overflow-y-scroll pb-10 justify-between">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex gap-2 justify-between items-center">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {notepads.map(({ _id, tags, title, _creationTime }) => (
        <div
          key={_id}
          className="flex gap-2 justify-between items-center hover:bg-gray-300 cursor-pointer"
          onClick={() => onClick?.(_id)}
        >
          <p className="medium flex-grow w-1/2">{title}</p>
          <div className="flex w-1/4 gap-2 items-center justify-end">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="bg-gray-300 px-1">
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="bg-gray-300 px-1" title={tags.join(", ")}>
                ...
              </span>
            )}
          </div>
          <p className="small w-1/5 text-right">
            {new Date(_creationTime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      ))}
    </>
  );
}
