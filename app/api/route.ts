import { NextResponse } from "next/server";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  // Simulate network latency 200-500ms
  const delay = Math.floor(Math.random() * 301) + 200;
  await sleep(delay);

  // Temporary mock data (later we will generate 50+)
  const data = [
    {
      id: "pt_1",
      name: "Emma Johnson",
      mrn: "123456",
      dob: "1998-04-12",
      status: "active",
      providerId: "p1",
      hasUpcoming: true,
      riskLevel: "medium",
    },
    {
      id: "pt_2",
      name: "Liam Smith",
      mrn: "654321",
      dob: "1985-10-03",
      status: "inactive",
      providerId: "p2",
      hasUpcoming: false,
      riskLevel: "low",
    },
  ];

  return NextResponse.json({
    data,
    pagination: {
      page: 1,
      limit: 10,
      total: data.length,
      totalPages: 1,
    },
  });
}
