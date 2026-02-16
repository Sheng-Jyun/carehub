'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePatients, useProviders } from '@/hooks/useApi';
import { Search, Filter, X, ChevronDown, ChevronUp, Download, Mail } from 'lucide-react';
import Link from 'next/link';
import { formatDate, calculateAge, cn } from '@/lib/utils';
import { PatientQueryParams } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  const params: PatientQueryParams = useMemo(() => ({
    search: searchParams.get('search') || undefined,
    status: (searchParams.get('status') as PatientQueryParams['status']) || undefined,
    provider: searchParams.get('provider') || undefined,
    hasUpcoming: searchParams.get('hasUpcoming') === 'true' ? true : searchParams.get('hasUpcoming') === 'false' ? false : undefined,
    riskLevel: (searchParams.get('riskLevel') as PatientQueryParams['riskLevel']) || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sortBy: searchParams.get('sortBy') || 'lastName',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  }), [searchParams]);

  const { data, isLoading, error } = usePatients(params);
  const { data: providers = [] } = useProviders();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (searchParams.get('search') || '')) {
        updateParams({ search: searchInput || undefined, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParams = useCallback((updates: Partial<PatientQueryParams>) => {
    const current = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        current.delete(key);
      } else {
        current.set(key, value.toString());
      }
    });

    router.push(`/patients?${current.toString()}`);
  }, [router, searchParams]);

  const handleSort = (column: string) => {
    const newOrder = params.sortBy === column && params.sortOrder === 'asc' ? 'desc' : 'asc';
    updateParams({ sortBy: column, sortOrder: newOrder });
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === data?.data.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(data?.data.map(p => p.id) || []);
    }
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatients(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'deceased':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Patients</h2>
        <p className="text-red-700">Failed to load patient data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            {data?.pagination.total || 0} total patients
          </p>
        </div>
        
        {selectedPatients.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedPatients.length} selected
            </span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Message
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search and Filter Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, MRN, or date of birth..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={params.status || ''}
                  onChange={(e) => updateParams({ status: e.target.value as any || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  value={params.provider || ''}
                  onChange={(e) => updateParams({ provider: e.target.value || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  value={params.riskLevel || ''}
                  onChange={(e) => updateParams({ riskLevel: e.target.value as any || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upcoming Appointment
                </label>
                <select
                  value={params.hasUpcoming === undefined ? '' : params.hasUpcoming ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : e.target.value === 'true';
                    updateParams({ hasUpcoming: value, page: 1 });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(params.search || params.status || params.provider || params.riskLevel || params.hasUpcoming !== undefined) && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {params.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Search: {params.search}
                    <button onClick={() => { setSearchInput(''); updateParams({ search: undefined, page: 1 }); }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {params.status && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Status: {params.status}
                    <button onClick={() => updateParams({ status: undefined, page: 1 })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {params.provider && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Provider: {providers.find(p => p.id === params.provider)?.firstName}
                    <button onClick={() => updateParams({ provider: undefined, page: 1 })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {params.riskLevel && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Risk: {params.riskLevel}
                    <button onClick={() => updateParams({ riskLevel: undefined, page: 1 })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {params.hasUpcoming !== undefined && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Upcoming: {params.hasUpcoming ? 'Yes' : 'No'}
                    <button onClick={() => updateParams({ hasUpcoming: undefined, page: 1 })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateParams({ search: undefined, status: undefined, provider: undefined, riskLevel: undefined, hasUpcoming: undefined, page: 1 });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPatients.length === data?.data.length && data?.data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th
                  onClick={() => handleSort('lastName')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Name
                    {params.sortBy === 'lastName' && (
                      params.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  MRN
                </th>
                <th
                  onClick={() => handleSort('dateOfBirth')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Age
                    {params.sortBy === 'dateOfBirth' && (
                      params.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Provider
                </th>
                <th
                  onClick={() => handleSort('riskLevel')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Risk
                    {params.sortBy === 'riskLevel' && (
                      params.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Last Visit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: params.limit || 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
                        <p className="text-gray-600">Try adjusting your filters or search criteria</p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchInput('');
                          updateParams({ search: undefined, status: undefined, provider: undefined, riskLevel: undefined, hasUpcoming: undefined, page: 1 });
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.data.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => handleSelectPatient(patient.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{patient.mrn}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {calculateAge(patient.dateOfBirth)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(patient.status))}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{patient.providerName}</td>
                    <td className="px-4 py-4">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', getRiskLevelColor(patient.riskLevel))}>
                        {patient.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {patient.lastVisit ? formatDate(patient.lastVisit) : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={params.limit}
                onChange={(e) => updateParams({ limit: parseInt(e.target.value), page: 1 })}
                className="px-2 py-1 border border-gray-300 rounded"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => updateParams({ page: 1 })}
                  disabled={params.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => updateParams({ page: params.page! - 1 })}
                  disabled={params.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => updateParams({ page: params.page! + 1 })}
                  disabled={params.page === data.pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => updateParams({ page: data.pagination.totalPages })}
                  disabled={params.page === data.pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}