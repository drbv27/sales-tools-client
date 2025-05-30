// src/components/customers/CustomersDataTable.jsx
'use client';

import { useEffect, Fragment } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  FileEdit,
  Trash2,
  ExternalLink,
  User,
  Phone,
  MapPin,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsRight,
} from 'lucide-react';
import useLeadsStore from '@/store/useLeadsStore';
import QuickEditDialog from '@/components/leads/QuickEditDialog';
import useQuickEditStore from '@/store/useQuickEditStore';
import DeleteBusinessDialog from '@/components/leads/DeleteBusinessDialog';
import useDeleteBusinessStore from '@/store/useDeleteBusinessStore';
import useCompanyTheme from '@/store/useCompanyTheme';
import Link from 'next/link';

export default function CustomersDataTable() {
  const { theme } = useCompanyTheme();
  const { openDialog: openQuickEditDialog } = useQuickEditStore();
  const { openDialog: openDeleteDialog } = useDeleteBusinessStore();

  // Extraemos getters y acciones de paginación para customers desde el store
  const {
    getPaginatedCustomerBusinesses,
    getFilteredCustomerBusinesses,
    visibleColumns,
    getContactsForBusiness,
    pagination,
    setPage,
    setPageSize,
  } = useLeadsStore();

  // Obtenemos los negocios filtrados para customers y calculamos el total
  const businesses = getPaginatedCustomerBusinesses();
  const totalBusinesses = getFilteredCustomerBusinesses().length;
  const currentPage = pagination.currentPage;
  const pageSizeStore = pagination.pageSize;
  const totalPages = Math.ceil(totalBusinesses / pageSizeStore);
  const start = (currentPage - 1) * pageSizeStore;
  const end = Math.min(start + pageSizeStore, totalBusinesses);

  useEffect(() => {
    if (theme.base2) {
      document.documentElement.style.setProperty('--theme-base2', theme.base2);
    }
    if (theme.highlighting) {
      document.documentElement.style.setProperty(
        '--theme-highlighting',
        theme.highlighting
      );
    }
  }, [theme]);

  const toggleRow = (businessId) => {
    // Usamos el estado de expandido que ya se encuentra en el store o lo manejamos localmente
    // En este ejemplo se mantiene el manejo local
    // Se recomienda centralizar la lógica de filas expandidas si es necesario
  };

  const getRowStyles = (contacts) => {
    if (!contacts || contacts.length === 0) return '';
    const status = contacts[0].status;
    if (status === 'lost') {
      return 'bg-red-50 hover:bg-red-100 transition-colors';
    }
    return 'hover:bg-slate-100 transition-colors';
  };

  const renderCell = (business, column) => {
    const contacts = getContactsForBusiness(business._id);
    switch (column) {
      case 'companyName':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleRow(business._id)}
            >
              {/* Se puede agregar lógica para expandir filas */}
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Link
              href={`/main/leads/${business._id}`}
              className="font-medium text-[var(--theme-base2)] hover:underline"
            >
              {business.name}
            </Link>
          </div>
        );
      case 'email':
        return business.email ? (
          <Link
            href={`/main/email-compose/${encodeURIComponent(business.email)}`}
            className="flex items-center gap-2 text-[var(--theme-base2)] hover:underline"
          >
            {business.email}
          </Link>
        ) : null;
      case 'phone':
        return business.phone ? (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            {business.phone}
          </div>
        ) : null;
      case 'location':
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>
              {business.city}, {business.state}
            </span>
          </div>
        );
      case 'website':
        return business.website ? (
          <a
            href={business.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[var(--theme-base2)] hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Visit
          </a>
        ) : null;
      case 'contacts':
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>
              {getContactsForBusiness(business._id).length} Contact
              {getContactsForBusiness(business._id).length !== 1 ? 's' : ''}
            </span>
          </div>
        );
      case 'actions':
        const businessContacts = getContactsForBusiness(business._id);
        return (
          <DropdownMenu
            onOpenChange={(open) => {
              // Se maneja el estado de dropdowns de forma local o centralizada
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openQuickEditDialog(business);
                }}
              >
                <FileEdit className="h-4 w-4" />
                Quick Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(business, businessContacts);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <div className="h-[52vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead key={column}>
                    {column.charAt(0).toUpperCase() +
                      column.slice(1).replace(/([A-Z])/g, ' $1')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <Fragment key={business._id}>
                  <TableRow
                    className={`group ${getRowStyles(
                      getContactsForBusiness(business._id)
                    )}`}
                  >
                    {visibleColumns.map((column) => (
                      <TableCell key={`${business._id}-${column}`}>
                        {renderCell(business, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Aquí se puede renderizar la fila expandida similar a LeadsDataTable si es necesario */}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 px-2">
        <div className="text-sm text-muted-foreground">
          Showing {start + 1} to {end} of {totalBusinesses} entries
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page</span>
            <Select
              value={pageSizeStore.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue>{pageSizeStore}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <QuickEditDialog />
      <DeleteBusinessDialog />
    </>
  );
}
