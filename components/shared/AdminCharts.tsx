"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartPoint = {
  name: string;
  value: number;
};

type MonthlyPoint = {
  name: string;
  total: number;
};

const colors = ["#b86430", "#51745b", "#3f6f8f", "#b64f64", "#6f5a9f"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}

export function AdminCharts({
  majorData,
  collegeData,
  domicileData,
  originData,
  monthlyData,
}: {
  majorData: ChartPoint[];
  collegeData: ChartPoint[];
  domicileData: ChartPoint[];
  originData: ChartPoint[];
  monthlyData: MonthlyPoint[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Distribusi Jurusan SMA">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={majorData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={2}>
              {majorData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Top 10 Program Studi">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={collegeData} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#b86430" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Provinsi Domisili">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={domicileData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#51745b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Provinsi Asal">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={originData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#3f6f8f" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <div className="lg:col-span-2">
        <ChartCard title="Registrasi 12 Bulan Terakhir">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#b86430" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
