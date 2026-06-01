import { MapPinIcon, UsersRoundIcon } from "lucide-react";

import { INDONESIA_MAP_PATHS, INDONESIA_MAP_VIEWBOX } from "@/lib/indonesia-map-paths";
import { projectIndonesiaCoordinate, resolveIndonesiaCoordinate } from "@/lib/indonesia-locations";

export type DomicileDistribution = {
  city: string;
  province: string | null;
  value: number;
};

export function IndonesiaDistributionMap({ locations }: { locations: DomicileDistribution[] }) {
  const mappedLocations = locations
    .map((location) => {
      const coordinate = resolveIndonesiaCoordinate(location.city, location.province);
      return coordinate ? { ...location, ...projectIndonesiaCoordinate(coordinate) } : null;
    })
    .filter((location): location is NonNullable<typeof location> => location !== null);
  const maxValue = Math.max(...mappedLocations.map((location) => location.value), 1);
  const totalAlumni = locations.reduce((total, location) => total + location.value, 0);
  const featuredLocations = locations.slice(0, 6);

  return (
    <div className="grid overflow-hidden border border-black bg-card dark:border-border lg:grid-cols-[1.45fr_0.55fr]">
      <div className="relative min-h-72 overflow-hidden bg-[#9ab6c8] p-4 dark:bg-[#273d49] sm:p-6">
        <div className="absolute left-4 top-4 z-10 border border-black bg-background px-3 py-2 text-xs text-muted-foreground dark:border-border sm:left-6 sm:top-6">
          <span className="flex items-center gap-1.5 font-sans font-bold uppercase text-foreground">
            <MapPinIcon className="size-3.5 text-foreground" aria-hidden="true" />
            Domisili alumni aktif
          </span>
          <span className="mt-1 block">Pilih marker atau lihat daftar kota untuk detail.</span>
        </div>
        <svg
          viewBox={INDONESIA_MAP_VIEWBOX}
          role="img"
          aria-label="Peta persebaran domisili alumni di Indonesia"
          className="mt-16 h-auto w-full overflow-visible sm:mt-10"
        >
          <g
            strokeWidth="1.25"
            style={{
              fill: "hsl(var(--secondary))",
              stroke: "hsl(var(--foreground) / 0.72)",
            }}
          >
            {INDONESIA_MAP_PATHS.map((path) => <path key={path} d={path} />)}
          </g>
          {mappedLocations.map((location) => {
            const radius = 6 + (location.value / maxValue) * 7;
            return (
              <g key={`${location.city}-${location.province ?? ""}`} className="group">
                <circle cx={location.x} cy={location.y} r={radius + 5} className="fill-background stroke-foreground stroke-[1]" />
                <circle
                  cx={location.x}
                  cy={location.y}
                  r={radius}
                  className="fill-accent stroke-foreground stroke-[2]"
                />
                <title>{`${location.city}${location.province ? `, ${location.province}` : ""}: ${location.value} alumni`}</title>
              </g>
            );
          })}
        </svg>
        {mappedLocations.length === 0 ? (
          <p className="absolute inset-x-4 bottom-4 border border-black bg-background p-3 text-center text-sm text-muted-foreground dark:border-border sm:inset-x-6">
            Lokasi akan tampil setelah alumni melengkapi kota domisili.
          </p>
        ) : null}
      </div>

      <div className="border-t border-black p-5 dark:border-border lg:border-l lg:border-t-0">
        <div className="flex items-center gap-3">
          <span className="catalog-bevel bg-accent p-2 text-black">
            <UsersRoundIcon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-2xl">{totalAlumni}</p>
            <p className="text-xs text-muted-foreground">alumni dengan data domisili</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {featuredLocations.map((location) => (
            <div key={`${location.city}-${location.province ?? ""}`} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{location.city}</p>
                {location.province ? <p className="truncate text-xs text-muted-foreground">{location.province}</p> : null}
              </div>
              <span className="catalog-bevel shrink-0 border border-black bg-accent px-2 py-1 font-sans text-xs font-bold text-black">{location.value}</span>
            </div>
          ))}
          {featuredLocations.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">Belum ada kota domisili yang dapat ditampilkan.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
