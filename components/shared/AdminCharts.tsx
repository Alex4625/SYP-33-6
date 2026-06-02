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

const colors = ["#e6915d", "#b3bd95", "#9ab6c8", "#d77a7a", "#8c9ae0", "#8e8a25", "#c0d4a7"];
const tooltipStyle = { border: "1px solid #000", borderRadius: 0, fontFamily: '"Times New Roman", Times, serif' };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Top 10 Program Studi">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={collegeData} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#e6915d" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Provinsi Domisili">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={domicileData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#b3bd95" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Provinsi Asal">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={originData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#9ab6c8" />
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
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#e6915d" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
