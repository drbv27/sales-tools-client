// src/components/opportunities/OpportunitiesTab.jsx
'use client';

// Manteniendo TODAS tus importaciones y lógica original
import { useState, useEffect, Fragment } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, LucideFilterX } from 'lucide-react';
import useCompanyTheme from '@/store/useCompanyTheme';
import useLeadsStore from '@/store/useLeadsStore';

// Renombrado para coincidir (opcional, pero bueno)
export default function OpportunitiesTab() {
  // --- TODA TU LÓGICA Y ESTADO ORIGINAL ---
  const { theme } = useCompanyTheme();
  const { getPaginatedBusinesses, getContactsForBusiness } = useLeadsStore();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterSeller, setFilterSeller] = useState('');
  const businesses = getPaginatedBusinesses();

  useEffect(() => {
    if (theme.base1)
      document.documentElement.style.setProperty('--theme-base1', theme.base1);
    if (theme.base2)
      document.documentElement.style.setProperty('--theme-base2', theme.base2);
    if (theme.highlighting)
      document.documentElement.style.setProperty(
        '--theme-highlighting',
        theme.highlighting
      );
    if (theme.callToAction)
      document.documentElement.style.setProperty(
        '--theme-callToAction',
        theme.callToAction
      );
  }, [theme]);

  // console.log(theme.callToAction); // Mantenido si lo usas para debug

  const toggleRow = (businessId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(businessId)) {
      newExpanded.delete(businessId);
    } else {
      newExpanded.add(businessId);
    }
    setExpandedRows(newExpanded);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStage('');
    setFilterSeller('');
  };

  const calculateTotalValue = (contacts, stageFilter = null) => {
    if (!contacts || contacts.length === 0) return 0;
    return contacts.reduce((total, contact) => {
      const opportunities = contact.opportunities || [];
      return (
        total +
        opportunities.reduce((sum, opp) => {
          if (stageFilter && opp.stage !== stageFilter) return sum;
          // Asegurarse que opp.value sea número
          const value = typeof opp.value === 'number' ? opp.value : 0;
          return sum + value;
        }, 0)
      );
    }, 0);
  };

  const getFilteredOpportunities = (contacts, stageFilter) => {
    if (!contacts || contacts.length === 0) return [];
    return contacts.flatMap((contact) =>
      (contact.opportunities || []).filter(
        (opportunity) => !stageFilter || opportunity.stage === stageFilter
      )
    );
  };

  const getUniqueStages = (contacts, stageFilter = null) => {
    const stages = new Set();
    contacts.forEach((contact) => {
      (contact.opportunities || []).forEach((opportunity) => {
        if (!stageFilter || opportunity.stage === stageFilter) {
          stages.add(opportunity.stage);
        }
      });
    });
    // Filtramos "" aquí para el select nativo también si es necesario
    return Array.from(stages).filter((stage) => stage !== '');
  };

  const getStageBadge = (stage) => {
    // Mantenemos tu lógica de badge original, ajustando quizás a nombre completo
    const colorMap = {
      Demo: 'bg-blue-100 text-blue-600',
      Proposal: 'bg-green-100 text-green-600',
      Negotiation: 'bg-yellow-100 text-yellow-600',
      Closed: 'bg-purple-100 text-purple-600' /* ... más ...*/,
    };
    const badgeColor = colorMap[stage] || 'bg-gray-100 text-gray-600';
    return (
      <span
        className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${badgeColor}`}
      >
        {' '}
        {stage}{' '}
      </span>
    );
  };

  // Lógica de filtrado original
  const filteredBusinesses = businesses.filter((business) => {
    const contacts = getContactsForBusiness(business._id);
    const totalOpportunities = contacts.reduce(
      (count, contact) => count + (contact.opportunities || []).length,
      0
    );
    const matchesSearch = business.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStage = filterStage
      ? contacts.some((contact) =>
          (contact.opportunities || []).some(
            (opportunity) => opportunity.stage === filterStage
          )
        )
      : true;
    const matchesSeller = filterSeller
      ? business.createdBy?.name === filterSeller
      : true;
    return (
      totalOpportunities > 0 && matchesSearch && matchesStage && matchesSeller
    );
  });

  // Cálculo de total original
  const totalOpportunitiesValue = filteredBusinesses.reduce(
    (total, business) => {
      const contacts = getContactsForBusiness(business._id);
      return total + calculateTotalValue(contacts, filterStage);
    },
    0
  );

  // Listas para los Selects Nativos (basado en tu lógica original)
  const uniqueStageOptions = Array.from(
    new Set(
      businesses.flatMap((business) =>
        getContactsForBusiness(business._id).flatMap((contact) =>
          (contact.opportunities || []).map((opp) => opp.stage)
        )
      )
    )
  ).filter((stage) => stage !== ''); // Filtramos ""
  const uniqueSellerOptions = Array.from(
    new Set(
      businesses.map((business) => business.createdBy?.name || 'Unknown Seller')
    )
  ).filter((seller) => seller !== '' && seller !== 'Unknown Seller'); // Filtramos "" y Unknown si es necesario

  // --- FIN LÓGICA ORIGINAL ---

  return (
    // Quitamos borde/redondeado si está dentro de un TabsContent
    <div>
      {/* Título opcional */}
      <div className="px-4 py-2 border-b bg-card">
        <h2 className="text-xl font-semibold text-foreground">
          Opportunities View
        </h2>
      </div>

      {/* --- SECCIÓN DE FILTROS RESPONSIVA (SOLO LAYOUT) --- */}
      <div className="p-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center border-b">
        {/* Grupo Izquierdo: Filtros */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <Input
            placeholder="Search by company"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // --- CAMBIO: Clases responsivas para ancho ---
            className="w-full sm:w-auto sm:flex-grow sm:max-w-xs border rounded px-2 py-1.5 h-9" // Añadido padding/altura para consistencia
          />
          {/* Select Nativo de Stage */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            // --- CAMBIO: Clases responsivas para ancho y estilo base ---
            className="w-full sm:w-auto border rounded p-2 h-9 text-sm bg-background" // Añadido h-9 text-sm bg-background
          >
            <option value="">All Stages</option>
            {uniqueStageOptions.map(
              (
                stage // Usando variable precalculada y filtrada
              ) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              )
            )}
          </select>
          {/* Select Nativo de Seller */}
          <select
            value={filterSeller}
            onChange={(e) => setFilterSeller(e.target.value)}
            // --- CAMBIO: Clases responsivas para ancho y estilo base ---
            className="w-full sm:w-auto border rounded p-2 h-9 text-sm bg-background" // Añadido h-9 text-sm bg-background
          >
            <option value="">All Sellers</option>
            {uniqueSellerOptions.map(
              (
                seller // Usando variable precalculada y filtrada
              ) => (
                <option key={seller} value={seller}>
                  {seller}
                </option>
              )
            )}
          </select>
        </div>

        {/* Grupo Derecho: Reset y Total */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetFilters}
            title="Reset Filters"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            {' '}
            {/* Ajustado tamaño */}
            {/* Asegúrate que theme.callToAction exista o usa un color fijo */}
            <LucideFilterX
              className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-destructive"
              style={{ color: theme.callToAction || 'inherit' }}
            />
          </Button>
          <div className="text-sm font-medium text-[var(--theme-base1)] bg-blue-50 py-1 px-3 rounded-md border border-[var(--theme-base1)] whitespace-nowrap">
            <span>Total: </span>
            <span className="font-semibold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalOpportunitiesValue)}
            </span>
          </div>
        </div>
      </div>
      {/* --- FIN SECCIÓN DE FILTROS --- */}

      {/* --- TABLA DE DATOS (Scroll horizontal, sin altura fija) --- */}
      {/* --- CAMBIO: Removido div con h-[52vh] overflow-y-auto --- */}
      <div className="overflow-x-auto">
        {' '}
        {/* Añadido div para scroll horizontal */}
        <Table>
          {/* TableHeader y TableBody usan TU lógica original */}
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px] sm:w-[400px]">
                Business Name
              </TableHead>{' '}
              {/* Ancho ajustado */}
              <TableHead>Seller</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead className="min-w-[200px]">Stages</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business) => {
                // --- Re-calculamos datos necesarios para la fila CON TU LÓGICA ---
                const contacts = getContactsForBusiness(business._id);
                const totalValue = calculateTotalValue(contacts, filterStage);
                const stages = getUniqueStages(contacts, filterStage);
                const seller = business.createdBy?.name || 'Unknown Seller';
                const filteredOpportunities = getFilteredOpportunities(
                  contacts,
                  filterStage
                );
                // --- Fin re-cálculo ---

                if (totalValue <= 0 && stages.length === 0) return null;

                return (
                  <Fragment key={business._id}>
                    <TableRow className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleRow(business._id)}
                          >
                            {expandedRows.has(business._id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <span
                            className="font-medium text-foreground truncate"
                            title={business.name}
                          >
                            {business.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {seller}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(totalValue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {stages.map((stage) => (
                            <Fragment key={stage}>
                              {getStageBadge(stage)}
                            </Fragment>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Fila Expandida (sin cambios lógicos) */}
                    {expandedRows.has(business._id) && (
                      <TableRow className="bg-muted/10 hover:bg-muted/20">
                        <TableCell colSpan={4} className="p-0">
                          <div className="px-6 py-3 space-y-2">
                            <h4 className="text-sm font-semibold mb-1">
                              Opportunities Details:
                            </h4>
                            {filteredOpportunities.length > 0 ? (
                              filteredOpportunities.map((opportunity) => (
                                <div
                                  key={
                                    opportunity._id ??
                                    opportunity.titles.join('-')
                                  }
                                  className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs border-b border-border/50 pb-1 last:border-b-0"
                                >
                                  <span
                                    className="font-medium text-foreground flex-1 truncate"
                                    title={opportunity.titles.join(', ')}
                                  >
                                    {opportunity.titles.join(', ')}
                                  </span>
                                  <span className="text-muted-foreground w-24 text-left sm:text-right shrink-0">
                                    {new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: 'USD',
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }).format(opportunity.value || 0)}
                                  </span>
                                  <div className="w-auto text-left sm:text-right shrink-0">
                                    {' '}
                                    {/* Ancho auto para badge */}
                                    {getStageBadge(opportunity.stage)}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-2">
                                No opportunities match the current stage filter
                                for this business.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No businesses match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* --- FIN TABLA --- */}
    </div>
  );
}
