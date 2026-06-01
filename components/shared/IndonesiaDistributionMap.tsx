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
    <div className="grid overflow-hidden rounded-lg border bg-card shadow-sm lg:grid-cols-[1.45fr_0.55fr]">
      <div className="relative min-h-72 overflow-hidden bg-secondary/35 p-4 sm:p-6">
        <div className="absolute left-4 top-4 z-10 rounded-md border bg-background/85 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur sm:left-6 sm:top-6">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <MapPinIcon className="size-3.5 text-primary" aria-hidden="true" />
            Domisili alumni aktif
          </span>
          <span className="mt-1 block">Arahkan kursor ke marker untuk detail.</span>
        </div>
        <svg
          viewBox={INDONESIA_MAP_VIEWBOX}
          role="img"
          aria-label="Peta persebaran domisili alumni di Indonesia"
          className="mt-14 h-auto w-full overflow-visible sm:mt-10"
        >
          <g
            strokeWidth="1.4"
            style={{
              fill: "hsl(var(--primary) / 0.13)",
              stroke: "hsl(var(--primary) / 0.48)",
            }}
          >
            {INDONESIA_MAP_PATHS.map((path) => <path key={path} d={path} />)}
          </g>
          {mappedLocations.map((location) => {
            const radius = 7 + (location.value / maxValue) * 8;
            return (
              <g key={`${location.city}-${location.province ?? ""}`} className="group">
                <circle cx={location.x} cy={location.y} r={radius + 6} className="fill-accent/20" />
                <circle
                  cx={location.x}
                  cy={location.y}
                  r={radius}
                  className="fill-primary stroke-background stroke-[3] transition group-hover:fill-accent group-hover:stroke-primary"
                />
                <title>{`${location.city}${location.province ? `, ${location.province}` : ""}: ${location.value} alumni`}</title>
              </g>
            );
          })}
        </svg>
        {mappedLocations.length === 0 ? (
          <p className="absolute inset-x-4 bottom-4 rounded-md border bg-background/90 p-3 text-center text-sm text-muted-foreground sm:inset-x-6">
            Lokasi akan tampil setelah alumni melengkapi kota domisili.
          </p>
        ) : null}
      </div>

      <div className="border-t p-5 lg:border-l lg:border-t-0">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-accent/35 p-2 text-primary">
            <UsersRoundIcon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-semibold">{totalAlumni}</p>
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
              <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium">{location.value}</span>
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
