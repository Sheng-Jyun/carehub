import { NextRequest, NextResponse } from 'next/server';
import { patients } from '@/mocks/data';
import { randomDelay, shouldSimulateError } from '@/lib/utils';
import { PatientQueryParams, PaginatedResponse, Patient } from '@/types';

export async function GET(request: NextRequest) {
  await randomDelay();

  // Simulate occasional errors
  if (shouldSimulateError()) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  
  const params: PatientQueryParams = {
    search: searchParams.get('search') || undefined,
    status: (searchParams.get('status') as PatientQueryParams['status']) || undefined,
    provider: searchParams.get('provider') || undefined,
    hasUpcoming: searchParams.get('hasUpcoming') === 'true' ? true : searchParams.get('hasUpcoming') === 'false' ? false : undefined,
    riskLevel: (searchParams.get('riskLevel') as PatientQueryParams['riskLevel']) || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sortBy: searchParams.get('sortBy') || 'lastName',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  };

  // Filter patients
  let filteredPatients = [...patients];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredPatients = filteredPatients.filter(patient => 
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.mrn.toLowerCase().includes(searchLower) ||
      patient.dateOfBirth.includes(searchLower)
    );
  }

  if (params.status) {
    filteredPatients = filteredPatients.filter(patient => patient.status === params.status);
  }

  if (params.provider) {
    filteredPatients = filteredPatients.filter(patient => patient.provider === params.provider);
  }

  if (params.hasUpcoming !== undefined) {
    filteredPatients = filteredPatients.filter(patient => patient.hasUpcomingAppointment === params.hasUpcoming);
  }

  if (params.riskLevel) {
    filteredPatients = filteredPatients.filter(patient => patient.riskLevel === params.riskLevel);
  }

  // Sort patients
  filteredPatients.sort((a, b) => {
    const aValue = a[params.sortBy as keyof Patient];
    const bValue = b[params.sortBy as keyof Patient];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return params.sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return params.sortOrder === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  // Paginate
  const total = filteredPatients.length;
  const totalPages = Math.ceil(total / (params.limit || 10));
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const response: PaginatedResponse<Patient> = {
    data: paginatedPatients,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  return NextResponse.json(response);
}
