import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FilterBar({
  searchParams,
  action = "/alumni",
}: {
  searchParams?: Record<string, string | string[] | undefined>;
  action?: string;
}) {
  const value = (key: string) => {
    const param = searchParams?.[key];
    return Array.isArray(param) ? param[0] ?? "" : param ?? "";
  };

  return (
    <form action={action} className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="md:col-span-2 lg:col-span-1">
        <Label htmlFor="q">Cari alumni</Label>
        <Input id="q" name="q" defaultValue={value("q")} placeholder="Nama alumni" />
      </div>
      <div>
        <Label htmlFor="jurusan">Jurusan</Label>
        <select id="jurusan" name="jurusan" defaultValue={value("jurusan")} className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm">
          <option value="">Semua</option>
          <option value="IPA">IPA</option>
          <option value="IPS">IPS</option>
        </select>
      </div>
      <div>
        <Label htmlFor="prodi">Prodi</Label>
        <Input id="prodi" name="prodi" defaultValue={value("prodi")} placeholder="Teknik, hukum..." />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" className="w-full lg:min-w-28">
          <SearchIcon className="size-4" aria-hidden="true" />
          Cari
        </Button>
      </div>
    </form>
  );
}
